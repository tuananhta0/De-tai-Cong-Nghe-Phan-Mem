## 2. Danh sách Features (Tính năng hệ thống)

Dựa trên cấu trúc công nghệ của hệ thống (Frontend, Backend C++, SQL, AI Python), các tính năng được bóc tách kỹ thuật như sau:

### Module Client (Frontend + Backend)

#### Feature 1: Hiển thị & Lọc Danh sách phim
- Hiển thị danh sách phim.
- Lọc theo trạng thái:
  - Đang chiếu.
  - Sắp chiếu.

#### Feature 2: Hiển thị Lịch chiếu & Suất chiếu theo phim
- Xem lịch chiếu của từng phim.
- Hiển thị các suất chiếu theo ngày và giờ.

#### Feature 3: Sơ đồ ghế ngồi tương tác Real-time
- Hiển thị trạng thái ghế:
  - Trống.
  - Đã đặt.
  - Đang chọn.
- Cập nhật trạng thái ghế theo thời gian thực.

#### Feature 4: Đặt vé & Giữ ghế tạm thời
- Đặt vé sau khi chọn ghế.
- Giữ ghế trong thời gian quy định.
- Xử lý bất đồng bộ (Asynchronous Processing).
- Xử lý tranh chấp ghế bằng cơ chế Concurrency ở Backend C++.

#### Feature 5: Tích hợp cổng Thanh toán trực tuyến
- Hỗ trợ thanh toán điện tử.
- Xác nhận giao dịch thành công.
- Cập nhật trạng thái vé sau thanh toán.

### Module AI & Đề xuất (Python)

#### Feature 6: Hệ thống gợi ý phim thông minh (Recommendation System)
- Phân tích hành vi và lịch sử xem phim của người dùng.
- Đề xuất danh sách phim phù hợp.
- Học từ dữ liệu người dùng để cải thiện độ chính xác của gợi ý.

### Module Quản trị (Admin Dashboard)

#### Feature 7: CRUD Quản lý Phim
- Thêm phim.
- Sửa thông tin phim.
- Xóa phim.
- Quản lý poster, trailer, thời lượng và mô tả.

#### Feature 8: CRUD Quản lý Suất chiếu & Phòng chiếu
- Tạo suất chiếu.
- Chỉnh sửa suất chiếu.
- Xóa suất chiếu.
- Quản lý phòng chiếu và lịch trình hoạt động.

#### Feature 9: Thống kê & Báo cáo doanh thu
- Thống kê doanh thu theo:
  - Ngày.
  - Tuần.
  - Tháng.
  - Phim.
- Hiển thị biểu đồ trực quan.
- Hỗ trợ lọc dữ liệu theo khoảng thời gian.
