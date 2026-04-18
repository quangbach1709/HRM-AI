# 🚀 HRM-AI: Hệ Thống Quản Trị Nhân Sự Tích Hợp AI

**HRM-AI** là một giải pháp quản lý nguồn nhân lực toàn diện, kết hợp công nghệ trí tuệ nhân tạo hiện đại để tối ưu hóa quy trình quản lý, tuyển dụng và điểm danh của doanh nghiệp.

## ✨ Tính năng chính

### 1. 🛡️ AI & Bảo Mật (AI Service)
- **Face Recognition:** Nhận diện khuôn mặt chính xác phục vụ cho việc điểm danh và xác thực người dùng.
- **Silent Face Anti-Spoofing:** Chống giả mạo khuôn mặt (bằng ảnh hoặc video) để đảm bảo tính minh bạch khi điểm danh.
- **Tự động hóa:** Tích hợp sâu vào quy trình chấm công qua camera.

### 2. 📊 Quản Lý Nhân Sự (HR Management)
- **Quản lý Nhân viên:** Theo dõi hồ sơ, thông tin cá nhân, bằng cấp và hợp đồng lao động.
- **Quản lý Tuyển dụng:** Xử lý hồ sơ ứng viên (Candidates) và các yêu cầu tuyển dụng (Recruitment Requests).
- **Phân quyền (RBAC):** Hệ thống phân quyền chi tiết cho Admin, HR, Manager và Employee.

### 3. 💸 Quản Lý Lương & Phúc Lợi (Payroll)
- **Bảng lương tự động:** Tính toán lương dựa trên công thực tế, phụ cấp và các khoản giảm trừ.
- **Template lương:** Tùy chỉnh các mẫu tính lương linh hoạt cho từng phòng ban hoặc vị trí.
- **Lịch làm việc:** Quản lý ca làm việc và lịch trình làm việc (Work Schedules).

### 4. 📈 Dashboard & Báo Cáo
- **Thống kê trực quan:** Cung cấp cái nhìn tổng quan về tình hình nhân sự, tuyển dụng qua các biểu đồ hiện đại.
- **Theo dõi thời gian thực:** Cập nhật trạng thái điểm danh và tiến độ công việc ngay lập tức.

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend (React/TypeScript)
- **UI/UX:** TailwindCSS, Shadcn UI mang lại trải nghiệm người dùng hiện đại, mượt mà.
- **State Management:** Hooks & Context API.
- **Build Tool:** Vite.

### Backend (Java Spring Boot)
- **Framework:** Spring Boot 3.x.
- **Database:** PostgreSQL / MySQL.
- **Authentication:** Spring Security & JWT.
- **Architecture:** Microservices-ready / Clean Architecture.

### AI Service (Python)
- **Framework:** FastAPI.
- **AI Models:** OpenCV, PyTorch, Silent-Face-Anti-Spoofing.

---

## 📂 Cấu Trúc Dự Án

```text
HRM-AI/
├── AI-Service/     # Dịch vụ AI (Python/FastAPI)
├── backend/        # Logic nghiệp vụ (Java/Spring Boot)
├── frontend/       # Giao diện người dùng (React/Vite)
└── uploads/        # Lưu trữ dữ liệu hình ảnh, hồ sơ
```

---

## ⚙️ Cài Đặt Nhanh

### 1. AI Service
```bash
cd AI-Service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
deactivate
```

### 2. Backend
```bash
cd backend
./mvnw spring-boot:run
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🤝 Đóng Góp
Mọi ý kiến đóng góp hoặc báo lỗi vui lòng mở **Issue** hoặc tạo **Pull Request**.

---
*Phát triển bởi [quangbach1709](https://github.com/quangbach1709)*
