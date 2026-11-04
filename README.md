# Hướng Dẫn Đưa Dự Án Trắc Nghiệm Trực Tuyến Lên GitHub và Render

Tài liệu này hướng dẫn từng bước đưa mã nguồn ứng dụng lên **GitHub** và deploy lên **Render** để lấy link công khai cho người chơi truy cập.

---

## Bước 1: Đưa mã nguồn lên GitHub

1. Giải nén file ZIP vừa tải về vào một thư mục trên máy tính.
2. Tạo một **New Repository** trên [GitHub](https://github.com):
   * **Repository name:** `realtime-quiz-game`
   * Chọn chế độ: **Public**.
   * Không tích chọn các tùy chọn khởi tạo khác. Nhấn **Create repository**.
3. Mở Terminal / Command Prompt tại thư mục dự án vừa giải nén và chạy các lệnh sau:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Quiz game source code"
   git branch -M main
   git remote add origin https://github.com/TEN_USER_GITHUB_CUA_BAN/realtime-quiz-game.git
   git push -u origin main
   ```
   *(Thay `TEN_USER_GITHUB_CUA_BAN` bằng tên tài khoản GitHub của bạn).*

---

## Bước 2: Đưa lên Render để lấy Link công khai (Miễn phí)

1. Truy cập [Render Dashboard](https://dashboard.render.com/) và đăng nhập bằng GitHub.
2. Nhấn nút **New +** ở góc trên bên phải và chọn **Web Service**.
3. Kết nối với kho chứa GitHub vừa tạo (`realtime-quiz-game`). Cấu hình:
   * **Name:** `realtime-quiz-game`
   * **Region:** Chọn khu vực (ví dụ: *Singapore*).
   * **Branch:** `main`.
   * **Runtime:** `Node`.
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
   * **Instance Type:** Chọn **Free**.
4. Nhấn **Create Web Service**.

---

## Bước 3: Sử dụng trong sự kiện

* **Link cho Người chơi (Mobile):** `https://ten-ung-dung.onrender.com/`
* **Link cho Ban Tổ chức / MC (Laptop):** `https://ten-ung-dung.onrender.com/admin.html`
