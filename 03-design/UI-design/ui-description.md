# Tài Liệu Mô Tả Giao Diện Hệ Thống Đặt Vé Xem Phim (Cinema Booking System)

Tài liệu này mô tả chi tiết luồng giao diện dành cho Khách hàng (End-user) từ lúc tìm kiếm phim cho đến khi đặt vé thành công. Mục tiêu giúp các thành viên mới trong dự án (Developer, QC/Tester) dễ dàng nắm bắt được luồng nghiệp vụ và cấu trúc giao diện.

---

## 1. Home Page (Trang Chủ)

### Mục đích màn hình
Là điểm chạm đầu tiên của khách hàng, giúp giới thiệu các bộ phim đang chiếu, sắp chiếu, các chương trình khuyến mãi và điều hướng người dùng bắt đầu luồng đặt vé.

### Chức năng chính
* Xem danh sách phim đang chiếu (Now Showing) và phim sắp chiếu (Coming Soon).
* Tìm kiếm phim theo tên, thể loại.
* Lọc phim theo cụm rạp hoặc định dạng (2D/3D/IMAX).
* Xem các banner quảng cáo/khuyến mãi (Slider/Carousel).

### Thành phần giao diện chính
* **Header:** Logo rạp phim, thanh tìm kiếm, bộ lọc vị trí (Tỉnh/Thành phố), nút Đăng nhập/Đăng ký (hoặc Avatar nếu đã đăng nhập).
* **Banner Slider:** Hiển thị các hình ảnh/trailer phim hot hoặc chương trình khuyến mãi lớn.
* **Tab Navigation:** Nút chuyển đổi giữa "Phim Đang Chiếu" và "Phim Sắp Chiếu".
* **Movie Grid:** Danh sách các thẻ phim (Movie Card). Mỗi card bao gồm: Ảnh poster, tên phim, nhãn độ tuổi (T13, T16, T18), thể loại, xếp hạng (stars) và nút "Mua vé ngay".
* **Footer:** Thông tin liên hệ, điều khoản sử dụng, liên kết mạng xã hội.

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Mặc định trang chủ phải tải danh sách "Phim Đang Chiếu" lên đầu tiên.
* Khi nhấn vào Poster hoặc Tên phim, hệ thống phải chuyển hướng sang trang **Movie Detail**.
* Khi nhấn nút "Mua vé ngay", hệ thống mở nhanh pop-up chọn suất chiếu hoặc chuyển hướng thẳng tới phần chọn suất chiếu ở trang Detail.
* Thanh tìm kiếm phải trả ra kết quả gợi ý (Auto-suggest) sau khi người dùng nhập từ 3 ký tự trở lên.

---

## 2. Movie Detail (Trang Chi Tiết Phim & Chọn Suất Chiếu)

### Mục đích màn hình
Cung cấp thông tin đầy đủ, trực quan về một bộ phim cụ thể và là nơi để khách hàng lựa chọn ngày xem, rạp xem và suất chiếu phù hợp.

### Chức năng chính
* Hiển thị thông tin chi tiết: Trailer, nội dung tóm tắt, diễn viên, đạo diễn, thời lượng.
* Lựa chọn Ngày xem (Date Picker) và Rạp xem (Cinema Location).
* Hiển thị và lựa chọn Suất chiếu (Showtime) theo định dạng phim.

### Thành phần giao diện chính
* **Movie Info Section:** Poster lớn (hoặc video trailer chạy ngầm background), tên phim (Tiếng Việt & Tiếng Anh), thời lượng (phút), ngày khởi chiếu, quốc gia, đánh giá từ người dùng.
* **Synopsis Section:** Đoạn văn ngắn tóm tắt nội dung phim và danh sách hình ảnh diễn viên/đạo diễn.
* **Booking Filter Bar:**
    * Thanh chọn ngày (hiển thị 7 ngày tiếp theo dưới dạng: Thứ, Ngày/Tháng).
    * Bộ lọc khu vực/Rạp (Dropdown select).
* **Showtime Section:** Danh sách các rạp còn suất chiếu. Dưới mỗi rạp chia theo loại phòng (2D Lồng tiếng, 2D Vietsub, IMAX) và danh sách các block thời gian suất chiếu (Ví dụ: `10:15`, `14:30`, `21:00`).

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Các suất chiếu của quá khứ (so với giờ hiện tại của hệ thống) bắt buộc phải bị ẩn hoặc làm mờ (disabled), không cho người dùng ấn vào.
* Khi người dùng chọn một suất chiếu cụ thể (Block thời gian), hệ thống sẽ chuyển hướng sang trang **Seat Selection** cùng với các tham số (Movie ID, Cinema ID, Date, Showtime ID).

---

## 3. Seat Selection (Trang Chọn Ghế)

### Mục đích màn hình
Cho phép khách hàng quan sát sơ đồ phòng chiếu theo thời gian thực (Real-time) để lựa chọn vị trí ngồi và các combo bắp nước đi kèm.

### Chức năng chính
* Hiển thị sơ đồ ghế ngồi trực quan của phòng chiếu.
* Cập nhật trạng thái ghế theo thời gian thực (Tránh trùng ghế).
* Chọn số lượng và loại ghế (Ghế thường, Ghế VIP, Ghế đôi/Sweetbox).
* Chọn kèm Combo bắp nước (Concession).

### Thành phần giao diện chính
* **Screen Indicator:** Thanh biểu diễn vị trí Màn Hình (thường là một đường cong lớn ở trên cùng để người dùng định vị hướng nhìn).
* **Seat Map Grid:** Ma trận các ô ghế được ký hiệu theo hàng (A, B, C,...) và cột (1, 2, 3,...). 
    * Màu sắc phân biệt rõ: Ghế thường (Xám), Ghế VIP (Vàng/Đỏ), Ghế đôi (Hồng), Ghế đã có người đặt (Có dấu X hoặc màu xám đậm), Ghế đang chọn (Xanh lá).
