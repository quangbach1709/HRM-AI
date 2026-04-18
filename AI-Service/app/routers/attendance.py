# -*- coding: utf-8 -*-
"""
Router: Attendance
- Nhận ảnh / frames từ frontend qua API Gateway
- Kiểm tra tính thực của ảnh bằng Silent-Face-Anti-Spoofing
- Nếu phát hiện fake: trả về 400 yêu cầu xác minh bằng video
- Nếu real: trích xuất embedding và so khớp với DB AI Service
  (chỉ so với bản ghi có is_active=True và person_id khớp với nhân viên đang chấm công)
- Nếu khớp: publish RabbitMQ message tới Backend Java để cập nhật StaffWorkSchedule
- Trả về kết quả xác minh cho frontend
"""

import logging
import numpy as np
from typing import List, Optional

import cv2
from fastapi import APIRouter, Depends, File, Form, Header, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.face_embedding import FaceEmbedding
from app.services.anti_spoof import get_anti_spoof_service
from app.services.face_recognition import get_face_recognition_service
from app.services.rabbitmq_attendance_publisher import publish_attendance_result

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])

# Ngưỡng cosine similarity để coi là khớp khuôn mặt (ArcFace normalized vectors)
# - 0.50: Quá thấp — người khác dân tộc ~ 0.50-0.60 dễ pass
# - 0.65: Không đủ an toàn — khoảng chồng lấp giữa same/diff người
# - 0.72: Cân bằng tốt — same person (khác góc/ánh sáng) ≈ 0.65-0.90, diff person < 0.65
# - 0.80+: Quá khắt — fail với cùng người ở góc lệch nhiều
SIMILARITY_THRESHOLD = 0.72

# Tỷ lệ frames "real" tối thiểu để chấp nhận video
MIN_REAL_FRAME_RATIO = 0.7

# Số frames tối thiểu cho verify-video
MIN_FRAMES_FOR_VIDEO = 5


# ─── Response Models ──────────────────────────────────────────────────────────


class AttendanceVerifyResponse(BaseModel):
    """Kết quả xác minh khuôn mặt trả về cho frontend"""

    verified: bool
    requireVideoVerification: bool = False
    message: str
    personId: Optional[str] = None


# ─── Helpers ──────────────────────────────────────────────────────────────────


async def _decode_image(file: UploadFile) -> np.ndarray:
    """Đọc UploadFile và trả về numpy BGR array"""
    contents = await file.read()
    img_array = np.frombuffer(contents, dtype=np.uint8)
    image = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    return image


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    """
    Tính cosine similarity chính xác giữa 2 ArcFace embedding vectors.

    Luôn chia cho norm thực tế — không giả định vector đã L2-normalize.
    Lý do: dù get_normalized_embedding đã normalize, quá trình lưu vào
    PostgreSQL ARRAY(Float) và đọc ra có thể gây sai lệch nhỏ về magnitude.
    Nếu chỉ dùng dot product mà không chia norm, khi magnitude > 1.0 thì
    kết quả bị clamp về 1.0 → mọi khuôn mặt đều khớp (false positive).
    """
    va = np.array(a, dtype=np.float32)
    vb = np.array(b, dtype=np.float32)

    norm_a = np.linalg.norm(va)
    norm_b = np.linalg.norm(vb)

    if norm_a < 1e-8 or norm_b < 1e-8:
        logger.warning(f"Near-zero embedding vector: norm_a={norm_a:.6f}, norm_b={norm_b:.6f}")
        return 0.0

    if abs(norm_a - 1.0) > 0.05 or abs(norm_b - 1.0) > 0.05:
        logger.warning(
            f"Embedding not unit-normalized: norm_a={norm_a:.4f}, norm_b={norm_b:.4f}. "
            "Using proper cosine formula."
        )

    similarity = float(np.dot(va, vb) / (norm_a * norm_b))
    # Clamp [-1, 1] → sau đó max(0, ...) để score trong [0, 1]
    return float(max(0.0, min(1.0, similarity)))


def _match_face(
    input_vector: List[float],
    registered_embeddings: List[FaceEmbedding],
) -> tuple:
    """
    So khớp input_vector với các embedding đã đăng ký.
    Trả về (matched: bool, details: List[dict]) để logging chi tiết.
    """
    scores = []
    max_score = 0.0
    best_emb_id = None
    
    for emb in registered_embeddings:
        if emb.embedding_vector is None:
            logger.warning(f"Embedding {emb.id} has no vector")
            continue

        stored_vector = list(emb.embedding_vector)
        score = _cosine_similarity(input_vector, stored_vector)
        passed = score >= SIMILARITY_THRESHOLD
        
        scores.append({
            'emb_id': str(emb.id),
            'angle': emb.angle,
            'score': float(score),
            'passed': passed
        })
        
        if score > max_score:
            max_score = score
            best_emb_id = str(emb.id)
    
    # Log tất cả scores (INFO level để luôn thấy khi chấm công)
    logger.info(f"Face matching: threshold={SIMILARITY_THRESHOLD}")
    for s in scores:
        status = "✅ PASS" if s['passed'] else "❌ FAIL"
        logger.info(f"  {status} | ID={s['emb_id']} | angle={s['angle']} | score={s['score']:.4f}")
    
    logger.info(f"Best match: ID={best_emb_id}, score={max_score:.4f}")
    
    matched = any(s['passed'] for s in scores)
    return matched, scores


