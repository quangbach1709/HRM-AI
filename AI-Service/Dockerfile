# Build stage
FROM python:3.10-slim AS builder

WORKDIR /app

# Cài đặt công cụ build
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt

# Runtime stage
FROM python:3.10-slim

WORKDIR /app

# Cài đặt thư viện hệ thống cho OpenCV (Silent-Face-Anti-Spoofing cần)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy bánh (wheels) và cài đặt
COPY --from=builder /app/wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy mã nguồn
COPY . .

# Đảm bảo thư mục models tồn tại
RUN mkdir -p /app/Silent-Face-Anti-Spoofing/resources

# Chạy trực tiếp uvicorn (Docker đã là môi trường cô lập, không cần venv)
EXPOSE 8000

# Health check dùng curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/docs || exit 1

# Lệnh khởi chạy chính xác như bạn yêu cầu
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
