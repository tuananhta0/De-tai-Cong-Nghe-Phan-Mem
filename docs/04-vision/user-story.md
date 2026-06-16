# USER STORIES

## US01: Xem danh sách phim

Là khách truy cập

Tôi muốn xem danh sách các phim đang chiếu và sắp chiếu trên website

Để có thể lựa chọn bộ phim mình yêu thích

### Acceptance Criteria

* Giao diện hiển thị danh sách phim dạng lưới (Grid), bao gồm poster, tên phim và thể loại.
* Có bộ lọc theo trạng thái:

  * Đang chiếu
  * Sắp chiếu

---

## US02: Gợi ý phim thông minh

Là thành viên đã đăng nhập

Tôi muốn nhận được danh sách phim đề xuất dựa trên lịch sử xem của mình

Để nhanh chóng tìm được những bộ phim phù hợp với sở thích

### Acceptance Criteria

* Khu vực "Phim đề xuất cho bạn" xuất hiện trên trang chủ sau khi người dùng đăng nhập.
* Hệ thống AI trả về danh sách 5 bộ phim phù hợp nhất dựa trên dữ liệu lịch sử xem.

---

## US03: Xem lịch chiếu phim

Là khách hàng

Tôi muốn xem lịch chiếu của một bộ phim theo ngày và giờ tại các rạp

Để sắp xếp thời gian đi xem phù hợp

### Acceptance Criteria

* Khi chọn một bộ phim, hệ thống hiển thị danh sách các ngày có suất chiếu.
* Khi chọn một ngày, hệ thống hiển thị các suất chiếu còn hiệu lực.

---

## US04: Chọn ghế ngồi

Là khách hàng đã chọn suất chiếu

Tôi muốn xem sơ đồ phòng chiếu và trạng thái các ghế

Để lựa chọn vị trí ngồi mong muốn

### Acceptance Criteria

* Hiển thị trực quan trạng thái ghế:

  * Ghế trống
  * Ghế đã đặt
  * Ghế đang chọn
* Ghế đã được đặt phải bị khóa và không thể chọn.
* Không cho phép hai người dùng đặt cùng một ghế tại cùng một thời điểm.

---

## US05: Đặt vé xem phim

Là khách hàng đã chọn ghế

Tôi muốn xem lại thông tin vé trước khi thanh toán

Để xác nhận chính xác đơn đặt vé của mình

### Acceptance Criteria

* Hiển thị:

  * Tên phim
  * Suất chiếu
  * Ghế đã chọn
  * Tổng tiền
* Hệ thống giữ ghế trong vòng 5 phút để người dùng hoàn tất thanh toán.

---

## US06: Thanh toán trực tuyến

Là khách hàng đặt vé

Tôi muốn thanh toán trực tuyến cho vé xem phim

Để hoàn tất giao dịch một cách nhanh chóng và an toàn

### Acceptance Criteria

* Hỗ trợ ít nhất một phương thức thanh toán điện tử.
* Sau khi thanh toán thành công, trạng thái vé được cập nhật thành "Đã thanh toán".

---

## US07: Quản lý danh mục phim

Là quản trị viên

Tôi muốn thêm, sửa và xóa thông tin phim

Để cập nhật nội dung trên website

### Acceptance Criteria

* Quản trị viên có thể:

  * Thêm phim
  * Chỉnh sửa phim
  * Xóa phim
* Hỗ trợ cập nhật:

  * Poster
  * Trailer
  * Thời lượng
  * Mô tả phim
* Dữ liệu được cập nhật vào cơ sở dữ liệu ngay sau khi lưu.

---

## US08: Quản lý suất chiếu

Là quản trị viên

Tôi muốn tạo và sắp xếp các suất chiếu cho từng bộ phim

Để vận hành lịch chiếu theo thực tế của rạp

### Acceptance Criteria

* Có thể tạo suất chiếu theo:

  * Phòng chiếu
  * Ngày chiếu
  * Giờ chiếu
* Hệ thống ngăn chặn việc tạo các suất chiếu bị trùng phòng và trùng thời gian.

---

## US09: Xem báo cáo doanh thu

Là quản lý rạp

Tôi muốn xem báo cáo doanh thu theo nhiều khoảng thời gian khác nhau

Để đánh giá hiệu quả kinh doanh của rạp

### Acceptance Criteria

* Hiển thị tổng doanh thu dưới dạng bảng số liệu.
* Hiển thị biểu đồ trực quan.
* Cho phép lọc theo:

  * Ngày
  * Tuần
  * Tháng
  * Bộ phim

---

## US10: Nhận vé điện tử bằng mã QR

Là khách hàng đã thanh toán thành công

Tôi muốn nhận được mã QR chứa thông tin vé

Để sử dụng khi đến rạp xem phim

### Acceptance Criteria

* Hệ thống tạo mã QR duy nhất cho mỗi vé.
* Hiển thị mã QR trên website sau khi thanh toán thành công.
* Gửi email xác nhận kèm mã QR cho khách hàng.
