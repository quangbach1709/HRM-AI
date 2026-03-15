# -*- coding: utf-8 -*-
"""
SQLAlchemy models cho AI Service
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Float
from sqlalchemy.dialects.postgresql import UUID, ARRAY

from app.database import Base


class FaceEmbedding(Base):
    """
    Lưu trữ vector khuôn mặt và thông tin đăng ký của AI Service.
    Backend Java chỉ lưu metadata (personId, imageUrl) — vector lưu ở đây.
    """

    __tablename__ = "tbl_ai_face_embedding"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # ID của Person bên backend Java (UUID dạng string để không cần FK cross-service)
    person_id = Column(String(36), nullable=False, index=True)

    # 512-dim ArcFace vector
    embedding_vector = Column(ARRAY(Float), nullable=False)

    # Object key trong MinIO (ví dụ: "face-embeddings/<uuid>.jpg")
    image_object_key = Column(String(512), nullable=True)

    # URL công khai truy cập ảnh từ MinIO
    image_url = Column(Text, nullable=True)

    # Trạng thái: False = chờ HR duyệt, True = đã duyệt
    is_active = Column(Boolean, default=False, nullable=False)

    # Phiên bản model AI
    model_version = Column(String(50), default="ArcFace_v1", nullable=False)

    # Góc chụp: front / left / right
    angle = Column(String(20), nullable=True)

    # Audit
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
