# -*- coding: utf-8 -*-
"""
FastAPI Main Application
"""

import os
import cv2
import numpy as np
from typing import List, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

class FaceVerificationResponse(BaseModel):
    embeddingVector: Optional[List[float]] = None  # 512-dim vector
    status: int  # 200, 400, 500
    statusDetail: str  # Chi tiết lỗi hoặc thông báo thành công


# ====================== HELPERS ======================

async def file_to_image(file: UploadFile) -> np.ndarray:
    """Chuyển UploadFile thành ảnh numpy array"""
    contents = await file.read()
    img_array = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return image


# ====================== ENDPOINTS ======================

@app.get("/")
async def root():
    return {"message": "Face Attendance System API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/attendance/check-image", response_model=FaceVerificationResponse)
async def check_attendance_image(file: UploadFile = File(...)):
    """
    Kiểm tra ảnh đơn
    - Nhận file ảnh trực tiếp
    - Kiểm tra liveness (anti-spoofing)
    - Trích xuất embedding vector
    - Trả về embeddingVector, status, statusDetail
    """
    try:
        # Convert file to image
        image = await file_to_image(file)
        
        if image is None:
            return FaceVerificationResponse(
                embeddingVector=None,
                status=400,
                statusDetail="Không thể decode ảnh. Vui lòng kiểm tra định dạng file."
            )
        
        # Step 1: Anti-spoofing check
        anti_spoof = get_anti_spoof_service()
        spoof_result = anti_spoof.detect_single_image(image)
        
        # Nếu phát hiện là fake hoặc cần xác minh thêm => yêu cầu video xác minh
        if not spoof_result['is_real'] or spoof_result.get('need_verification', False):
            if not spoof_result['is_real']:
                message = "Phát hiện nghi ngờ giả mạo. Vui lòng xác minh bằng video 3 giây."
            else:
                message = "Cần xác minh thêm. Vui lòng quay video ngắn 3 giây."
            
            return FaceVerificationResponse(
                embeddingVector=None,
                status=400,
                statusDetail=message
            )
        
        # Step 2: Extract embedding
        face_service = get_face_recognition_service()
        embedding_result = face_service.get_embedding(image)
        
        if not embedding_result['success']:
            return FaceVerificationResponse(
                embeddingVector=None,
                status=400,
                statusDetail=embedding_result.get('error', 'Không phát hiện được khuôn mặt')
            )
        
        # Success - Return embedding vector
        return FaceVerificationResponse(
            embeddingVector=embedding_result['embedding'],
            status=200,
            statusDetail="Xác minh ảnh thành công."
        )
        
    except Exception as e:
        return FaceVerificationResponse(
            embeddingVector=None,
            status=500,
            statusDetail=f"Lỗi server: {str(e)}"
        )


@app.post("/api/attendance/verify-video", response_model=FaceVerificationResponse)
async def verify_video(files: List[UploadFile] = File(...)):
    """
    Xác minh qua video (nhiều frames)
    - Nhận danh sách file ảnh trực tiếp (các frames từ video)
    - Kiểm tra liveness trên từng frame
    - Nếu >= 70% là real => Trích xuất embedding
    - Trả về embeddingVector, status, statusDetail
    """
    try:
        if not files or len(files) < 5:
            return FaceVerificationResponse(
                embeddingVector=None,
                status=400,
                statusDetail="Cần ít nhất 5 frames từ video."
            )
        
        # Convert all files to images
        frames = []
        for file in files:
            frame = await file_to_image(file)
            if frame is not None:
                frames.append(frame)
        
        if len(frames) < 5:
            return FaceVerificationResponse(
                embeddingVector=None,
                status=400,
                statusDetail="Không đủ frames hợp lệ. Vui lòng gửi lại video."
            )
        
        # Anti-spoofing on all frames
        anti_spoof = get_anti_spoof_service()
        spoof_result = anti_spoof.detect_video_frames(frames)
        
        if not spoof_result['is_real']:
            return FaceVerificationResponse(
                embeddingVector=None,
                status=400,
                statusDetail=f"Xác minh thất bại. Chỉ có {spoof_result['real_frame_ratio']*100:.1f}% frames là thật."
            )
        
        # Find the frame with highest confidence
        best_frame_idx = 0
        best_score = 0
        for detail in spoof_result.get('details', []):
            if detail.get('confidence', 0) > best_score:
                best_score = detail['confidence']
                best_frame_idx = detail.get('frame_index', 0)
        
        # Extract embedding from best frame
        face_service = get_face_recognition_service()
        embedding_result = face_service.get_embedding(frames[best_frame_idx])
        
        if not embedding_result['success']:
            return FaceVerificationResponse(
                embeddingVector=None,
                status=400,
                statusDetail=embedding_result.get('error', 'Không phát hiện được khuôn mặt.')
            )
        
        # Success
        return FaceVerificationResponse(
            embeddingVector=embedding_result['embedding'],
            status=200,
            statusDetail="Xác minh video thành công."
        )
        
    except Exception as e:
        return FaceVerificationResponse(
            embeddingVector=None,
            status=500,
            statusDetail=f"Lỗi server: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)