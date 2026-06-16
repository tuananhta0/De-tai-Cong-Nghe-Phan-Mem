# System Architecture

Hệ thống đặt vé xem phim được xây dựng theo mô hình 3 lớp (Three-tier Architecture).

## Presentation Layer

Frontend Web được phát triển bằng HTML, CSS, và ReactJS.

Chức năng:

- Hiển thị danh sách phim
- Hiển thị lịch chiếu
- Chọn ghế
- Thanh toán
- Hiển thị vé điện tử

## Business Layer

Backend được phát triển bằng C++.

Chức năng:

- Xử lý nghiệp vụ đặt vé
- Quản lý ghế ngồi
- Quản lý phim
- Quản lý suất chiếu
- Xử lý thanh toán

## Data Layer

SQL Database lưu trữ:

- Người dùng
- Phim
- Suất chiếu
- Ghế ngồi
- Vé đặt
- Thanh toán

## AI Recommendation Module

Module Python sử dụng lịch sử xem phim của người dùng để đề xuất danh sách phim phù hợp.

## External Services

- Cổng thanh toán trực tuyến
- Dịch vụ gửi Email
- Sinh mã QR cho vé điện tử
