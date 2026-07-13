# 🎬 Feature: Home / Movie List

## Branch
`feature/movie-list`

## Description
Xây dựng module hiển thị danh sách phim trên trang Home. Dữ liệu được lấy từ Backend API và hiển thị dưới dạng các Movie Card.

---

## Tasks

### Fetch API
- [ ] Gọi API lấy danh sách phim từ Backend.
- [ ] Xử lý trạng thái loading khi đang fetch dữ liệu.
- [ ] Xử lý lỗi khi API không phản hồi.
- [ ] Đồng bộ dữ liệu với Context/State.

### Render Movie List
- [ ] Hiển thị danh sách phim dạng Grid.
- [ ] Hiển thị Poster.
- [ ] Hiển thị tên phim.
- [ ] Hiển thị Rating.
- [ ] Hiển thị Genre.
- [ ] Hiển thị trạng thái (Đang chiếu / Sắp chiếu nếu có).

### Search / Filter
- [ ] Tìm kiếm theo tên phim.
- [ ] Lọc theo Genre.
- [ ] (Optional) Lọc theo trạng thái.

### Loading & Empty State
- [ ] Hiển thị Loading Spinner/Skeleton.
- [ ] Hiển thị Empty State khi không có dữ liệu.
- [ ] Hiển thị Empty State khi không tìm thấy kết quả.

### Error Handling
- [ ] Hiển thị thông báo khi API lỗi.
- [ ] Có chức năng Retry (nếu cần).

---

## Output
- Home Page Movie List.
- Fetch dữ liệu từ Backend.
- Render Movie Card.
- Search/Filter hoạt động.
- Loading State.
- Empty State.
- Error Handling.

---

## Acceptance Criteria

- [ ] Danh sách phim được lấy từ Backend API.
- [ ] Hiển thị đúng Poster, Rating, Genre và thông tin phim.
- [ ] Search hoạt động.
- [ ] Filter hoạt động (nếu có).
- [ ] Loading State hoạt động.
- [ ] Empty State hoạt động.
- [ ] Không bị crash khi API trả về mảng rỗng hoặc lỗi.

---

## Pull Request
`feature/movie-list`
