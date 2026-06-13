# Chi tiết các giai đoạn hành trình

## 🔍 Giai đoạn 1: Nhận biết & Tìm kiếm (Awareness)

**Hành động:**
Khách hàng phát sinh nhu cầu, lên website/app để tìm phim hot và kiểm tra suất chiếu.

**Điểm chạm (Touchpoints):**

* Website
* Mobile App rạp phim

**Điểm đau (Pain Points):**

* Lịch chiếu cập nhật chậm.
* App load lâu làm mất thời gian cân nhắc.

---

## 💳 Giai đoạn 2: Đặt vé & Thanh toán (Booking & Payment)

**Lưu ý:** Đây là giai đoạn tương tác trực tiếp với hệ thống nội bộ.

### Luồng Tự phục vụ (Online)

Khách chọn ghế → Thanh toán qua Ví điện tử → Nhận mã QR Code.

### Luồng Tại quầy (Offline)

Khách đến quầy → Nhân viên bán vé (Persona 1) thao tác chọn ghế trên POS → Thu tiền mặt/quẹt thẻ → In vé giấy.

**Điểm đau (Pain Points):**

**Khách online:**

* Lỗi giữ ghế (Double-booking).
* Lỗi cổng thanh toán.

**Khách tại quầy:**

* Xếp hàng chờ lâu do hệ thống POS của nhân viên xử lý chậm hoặc giao diện khó dùng.

---

## 🎟️ Giai đoạn 3: Đón tiếp & Check-in (Arrival)

**Hành động:**
Khách đến rạp, mua bắp nước, đưa mã QR hoặc vé giấy cho nhân viên soát vé để vào phòng chiếu.

**Điểm chạm:**

* Quầy Popcorn
* Cửa kiểm soát vé (Gate)

**Điểm đau (Pain Points):**

* Quầy bắp nước quá tải không đủ người phục vụ.
* Máy quét QR tại cửa bị lỗi khiến nhân viên phải nhập tay thủ công.

---

## 🎬 Giai đoạn 4: Trải nghiệm xem phim (In-theater)

**Hành động:**
Khách tìm số ghế, ngồi xem phim và trải nghiệm dịch vụ.

**Điểm chạm:**

* Phòng chiếu
* Ghế ngồi
* Hệ thống âm thanh/ánh sáng

**Điểm đau (Pain Points):**

* Ghế bị hỏng hóc.
* Phòng chiếu quá lạnh.
* Xảy ra sự cố kỹ thuật nhưng không có nút gọi hỗ trợ nhanh.

---

## ⭐ Giai đoạn 5: Sau khi xem phim (Post-movie)

**Hành động:**
Ra về, nhận thông báo tích điểm thành viên, đánh giá dịch vụ.

**Điểm chạm:**

* Hệ thống Loyalty (Tích điểm)
* Email/Push Notification chăm sóc khách hàng

**Điểm đau (Pain Points):**

* Hệ thống đồng bộ điểm thành viên bị chậm.
* Quy trình phản hồi khiếu nại (nếu có) phức tạp.

---

# ⚙️ Ma trận liên kết với Hệ thống Nội bộ (Internal Mapping)

Để giải quyết các điểm đau trên của khách hàng, hệ thống nội bộ cần đáp ứng:

| Giai đoạn khách hàng       | Tính năng Hệ thống Nội bộ tương ứng                                                                             | Vai trò phụ trách (Persona) |
| -------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------- |
| Giai đoạn 2 (Đặt vé)       | Giao diện POS bán vé tại quầy tối giản, xử lý < 30s. Khóa ghế realtime để tránh double-booking.                 | Nhân viên bán vé            |
| Giai đoạn 3 (Check-in)     | Màn hình quét QR kiểm tra trạng thái vé siêu tốc (chuyển trạng thái sang checked-in ngay lập tức).              | Nhân viên bán vé / Soát vé  |
| Giai đoạn 3 & 5 (Vận hành) | Dashboard theo dõi lượng khách theo thời gian thực để điều phối nhân sự trực quầy bắp nước/soát vé ca cao điểm. | Quản lý rạp                 |
| Giai đoạn 5 (Báo cáo)      | Hệ thống tự động đối soát doanh thu tiền mặt tại quầy và online cuối ca, giảm tỷ lệ lệch số liệu.               | Quản lý rạp                 |
