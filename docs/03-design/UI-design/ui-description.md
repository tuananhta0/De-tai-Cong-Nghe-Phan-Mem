# Tài Liệu Mô Tả Giao Diện Hệ Thống Đặt Vé Xem Phim (Cinema Booking System)

Tài liệu này mô tả chi tiết luồng giao diện dành cho Khách hàng (End-user) từ lúc tìm kiếm phim cho đến khi đặt vé thành công. Mục tiêu giúp các thành viên mới trong dự án (Developer, QC/Tester) dễ dàng nắm bắt được luồng nghiệp vụ và cấu trúc giao diện hệ thống rạp phim.

---

## 1. Home Page (Trang Chủ)

### Mục đích màn hình
Là điểm chạm đầu tiên của khách hàng, giúp giới thiệu các bộ phim đang chiếu, sắp chiếu, các chương trình khuyến mãi và điều hướng người dùng bắt đầu luồng đặt vé nhanh chóng.

### Chức năng chính
* Xem danh sách phim đang chiếu (Now Showing) và phim sắp chiếu (Coming Soon).
* Tìm kiếm phim theo tên, thể loại hoặc diễn viên.
* Lọc nhanh phim theo cụm rạp hoặc định dạng xem (2D/3D/IMAX).
* Xem các banner quảng cáo/khuyến mãi động (Slider/Carousel).

### Thành phần giao diện chính
* **Header:** Logo rạp phim, thanh tìm kiếm thông minh, bộ lọc vị trí (Tỉnh/Thành phố), nút Đăng nhập/Đăng ký (hoặc Avatar nếu đã đăng nhập).
* **Banner Slider:** Hiển thị các hình ảnh/trailer phim hot hoặc chương trình khuyến mãi lớn của rạp.
* **Tab Navigation:** Nút chuyển đổi mượt mà giữa hai danh mục: "Phim Đang Chiếu" và "Phim Sắp Chiếu".
* **Movie Grid:** Danh sách các thẻ phim (Movie Card). Mỗi card bao gồm: Ảnh poster, tên phim, nhãn phân loại độ tuổi (P, T13, T16, T18), thể loại, thời lượng và nút "Mua vé ngay".
* **Footer:** Thông tin liên hệ, điều khoản sử dụng, chính sách bảo mật và liên kết mạng xã hội của rạp.

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Mặc định khi truy cập trang chủ, hệ thống phải tải danh sách "Phim Đang Chiếu" lên đầu tiên.
* Khi nhấn vào Poster hoặc Tên phim, hệ thống phải chuyển hướng chính xác sang trang **Movie Detail**.
* Khi nhấn nút "Mua vé ngay", hệ thống mở nhanh pop-up chọn suất chiếu hoặc cuộn xuống phần chọn suất chiếu ở trang Detail.
* Thanh tìm kiếm phải hiển thị kết quả gợi ý (Auto-suggest) ngay sau khi người dùng nhập từ 3 ký tự trở lên.

---

## 2. Movie Detail (Trang Chi Tiết Phim & Chọn Suất Chiếu)

### Mục đích màn hình
Cung cấp thông tin đầy đủ, trực quan về một bộ phim cụ thể (nội dung, trailer, đánh giá) và là nơi để khách hàng lựa chọn ngày xem, rạp xem và suất chiếu phù hợp với lịch trình cá nhân.

### Chức năng chính
* Hiển thị thông tin chi tiết: Trailer phim, nội dung tóm tắt, danh sách diễn viên, đạo diễn, thời lượng, ngôn ngữ.
* Lựa chọn Ngày xem (Date Picker) trong tuần.
* Lựa chọn Cụm rạp xem gần nhất hoặc theo bộ lọc khu vực.
* Hiển thị và lựa chọn Suất chiếu (Showtime) theo định dạng phim (2D Vietsub, 2D Lồng tiếng, IMAX).

### Thành phần giao diện chính
* **Movie Info Section:** Poster lớn (hoặc video trailer chạy ngầm làm background), tên phim (Tiếng Việt & Tiếng Anh), thời lượng (phút), ngày khởi chiếu, quốc gia, điểm số đánh giá từ người dùng.
* **Synopsis Section:** Đoạn văn ngắn tóm tắt nội dung cốt truyện và danh sách hình ảnh/tên các diễn viên chính, đạo diễn.
* **Booking Filter Bar:**
    * Thanh chọn ngày: Hiển thị 7 ngày tiếp theo dưới dạng thanh trượt ngang (Thứ, Ngày/Tháng).
    * Bộ lọc khu vực/Rạp: Dropdown select chọn quận/huyện hoặc tỉnh thành.
