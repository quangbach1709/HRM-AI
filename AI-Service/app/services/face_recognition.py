# -*- coding: utf-8 -*-
"""
Face Embedding Service - Trích xuất embedding từ khuôn mặt
"""

import numpy as np
from typing import Dict, Optional

from uniface import RetinaFace, ArcFace


class FaceEmbeddingService:
    """Service để trích xuất embedding từ khuôn mặt"""
    
    def __init__(self):
        """Khởi tạo service"""
        # Khởi tạo models
        print("Đang tải Face Detection model...")
        self.detector = RetinaFace()
        
        print("Đang tải Face Recognition model...")
        self.recognizer = ArcFace()
        
        print("Face Embedding Service sẵn sàng!")
    
    def detect_face(self, image: np.ndarray) -> Optional[Dict]:
        """
        Phát hiện khuôn mặt trong ảnh
        
        Returns:
            Dict với bbox, confidence, landmarks hoặc None
        """
        faces = self.detector.detect(image)
        
        if not faces:
            return None
        
        # Trả về khuôn mặt có confidence cao nhất
        best_face = max(faces, key=lambda x: x['confidence'])
        return best_face
    
    def extract_embedding(self, image: np.ndarray, landmarks: np.ndarray) -> np.ndarray:
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
    
    def get_embedding(self, image: np.ndarray) -> Dict:
        """
        Trích xuất embedding từ ảnh.

        Returns:
            Dict với:
            - success: bool
            - embedding: list[float] (512-dim, đã L2-normalize)
            - face_confidence: float (độ tin cậy phát hiện khuôn mặt, 0-1)
            - bbox: list
            - error: str (nếu thất bại)
        """
        face = self.detect_face(image)
        
        if face is None:
            return {
                'success': False,
                'embedding': None,
                'face_confidence': 0.0,
                'error': 'Không phát hiện được khuôn mặt trong ảnh'
            }
        
        embedding = self.extract_embedding(image, face['landmarks'])
        vec = embedding.flatten()

        # Đảm bảo vector đã L2-normalize trước khi lưu/so sánh
        norm = np.linalg.norm(vec)
        if norm > 1e-8:
            vec = vec / norm
        
        return {
            'success': True,
            'embedding': vec.tolist(),
            'face_confidence': float(face.get('confidence', 1.0)),
            'bbox': face['bbox'].tolist() if hasattr(face['bbox'], 'tolist') else face['bbox']
        }


# Singleton instance
_face_embedding_service = None

def get_face_recognition_service() -> FaceEmbeddingService:
    """Giữ tên hàm cũ để không cần sửa main.py"""
    global _face_embedding_service
    if _face_embedding_service is None:
        _face_embedding_service = FaceEmbeddingService()
    return _face_embedding_service