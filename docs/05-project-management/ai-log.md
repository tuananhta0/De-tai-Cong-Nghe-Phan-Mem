# AI LOG

## Thông tin chung

- Tên dự án: Hệ thống Đặt Vé Xem Phim Trực Tuyến
- Công cụ AI sử dụng: ChatGPT
- Mục đích sử dụng:
  - Hỗ trợ phân tích yêu cầu
  - Hỗ trợ xây dựng tài liệu dự án
  - Hỗ trợ thiết kế hệ thống
  - Hỗ trợ thiết kế cơ sở dữ liệu
  - Hỗ trợ giải thích các công nghệ sử dụng trong dự án

---

# Tuần 1: Khảo sát và xác định yêu cầu

## Công việc thực hiện

- Xác định ý tưởng sản phẩm
- Phân tích nhu cầu người dùng
- Xây dựng Product Vision
- Xác định các chức năng chính của hệ thống

## Prompt sử dụng

"Hãy đề xuất các chức năng chính cho hệ thống đặt vé xem phim trực tuyến."

"Hãy xây dựng Product Vision cho một website đặt vé xem phim tích hợp AI gợi ý phim."

## Kết quả nhận được

- Đề xuất các chức năng:
  - Xem danh sách phim
  - Xem lịch chiếu
  - Chọn ghế
  - Đặt vé
  - Thanh toán trực tuyến
  - Quản lý phim
  - Quản lý suất chiếu
  - Báo cáo doanh thu
  - Gợi ý phim bằng AI

- Hỗ trợ xây dựng Product Vision cho dự án.

## Đánh giá

AI giúp nhóm xác định phạm vi dự án nhanh hơn và cung cấp các ý tưởng ban đầu để xây dựng tài liệu yêu cầu.

---

# Tuần 2: Xây dựng Persona và User Story

## Công việc thực hiện

- Xây dựng Persona
- Xây dựng Customer Persona
- Xây dựng User Journey
- Xây dựng User Story

## Prompt sử dụng

"Tạo Persona cho sinh viên thường xuyên đặt vé xem phim trực tuyến."

"Viết User Story cho chức năng đặt vé xem phim."

## Kết quả nhận được

- Xây dựng Persona đại diện cho nhóm người dùng mục tiêu.
- Đề xuất Customer Persona theo từng nhóm khách hàng.
- Chuẩn hóa User Story theo mẫu Agile.

Ví dụ:

Là khách hàng

Tôi muốn đặt vé xem phim

Để có thể giữ chỗ trước khi đến rạp.

## Đánh giá

AI hỗ trợ tạo khung nội dung ban đầu, giúp nhóm tiết kiệm thời gian trong giai đoạn phân tích yêu cầu.

---

# Tuần 3: Thiết kế hệ thống

## Công việc thực hiện

- Thiết kế Use Case Diagram
- Thiết kế System Architecture
- Thiết kế ERD
- Thiết kế Sitemap

## Prompt sử dụng

"Thiết kế Use Case Diagram cho hệ thống đặt vé xem phim."

"Thiết kế System Architecture cho website đặt vé xem phim sử dụng Frontend, Backend C++, SQL và AI Recommendation."

## Kết quả nhận được

### Use Case

- Khách truy cập
- Khách hàng
- Quản trị viên
- Quản lý rạp

### Các chức năng chính

- Xem phim
- Xem lịch chiếu
- Chọn ghế
- Đặt vé
- Thanh toán
- Quản lý phim
- Quản lý suất chiếu
- Báo cáo doanh thu

### Kiến trúc hệ thống

Frontend
↓
REST API
↓
Backend C++
↓
SQL Database

## Đánh giá

AI hỗ trợ xây dựng cấu trúc tổng thể của hệ thống, giúp nhóm hoàn thiện các sơ đồ thiết kế.

---

# Tuần 4: Thiết kế giao diện

## Công việc thực hiện

- Thiết kế Wireframe
- Thiết kế UI Description
- Thiết kế Sitemap
- Chuẩn hóa cấu trúc giao diện

## Prompt sử dụng

"Mô tả giao diện trang chủ của hệ thống đặt vé xem phim."

"Đề xuất cấu trúc thư mục Frontend cho website đặt vé xem phim."

## Kết quả nhận được

### Các màn hình được mô tả

- Home Page
- Movie Detail
- Showtime Selection
- Seat Selection
- Payment
- Payment Success
- Login / Register

### Hỗ trợ

- Chuẩn hóa cấu trúc giao diện
- Đề xuất cách tổ chức thư mục dự án
- Đề xuất các thành phần giao diện có thể tái sử dụng

## Đánh giá

AI hỗ trợ nhóm xây dựng tài liệu UI nhanh hơn và đảm bảo tính thống nhất giữa các màn hình.

---

# Tuần 5: Thiết kế cơ sở dữ liệu và tài liệu dự án

## Công việc thực hiện

- Thiết kế cơ sở dữ liệu
- Tạo Mock Data
- Thiết kế REST API
- Hoàn thiện README

## Prompt sử dụng

"Thiết kế cơ sở dữ liệu SQL cho hệ thống đặt vé xem phim."

"Giải thích REST API giữa Frontend và Backend."

"Tạo README đầy đủ cho dự án đặt vé xem phim."

## Kết quả nhận được

### Các bảng dữ liệu

- Users
- Movies
- Showtimes
- Rooms
- Seats
- Bookings
- Payments

### REST API

GET /api/movies

GET /api/showtimes

POST /api/bookings

POST /api/payments

### Tài liệu

- README
- Database Design
- Architecture Description

## Đánh giá

AI hỗ trợ nhóm hoàn thiện tài liệu kỹ thuật và thiết kế cơ sở dữ liệu nhanh chóng hơn.

---

# Tổng kết

| Nội dung | Mức độ hỗ trợ |
|-----------|--------------|
| Phân tích yêu cầu | Cao |
| Persona và User Story | Cao |
| Thiết kế hệ thống | Cao |
| Thiết kế giao diện | Cao |
| Thiết kế cơ sở dữ liệu | Trung bình |
| Thiết kế API | Trung bình |
| Viết tài liệu | Cao |

## Kết luận

Nhóm sử dụng ChatGPT như một công cụ hỗ trợ trong quá trình phân tích, thiết kế và xây dựng tài liệu dự án. Các nội dung do AI đề xuất được nhóm xem xét, chỉnh sửa và xác thực trước khi sử dụng trong sản phẩm cuối cùng.

