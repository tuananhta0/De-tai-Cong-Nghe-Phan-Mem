# Hướng Dẫn Cài Đặt & Chạy

## Cài đặt

```bash
# Bước 1: Giải nén và vào thư mục
unzip frontend-final.zip -d xcine-frontend
cd xcine-frontend

# Bước 2: Cài dependencies
# Nếu gặp lỗi sqlite3 (native module), dùng flag này:
npm install --ignore-scripts

# Bước 3: Chạy dev server
npm run dev
```

## Nếu vẫn lỗi sqlite3

sqlite3 là dependency của **backend C++** (server.ts), không phải frontend.
Để chạy thuần frontend, cài từng package cần thiết:

```bash
npm install react react-dom lucide-react motion vite @vitejs/plugin-react @tailwindcss/vite tailwindcss typescript
npm run dev
```

## Kết nối backend C++

Frontend proxy `/api/*` → `http://localhost:8080`
Backend C++ phải đang chạy trên port 8080 trước khi vào tính năng đặt vé, admin, staff.

Xem `vite.config.ts` để thay đổi port nếu cần.

## Build production

```bash
npm run build      # Output vào dist/
npm run preview    # Preview bản build
```
