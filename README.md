# 📚 Library Management System - Deep Blue Edition

Một hệ thống Quản lý Thư viện số toàn diện được xây dựng bằng **Spring Boot 3** ở phía Backend và **React (Vite)** ở phía Frontend, tích hợp giao diện hiện đại mang phong cách Glassmorphism và màu sắc "Deep Blue" cực kỳ sang trọng.

## 🌟 Tính năng nổi bật

### Dành cho Quản trị viên (Manager)
- **Bảng điều khiển (Dashboard)**: Xem tổng quan hệ thống.
- **Quản lý Người dùng**: 
  - Xem danh sách, cập nhật tên hiển thị người dùng.
  - Khóa/Mở khóa tài khoản (Thay đổi trạng thái `AVAILABLE`/`UNAVAILABLE`).
  - Đặt lại mật khẩu (Reset password) nhanh.
  - Xóa người dùng.
- **Quản lý Thể loại**: Xem, thêm mới, chỉnh sửa và xóa các thể loại sách (Category).
- **Quản lý Đầu sách**: Thêm mới sách, sửa thông tin, đổi ảnh bìa, cập nhật số lượng tồn kho.
- **Mượn / Trả sách**: Quản lý lịch sử mượn trả của độc giả.

### Dành cho Độc giả (Borrower)
- **Đăng ký & Đăng nhập**: Form đăng nhập/đăng ký hiện đại, hỗ trợ JWT Token bảo mật.
- Khám phá các đầu sách và theo dõi lịch sử mượn trả cá nhân (Borrower Dashboard).

## 🛠 Công nghệ sử dụng

### Backend
- **Java 17** & **Spring Boot 3**
- **Spring Security** kết hợp **JWT** (JSON Web Token) để xác thực và phân quyền (RBAC).
- **Spring Data JPA** để tương tác cơ sở dữ liệu.
- Cấu trúc kiến trúc phân tầng chuẩn: Controller, Service, Repository, Entity, DTO.

### Frontend
- **React 19** (Khởi tạo bằng Vite siêu tốc).
- **React Router v7** để điều hướng linh hoạt (SPA).
- **Axios** kết hợp với custom `api.js` interceptor để tự động gắn kèm Bearer Token.
- **Bootstrap 5** & **Custom CSS** cho giao diện thẩm mỹ và reponsive.

---

## 🚀 Hướng dẫn cài đặt và chạy ứng dụng

### 1. Khởi động Backend (Spring Boot)

Mở terminal, điều hướng vào thư mục gốc của project (nơi chứa file `pom.xml`) và chạy lệnh sau (yêu cầu máy có sẵn JDK 17):

Trên Windows:
```bash
./mvnw clean spring-boot:run
```
Trên macOS/Linux:
```bash
./mvnw clean spring-boot:run
```
*Backend sẽ chạy trên cổng `http://localhost:8080`.*

### 2. Khởi động Frontend (React / Vite)

Mở một terminal khác, di chuyển vào thư mục `frontend`:
```bash
cd frontend
```
Cài đặt các gói phụ thuộc (chỉ cần chạy lần đầu tiên):
```bash
npm install
```
Chạy máy chủ phát triển (Dev Server):
```bash
npm run dev
```
*Mở trình duyệt và truy cập vào đường dẫn do Vite cung cấp (thường là `http://localhost:5173`).*

---

## 👤 Tài khoản thử nghiệm (Test Accounts)

Sau khi hệ thống khởi tạo (qua `DataInitializer.java`), bạn có thể sử dụng các tài khoản có sẵn sau:

- **Admin / Quản lý**:
  - Username: `admin`
  - Password: `adminpassword` (hoặc mật khẩu mặc định nếu được reset)

- **User / Độc giả**:
  - Username: `user` hoặc bạn có thể tự Đăng ký mới ngoài màn hình Login.

## 🤝 Tác giả

Được phát triển và cập nhật theo yêu cầu trong quá trình xây dựng hệ thống Quản lý Thư viện "Deep Blue Edition".
