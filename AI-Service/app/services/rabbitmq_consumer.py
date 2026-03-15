# -*- coding: utf-8 -*-
"""
RabbitMQ Consumer — Face Approval
Lắng nghe message từ Backend Java khi HR duyệt khuôn mặt.
Cập nhật is_active = True cho bản ghi FaceEmbedding trong DB của AI Service.
"""

import json
import logging
import os
import threading
import time

import pika
from pika.exceptions import AMQPConnectionError

logger = logging.getLogger(__name__)

# ── Biến môi trường ────────────────────────────────────────────────────────────
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")

# ── Queue/Exchange constants — phải khớp với RabbitMQConfig.java ──────────────
FACE_APPROVAL_QUEUE = "face.approval.queue"
FACE_APPROVAL_EXCHANGE = "face.approval.exchange"
FACE_APPROVAL_ROUTING_KEY = "face.approval.key"

# ── Retry settings ─────────────────────────────────────────────────────────────
RECONNECT_DELAY_SECONDS = 5


def _create_connection() -> pika.BlockingConnection:
    """Tạo kết nối RabbitMQ"""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300,
    )
    return pika.BlockingConnection(parameters)


def _handle_approval_message(channel, method, properties, body):
    """
    Callback xử lý message duyệt khuôn mặt từ Backend Java.
    Cập nhật is_active = True cho bản ghi trong tbl_ai_face_embedding.
    """
    # Import ở đây để tránh circular import khi module load
    from app.database import SessionLocal
    from app.models.face_embedding import FaceEmbedding

    try:
        payload = json.loads(body)
        ai_embedding_id = payload.get("aiEmbeddingId")
        is_active = payload.get("isActive", True)
        approved_by = payload.get("approvedBy", "unknown")

        if not ai_embedding_id:
            logger.error("Message thiếu aiEmbeddingId, bỏ qua: %s", payload)
            channel.basic_ack(delivery_tag=method.delivery_tag)
            return

        db = SessionLocal()
        try:
            embedding = (
                db.query(FaceEmbedding)
                .filter(FaceEmbedding.id == ai_embedding_id)
                .first()
            )

            if embedding is None:
                logger.warning(
                    "Không tìm thấy FaceEmbedding với id=%s trong AI DB",
                    ai_embedding_id,
                )
                channel.basic_ack(delivery_tag=method.delivery_tag)
                return

            embedding.is_active = is_active
            db.commit()
            logger.info(
                "Đã cập nhật is_active=%s cho aiEmbeddingId=%s (approvedBy=%s)",
                is_active,
                ai_embedding_id,
                approved_by,
            )
        finally:
            db.close()

        channel.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        logger.error("Lỗi xử lý approval message: %s", e, exc_info=True)
        # Nack và không requeue để tránh poison-message loop
        channel.basic_nack(delivery_tag=method.delivery_tag, requeue=False)


def _consume_loop():
    """
    Vòng lặp tiêu thụ message với tự động kết nối lại khi mất kết nối.
    Chạy trong daemon thread riêng để không block FastAPI event loop.
    """
    while True:
        try:
            logger.info(
                "Đang kết nối RabbitMQ consumer tại %s:%s ...",
                RABBITMQ_HOST,
                RABBITMQ_PORT,
            )
            connection = _create_connection()
            channel = connection.channel()

            # Khai báo exchange và queue (idempotent)
            channel.exchange_declare(
                exchange=FACE_APPROVAL_EXCHANGE,
                exchange_type="topic",
                durable=True,
            )
            channel.queue_declare(queue=FACE_APPROVAL_QUEUE, durable=True)
            channel.queue_bind(
                queue=FACE_APPROVAL_QUEUE,
                exchange=FACE_APPROVAL_EXCHANGE,
                routing_key=FACE_APPROVAL_ROUTING_KEY,
            )

            # Chỉ xử lý 1 message tại một thời điểm
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(
                queue=FACE_APPROVAL_QUEUE,
                on_message_callback=_handle_approval_message,
            )

            logger.info(
                "Face Approval consumer đã sẵn sàng, đang lắng nghe queue '%s'...",
                FACE_APPROVAL_QUEUE,
            )
            channel.start_consuming()

        except AMQPConnectionError as e:
            logger.warning(
                "Mất kết nối RabbitMQ: %s. Thử lại sau %ds...",
                e,
                RECONNECT_DELAY_SECONDS,
            )
            time.sleep(RECONNECT_DELAY_SECONDS)
        except Exception as e:
            logger.error(
                "Lỗi không xác định trong consumer loop: %s. Thử lại sau %ds...",
                e,
                RECONNECT_DELAY_SECONDS,
            )
            time.sleep(RECONNECT_DELAY_SECONDS)


def start_face_approval_consumer():
    """
    Khởi chạy consumer trong daemon thread.
    Gọi từ lifespan() của FastAPI khi startup.
    """
    thread = threading.Thread(
        target=_consume_loop, daemon=True, name="face-approval-consumer"
    )
    thread.start()
    logger.info("Face Approval consumer thread đã khởi động.")