# ─── Endpoints ────────────────────────────────────────────────────────────────


@router.post("/check-image", response_model=AttendanceVerifyResponse)
async def check_attendance_image(
    file: UploadFile = File(...),
    staffId: str = Form(...),
    shiftWorkType: int = Form(3),
    x_auth_username: str = Header(None, alias="X-Auth-Username"),
    db: Session = Depends(get_db),
):
    """
    Xác minh khuôn mặt bằng ảnh đơn cho chấm công.

    - Kiểm tra anti-spoofing
    - Trích xuất embedding
    - So khớp với bản ghi đã duyệt (is_active=True) của nhân viên (theo X-Auth-Username)
    - Nếu khớp: publish RabbitMQ tới Backend để cập nhật StaffWorkSchedule

    Form fields:
        file: Ảnh khuôn mặt
        staffId: UUID của Staff bên backend
        shiftWorkType: Loại ca (1=sáng, 2=chiều, 3=nguyên ngày)

    Header bắt buộc (inject bởi API Gateway):
        X-Auth-Username: <username của nhân viên>
    """
    if not x_auth_username:
        raise HTTPException(
            status_code=401,
            detail="Không xác định được người dùng. Vui lòng đăng nhập lại.",
        )

    # 1. Decode ảnh
    image = await _decode_image(file)
    if image is None:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=False,
            message="Không thể đọc ảnh. Vui lòng kiểm tra định dạng file.",
        )

    # 2. Anti-spoofing
    anti_spoof = get_anti_spoof_service()
    spoof_result = anti_spoof.detect_single_image(image)

    if not spoof_result["is_real"] or spoof_result.get("need_verification", False):
        msg = (
            "Phát hiện nghi ngờ giả mạo khuôn mặt. Vui lòng xác minh bằng video 3 giây."
            if not spoof_result["is_real"]
            else "Cần xác minh thêm. Vui lòng quay video ngắn 3 giây."
        )
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=True,
            message=msg,
        )

    # 3. Trích xuất embedding
    face_service = get_face_recognition_service()
    embedding_result = face_service.get_embedding(image)

    if not embedding_result["success"]:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=False,
            message=embedding_result.get(
                "error", "Không phát hiện được khuôn mặt trong ảnh."
            ),
        )

    input_vector: List[float] = embedding_result["embedding"]

    # 4. Truy vấn embedding đã duyệt theo person_id (= username)
    registered = (
        db.query(FaceEmbedding)
        .filter(
            FaceEmbedding.person_id == x_auth_username,
            FaceEmbedding.is_active == True,  # noqa: E712
        )
        .all()
    )

    if not registered:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=False,
            message="Chưa có khuôn mặt đã được duyệt cho tài khoản này. Vui lòng đăng ký và chờ HR duyệt.",
        )

    # 5. So khớp
    matched, match_details = _match_face(input_vector, registered)

    if not matched:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=False,
            message="Khuôn mặt không khớp với dữ liệu đã đăng ký. Vui lòng thử lại.",
        )

    # 6. Publish RabbitMQ tới Backend Java để cập nhật StaffWorkSchedule
    try:
        publish_attendance_result(
            staff_id=staffId,
            username=x_auth_username,
            shift_work_type=shiftWorkType,
        )
        logger.info(
            "Published attendance result for username=%s staffId=%s shiftWorkType=%s",
            x_auth_username,
            staffId,
            shiftWorkType,
        )
    except Exception as e:
        logger.error("Không thể publish attendance result: %s", e, exc_info=True)
        # Không block response — báo lỗi nhẹ nhàng hơn
        return AttendanceVerifyResponse(
            verified=True,
            requireVideoVerification=False,
            message="Xác minh khuôn mặt thành công nhưng có lỗi khi gửi dữ liệu chấm công. Vui lòng thử lại.",
            personId=x_auth_username,
        )

    return AttendanceVerifyResponse(
        verified=True,
        requireVideoVerification=False,
        message="Xác minh khuôn mặt thành công. Chấm công đã được ghi nhận.",
        personId=x_auth_username,
    )


