/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
//  services/api.ts
//  Lớp gọi API tập trung tới backend C++ (Crow + SQL Server) đã thiết kế lại.
//  Toàn bộ route khớp với CROW_ROUTE đăng ký trong main.cpp:
//    /api/movies, /api/cinemas, /api/showtimes, /api/seats, /api/bookings,
//    /api/accounts, /api/promotions, /api/news, /api/combos
//
//  Mọi hàm trả Promise; lỗi mạng/HTTP được throw để component tự xử lý
//  (hiển thị toast/lỗi) thay vì âm thầm trả mảng rỗng.
// ============================================================================

import type {
  Movie,
  Cinema,
  Showtime,
  Booking,
  UserProfile,
  Promotion,
  News,
  ComboItem,
} from "../types";

const BASE_URL = "/api"; // Vite proxy /api/* -> http://localhost:8080/api/* (xem vite.config.ts)

// ============================================================================
//  SECURITY HEADERS
//  Đọc role/email của người đang đăng nhập (khách hàng hoặc nhân viên/admin
//  đang trực Staff Portal) từ localStorage để gửi kèm mọi request lên backend
//  C++. Backend dùng các header này (qua AuthGuard.hpp) để chặn các hành động
//  quản trị (thêm/sửa/xóa phim, suất chiếu, khuyến mãi...) nếu role không phù
//  hợp - tránh trường hợp người dùng tự gọi thẳng API mà bỏ qua giao diện.
// ============================================================================
function getSecurityHeaders(): Record<string, string> {
  try {
    // Nhân viên/Admin đang đăng nhập ở Staff Portal/Admin Panel được ưu tiên trước
    const cachedOp = localStorage.getItem("tcd_operator");
    if (cachedOp) {
      const op = JSON.parse(cachedOp);
      return { "x-user-role": op.role || "", "x-user-email": op.email || "" };
    }
    const cachedUser = localStorage.getItem("tcd_user");
    if (cachedUser) {
      const u = JSON.parse(cachedUser);
      return { "x-user-role": u.role || "customer", "x-user-email": u.email || "" };
    }
  } catch {
    /* localStorage hỏng hoặc JSON không hợp lệ -> coi như khách vãng lai */
  }
  return { "x-user-role": "customer" };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Lỗi ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* response không phải JSON, giữ message mặc định */
    }
    throw new Error(message);
  }
  // 204 No Content (vd preflight) không có body để parse
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// Dùng cho các hành động quản trị (thêm/sửa/xóa phim, suất chiếu, khuyến mãi,
// check-in vé...) - tự gắn thêm x-user-role/x-user-email vào header để backend
// xác thực quyền truy cập trước khi thực hiện thao tác.
async function protectedRequest<T>(path: string, options?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getSecurityHeaders(),
      ...(options?.headers || {}),
    },
  });
}

// ============================================================================
//  PHIM (MOVIES)
// ============================================================================
export const movieApi = {
  getAll: () => request<Movie[]>("/movies"),
  getById: (id: string) => request<Movie>(`/movies/${id}`),
  create: (movie: Omit<Movie, "id">) =>
    protectedRequest<Movie>("/movies", { method: "POST", body: JSON.stringify(movie) }),
  update: (id: string, movie: Omit<Movie, "id">) =>
    protectedRequest<Movie>(`/movies/${id}`, { method: "PUT", body: JSON.stringify(movie) }),
  remove: (id: string) =>
    protectedRequest<{ success: boolean }>(`/movies/${id}`, { method: "DELETE" }),
};

// ============================================================================
//  CỤM RẠP (CINEMAS)
// ============================================================================
export const cinemaApi = {
  getAll: () => request<Cinema[]>("/cinemas"),
};

// ============================================================================
//  SUẤT CHIẾU (SHOWTIMES)
// ============================================================================
export const showtimeApi = {
  getAll: () => request<Showtime[]>("/showtimes"),
  getByMovie: (movieId: string) => request<Showtime[]>(`/showtimes/movie/${movieId}`),
  create: (data: {
    movieId: string;
    cinemaId: string;
    startTime: string; // "yyyy-mm-dd HH:mm:ss"
    format: Showtime["format"];
    room?: string; // "Phòng 1" | "Phòng 2 (VIP)"
    priceStandard: number;
    priceVIP: number;
    priceDouble: number;
  }) => protectedRequest<{ id: string; success: boolean }>("/showtimes", {
    method: "POST",
    body: JSON.stringify(data),
  }),
  remove: (id: string) =>
    protectedRequest<{ success: boolean }>(`/showtimes/${id}`, { method: "DELETE" }),
};

