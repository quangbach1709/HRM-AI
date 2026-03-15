# -*- coding: utf-8 -*-
"""
RabbitMQ Publisher - Gửi message FaceEmbedding cho Backend Java
"""

import json
import logging
import os
import time
from typing import Dict, Any

import pika
from pika.exceptions import AMQPConnectionError

logger = logging.getLogger(__name__)

# Biến môi trường
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")

# Queue/Exchange constants — phải khớp với RabbitMQConfig.java phía backend
FACE_EMBEDDING_QUEUE = "face.embedding.queue"
FACE_EMBEDDING_EXCHANGE = "face.embedding.exchange"
FACE_EMBEDDING_ROUTING_KEY = "face.embedding.key"


def _create_connection() -> pika.BlockingConnection:
    """Tạo kết nối RabbitMQ với retry"""
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASSWORD)
    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials,
        heartbeat=600,
        blocked_connection_timeout=300,
    )
    return pika.BlockingConnection(parameters)


def publish_face_embedding(payload: Dict[str, Any], retries: int = 3) -> None:
    """
    Publish message FaceEmbedding lên RabbitMQ để backend Java tiêu thụ.

    Args:
        payload: Dict chứa thông tin FaceEmbedding cần lưu vào backend
        retries: Số lần thử lại nếu kết nối thất bại
    """
    for attempt in range(1, retries + 1):
        try:
            connection = _create_connection()
            channel = connection.channel()

            # Khai báo exchange và queue (idempotent - an toàn khi gọi nhiều lần)
            channel.exchange_declare(
                exchange=FACE_EMBEDDING_EXCHANGE,
                exchange_type="topic",
                durable=True,
            )
            channel.queue_declare(queue=FACE_EMBEDDING_QUEUE, durable=True)
            channel.queue_bind(
                queue=FACE_EMBEDDING_QUEUE,
                exchange=FACE_EMBEDDING_EXCHANGE,
                routing_key=FACE_EMBEDDING_ROUTING_KEY,
            )

            # Publish message
            channel.basic_publish(
                exchange=FACE_EMBEDDING_EXCHANGE,
                routing_key=FACE_EMBEDDING_ROUTING_KEY,
                body=json.dumps(payload, default=str),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # persistent message
                    content_type="application/json",
                ),
            )

            connection.close()
            logger.info(
                f"Published face embedding message for personId={payload.get('personId')}"
            )
            return

        except (AMQPConnectionError, Exception) as e:
            logger.warning(f"RabbitMQ publish attempt {attempt}/{retries} failed: {e}")
            if attempt < retries:
                time.sleep(2**attempt)  # exponential backoff
            else:
                logger.error(
                    f"Failed to publish face embedding message after {retries} attempts"
                )
                raise RuntimeError(
                    f"Không thể gửi message lên RabbitMQ: {str(e)}"
                ) from e
