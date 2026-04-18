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
import logging
from typing import Tuple, List, Dict

logger = logging.getLogger(__name__)

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
        
        # Ngưỡng quyết định - đã calibrate từ 0.7->0.5 để tránh false negative
        # Score từ Silent-Face-Anti-Spoofing: [0=Spoof, 1=Real, 2=Unknown]
        # Chúng ta dùng score cho class 1 (Real face) để quyết định
        self.real_threshold = 0.5   # Score >= 0.5 => Real face
        self.fake_threshold = 0.3   # Score <= 0.3 => Fake face
        # Giữa 0.3-0.5 => Cần xác minh thêm bằng video
        
        logger.info(f"AntiSpoofService initialized with model_dir: {self.model_dir}")
        logger.info(f"Thresholds: real={self.real_threshold}, fake={self.fake_threshold}")
    
    def check_image_ratio(self, image:  np.ndarray) -> bool:
        """Kiểm tra tỷ lệ ảnh có phù hợp không (3:4)"""
        height, width = image. shape[:2]
        ratio = width / height
        # Cho phép sai số 10%
        return 0.675 <= ratio <= 0.825  # 3/4 = 0.75
    
    def preprocess_image(self, image: np. ndarray) -> np.ndarray:
        """
        Tiền xử lý ảnh để phù hợp với model.
        
        Note: Loại bỏ padding bằng black color vì nó làm model bị confuse.
        Model sẽ tự crop từ bbox, không cần preprocess aspect ratio.
        """
        # Không thay đổi ảnh - để model crop từ bbox
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
        logger.info("=" * 60)
        logger.info("Starting face liveness detection")
        logger.info(f"Input image shape: {image.shape}")
        
        # Preprocess
        image = self.preprocess_image(image)
        logger.info(f"After preprocess shape: {image.shape}")
        
        # Detect face bbox
        try:
            image_bbox = self.model_test.get_bbox(image)
            logger.info(f"Face bbox detected: {image_bbox}")
        except Exception as e:
            logger.error(f"Face detection failed: {e}", exc_info=True)
            return {
                'is_real': False,
                'confidence': 0.0,
                'need_verification':  False,
                'bbox': None,
                'error':  'Không phát hiện được khuôn mặt'
            }
        
        prediction = np.zeros((1, 3))
        model_count = 0
        
        # Chạy qua tất cả các models
        logger.info(f"Models directory: {self.model_dir}")
        for model_name in os.listdir(self.model_dir):
            if not model_name.endswith('.pth'):
                continue
            
            model_count += 1
            logger.info(f"Running model {model_count}: {model_name}")
                
            h_input, w_input, model_type, scale = parse_model_name(model_name)
            logger.debug(f"Model config: h={h_input}, w={w_input}, type={model_type}, scale={scale}")
            
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
            logger.debug(f"Cropped image shape: {img.shape}")
            
            model_path = os.path.join(self. model_dir, model_name)
            model_result = self.model_test.predict(img, model_path)
            logger.info(f"Model {model_name} output: {model_result}")
            prediction += model_result
        
        logger.info(f"Total models processed: {model_count}")
        logger.info(f"Accumulated prediction: {prediction}")
        
        # Tính score trung bình từ tất cả models
        if model_count == 0:
            logger.error("No models found in model directory!")
            return {
                'is_real': False,
                'confidence': 0.0,
                'need_verification': False,
                'bbox': None,
                'error': 'Không tìm thấy model nào'
            }
        
        # Score cho class 1 (Real Face) - lấy trung bình từ tất cả models
        score = float(prediction[0][1] / model_count)
        label = int(np.argmax(prediction))
        
        logger.info(f"Score calculation: {prediction[0][1]} / {model_count} = {score:.4f}")
        logger.info(f"Label (argmax): {label}")
        logger.info(f"Thresholds: real={self.real_threshold}, fake={self.fake_threshold}")
        
        # Quyết định dựa trên score
        if score >= self.real_threshold:
            is_real = True
            need_verification = False
            logger.info(f"✅ Decision: REAL (score {score:.4f} >= {self.real_threshold})")
        elif score <= self.fake_threshold:
            is_real = False
            need_verification = False
            logger.info(f"❌ Decision: FAKE (score {score:.4f} <= {self.fake_threshold})")
        else:
            is_real = False
            need_verification = True
            logger.info(f"⚠️  Decision: NEED_VERIFICATION ({self.fake_threshold} < score {score:.4f} < {self.real_threshold})")
        
        result = {
            'is_real': is_real,
            'confidence': score,
            'need_verification': need_verification,
            'bbox': image_bbox,
            'label': label
        }
        
        logger.info(f"Final result: {result}")
        logger.info("=" * 60)
        
        return result
    
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