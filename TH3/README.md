# Bài thực hành số 3: NodeJS + Express + EJS
Dự án này là một ứng dụng web cơ bản sử dụng đặt tour du lịch
 **Express** và công cụ render giao diện **EJS**. Website giới thiệu danh sách các địa điểm du lịch, cho phép xem chi tiết từng địa điểm thông qua Route động.
## Thông tin sinh viên
- **Họ và tên:** Đoàn Nguyễn Gia Hưng
- **Lớp:** CNTT 46A
- **Mã số sinh viên:** 4651050108
- **Học phần:** Lập trình ứng dụng
## Các tính năng chính
- Cấu trúc layout dùng chung (**Header, Navbar, Footer**).
- Hiển thị danh sách dữ liệu bằng vòng lặp `forEach`.
- Sử dụng câu lệnh điều kiện `if/else` để hiển thị trạng thái (Nổi bật/Bình thường).
- Route động `/detail/:id` để xem chi tiết từng đối tượng.
## Cấu trúc thư mục
- `app.js`: File thực thi chính của Server.
- `views/`: Chứa các tệp giao diện EJS.
- `public/`: Chứa các tài nguyên tĩnh (CSS, JS, hình ảnh).
- `package.json`: Quản lý các thư viện và thông tin dự án.