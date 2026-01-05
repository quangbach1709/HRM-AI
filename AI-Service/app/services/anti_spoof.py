# -*- coding: utf-8 -*-
"""
Anti-Spoofing Service sử dụng Silent-Face-Anti-Spoofing
"""

import os
import sys
import cv2
import numpy as np
import torch
import torch.nn. functional as F
from typing import Tuple, List, Dict

# Thêm path tới Silent-Face-Anti-Spoofing
SILENT_FACE_PATH = os.path. join(os.path.dirname(__file__), '..', '..', 'Silent-Face-Anti-Spoofing')
sys.path.insert(0, SILENT_FACE_PATH)

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name


class AntiSpoofService:
    """Service để kiểm tra tính chân thực của khuôn mặt"""
    
    def __init__(self, model_dir: str = None, device_id: int = 0):
        """
        Khởi tạo service
        
        Args: 
            model_dir: Đường dẫn tới thư mục chứa models
            device_id: GPU device ID (0 nếu dùng CPU)
        """
        self.model_dir = model_dir or os.path. join(
            SILENT_FACE_PATH, 'resources', 'anti_spoof_models'
        )
        self.device_id = device_id
        self.model_test = AntiSpoofPredict(device_id)
        self.image_cropper = CropImage()
        
        # Ngưỡng quyết định (có thể điều chỉnh)
        self.real_threshold = 0.7  # Trên ngưỡng này => Real
        self.fake_threshold = 0.3  # Dưới ngưỡng này => Fake
        # Giữa 2 ngưỡng => Cần xác minh thêm
    
    def check_image_ratio(self, image:  np.ndarray) -> bool:
        """Kiểm tra tỷ lệ ảnh có phù hợp không (3:4)"""
        height, width = image. shape[:2]
        ratio = width / height
        # Cho phép sai số 10%
        return 0.675 <= ratio <= 0.825  # 3/4 = 0.75
    
    def preprocess_image(self, image: np. ndarray) -> np.ndarray:
        """
        Tiền xử lý ảnh để phù hợp với model
        """
        height, width = image. shape[:2]
        
        # Resize về tỷ lệ 3:4 nếu cần
        if width / height != 3/4:
            new_height = int(width * 4 / 3)
            if new_height > height:
                # Thêm padding
                pad_top = (new_height - height) // 2
                pad_bottom = new_height - height - pad_top
                image = cv2.copyMakeBorder(
                    image, pad_top, pad_bottom, 0, 0,
                    cv2.BORDER_CONSTANT, value=[0, 0, 0]
                )
            else:
                # Crop
                start = (height - new_height) // 2
                image = image[start:start+new_height, : , :]
        
        return image
    
    def detect_single_image(self, image:  np.ndarray) -> Dict:
        """
        Kiểm tra một ảnh đơn lẻ
        
        Args:
            image: Ảnh BGR từ OpenCV
            
        Returns:
            Dict chứa kết quả: 
            - is_real: bool
            - confidence: float (0-1)
            - need_verification: bool
            - bbox: list [x, y, w, h]
        """
        # Preprocess
        image = self.preprocess_image(image)
        
        # Detect face bbox
        try:
            image_bbox = self.model_test.get_bbox(image)
        except Exception as e: 
            return {
                'is_real': False,
                'confidence': 0.0,
                'need_verification':  False,
                'bbox': None,
                'error':  'Không phát hiện được khuôn mặt'
            }
        
        prediction = np.zeros((1, 3))
        
        # Chạy qua tất cả các models
        for model_name in os.listdir(self.model_dir):
            if not model_name.endswith('.pth'):
                continue
                
            h_input, w_input, model_type, scale = parse_model_name(model_name)
            
            param = {
                "org_img": image,
                "bbox": image_bbox,
                "scale":  scale,
                "out_w": w_input,
                "out_h": h_input,
                "crop": True,
            }
            
            if scale is None:
                param["crop"] = False
                
            img = self.image_cropper.crop(**param)
            model_path = os.path.join(self. model_dir, model_name)
            prediction += self.model_test.predict(img, model_path)
        
        # Tính điểm cuối cùng
        label = np.argmax(prediction)
        # Score cho label=1 (Real Face)
        score = prediction[0][1] / 2  # Chia 2 vì có 2 models
        
        # Quyết định
        is_real = label == 1
        need_verification = self.fake_threshold < score < self.real_threshold
        
        return {
            'is_real': is_real and score >= self.real_threshold,
            'confidence': float(score),
            'need_verification':  need_verification,
            'bbox': image_bbox,
            'label': int(label)
        }
    
    def detect_video_frames(self, frames: List[np. ndarray]) -> Dict:
        """
        Kiểm tra nhiều frames từ video
        
        Args:
            frames: List các frame ảnh BGR
            
        Returns:
            Dict chứa kết quả tổng hợp
        """
        if not frames:
            return {
                'is_real': False,
                'confidence': 0.0,
                'details': [],
                'error': 'Không có frame nào'
            }
        
        results = []
        for i, frame in enumerate(frames):
            result = self.detect_single_image(frame)
            result['frame_index'] = i
            results.append(result)
        
        # Tính toán kết quả tổng hợp
        real_count = sum(1 for r in results if r. get('is_real', False))
        avg_confidence = np.mean([r. get('confidence', 0) for r in results])
        
        # Nguyên tắc: >= 70% frames là real => Real
        is_real = real_count >= len(frames) * 0.7
        
        return {
            'is_real': is_real,
            'confidence': float(avg_confidence),
            'real_frame_ratio': real_count / len(frames),
            'details': results
        }


# Singleton instance
_anti_spoof_service = None

def get_anti_spoof_service() -> AntiSpoofService:
    global _anti_spoof_service
    if _anti_spoof_service is None: 
        _anti_spoof_service = AntiSpoofService()
    return _anti_spoof_service