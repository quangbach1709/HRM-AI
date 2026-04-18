# -*- coding: utf-8 -*-
"""
RabbitMQ Attendance Publisher
Gửi kết quả xác minh khuôn mặt chấm công sang Backend Java.
Backend sẽ cập nhật StaffWorkSchedule (check-in / check-out).
"""

import json
import logging
import os
import time
from typing import Optional

import pika
from pika.exceptions import AMQPConnectionError

logger = logging.getLogger(__name__)

# Biến môi trường
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "guest")

# Queue/Exchange constants — phải khớp với RabbitMQConfig.java phía backend
ATTENDANCE_RESULT_QUEUE = "attendance.result.queue"
ATTENDANCE_RESULT_EXCHANGE = "attendance.result.exchange"
ATTENDANCE_RESULT_ROUTING_KEY = "attendance.result.key"


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


def publish_attendance_result(
    staff_id: str,
    username: str,
    shift_work_type: int,
    retries: int = 3,
) -> None:
    """
    Publish message kết quả chấm công lên RabbitMQ để backend Java tiêu thụ.

    Args:
        staff_id: UUID của Staff bên backend Java
        username: Username của nhân viên (để log)
        shift_work_type: Loại ca làm việc (1=sáng, 2=chiều, 3=nguyên ngày)
        retries: Số lần thử lại nếu kết nối thất bại
    """
    payload = {
        "staffId": staff_id,
        "username": username,
        "shiftWorkType": shift_work_type,
    }

    for attempt in range(1, retries + 1):
        try:
            connection = _create_connection()
            channel = connection.channel()

            # Khai báo exchange và queue (idempotent)
            channel.exchange_declare(
                exchange=ATTENDANCE_RESULT_EXCHANGE,
                exchange_type="topic",
                durable=True,
            )
            channel.queue_declare(queue=ATTENDANCE_RESULT_QUEUE, durable=True)
            channel.queue_bind(
                queue=ATTENDANCE_RESULT_QUEUE,
                exchange=ATTENDANCE_RESULT_EXCHANGE,
                routing_key=ATTENDANCE_RESULT_ROUTING_KEY,
            )

            channel.basic_publish(
                exchange=ATTENDANCE_RESULT_EXCHANGE,
                routing_key=ATTENDANCE_RESULT_ROUTING_KEY,
                body=json.dumps(payload, default=str),
                properties=pika.BasicProperties(
                    delivery_mode=2,  # persistent
                    content_type="application/json",
                ),
            )

            connection.close()
            logger.info(
                "Published attendance result: staffId=%s username=%s shiftWorkType=%s",
                staff_id,
                username,
                shift_work_type,
            )
            return

        except (AMQPConnectionError, Exception) as e:
            logger.warning(
                "RabbitMQ attendance publish attempt %d/%d failed: %s",
                attempt,
                retries,
                e,
            )
            if attempt < retries:
                time.sleep(2**attempt)
            else:
                logger.error(
                    "Failed to publish attendance result after %d attempts", retries
                )
                raise RuntimeError(
                    f"Không thể gửi kết quả chấm công lên RabbitMQ: {str(e)}"
                ) from e
