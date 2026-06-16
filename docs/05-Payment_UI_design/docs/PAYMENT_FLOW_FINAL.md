# Payment Flow Final Design

## Mục tiêu

Hoàn thiện luồng thanh toán của hệ thống Movie Ticket System từ bước xác nhận thông tin vé đến khi người dùng nhận được vé điện tử.

---

# Luồng thanh toán

```text
Chọn phim
    ↓
Chọn suất chiếu
    ↓
Chọn ghế
    ↓
Xác nhận thông tin vé
    ↓
Hiển thị QR thanh toán
    ↓
Người dùng thanh toán
    ↓
Thanh toán thành công
    ↓
Hiển thị vé điện tử
```

---

# Màn hình 1: Thanh toán

## Thông tin hiển thị

### Thông tin phim

* Tên phim
* Thể loại
* Ngày chiếu
* Giờ chiếu
* Phòng chiếu

### Ghế đã chọn

* A5
* A6

### Tổng tiền

```text
2 vé × 90.000 VNĐ

Tổng cộng: 180.000 VNĐ
```

### Phương thức thanh toán

* Thẻ ngân hàng
* MoMo
* ZaloPay
* QR Payment

### QR Thanh toán

Hệ thống hiển thị mã QR để người dùng quét bằng ứng dụng ngân hàng hoặc ví điện tử.

---

# Màn hình 2: Xác nhận thành công

## Thông báo

```text
✓ ĐẶT VÉ THÀNH CÔNG
```

## Thông tin vé

* Mã vé
* Tên phim
* Ngày chiếu
* Giờ chiếu
* Ghế đã đặt
* Tổng tiền

## Hành động tiếp theo

* Về trang chủ
* Xem chi tiết vé

---

# Mockup

## Thanh toán

![Payment Wireframe](../assets/images/payment-wireframe.png)

## Đặt vé thành công

![Success Wireframe](../assets/images/payment-success-wireframe.png)

---

# Acceptance Criteria

* Hiển thị đầy đủ thông tin phim
* Hiển thị ghế đã chọn
* Hiển thị tổng tiền
* Có QR thanh toán
* Có bước xác nhận thanh toán
* Có màn hình đặt vé thành công
* Luồng thanh toán hoàn chỉnh
* Mockup được đính kèm trong tài liệu
