# -*- coding: utf-8 -*-
"""
Router: Face Registration
- Nhận 3 ảnh (front / left / right) từ frontend qua API Gateway
- Trích xuất vector khuôn mặt bằng ArcFace (KHÔNG anti-spoof — để HR rà soát)
- Upload ảnh lên MinIO
- Lưu FaceEmbedding vào DB riêng của AI Service (PostgreSQL)
- Publish message lên RabbitMQ để Backend Java lưu metadata (FaceEmbedding không có vector)
"""

import logging
from typing import List

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.face_embedding import FaceEmbedding
from app.services.face_recognition import get_face_recognition_service
from app.services.minio_service import upload_image
from app.services.rabbitmq_publisher import publish_face_embedding

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/face-registration", tags=["Face Registration"])

# Nhãn góc mặt theo thứ tự gửi từ frontend
ANGLE_LABELS = ["front", "left", "right"]


# ─── Response Models ──────────────────────────────────────────────────────────


class RegisteredFaceDto(BaseModel):
    """Thông tin một khuôn mặt đã đăng ký, trả về cho frontend"""

    id: str
    personId: str
    imageUrl: str
    angle: str
    modelVersion: str
    active: bool
    message: str

    class Config:
        from_attributes = True


class FaceRegistrationResponse(BaseModel):
    success: bool
    message: str
    data: List[RegisteredFaceDto] = []


# ─── Helpers ─────────────────────────────────────────────────────────────────


async def _decode_image(file: UploadFile) -> np.ndarray:
    """Đọc UploadFile và chuyển thành numpy BGR array"""
    contents = await file.read()
    img_array = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"Không thể decode ảnh: {file.filename}")
    # Reset để lấy lại bytes gốc nếu cần
    await file.seek(0)
    return image, contents


# ─── Endpoint ────────────────────────────────────────────────────────────────


@router.post("/register", response_model=FaceRegistrationResponse)
async def register_face(
    frames: List[UploadFile] = File(
        ..., description="3 ảnh theo thứ tự: mặt thẳng, trái, phải"
    ),
    x_auth_username: str = Header(None, alias="X-Auth-Username"),
    db: Session = Depends(get_db),
):
    """
    Đăng ký khuôn mặt nhân viên.

    - Nhận 3 ảnh (front / left / right)
    - Trích xuất embedding vector bằng ArcFace (không kiểm tra anti-spoof)
    - Upload ảnh lên MinIO
    - Lưu embedding vào DB AI Service
    - Publish message vào RabbitMQ để Backend Java tạo FaceEmbedding metadata

    Header bắt buộc (inject bởi API Gateway):
        X-Auth-Username: <username của nhân viên>

    Body (multipart/form-data):
        frames: 3 file ảnh (front → left → right)
    """
    if len(frames) != 3:
        raise HTTPException(
            status_code=400,
            detail="Cần đúng 3 ảnh theo thứ tự: mặt thẳng, mặt trái, mặt phải",
        )

    if not x_auth_username:
        raise HTTPException(
            status_code=401,
            detail="Không xác định được người dùng. Vui lòng đăng nhập lại.",
        )

    face_service = get_face_recognition_service()
    registered: List[RegisteredFaceDto] = []

    for idx, file in enumerate(frames):
        angle = ANGLE_LABELS[idx]

        # 1. Decode ảnh
        try:
            image, raw_bytes = await _decode_image(file)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

        # 2. Trích xuất embedding (không anti-spoof)
        embedding_result = face_service.get_embedding(image)
        if not embedding_result["success"]:
            raise HTTPException(
                status_code=400,
                detail=f"Ảnh góc '{angle}': {embedding_result.get('error', 'Không phát hiện được khuôn mặt')}",
            )

        embedding_vector: List[float] = embedding_result["embedding"]

        # 3. Upload ảnh lên MinIO
        content_type = file.content_type or "image/jpeg"
        try:
            object_key, public_url = upload_image(raw_bytes, content_type)
        except Exception as e:
            logger.error(f"MinIO upload error for angle={angle}: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi upload ảnh: {str(e)}")

        # 4. Lưu embedding vào DB AI Service
        db_embedding = FaceEmbedding(
            person_id=x_auth_username,  # dùng username làm định danh tạm (backend sẽ resolve personId)
            embedding_vector=embedding_vector,
            image_object_key=object_key,
            image_url=public_url,
            is_active=False,  # chờ HR duyệt
            model_version="ArcFace_v1",
            angle=angle,
        )
        db.add(db_embedding)
        db.flush()  # để lấy db_embedding.id ngay mà chưa commit

        # 5. Publish message lên RabbitMQ cho Backend Java
        message_payload = {
            "aiEmbeddingId": str(db_embedding.id),
            "username": x_auth_username,
            "imageUrl": public_url,
            "imageObjectKey": object_key,
            "angle": angle,
            "modelVersion": "ArcFace_v1",
            "isActive": False,
        }
        try:
            publish_face_embedding(message_payload)
        except RuntimeError as e:
            # Rollback db nếu không gửi được message (đảm bảo tính nhất quán)
            db.rollback()
            logger.error(f"RabbitMQ publish failed: {e}")
            raise HTTPException(status_code=500, detail=f"Lỗi hàng đợi: {str(e)}")

        registered.append(
            RegisteredFaceDto(
                id=str(db_embedding.id),
                personId=x_auth_username,
                imageUrl=public_url,
                angle=angle,
                modelVersion="ArcFace_v1",
                active=False,
                message=f"Đã xử lý ảnh góc '{angle}' thành công",
            )
        )

    db.commit()

    return FaceRegistrationResponse(
        success=True,
        message="Đã gửi đăng ký khuôn mặt. Vui lòng chờ HR xét duyệt.",
        data=registered,
    )
