# 🖥️ TÀI LIỆU MÔ TẢ CÁC MÀN HÌNH GIAO DIỆN (UI DESCRIPTION)

Tài liệu này đặc tả chi tiết cấu trúc, mục đích và các thành phần giao diện của 5 màn hình core trong hệ thống Đặt Vé Xem Phim Trực Tuyến, giúp thành viên mới dễ dàng tiếp cận dự án.

---

## 1. Màn hình Trang chủ (Home Page)
* **Mục đích màn hình:** Là điểm chạm đầu tiên của khách hàng khi truy cập hệ thống; giúp quảng bá các phim hot và điều hướng người dùng đặt vé nhanh chóng.
* **Chức năng chính:**
    * Xem danh sách phim đang chiếu và phim sắp chiếu (Slider/Banner nổi bật).
    * Tìm kiếm phim theo tên, thể loại hoặc rạp.
    * Sử dụng bộ lọc nhanh (Quick Booking): Chọn Phim -> Chọn Rạp -> Chọn Ngày -> Chọn Suất chiếu trực tiếp từ trang chủ.
* **Thành phần giao diện chính:**
    * `Header`: Logo rạp phim, thanh tìm kiếm, nút Đăng nhập/Đăng ký / Hồ sơ cá nhân.
    * `Banner Carousel`: Slider động hiển thị trailer/poster của các phim bom tấn đang hot.
    * `Quick Booking Bar`: Thanh công cụ lọc nhanh suất chiếu.
    * `Movie Grid`: Danh sách các thẻ phim (Movie Cards), mỗi thẻ gồm: Ảnh poster, tên phim, nhãn độ tuổi (T13, T16, T18), và nút "Đặt vé".

---

## 2. Màn hình Chi tiết phim (Movie Detail)
* **Mục đích màn hình:** Cung cấp thông tin đầy đủ, chi tiết về một bộ phim cụ thể để thuyết phục khách hàng đưa ra quyết định mua vé.
* **Chức năng chính:**
    * Trình chiếu Trailer phim và hiển thị đánh giá/review từ người xem khác.
    * Hiển thị danh sách lịch chiếu cụ thể của bộ phim đó theo từng ngày và từng cụm rạp.
* **Thành phần giao diện chính:**
    * `Media Section`: Khung phát video trailer, ảnh nền poster mờ (Backdrop).
    * `Info Section`: Tên phim tiếng Anh/tiếng Việt, thời lượng, đạo diễn, diễn viên, ngày khởi chiếu, tóm tắt nội dung phim (Synopsis).
    * `Rating Badges`: Điểm số đánh giá (ví dụ: IMDb hoặc hệ thống sao của rạp).
    * `Showtime Selector`: Thanh chọn ngày (Date Picker) và danh sách các cụm rạp đi kèm các khung giờ chiếu (ví dụ: 14:30, 18:00, 21:15) dạng nút bấm.

---

## 3. Màn hình Chọn ghế (Seat Selection)
* **Mục đích màn hình:** Cho phép khách hàng trực quan hóa phòng chiếu để chọn vị trí chỗ ngồi yêu thích và các combo bắp nước đi kèm.
* **Chức năng chính:**
    * Hiển thị sơ đồ ghế theo thời gian thực (Real-time).
    * Cho phép bấm chọn/hủy chọn ghế (Khóa ghế tạm thời trong luồng thanh toán).
    * Chọn số lượng combo bỏng ngô và nước uống đi kèm.
* **Thành phần giao diện chính:**
    * `Screen Indicator`: Biểu tượng màn hình rạp chiếu để người dùng định vị hướng nhìn.
    * `Seat Map Matrix`: Sơ đồ các ma trận ghế được phân biệt rõ ràng bằng màu sắc:
        * *Màu xám:* Ghế trống thường.
        * *Màu tím:* Ghế VIP.
        * *Màu hồng:* Ghế đôi (Sweetbox).
        * *Màu đỏ:* Ghế đã có người khác mua (Disable không cho click).
        * *Màu xanh lá:* Ghế bạn đang chọn.
    * `Legend`: Bảng chú thích ý nghĩa các màu sắc/loại ghế.
    * `F&B Counter`: Khu vực thêm nhanh các Combo bắp nước (nút tăng/giảm số lượng `+` `-`).
    * `Side Panel Summary`: Khung tóm tắt bên góc màn hình hiển thị: Tên phim, phòng chiếu, danh sách ghế đã chọn (`A12, A13`), tổng số tiền tạm tính và nút "Tiếp tục".

---

## 4. Màn hình Thanh toán (Payment)
* **Mục đích màn hình:** Hiển thị toàn bộ thông tin đơn hàng để khách hàng soát lỗi và tiến hành thực hiện giao dịch an toàn.
* **Chức năng chính:**
    * Áp dụng mã giảm giá / Voucher (nếu có).
    * Lựa chọn phương thức thanh toán phù hợp.
    * Đếm ngược thời gian giữ ghế (Ví dụ: `04:59`).
* **Thành phần giao diện chính:**
    * `Countdown Timer`: Đồng hồ đếm ngược thời gian giao dịch để tạo tính cấp bách.
    * `Order Order Info`: Bảng chi tiết đơn hàng (Phim, Suất chiếu, Ghế, Combo bắp nước, Tổng tiền).
    * `Voucher Input`: Ô nhập mã giảm giá kèm nút "Áp dụng".
    * `Payment Methods`: Danh sách các tùy chọn thanh toán kèm icon trực quan: Ví điện tử MoMo, Thẻ ATM/Internet Banking, Quét mã QR (VNPAY).
    * `Action Button`: Nút "Xác nhận thanh toán".

---

## 5. Màn hình Đặt vé thành công (Booking Success)
* **Mục đích màn hình:** Xác nhận giao dịch hoàn tất thành công, cung cấp thông tin vé điện tử để khách hàng sử dụng khi đến rạp.
* **Chức năng chính:**
    * Hiển thị thông tin vé kèm mã QR-Code duy nhất để quét lấy vé cứng tại quầy/máy tự động.
    * Cung cấp nút điều hướng quay lại trang chủ hoặc kiểm tra lịch sử đặt vé.
* **Thành phần giao diện chính:**
    * `Success Animation`: Icon tích xanh lớn kèm dòng chữ chúc mừng "Đặt vé thành công!".
    * `Digital Ticket (QR Code)`: Mã QR chứa thông tin mã hóa của vé xem phim để nhân viên soát vé quét tại rạp.
    * `Ticket Details`: Mã đặt vé (mã text), Tên phim, Rạp, Phòng chiếu, Suất chiếu, Ghế, và Tổng số tiền đã thanh toán.
    * `Navigation Buttons`: Nút "Quay lại trang chủ" và nút "Xem lịch sử đặt vé".
