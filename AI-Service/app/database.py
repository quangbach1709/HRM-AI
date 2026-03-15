# -*- coding: utf-8 -*-
"""
Database configuration - PostgreSQL via SQLAlchemy
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Tải .env từ thư mục gốc của AI-Service
load_dotenv(".env")  # Ưu tiên nếu chạy từ AI-Service/
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env")) # Fallback cho các trường hợp khác

# Ưu tiên lấy DATABASE_URL đầy đủ, nếu không có sẽ ghép từ các biến riêng lẻ
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    db_user = os.getenv("DB_USERNAME", "postgres")
    db_pass = os.getenv("DB_PASSWORD", "postgres")
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = os.getenv("DB_PORT", "5432")
    db_name = os.getenv("DB_NAME", "hr_db")
    DATABASE_URL = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency injection cho FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Tạo tất cả bảng nếu chưa tồn tại"""
    from app.models import face_embedding  # noqa: F401 - import để register model

    Base.metadata.create_all(bind=engine)