* **Showtime Section:** Danh sách các rạp còn suất chiếu của phim đó. Dưới mỗi tên rạp chia theo loại phòng/định dạng phim và danh sách các block thời gian suất chiếu cụ thể (Ví dụ: `09:30`, `14:15`, `20:45`).

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Các suất chiếu của quá khứ (so với giờ hiện tại của hệ thống hiển thị) bắt buộc phải bị ẩn hoặc làm mờ (disabled), không cho phép người dùng tương tác ấn vào.
* Khi người dùng chọn một suất chiếu cụ thể (Block thời gian), hệ thống phải ghi nhận thông tin và tự động chuyển hướng sang trang **Seat Selection** kèm các tham số liên quan (`Movie ID`, `Cinema ID`, `Date`, `Showtime ID`).

---

## 3. Seat Selection (Trang Chọn Ghế)

### Mục đích màn hình
Cho phép khách hàng quan sát sơ đồ phòng chiếu theo thời gian thực (Real-time) để lựa chọn vị trí ngồi mong muốn và chọn mua thêm các combo bắp nước đi kèm trước khi thanh toán.

### Chức năng chính
* Hiển thị sơ đồ ghế ngồi trực quan, đúng cấu trúc vật lý của phòng chiếu được chọn.
* Cập nhật trạng thái ghế liên tục theo thời gian thực (Đồng bộ hóa để tránh tình trạng hai người đặt trùng một ghế).
* Chọn số lượng và loại ghế linh hoạt (Ghế thường, Ghế VIP, Ghế đôi/Sweetbox).
* Chọn kèm các Combo bắp nước ưu đãi (Concession) ngay trên trang.

### Thành phần giao diện chính
* **Screen Indicator:** Thanh biểu diễn vị trí Màn Hình (thường là một đường cong hoặc dải màu sáng lớn ở trên cùng để người dùng định vị hướng nhìn khi chọn ghế).
* **Seat Map Grid:** Ma trận các ô ghế được ký hiệu theo hàng chữ (A, B, C,...) và cột số (1, 2, 3,...). 
    * Màu sắc phân biệt rõ ràng: Ghế thường (Xám), Ghế VIP (Vàng/Đỏ), Ghế đôi (Hồng), Ghế đã có người đặt (Có dấu X hoặc màu xám đậm), Ghế đang chọn (Xanh lá).
* **Seat Legend:** Chú thích chi tiết ý nghĩa của các loại màu sắc ghế ở phía dưới sơ đồ để khách hàng dễ hiểu.
* **Concession Section:** Danh sách các combo bắp nước đi kèm giá tiền, nút tăng/giảm số lượng cụ thể (`+`, `-`).
* **Summary Bottom Bar (Thanh tổng kết cố định ở đáy trang):** Hiển thị: Tên phim, Rạp, Suất chiếu, Số ghế đã chọn (Vd: H12, H13), Tổng tiền tạm tính và nút "Tiếp tục".

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Hệ thống tuyệt đối không cho phép người dùng chọn những ghế đã có trạng thái "Đã bán" hoặc "Đang được giữ chỗ tạm thời bởi người khác".
* Khách hàng không được để lại 1 ghế trống duy nhất ở giữa các ghế đang chọn và ghế đã bán (quy tắc tối ưu công suất phòng chiếu của rạp).
* Giới hạn thời gian chọn ghế tối đa là 5 phút. Bộ đếm ngược (Countdown Timer) phải hiển thị nổi bật trên màn hình. Nếu hết giờ mà khách hàng chưa chuyển sang bước thanh toán, ghế đang chọn sẽ tự động giải phóng về trạng thái trống.

---

## 4. Payment (Trang Thanh Toán)

### Mục đích màn hình
Cung cấp hóa đơn chi tiết (Invoice) tổng kết toàn bộ đơn hàng và cung cấp các phương thức thanh toán an toàn để khách hàng tiến hành trả tiền vé.

### Chức năng chính
* Hiển thị thông tin tóm tắt toàn bộ đơn đặt vé (Vé phim + Bắp nước).
* Áp dụng mã giảm giá/Voucher hoặc tích điểm thành viên (Membership points).
* Lựa chọn cổng thanh toán điện tử phù hợp để giao dịch.

