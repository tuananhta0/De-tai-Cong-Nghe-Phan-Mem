# 🎬 X CINEMA — Hệ Thống Đặt Vé Xem Phim Trực Tuyến

Dự án được phát triển trong học phần **Công nghệ Phần mềm**, xây dựng một hệ thống hỗ trợ khách hàng tra cứu phim, xem lịch chiếu, chọn ghế và đặt vé trực tuyến theo thời gian thực, đồng thời cung cấp các công cụ quản trị cho rạp phim.

---

## 🎯 Mục tiêu dự án

- Hỗ trợ khách hàng tìm phim và đặt vé xem phim trực tuyến, giảm thời gian xếp hàng tại quầy.
- Cho phép chọn ghế theo thời gian thực (khóa ghế tạm thời, đồng bộ trạng thái giữa nhiều người dùng qua WebSocket).
- Cung cấp giao diện quản trị để quản lý phim, cụm rạp, lịch chiếu, combo, khuyến mãi và tình trạng vé.
- Áp dụng kiến trúc client-server rõ ràng: frontend React tách biệt hoàn toàn với backend C++ qua REST API + WebSocket.

---

## 🛠 Công nghệ sử dụng

### Backend
- **Ngôn ngữ:** C++17
- **Web framework:** [Crow](https://github.com/CrowCpp/Crow) (fetch tự động qua CMake `FetchContent`)
- **Cơ sở dữ liệu:** Microsoft SQL Server, kết nối qua **ODBC**
- **Realtime:** WebSocket (khóa ghế, cập nhật trạng thái vé/đơn cho admin)
- **Build toolchain:** CMake (`MinGW Makefiles`) + MinGW-w64 (`g++ 15.2.0` qua MSYS2)
- **Bảo mật:** Hash mật khẩu SHA-256 (`SecurityUtil.hpp`), phân quyền theo vai trò (`AuthGuard.hpp`)

### Frontend
- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 6
- **Styling:** Tailwind CSS v4
- **Khác:** `lucide-react` (icon), `motion` (animation)
- Kiến trúc **Context API**: `AuthContext`, `MovieContext`, `BookingContext`, `UIContext`

### Cơ sở dữ liệu
- SQL Server, script khởi tạo và seed dữ liệu đặt trong `database-sql/`

---

## 🚀 Chức năng hệ thống

### Khách hàng
1. **Xem danh sách & chi tiết phim** — phim đang chiếu, sắp chiếu, poster, thể loại, thời lượng, trailer, lịch chiếu.
2. **Đặt vé** — chọn cụm rạp, suất chiếu, chọn ghế trên sơ đồ ghế thời gian thực (Thường / VIP / Sweetbox).
3. **Combo & khuyến mãi** — chọn combo bắp nước, áp mã khuyến mãi.
4. **Thanh toán** — xem tóm tắt vé, tổng tiền, xác nhận thanh toán, nhận vé điện tử (e-ticket).
5. **Tài khoản** — đăng ký, đăng nhập, xem hồ sơ, xem lịch sử đặt vé.
6. **Tin tức & khuyến mãi** — xem tin tức, ưu đãi của rạp.

### Quản trị viên / Nhân viên (phân quyền theo vai trò: `admin`, `cinema_admin`, `employee`)
- **Quản lý phim:** thêm, sửa, xóa phim.
- **Quản lý cụm rạp & lịch chiếu:** tạo, xem, hủy suất chiếu (có kiểm tra trùng lịch qua trigger CSDL).
- **Quản lý đặt vé:** theo dõi vé đã bán, check-in vé, xác nhận đổi combo.
- **Quản lý combo & khuyến mãi:** thêm/xóa combo, mã khuyến mãi.
- **Quản lý tin tức:** đăng, xóa tin tức.
- **Thống kê doanh thu:** xem doanh thu theo cụm rạp (dành cho `admin`/`cinema_admin`).
- **Quản lý tài khoản nhân viên:** tạo tài khoản nhân viên/quản trị theo từng cụm rạp.

---

## 🗂 Cấu trúc thư mục

```
WebBanVeXemPhim/
│
├── README.md
├── .gitignore
│
├── backend/                     # C++ Crow + ODBC (SQL Server)
│   ├── CMakeLists.txt
│   ├── .env.example
│   └── src/
│       ├── main.cpp             # Khai báo toàn bộ route REST API + WebSocket
│       ├── controllers/         # MovieController, CinemaController, BookingController,
│       │                        # AccountController, PromotionController, NewsController, ComboController
│       ├── models/               # Tương ứng với từng controller, thao tác trực tiếp với CSDL
│       ├── database/             # Database.hpp (kết nối ODBC), DotEnv.hpp
│       ├── websocket/            # WebSocketManager.hpp — realtime ghế & thông báo admin
│       └── utils/                # AuthGuard, SecurityUtil, JsonArrayUtil
│
├── frontend/                    # React 19 + TypeScript + Vite
│   └── src/
│       ├── main.tsx / App.tsx
│       ├── contexts/             # AuthContext, MovieContext, BookingContext, UIContext
│       ├── pages/                 # Admin, Staff, Auth, Profile, Cinemas, Promotions
│       ├── components/
│       │   ├── booking/           # SeatMap, PaymentModal, ETicket
│       │   ├── movie/             # MovieDetailModal, MovieCard...
│       │   ├── layout/            # Header, HeroBanner
│       │   └── ui/, common/
│       ├── services/              # api.ts (REST client), useWebSocket.ts
│       ├── hooks/                 # useAsyncData, useWebSocket
│       ├── types/                 # movie, booking, auth, content
│       └── data/seedData.ts
│
└── database-sql/
    ├── 01_create_database.sql   # Toàn bộ schema (Cinemas, Halls, Seats, Movies, Showtimes, Bookings...)
    └── 02_insert_data.sql       # Dữ liệu mẫu + trigger chống trùng lịch chiếu
```

---

## ⚙️ Hướng dẫn chạy dự án (local)

### 1. Cơ sở dữ liệu
1. Cài SQL Server, tạo instance (mặc định cấu hình dùng `localhost\MSSQLSERVER01`).
2. Chạy lần lượt `database-sql/01_create_database.sql` rồi `database-sql/02_insert_data.sql`.

### 2. Backend
```bash
cd backend
cp .env.example .env     # rồi điền DB_SERVER, DB_NAME, DB_UID, DB_PASSWORD
cmake -G "MinGW Makefiles" -B build
cmake --build build
./build/WebXemPhim_Backend.exe
```
Backend chạy tại `http://localhost:8080`, REST API tại `/api/*`, WebSocket tại `/ws`.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Vite proxy tự động chuyển tiếp `/api/*` và `/ws` sang backend tại cổng `8080`.

---

## 📡 Tổng quan API (REST)

| Nhóm | Endpoint chính |
|---|---|
| Phim | `GET/POST /api/movies`, `GET/PUT/DELETE /api/movies/:id` |
| Rạp & lịch chiếu | `GET /api/cinemas`, `GET/POST /api/showtimes`, `DELETE /api/showtimes/:id` |
| Ghế & đặt vé | `GET /api/seats/:showtimeId`, `POST /api/seats/lock`, `GET/POST /api/bookings` |
| Vé | `GET /api/bookings/user/:email`, `PUT /api/bookings/:code/checkin`, `PUT /api/bookings/:code/combo` |
| Tài khoản | `POST /api/accounts/login`, `POST /api/accounts/register`, `GET/PUT /api/accounts/:email` |
| Khuyến mãi | `GET/POST /api/promotions`, `GET /api/promotions/validate/:code` |
| Tin tức | `GET/POST /api/news`, `PUT /api/news/:id/view` |
| Combo | `GET/POST /api/combos` |
| Thống kê | `GET /api/admin/revenue` |

Phân quyền được kiểm tra qua header `x-user-role` / `x-user-email` (xem `AuthGuard.hpp`).

---

## 📌 Quy trình phát triển

Dự án được thực hiện theo mô hình **Agile Scrum**: thu thập yêu cầu → thiết kế CSDL & API → phát triển song song backend/frontend → tích hợp realtime (WebSocket) → kiểm thử → đánh giá sprint.

---

## 📄 Giấy phép

Dự án được phát triển phục vụ mục đích học tập trong học phần Công nghệ Phần mềm.

## 📞 Liên hệ

Mọi góp ý hoặc câu hỏi liên quan đến dự án, vui lòng liên hệ qua GitHub Issues hoặc GitHub Discussions của repository.
