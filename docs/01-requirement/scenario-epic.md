# Scenario và Epic - Hệ thống Quản lý Rạp Chiếu Phim

## 1. Giới thiệu

Tài liệu này mô tả các tình huống sử dụng chính (Scenario) và các nhóm chức năng lớn (Epic) của hệ thống quản lý rạp chiếu phim. Đây là cơ sở để xây dựng User Story và Product Backlog trong các bước tiếp theo của quy trình phát triển sản phẩm.

---

# 2. Actors

## Khách hàng

Người sử dụng hệ thống để tìm kiếm phim, xem lịch chiếu và đặt vé.

## Nhân viên

Người quản lý thông tin phim, phòng chiếu và suất chiếu.

## Quản lý

Người theo dõi hoạt động kinh doanh và doanh thu của rạp chiếu phim.

---

# 3. Scenarios

## Scenario 1: Khách hàng đặt vé xem phim

### Mô tả

Khách hàng muốn đặt vé trực tuyến cho bộ phim mình yêu thích.

### Luồng chính

1. Khách hàng truy cập hệ thống.
2. Xem danh sách phim đang chiếu.
3. Chọn phim mong muốn.
4. Xem lịch chiếu.
5. Chọn suất chiếu.
6. Chọn ghế ngồi.
7. Thanh toán vé.
8. Nhận vé điện tử.

### Kết quả mong đợi

Khách hàng nhận được vé xem phim hợp lệ sau khi thanh toán thành công.

---

## Scenario 2: Nhân viên quản lý phim

### Mô tả

Nhân viên cập nhật danh sách phim trong hệ thống.

### Luồng chính

1. Nhân viên đăng nhập.
2. Truy cập chức năng quản lý phim.
3. Thêm, sửa hoặc xóa thông tin phim.
4. Lưu thay đổi.

### Kết quả mong đợi

Thông tin phim được cập nhật chính xác trong hệ thống.

---

## Scenario 3: Nhân viên quản lý suất chiếu

### Mô tả

Nhân viên tạo và quản lý lịch chiếu phim.

### Luồng chính

1. Đăng nhập hệ thống.
2. Chọn phim cần tạo suất chiếu.
3. Chọn phòng chiếu.
4. Chọn thời gian chiếu.
5. Lưu suất chiếu.

### Kết quả mong đợi

Suất chiếu mới được tạo thành công và hiển thị cho khách hàng.

---

## Scenario 4: Nhân viên quản lý phòng chiếu

### Mô tả

Nhân viên quản lý thông tin phòng chiếu và số lượng ghế.

### Luồng chính

1. Đăng nhập hệ thống.
2. Truy cập chức năng quản lý phòng chiếu.
3. Thêm hoặc chỉnh sửa thông tin phòng chiếu.
4. Lưu thay đổi.

### Kết quả mong đợi

Thông tin phòng chiếu được cập nhật chính xác.

---

## Scenario 5: Quản lý xem báo cáo doanh thu

### Mô tả

Quản lý muốn theo dõi hiệu quả kinh doanh của rạp.

### Luồng chính

1. Đăng nhập hệ thống.
2. Truy cập chức năng báo cáo.
3. Chọn khoảng thời gian cần thống kê.
4. Xem doanh thu và số lượng vé bán ra.
5. Xuất báo cáo.

### Kết quả mong đợi

Quản lý nhận được báo cáo doanh thu chính xác.

---

# 4. Epics

## Epic 1: Quản lý phim

### Mục tiêu

Cho phép nhân viên quản lý thông tin phim đang chiếu tại rạp.

### Liên quan

* Scenario 2

---

## Epic 2: Quản lý suất chiếu

### Mục tiêu

Cho phép nhân viên tạo và quản lý lịch chiếu phim.

### Liên quan

* Scenario 3

---

## Epic 3: Quản lý phòng chiếu

### Mục tiêu

Cho phép quản lý thông tin phòng chiếu và ghế ngồi.

### Liên quan

* Scenario 4

---

## Epic 4: Đặt vé

### Mục tiêu

Cho phép khách hàng tìm kiếm phim, chọn ghế và đặt vé trực tuyến.

### Liên quan

* Scenario 1

---

## Epic 5: Thanh toán

### Mục tiêu

Cho phép khách hàng thanh toán vé và nhận vé điện tử.

### Liên quan

* Scenario 1

---

## Epic 6: Báo cáo doanh thu

### Mục tiêu

Cho phép quản lý theo dõi hiệu quả hoạt động của rạp chiếu phim.

### Liên quan

* Scenario 5

---

# 5. Mapping giữa Scenario và Epic

| Scenario                      | Epic                |
| ----------------------------- | ------------------- |
| Khách hàng đặt vé xem phim    | Đặt vé              |
| Khách hàng thanh toán vé      | Thanh toán          |
| Nhân viên quản lý phim        | Quản lý phim        |
| Nhân viên quản lý suất chiếu  | Quản lý suất chiếu  |
| Nhân viên quản lý phòng chiếu | Quản lý phòng chiếu |
| Quản lý xem báo cáo doanh thu | Báo cáo doanh thu   |

---

# 6. Kết luận

Các Scenario và Epic trên phản ánh những nghiệp vụ cốt lõi của hệ thống quản lý rạp chiếu phim. Đây sẽ là cơ sở để xây dựng User Story, Product Features và Product Backlog trong các giai đoạn tiếp theo của dự án.