* **Seat Legend:** Chú thích ý nghĩa của các màu sắc ghế ở phía dưới sơ đồ.
* **Concession Section (Pop-up hoặc phân đoạn dưới):** Danh sách các combo bắp nước kèm giá tiền, nút tăng/giảm số lượng (`+`, `-`).
* **Summary Bottom Bar (Thanh tổng kết cố định ở đáy trang):** Hiển thị: Tên phim, Rạp, Suất chiếu, Số ghế đã chọn (Vd: H12, H13), Tổng tiền tạm tính và nút "Tiếp tục" (Thanh toán).

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Hệ thống không cho phép người dùng chọn những ghế đã có trạng thái "Đã bán" hoặc "Đang được giữ chỗ bởi người khác".
* Khách hàng không được đặt ghế trống ở giữa (để lại 1 ghế trống duy nhất giữa các nhóm ghế) để tối ưu công suất rạp.
* Giới hạn thời gian chọn ghế tối đa là 5 - 10 phút. Bộ đếm ngược (Countdown Timer) phải hiển thị rõ ràng trên màn hình. Nếu hết giờ mà chưa nhấn thanh toán, ghế sẽ tự động giải phóng và quay về trang chủ/trang detail.

---

## 4. Payment (Trang Thanh Toán)

### Mục đích màn hình
Cung cấp hóa đơn chi tiết (Invoice) và các phương thức thanh toán an toàn để khách hàng hoàn tất giao dịch mua vé.

### Chức năng chính
* Hiển thị thông tin tóm tắt toàn bộ đơn hàng (Vé phim + Bắp nước).
* Áp dụng mã giảm sách/Voucher/Điểm thành viên.
* Lựa chọn cổng thanh toán điện tử.

### Thành phần giao diện chính
* **Countdown Timer:** Tiếp tục hiển thị thời gian giữ ghế còn lại từ trang trước.
* **Order Summary Card:** Danh sách chi tiết gồm: Tên phim, định dạng, thời gian, phòng chiếu, danh sách ghế, chi tiết bắp nước, tổng tiền chưa giảm.
* **Promotion Code Box:** Ô nhập mã giảm giá (Voucher) và nút "Áp dụng".
* **Payment Methods List:** Danh sách các Radio Button hoặc Card chọn phương thức:
    * Ví điện tử (Momo, ZaloPay, ShopeePay).
    * Thẻ nội địa / Cổng VNPAY (ATM/QR Code).
    * Thẻ quốc tế (Visa/Mastercard).
* **Terms Agreement:** Ô checkbox "Tôi đồng ý với điều khoản mua vé và rạp phim".
* **Action Button:** Nút "Thanh toán" kèm tổng số tiền cuối cùng cần trả.

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Nút "Thanh toán" chỉ có hiệu lực khi người dùng đã tích chọn vào ô Checkbox "Tôi đồng ý với điều khoản...".
* Khi áp dụng mã giảm giá thành công, hệ thống phải trừ tiền trực tiếp trên tổng số tiền hiển thị và hiển thị dòng chữ "Đã giảm: -X.000đ".
* Khi nhấn "Thanh toán", hệ thống sẽ gọi API sang bên thứ 3 (Cổng thanh toán) và hiển thị màn hình Loading (Chờ thanh toán).

---

## 5. Booking Success (Trang Đặt Vé Thành Công)

### Mục đích màn hình
Xác nhận giao dịch thành công, cung cấp thông tin vé điện tử cùng mã QR/Mã vạch để khách hàng sử dụng khi đến rạp nhận vé/vào phòng chiếu.

### Chức năng chính
* Hiển thị thông báo trạng thái đặt vé thành công.
* Cung cấp Mã đặt vé (Booking ID) và Mã QR (QR Code).
* Cho phép chụp ảnh màn hình, lưu vé về máy hoặc gửi thông tin vé qua Email/SMS.

### Thành phần giao diện chính
* **Success Icon:** Biểu tượng tích xanh chuyển động lớn báo hiệu thành công.
* **Digital Ticket Card:** Thiết kế giả lập như một chiếc vé giấy bao gồm:
    * **Mã QR Code / Mã vạch (Barcode)** nằm ở vị trí trung tâm để nhân viên quét tại quầy.
    * **Mã đặt vé (Booking ID):** Chuỗi ký tự (Vd: `CX89012`).
    * **Thông tin vé:** Tên phim, Thời gian, Rạp, Phòng chiếu, Số ghế, Combo bắp nước đi kèm.
    * **Tổng tiền đã thanh toán:** Định dạng tiền tệ kèm trạng thái "Đã thanh toán".
* **Instruction Note:** Dòng chữ hướng dẫn (Ví dụ: *"Vui lòng mang mã QR này đến quầy vé hoặc máy in vé tự động tại rạp để nhận vé cứng"*).
* **Action Buttons:** Nút "Lưu vé" (Tải ảnh về máy), nút "Gửi email" và nút "Quay lại Trang Chủ".

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Hệ thống phải tự động gửi một email xác nhận kèm thông tin vé và mã QR đến email tài khoản của khách hàng ngay khi màn hình này hiển thị.
* Khi nhấn nút "Quay lại Trang Chủ", toàn bộ trạng thái đặt vé cũ trong bộ nhớ ứng dụng phải được xóa sạch để sẵn sàng cho lượt đặt vé mới.
