# 1. Sitemap (Sơ đồ trang)

Sitemap này được phân tách rõ ràng thành hai phân hệ chính để giải quyết triệt để các điểm đau: Phân hệ Khách hàng (Online) và Phân hệ Nội bộ/Admin (POS cho nhân viên và Dashboard quản lý).

```text
[HỆ THỐNG ĐẶT VÉ RẠP CHIẾU PHIM]
├── 🌐 PHÂN HỆ KHÁCH HÀNG (B2C WEB/APP)
│   ├── Home (Trang chủ: Slider phim, Gợi ý phim AI BL-08)
│   ├── Movie Detail (Chi tiết phim, Trailer)
│   ├── Showtime Selection (Chọn lịch chiếu theo phim/ngày BL-04)
│   ├── Seat Selection (Sơ đồ ghế realtime BL-05, Khóa ghế BL-06)
│   ├── Payment (Thanh toán cổng/ví điện tử BL-07)
│   ├── Booking Success (Mã QR code vé, gửi Email BL-10)
│   └── User Space
│       ├── User Profile (Thông tin cá nhân, tích điểm thành viên)
│       └── Booking History (Lịch sử đặt vé, xem lại QR code)
│
└── 💼 PHÂN HỆ NỘI BỘ (B2B ADMIN & POS)
    ├── Login/Auth (Xác thực phân quyền theo Persona)
    ├── 🖥️ Giao diện POS Bán Vé (Cho Nhân viên quầy - Giai đoạn 2)
    │   ├── Quick Showtimes (Chọn nhanh suất chiếu)
    │   └── Seat Matrix POS (Sơ đồ ghế khóa realtime, in vé giấy)
    ├── 🎫 Giao diện Check-in (Cho Nhân viên soát vé - Giai đoạn 3)
    │   └── QR Scanner Web-app (Quét siêu tốc, chuyển trạng thái checked-in)
    └── 📊 Giao diện Quản trị (Admin/Quản lý rạp)
        ├── Movie & Showtime CRUD (Quản lý phim BL-01, Suất chiếu BL-03)
        ├── Realtime Dashboard (Theo dõi lượng khách ca cao điểm - Vận hành)
        └── Revenue Report (Báo cáo doanh thu, vẽ biểu đồ Chart.js BL-09)
```

# 2. Sơ đồ điều hướng (Navigation Flow Diagram)

Dưới đây là luồng chuyển động giữa các màn hình giúp tối ưu hóa trải nghiệm, giải quyết lỗi Double-booking nhờ cơ chế khóa ghế tạm thời ở Backend và đồng bộ tức thì giữa Online và POS.

## 🔄 Luồng Khách hàng Online (B2C)

```text
[Home]
  │  (Click chọn phim)
  ▼
[Movie Detail]
  │  (Chọn xem lịch chiếu)
  ▼
[Showtime Selection]
  │  (Chọn suất chiếu hợp lệ)
  ▼
[Seat Selection] ──(Backend C++: Giữ ghế tạm 5-10p, đổi trạng thái ma trận)
  │  (Xác nhận ghế)
  ▼
[Payment] ─────────(Lỗi thanh toán)──► [Seat Selection] (Giải phóng ghế nếu hủy)
  │  (Thanh toán thành công)
  ▼
[Booking Success] ──(Sinh mã QR, Trigger Email + Tích điểm thành viên)
  │  (Xem lại vé)
  ▼
[Booking History] ◄── [User Profile]
```

## 🔄 Luồng Nhân viên tại quầy (POS & Gate Offline)

```text
[Login Admin/POS]
  │
  ├─► (Quyền: Nhân viên bán vé) ──► [POS Selection] ──► [Seat Matrix POS] ──► [In vé giấy/Thu tiền]
  │                                     ▲
  │                                     │ (Đồng bộ Realtime trạng thái ghế trống/đã đặt)
  │                                     ▼
  ├─► (Hệ thống đồng bộ Backend) ◄─── [Luồng Online khách chọn ghế]
  │
  ├─► (Quyền: Nhân viên soát vé) ──► [QR Scanner App] ──► [Đối chiếu DB] ──► [Cập nhật Checked-In]
  │
  └─► (Quyền: Quản lý rạp) ────────► [Realtime Dashboard] / [Movie-Showtime CRUD] / [Revenue Report]
```



  