// ============================================================================
//  GHẾ (SEATS)
// ============================================================================
export interface SeatStatus {
  showtimeSeatId: number;
  seatName: string;
  seatType: string;
  status: "Available" | "Holding" | "Booked";
}

export const seatApi = {
  getByShowtime: (showtimeId: string) => request<SeatStatus[]>(`/seats/${showtimeId}`),
  lock: (showtimeId: string, seatName: string) =>
    request<{ success: boolean; showtimeSeatId: number }>("/seats/lock", {
      method: "POST",
      body: JSON.stringify({ showtimeId, seatName }),
    }),
};

// ============================================================================
//  ĐẶT VÉ (BOOKINGS)
// ============================================================================
export interface CreateBookingPayload {
  showtimeId: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  showDate: string;
  showTime: string;
  room: string;
  format: string;
  seats: string[];
  totalAmount: number;
  paymentMethod: string;
  qrCodeUrl: string;
  userEmail?: string;
  combos?: { id: string; quantity: number }[];
}

export const bookingApi = {
  create: (payload: CreateBookingPayload) =>
    request<Booking>("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getByUser: (email: string) => request<Booking[]>(`/bookings/user/${encodeURIComponent(email)}`),
  getAll: () => protectedRequest<Booking[]>("/bookings"),
  setCheckedIn: (code: string, isCheckedIn: boolean) =>
    protectedRequest<{ success: boolean }>(`/bookings/${code}/checkin`, {
      method: "PUT",
      body: JSON.stringify({ isCheckedIn }),
    }),
  setComboRedeemed: (code: string, isComboRedeemed: boolean) =>
    protectedRequest<{ success: boolean }>(`/bookings/${code}/combo`, {
      method: "PUT",
      body: JSON.stringify({ isComboRedeemed }),
    }),
  getRevenue: () => protectedRequest<{ revenue: number }>("/admin/revenue"),
};

// ============================================================================
//  TÀI KHOẢN (ACCOUNTS)
// ============================================================================
export const accountApi = {
  login: (emailOrPhone: string, password: string) =>
    request<UserProfile>("/accounts/login", {
      method: "POST",
      body: JSON.stringify({ emailOrPhone, password }),
    }),
  register: (data: { name: string; email: string; phone?: string; password: string }) =>
    request<UserProfile>("/accounts/register", { method: "POST", body: JSON.stringify(data) }),
  getByEmail: (email: string) => request<UserProfile>(`/accounts/${encodeURIComponent(email)}`),
  updateProfile: (email: string, data: Partial<UserProfile>) =>
    protectedRequest<UserProfile>(`/accounts/${encodeURIComponent(email)}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getAll: () => protectedRequest<UserProfile[]>("/accounts"),
};

// ============================================================================
//  KHUYẾN MÃI (PROMOTIONS)
// ============================================================================
export const promotionApi = {
  getAll: () => request<Promotion[]>("/promotions"),
  create: (data: Omit<Promotion, "id">) =>
    protectedRequest<Promotion>("/promotions", { method: "POST", body: JSON.stringify(data) }),
  remove: (id: string) =>
    protectedRequest<{ success: boolean }>(`/promotions/${id}`, { method: "DELETE" }),
  validate: (code: string) =>
    request<{ valid: boolean; discountPercent: number }>(`/promotions/validate/${encodeURIComponent(code)}`),
};

// ============================================================================
//  TIN TỨC (NEWS)
// ============================================================================
export const newsApi = {
  getAll: () => request<News[]>("/news"),
  create: (data: Omit<News, "id" | "views">) =>
    protectedRequest<News>("/news", { method: "POST", body: JSON.stringify(data) }),
  remove: (id: string) => protectedRequest<{ success: boolean }>(`/news/${id}`, { method: "DELETE" }),
  incrementViews: (id: string) =>
    request<{ success: boolean }>(`/news/${id}/view`, { method: "PUT" }),
};

// ============================================================================
//  COMBO (BẮP NƯỚC)
// ============================================================================
export const comboApi = {
  getAll: () => request<ComboItem[]>("/combos"),
  create: (data: Omit<ComboItem, "id">) =>
    protectedRequest<ComboItem>("/combos", { method: "POST", body: JSON.stringify(data) }),
  remove: (id: string) => protectedRequest<{ success: boolean }>(`/combos/${id}`, { method: "DELETE" }),
};