### Thành phần giao diện chính
* **Countdown Timer:** Tiếp tục hiển thị thời gian giữ ghế còn lại được đồng bộ từ trang trước (thời gian đếm ngược cho toàn bộ phiên giao dịch).
* **Order Summary Card:** Danh sách chi tiết hóa đơn gồm: Tên phim, định dạng, thời gian suất chiếu, phòng chiếu, danh sách số ghế, chi tiết combo bắp nước, tổng tiền chưa giảm.
* **Promotion Code Box:** Ô nhập mã giảm giá (Voucher) và nút "Áp dụng".
* **Payment Methods List:** Danh sách các Radio Button hoặc Card chọn phương thức thanh toán phổ biến:
    * Ví điện tử (Momo, ZaloPay, ShopeePay).
    * Thẻ nội địa / Cổng VNPAY (Quét mã QR Code ngân hàng).
    * Thẻ quốc tế (Visa/Mastercard/JCB).
* **Terms Agreement:** Ô checkbox xác nhận: "Tôi đồng ý với điều khoản mua vé và quy định của rạp phim".
* **Action Button:** Nút "Thanh toán" đính kèm tổng số tiền cuối cùng cần phải trả (Đã trừ giảm giá nếu có).

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Nút "Thanh toán" chỉ có hiệu lực (active) khi người dùng đã tích chọn vào ô Checkbox đồng ý với điều khoản dịch vụ.
* Khi áp dụng mã giảm giá thành công, hệ thống phải cập nhật trừ tiền trực tiếp trên tổng số tiền hiển thị thời gian thực và hiển thị dòng chữ "Đã giảm: -X.000đ".
* Khi nhấn "Thanh toán", hệ thống sẽ khóa giao diện, gọi API sang bên cổng thanh toán thứ 3 và hiển thị màn hình Loading chuyển hướng, không cho người dùng ấn lặp lại (Chống double-charge).

---

## 5. Booking Success (Trang Đặt Vé Thành Công)

### Mục đích màn hình
Xác nhận giao dịch thành công, cung cấp thông tin vé điện tử cùng mã QR/Mã vạch để khách hàng sử dụng trực tiếp khi đến rạp nhận vé cứng hoặc vào phòng chiếu.

### Chức năng chính
* Hiển thị thông báo trạng thái đặt vé thành công rực rỡ, rõ ràng.
* Cung cấp Mã đặt vé viết bằng chữ (Booking ID) và Mã QR (QR Code).
* Cung cấp các tùy chọn tiện ích: Tải ảnh vé về máy, gửi thông tin vé qua Email/SMS.

### Thành phần giao diện chính
* **Success Icon:** Biểu tượng tích xanh chuyển động lớn báo hiệu giao dịch hoàn tất hoàn hảo.
* **Digital Ticket Card:** Thiết kế giả lập như một chiếc vé giấy xinh xắn bao gồm:
    * **Mã QR Code / Mã vạch (Barcode):** Nằm ở vị trí trung tâm, kích thước lớn để nhân viên quét tại quầy hoặc máy soát vé.
    * **Mã đặt vé (Booking ID):** Chuỗi ký tự ngắn dễ đọc (Vd: `CINEMA9821`).
    * **Thông tin chi tiết:** Tên phim, Thời gian, Rạp, Phòng chiếu, Số ghế, Combo bắp nước đi kèm.
    * **Tổng tiền đã thanh toán:** Hiển thị số tiền kèm trạng thái màu xanh "Đã thanh toán".
* **Instruction Note:** Dòng chữ hướng dẫn cụ thể (*"Vui lòng mang mã QR này đến quầy vé hoặc máy in vé tự động tại rạp để nhận vé cứng"*).
* **Action Buttons:** Nút "Lưu vé" (Tải ảnh định dạng PNG về máy), nút "Gửi lại email" và nút "Quay lại Trang Chủ".

### Acceptance Criteria (Tiêu chí nghiệm thu)
* Hệ thống phải tự động kích hoạt API gửi một email xác nhận kèm thông tin vé chi tiết và mã QR đến email đăng ký tài khoản của khách hàng ngay khi màn hình này được hiển thị thành công.
* Khi người dùng nhấn nút "Quay lại Trang Chủ", toàn bộ trạng thái đơn hàng cũ trong session/state lưu trữ tạm của ứng dụng phải được xóa sạch hoàn toàn để sẵn sàng cho lượt đặt vé mới tiếp theo.
