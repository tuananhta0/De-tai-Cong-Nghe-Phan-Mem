# 3. Product Backlog (Ưu tiên hóa - Priority: High)

Backlog được phân loại chi tiết thành:

* **High (Critical):** Bắt buộc phải có để hệ thống vận hành được luồng nghiệp vụ chính.
* **High (Standard):** Quan trọng nhưng có thể triển khai sau các chức năng cốt lõi.

| ID    | Feature            | Description (Mô tả Backlog)                                                                                | Priority        | Deliverables (Sản phẩm bàn giao kỹ thuật)                                                     |
| ----- | ------------------ | ---------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| BL-01 | Quản lý phim       | Thiết kế DB SQL cho bảng Phim; Viết API C++ để thêm/sửa/xóa phim; Giao diện Admin CRUD phim.               | High (Critical) | - Script tạo bảng SQL<br>- API endpoints (/api/movies) viết bằng C++<br>- UI form Admin       |
| BL-02 | Xem danh sách phim | Giao diện trang chủ hiển thị danh sách phim lấy dữ liệu từ Backend.                                        | High (Critical) | - Giao diện HTML/CSS/JS hoàn chỉnh<br>- Code fetch API kết nối Backend                        |
| BL-03 | Quản lý suất chiếu | Thiết kế DB Suất chiếu; API C++ quản lý lịch chiếu; UI Admin cấu hình giờ chiếu.                           | High (Critical) | - Bảng SQL Showtimes<br>- Logic kiểm tra trùng lịch ở Backend C++                             |
| BL-04 | Xem lịch chiếu     | Hiển thị danh sách lịch chiếu, giờ chiếu tương ứng khi khách click vào một phim cụ thể.                    | High (Critical) | - UI trang chi tiết phim & lịch chiếu<br>- API lấy lịch chiếu theo movie_id                   |
| BL-05 | Chọn ghế           | Giao diện sơ đồ phòng chiếu trực quan; API C++ trả về trạng thái ghế trống/đã đặt.                         | High (Critical) | - UI sơ đồ ghế (Grid hệ thống ghế)<br>- API trả về trạng thái ma trận ghế                     |
| BL-06 | Đặt vé & Giữ ghế   | Logic backend C++ khóa ghế tạm thời khi user click chọn; tạo đơn hàng tạm trong DB.                        | High (Critical) | - Cơ chế Lock ghế ở Backend (C++) chống đặt trùng<br>- API đặt vé (/api/book)                 |
| BL-07 | Thanh toán         | Tích hợp luồng thanh toán; cập nhật trạng thái vé từ "chờ" sang "đã thanh toán" trong SQL.                 | High (Critical) | - Module tích hợp thanh toán (Mockup/Cổng thật)<br>- Logic cập nhật DB khi thành công         |
| BL-08 | Gợi ý phim (AI)    | Viết script Python (Collaborative Filtering hoặc Content-based) để gợi ý phim; Backend C++ gọi script này. | High (Standard) | - Source code Python AI model<br>- API/Cơ chế kết nối giữa Backend C++ và Python              |
| BL-09 | Báo cáo doanh thu  | Truy vấn SQL tính tổng tiền; Backend C++ tính toán; Frontend vẽ biểu đồ doanh thu.                         | High (Standard) | - Câu lệnh SQL SUM/GROUP BY tối ưu<br>- Giao diện biểu đồ Admin (dùng Chart.js hoặc tương tự) |
| BL-10 | Mã QR & Vé         | Tạo mã QR code sau khi thanh toán; Tích hợp dịch vụ gửi mail tự động đính kèm vé.                          | High (Standard) | - Module tạo QR Code<br>- Dịch vụ gửi Email tự động<br>- Template vé điện tử                  |
