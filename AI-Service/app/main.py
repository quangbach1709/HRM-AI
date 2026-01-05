# -*- coding: utf-8 -*-
"""
FastAPI Main Application
"""

import os
import cv2
import numpy as np
import base64
from datetime import datetime
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi. middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.services.anti_spoof import get_anti_spoof_service
from app.services.face_recognition import get_face_recognition_service


app = FastAPI(
    title="Face Attendance System API",
    description="API cho hệ thống chấm công bằng khuôn mặt",
    version="1.0.0"
)

# CORS cho phép ReactJS frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ====================== MODELS ======================

class AttendanceRequest(BaseModel):
    image_base64: str


class VideoVerificationRequest(BaseModel):
    frames_base64: List[str]  # List of base64 encoded frames


class RegisterRequest(BaseModel):
    person_id: str
    name: str
    department: str = ""
    image_base64: str


class AttendanceResponse(BaseModel):
    success: bool
    message: str
    person_id: Optional[str] = None
    name: Optional[str] = None
    department: Optional[str] = None
    attendance_time: Optional[str] = None
    liveness_score: Optional[float] = None
    similarity:  Optional[float] = None
    need_video_verification: bool = False


# ====================== HELPERS ======================

def base64_to_image(base64_string: str) -> np.ndarray:
    """Chuyển base64 thành ảnh numpy array"""
    # Loại bỏ header nếu có (data: image/jpeg;base64,...)
    if ',' in base64_string:
        base64_string = base64_string.split(',')[1]
    
    img_bytes = base64.b64decode(base64_string)
    img_array = np.frombuffer(img_bytes, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    
    return image


def save_attendance_log(person_id: str, name: str, success: bool, method: str):
    """Lưu log chấm công"""
    log_dir = os.path. join(os.path.dirname(__file__), '..', '..', 'data', 'attendance_logs')
    os.makedirs(log_dir, exist_ok=True)
    
    today = datetime.now().strftime('%Y-%m-%d')
    log_file = os. path.join(log_dir, f'{today}.txt')
    
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    status = 'SUCCESS' if success else 'FAILED'
    
    log_entry = f"{timestamp} | {status} | {person_id} | {name} | {method}\n"
    
    with open(log_file, 'a', encoding='utf-8') as f:
        f. write(log_entry)


# ====================== ENDPOINTS ======================

@app.get("/")
async def root():
    return {"message": "Face Attendance System API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/attendance/check-image", response_model=AttendanceResponse)
async def check_attendance_image(request: AttendanceRequest):
    """
    Bước 1: Kiểm tra ảnh đơn
    - Kiểm tra liveness
    - Nếu đạt => Nhận dạng danh tính
    - Nếu nghi ngờ => Yêu cầu video
    """
    try: 
        # Convert base64 to image
        image = base64_to_image(request.image_base64)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Không thể decode ảnh")
        
        # Step 1: Anti-spoofing check
        anti_spoof = get_anti_spoof_service()
        spoof_result = anti_spoof.detect_single_image(image)
        
        # Nếu phát hiện là fake hoặc cần xác minh thêm => yêu cầu video xác minh
        if not spoof_result['is_real'] or spoof_result.get('need_verification', False):
            # Thay vì từ chối ngay, cho người dùng cơ hội xác minh bằng video
            if not spoof_result['is_real']:
                message = "Phát hiện nghi ngờ giả mạo. Vui lòng xác minh bằng video 3 giây."
            else:
                message = "Cần xác minh thêm. Vui lòng quay video ngắn 3 giây."
            
            return AttendanceResponse(
                success=False,
                message=message,
                liveness_score=spoof_result['confidence'],
                need_video_verification=True  # Luôn yêu cầu video khi nghi ngờ
            )
        
        # Step 2: Face Recognition
        face_service = get_face_recognition_service()
        identity_result = face_service.identify(image)
        
        if not identity_result['success']:
            return AttendanceResponse(
                success=False,
                message=identity_result.get('error', 'Lỗi nhận dạng'),
                liveness_score=spoof_result['confidence'],
                need_video_verification=False
            )
        
        if not identity_result['identified']:
            return AttendanceResponse(
                success=False,
                message="Không tìm thấy khuôn mặt trong hệ thống.  Vui lòng đăng ký trước.",
                liveness_score=spoof_result['confidence'],
                need_video_verification=False
            )
        
        # Success - Log attendance
        save_attendance_log(
            identity_result['person_id'],
            identity_result['name'],
            True,
            'image'
        )
        
        return AttendanceResponse(
            success=True,
            message="Chấm công thành công! ",
            person_id=identity_result['person_id'],
            name=identity_result['name'],
            department=identity_result['department'],
            attendance_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            liveness_score=spoof_result['confidence'],
            similarity=identity_result['similarity'],
            need_video_verification=False
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/attendance/verify-video", response_model=AttendanceResponse)
async def verify_video(request: VideoVerificationRequest):
    """
    Bước 2 (nếu cần): Xác minh qua video
    - Nhận 10 frames từ video
    - Kiểm tra liveness trên từng frame
    - Nếu >= 70% là real => Nhận dạng danh tính
    """
    try: 
        if not request.frames_base64 or len(request. frames_base64) < 5:
            raise HTTPException(
                status_code=400, 
                detail="Cần ít nhất 5 frames từ video"
            )
        
        # Convert all frames
        frames = []
        for frame_b64 in request. frames_base64:
            frame = base64_to_image(frame_b64)
            if frame is not None:
                frames.append(frame)
        
        if len(frames) < 5:
            raise HTTPException(
                status_code=400,
                detail="Không đủ frames hợp lệ"
            )
        
        # Anti-spoofing on all frames
        anti_spoof = get_anti_spoof_service()
        spoof_result = anti_spoof.detect_video_frames(frames)
        
        if not spoof_result['is_real']: 
            return AttendanceResponse(
                success=False,
                message=f"Xác minh thất bại.  Chỉ có {spoof_result['real_frame_ratio']*100:.1f}% frames là thật.",
                liveness_score=spoof_result['confidence'],
                need_video_verification=False
            )
        
        # Face Recognition - Use the frame with highest confidence
        face_service = get_face_recognition_service()
        
        # Tìm frame có liveness score cao nhất
        best_frame_idx = 0
        best_score = 0
        for detail in spoof_result. get('details', []):
            if detail. get('confidence', 0) > best_score:
                best_score = detail['confidence']
                best_frame_idx = detail. get('frame_index', 0)
        
        identity_result = face_service.identify(frames[best_frame_idx])
        
        if not identity_result. get('identified', False):
            return AttendanceResponse(
                success=False,
                message="Không tìm thấy khuôn mặt trong hệ thống.",
                liveness_score=spoof_result['confidence'],
                need_video_verification=False
            )
        
        # Success
        save_attendance_log(
            identity_result['person_id'],
            identity_result['name'],
            True,
            'video'
        )
        
        return AttendanceResponse(
            success=True,
            message="Xác minh video thành công!  Chấm công hoàn tất.",
            person_id=identity_result['person_id'],
            name=identity_result['name'],
            department=identity_result. get('department', ''),
            attendance_time=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            liveness_score=spoof_result['confidence'],
            similarity=identity_result. get('similarity'),
            need_video_verification=False
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/register")
async def register_face(request: RegisterRequest):
    """
    Đăng ký khuôn mặt nhân viên mới
    """
    try:
        image = base64_to_image(request. image_base64)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Không thể decode ảnh")
        
        # Kiểm tra liveness trước khi đăng ký
        anti_spoof = get_anti_spoof_service()
        spoof_result = anti_spoof. detect_single_image(image)
        
        if not spoof_result['is_real']: 
            raise HTTPException(
                status_code=400,
                detail="Vui lòng sử dụng ảnh thật để đăng ký"
            )
        
        # Register
        face_service = get_face_recognition_service()
        result = face_service. register_face(
            person_id=request.person_id,
            name=request.name,
            image=image,
            department=request.department
        )
        
        if not result['success']: 
            raise HTTPException(status_code=400, detail=result['error'])
        
        return {
            "success": True,
            "message": f"Đăng ký thành công cho {request.name}",
            "person_id": request.person_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/employees")
async def list_employees():
    """Lấy danh sách nhân viên đã đăng ký"""
    face_service = get_face_recognition_service()
    
    employees = []
    for person_id, info in face_service. database.items():
        employees.append({
            "person_id":  person_id,
            "name": info['name'],
            "department": info. get('department', ''),
            "registered_at": info. get('registered_at', '')
        })
    
    return {"employees": employees, "total": len(employees)}


if __name__ == "__main__":
    import uvicorn
    uvicorn. run(app, host="0.0.0.0", port=8000)