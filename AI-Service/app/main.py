# -*- coding: utf-8 -*-
"""
FastAPI Main Application
"""

from typing import List, Optional
from fastapi import FastAPI
from pydantic import BaseModel
from contextlib import asynccontextmanager

from app.database import create_tables
from app.routers import face_registration, attendance
from app.services.rabbitmq_consumer import start_face_approval_consumer


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi tạo database tables khi startup
    create_tables()
    # Khởi chạy consumer lắng nghe message duyệt khuôn mặt từ Backend Java
    start_face_approval_consumer()
    yield


app = FastAPI(
    title="Face Attendance System API",
    description="API cho hệ thống chấm công bằng khuôn mặt",
    version="1.0.0",
    lifespan=lifespan,
)

# Đăng ký routers
app.include_router(face_registration.router)
app.include_router(attendance.router)


# ====================== BASIC ENDPOINTS ======================


@app.get("/")
async def root():
    return {"message": "Face Attendance System API is running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
