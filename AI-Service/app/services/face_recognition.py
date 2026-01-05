# -*- coding: utf-8 -*-
"""
Face Recognition Service sử dụng UniFace
"""

import os
import cv2
import numpy as np
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime

from uniface import RetinaFace, ArcFace
from uniface import compute_similarity


class FaceRecognitionService:
    """Service để nhận dạng khuôn mặt"""
    
    def __init__(self, embeddings_dir: str = None, similarity_threshold: float = 0.5):
        """
        Khởi tạo service
        
        Args: 
            embeddings_dir: Thư mục lưu embeddings
            similarity_threshold:  Ngưỡng tương đồng (0-1)
        """
        self. embeddings_dir = embeddings_dir or os.path.join(
            os. path.dirname(__file__), '..', '..', '..', 'data', 'face_embeddings'
        )
        os.makedirs(self.embeddings_dir, exist_ok=True)
        
        self.similarity_threshold = similarity_threshold
        
        # Khởi tạo models
        print("Đang tải Face Detection model...")
        self.detector = RetinaFace()
        
        print("Đang tải Face Recognition model...")
        self.recognizer = ArcFace()
        
        # Load database embeddings
        self. database = self._load_database()
        
        print(f"Đã tải {len(self.database)} khuôn mặt từ database")
    
    def _load_database(self) -> Dict:
        """Load embeddings từ file"""
        db_file = os.path. join(self.embeddings_dir, 'database.json')
        embeddings_file = os.path. join(self.embeddings_dir, 'embeddings.npy')
        
        if os.path.exists(db_file) and os.path.exists(embeddings_file):
            with open(db_file, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            embeddings = np.load(embeddings_file)
            
            database = {}
            for person_id, info in metadata.items():
                idx = info['embedding_index']
                database[person_id] = {
                    'name': info['name'],
                    'department': info. get('department', ''),
                    'embedding': embeddings[idx],
                    'registered_at': info.get('registered_at', '')
                }
            return database
        
        return {}
    
    def _save_database(self):
        """Lưu embeddings ra file"""
        db_file = os. path.join(self.embeddings_dir, 'database. json')
        embeddings_file = os.path.join(self.embeddings_dir, 'embeddings.npy')
        
        metadata = {}
        embeddings = []
        
        for idx, (person_id, info) in enumerate(self.database.items()):
            metadata[person_id] = {
                'name': info['name'],
                'department': info.get('department', ''),
                'embedding_index': idx,
                'registered_at': info.get('registered_at', '')
            }
            embeddings.append(info['embedding'])
        
        with open(db_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        
        if embeddings:
            np.save(embeddings_file, np.array(embeddings))
    
    def detect_face(self, image: np.ndarray) -> Optional[Dict]:
        """
        Phát hiện khuôn mặt trong ảnh
        
        Returns:
            Dict với bbox, confidence, landmarks hoặc None
        """
        faces = self.detector. detect(image)
        
        if not faces:
            return None
        
        # Trả về khuôn mặt có confidence cao nhất
        best_face = max(faces, key=lambda x: x['confidence'])
        return best_face
    
    def extract_embedding(self, image:  np.ndarray, landmarks: np.ndarray) -> np.ndarray:
        """
        Trích xuất embedding từ khuôn mặt
        
        Args: 
            image: Ảnh gốc
            landmarks: 5-point landmarks từ detector
            
        Returns:
            Embedding vector (512-dim)
        """
        embedding = self.recognizer.get_normalized_embedding(image, landmarks)
        return embedding
    
    def register_face(
        self, 
        person_id: str, 
        name:  str, 
        image: np.ndarray,
        department: str = ''
    ) -> Dict:
        """
        Đăng ký khuôn mặt mới
        
        Args:
            person_id:  Mã nhân viên
            name: Tên nhân viên
            image: Ảnh khuôn mặt
            department:  Phòng ban
            
        Returns:
            Dict với kết quả đăng ký
        """
        # Detect face
        face = self.detect_face(image)
        
        if face is None:
            return {
                'success': False,
                'error': 'Không phát hiện được khuôn mặt trong ảnh'
            }
        
        # Extract embedding
        embedding = self. extract_embedding(image, face['landmarks'])
        
        # Kiểm tra xem có trùng với ai không
        if self.database:
            match = self._find_match(embedding)
            if match and match['person_id'] != person_id:
                return {
                    'success': False,
                    'error': f"Khuôn mặt đã được đăng ký cho:  {match['name']} ({match['person_id']})"
                }
        
        # Lưu vào database
        self.database[person_id] = {
            'name': name,
            'department': department,
            'embedding': embedding. flatten(),
            'registered_at': datetime.now().isoformat()
        }
        
        self._save_database()
        
        return {
            'success': True,
            'person_id':  person_id,
            'name': name,
            'message': 'Đăng ký thành công'
        }
    
    def _find_match(self, query_embedding: np. ndarray) -> Optional[Dict]:
        """Tìm khuôn mặt khớp trong database"""
        if not self.database:
            return None
        
        best_match = None
        best_similarity = -1
        
        for person_id, info in self.database.items():
            db_embedding = info['embedding']. reshape(1, -1)
            query_flat = query_embedding. reshape(1, -1)
            
            similarity = np.dot(query_flat, db_embedding. T)[0][0]
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = {
                    'person_id': person_id,
                    'name': info['name'],
                    'department': info.get('department', ''),
                    'similarity':  float(similarity)
                }
        
        if best_match and best_match['similarity'] >= self.similarity_threshold:
            return best_match
        
        return None
    
    def identify(self, image: np.ndarray) -> Dict:
        """
        Nhận dạng danh tính từ ảnh
        
        Args: 
            image:  Ảnh chứa khuôn mặt
            
        Returns: 
            Dict với thông tin nhận dạng
        """
        # Detect face
        face = self.detect_face(image)
        
        if face is None:
            return {
                'success': False,
                'identified': False,
                'error': 'Không phát hiện được khuôn mặt'
            }
        
        # Extract embedding
        embedding = self.extract_embedding(image, face['landmarks'])
        
        # Find match
        match = self._find_match(embedding)
        
        if match:
            return {
                'success':  True,
                'identified': True,
                'person_id':  match['person_id'],
                'name': match['name'],
                'department':  match['department'],
                'similarity': match['similarity'],
                'bbox': face['bbox']. tolist() if hasattr(face['bbox'], 'tolist') else face['bbox']
            }
        else:
            return {
                'success':  True,
                'identified': False,
                'message': 'Không tìm thấy khuôn mặt phù hợp trong database',
                'bbox': face['bbox'].tolist() if hasattr(face['bbox'], 'tolist') else face['bbox']
            }


# Singleton instance
_face_recognition_service = None

def get_face_recognition_service() -> FaceRecognitionService:
    global _face_recognition_service
    if _face_recognition_service is None:
        _face_recognition_service = FaceRecognitionService()
    return _face_recognition_service