@router.post("/verify-video", response_model=AttendanceVerifyResponse)
async def verify_attendance_video(
    files: List[UploadFile] = File(...),
    staffId: str = Form(...),
    shiftWorkType: int = Form(3),
    x_auth_username: str = Header(None, alias="X-Auth-Username"),
    db: Session = Depends(get_db),
):
    """
    Xác minh khuôn mặt bằng video (nhiều frames) cho chấm công.

    - Nhận ≥5 frames
    - Kiểm tra anti-spoofing trên từng frame (≥70% phải là real)
    - Trích xuất embedding từ frame có chất lượng tốt nhất
    - So khớp với bản ghi đã duyệt của nhân viên
    - Nếu khớp: publish RabbitMQ tới Backend để cập nhật StaffWorkSchedule

    Form fields:
        files: Danh sách frame ảnh từ video
        staffId: UUID của Staff bên backend
        shiftWorkType: Loại ca (1=sáng, 2=chiều, 3=nguyên ngày)

    Header bắt buộc (inject bởi API Gateway):
        X-Auth-Username: <username của nhân viên>
    """
    if not x_auth_username:
        raise HTTPException(
            status_code=401,
            detail="Không xác định được người dùng. Vui lòng đăng nhập lại.",
        )

    if len(files) < MIN_FRAMES_FOR_VIDEO:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=True,
            message=f"Cần ít nhất {MIN_FRAMES_FOR_VIDEO} frames. Vui lòng quay lại.",
        )

    # 1. Decode tất cả frames
    images: List[np.ndarray] = []
    for f in files:
        img = await _decode_image(f)
        if img is not None:
            images.append(img)

    if len(images) < MIN_FRAMES_FOR_VIDEO:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=True,
            message="Không đủ frames hợp lệ. Vui lòng quay lại.",
        )

    # 2. Anti-spoofing — kiểm tra từng frame
    anti_spoof = get_anti_spoof_service()
    real_count = 0
    real_images: List[np.ndarray] = []

    for img in images:
        result = anti_spoof.detect_single_image(img)
        if result.get("is_real", False):
            real_count += 1
            real_images.append(img)

    real_ratio = real_count / len(images)
    logger.info(
        "Video verification: %d/%d frames real (ratio=%.2f)",
        real_count,
        len(images),
        real_ratio,
    )

    if real_ratio < MIN_REAL_FRAME_RATIO:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=True,
            message=f"Phát hiện nghi ngờ giả mạo ({int(real_ratio * 100)}% frames hợp lệ). Vui lòng thử lại.",
        )

    # 3. Trích xuất embedding từ các real frames — chọn frame có face confidence cao nhất
    face_service = get_face_recognition_service()
    best_embedding: Optional[List[float]] = None
    best_face_confidence = 0.0

    for img in real_images:
        result = face_service.get_embedding(img)
        if result["success"]:
            face_conf = result.get("face_confidence", 1.0)
            if face_conf > best_face_confidence:
                best_embedding = result["embedding"]
                best_face_confidence = face_conf

    logger.info(
        "Video embedding: best frame face_confidence=%.4f from %d real frames",
        best_face_confidence,
        len(real_images),
    )

    if best_embedding is None:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=True,
            message="Không phát hiện được khuôn mặt rõ ràng trong video. Vui lòng thử lại.",
        )

    # 4. Truy vấn embedding đã duyệt
    registered = (
        db.query(FaceEmbedding)
        .filter(
            FaceEmbedding.person_id == x_auth_username,
            FaceEmbedding.is_active == True,  # noqa: E712
        )
        .all()
    )

    if not registered:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=False,
            message="Chưa có khuôn mặt đã được duyệt cho tài khoản này. Vui lòng đăng ký và chờ HR duyệt.",
        )

    # 5. So khớp
    matched, match_details = _match_face(best_embedding, registered)

    if not matched:
        return AttendanceVerifyResponse(
            verified=False,
            requireVideoVerification=False,
            message="Khuôn mặt không khớp với dữ liệu đã đăng ký. Vui lòng thử lại.",
        )

    # 6. Publish RabbitMQ
    try:
        publish_attendance_result(
            staff_id=staffId,
            username=x_auth_username,
            shift_work_type=shiftWorkType,
        )
        logger.info(
            "Published attendance result (video) for username=%s staffId=%s",
            x_auth_username,
            staffId,
        )
    except Exception as e:
        logger.error("Không thể publish attendance result: %s", e, exc_info=True)
        return AttendanceVerifyResponse(
            verified=True,
            requireVideoVerification=False,
            message="Xác minh khuôn mặt thành công nhưng có lỗi khi gửi dữ liệu chấm công. Vui lòng thử lại.",
            personId=x_auth_username,
        )

    return AttendanceVerifyResponse(
        verified=True,
        requireVideoVerification=False,
        message="Xác minh khuôn mặt qua video thành công. Chấm công đã được ghi nhận.",
        personId=x_auth_username,
    )
