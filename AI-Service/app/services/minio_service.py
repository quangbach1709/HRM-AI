# -*- coding: utf-8 -*-
"""
MinIO Service - Upload ảnh lên object storage và trả về URL công khai
"""

import io
import os
import uuid
from typing import Tuple

from minio import Minio
from minio.error import S3Error

# Biến môi trường
MINIO_ENDPOINT = os.getenv("MINIO_ENDPOINT", "localhost:9002")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.getenv("MINIO_BUCKET", "hrm-files")
MINIO_PUBLIC_BASE_URL = os.getenv("MINIO_PUBLIC_BASE_URL", "http://localhost:9002")

# Loại bỏ schema khỏi endpoint nếu có (Minio client không nhận http://)
_endpoint = MINIO_ENDPOINT.replace("http://", "").replace("https://", "")
_secure = MINIO_ENDPOINT.startswith("https://")


def _get_client() -> Minio:
    return Minio(
        _endpoint,
        access_key=MINIO_ACCESS_KEY,
        secret_key=MINIO_SECRET_KEY,
        secure=_secure,
    )


def _ensure_bucket(client: Minio) -> None:
    """Tạo bucket nếu chưa tồn tại và set public-read policy"""
    if not client.bucket_exists(MINIO_BUCKET):
        client.make_bucket(MINIO_BUCKET)
        # Public-read policy (giống backend Java)
        import json

        policy = json.dumps(
            {
                "Version": "2012-10-17",
                "Statement": [
                    {
                        "Effect": "Allow",
                        "Principal": {"AWS": ["*"]},
                        "Action": ["s3:GetObject"],
                        "Resource": [f"arn:aws:s3:::{MINIO_BUCKET}/*"],
                    }
                ],
            }
        )
        client.set_bucket_policy(MINIO_BUCKET, policy)


def upload_image(
    image_bytes: bytes, content_type: str = "image/jpeg"
) -> Tuple[str, str]:
    """
    Upload ảnh lên MinIO.

    Returns:
        (object_key, public_url)
    """
    client = _get_client()
    _ensure_bucket(client)

    # Tạo object key: face-embeddings/<uuid>.jpg
    ext = "jpg" if "jpeg" in content_type else content_type.split("/")[-1]
    object_key = f"face-embeddings/{uuid.uuid4()}.{ext}"

    client.put_object(
        bucket_name=MINIO_BUCKET,
        object_name=object_key,
        data=io.BytesIO(image_bytes),
        length=len(image_bytes),
        content_type=content_type,
    )

    # URL công khai trực tiếp (bucket đã set public-read)
    public_url = f"{MINIO_PUBLIC_BASE_URL}/{MINIO_BUCKET}/{object_key}"
    return object_key, public_url
