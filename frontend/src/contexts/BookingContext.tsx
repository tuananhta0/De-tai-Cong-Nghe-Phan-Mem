/**
 * contexts/BookingContext.tsx
 *
 * Quản lý:
 *   1. Lịch sử đặt vé (bookings[]) — tải từ server, đồng bộ checkin/combo
 *   2. Booking flow (seat → payment → ticket) — trạng thái bước hiện tại
 *   3. Tài khoản người dùng (cho admin quản lý)
 *
 * Tách riêng để Admin/Staff portal chỉ subscribe context này,
 * không bị re-render khi catalogue phim thay đổi.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Booking, ComboItem } from "../types/booking";
import type { Movie, Showtime } from "../types/movie";
import type { UserProfile } from "../types/auth";
import { bookingApi, accountApi, type CreateBookingPayload } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingFlowState {
  movie: Movie;
  showtime: Showtime;
  step: "seats" | "payment" | "ticket";
  selectedSeats: string[];
  totalAmount: number;
  activeTicket?: Booking;
  selectedCombos?: { id: string; name: string; price: number; quantity: number }[];
}

interface BookingContextValue {
  // Booking history
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  refreshBookingsFromServer: () => Promise<void>;
  loadUserBookings: (email: string) => Promise<void>;

  // Booking flow
  activeBooking: BookingFlowState | null;
  setActiveBooking: React.Dispatch<React.SetStateAction<BookingFlowState | null>>;
  startBooking: (movie: Movie, showtime: Showtime) => void;
  proceedToPayment: (seats: string[], total: number) => void;
  completePayment: (payload: CreateBookingPayload) => Promise<Booking | null>;
  cancelBooking: () => void;

  // User accounts (for admin)
  accounts: UserProfile[];
  setAccounts: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_ACCOUNTS: UserProfile[] = [
  { name: "Nguyễn Anh Đức", email: "nguyenanhducdemmer@gmail.com", phone: "0987.654.321", avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=DucNguyen", membershipId: "X-MEM-55809", points: 1250, favoriteMovies: ["m-1", "m-3", "m-5"], role: "customer" },
  { name: "Admin Nguyễn", email: "admin@xcinema.vn", phone: "0911223344", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin", membershipId: "X-ADMIN-00001", points: 99999, favoriteMovies: [], role: "admin" },
  { name: "Staff Trần", email: "employee@xcinema.vn", phone: "0922334455", avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=Staff", membershipId: "X-STAFF-00001", points: 5000, favoriteMovies: [], role: "employee" },
];

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "null") return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch { return fallback; }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({
  children,
  onAlert,
  onRegisterLoadUserBookings,
}: {
  children: React.ReactNode;
  onAlert: (msg: string) => void;
  onRegisterLoadUserBookings?: (fn: (email: string) => Promise<void>) => void;
}) {
  const [bookings, _setBookings] = useState<Booking[]>(() => readLS("tcd_bookings", []));
  const [activeBooking, setActiveBooking] = useState<BookingFlowState | null>(null);
  const [accounts, _setAccounts] = useState<UserProfile[]>(() => {
    const cached = readLS<UserProfile[]>("tcd_accounts", []);
    return cached.length > 0 ? cached : DEFAULT_ACCOUNTS;
  });

  // ── Booking history setter (syncs checkin/combo status to C++) ────────────
  const setBookings: React.Dispatch<React.SetStateAction<Booking[]>> = (updater) => {
    _setBookings(prev => {
      const next = typeof updater === "function" ? (updater as (p: Booking[]) => Booking[])(prev) : updater;
      const updated = next.filter(n => prev.some(p => p.code === n.code && JSON.stringify(p) !== JSON.stringify(n)));
      (async () => {
        for (const b of updated) {
          try {
            await bookingApi.setCheckedIn(b.code, !!b.isCheckedIn);
            await bookingApi.setComboRedeemed(b.code, !!b.isComboRedeemed);
          } catch { onAlert("Không thể cập nhật trạng thái vé."); }
        }
      })();
      return next;
    });
  };

  const refreshBookingsFromServer = useCallback(async () => {
    try {
      const fresh = await bookingApi.getAll();
      // Merge: giữ lại vé local chưa sync lên server, không ghi đè hoàn toàn
      _setBookings(prev => {
        const serverCodes = new Set(fresh.map((b: Booking) => b.code));
        const localOnly = prev.filter(b => b.code && !serverCodes.has(b.code));
        return [...fresh, ...localOnly];
      });
    }
    catch (err) { console.warn("Không thể tải lại danh sách vé:", err); }
  }, []);

  // Tải lịch sử vé của khách hàng sau khi đăng nhập
  const loadUserBookings = useCallback(async (email: string) => {
    try {
      const fresh = await bookingApi.getByUser(email);
      if (fresh.length > 0) {
        _setBookings(prev => {
          const others = prev.filter(b => b.userEmail?.toLowerCase() !== email.toLowerCase());
          const serverCodes = new Set(fresh.map(b => b.code));
          const localOnly = prev.filter(b =>
            (!b.userEmail || b.userEmail.toLowerCase() === email.toLowerCase()) &&
            !serverCodes.has(b.code)
          );
          return [...fresh, ...localOnly, ...others];
        });
      }
    } catch (err) { console.warn("Không thể tải lịch sử vé:", err); }
  }, []);

  // Đăng ký hàm loadUserBookings với main.tsx SAU KHI đã khai báo xong
  // (tránh lỗi "Cannot access before initialization")
  useEffect(() => {
    onRegisterLoadUserBookings?.(loadUserBookings);
  }, [loadUserBookings, onRegisterLoadUserBookings]);

  // ── Booking flow actions ──────────────────────────────────────────────────
  const startBooking = useCallback((movie: Movie, showtime: Showtime) => {
    setActiveBooking({ movie, showtime, step: "seats", selectedSeats: [], totalAmount: 0 });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const proceedToPayment = useCallback((seats: string[], total: number) => {
    setActiveBooking(prev => prev ? { ...prev, step: "payment", selectedSeats: seats, totalAmount: total } : null);
  }, []);

  const completePayment = useCallback(async (payload: CreateBookingPayload): Promise<Booking | null> => {
    try {
      const booking = await bookingApi.create(payload);
      // Tải lại toàn bộ lịch sử vé của user từ server thay vì thêm thủ công.
      // Tránh duplicate do nhiều nơi cùng update bookings state.
      if (payload.userEmail) {
        try {
          const fresh = await bookingApi.getByUser(payload.userEmail);
          _setBookings(prev => {
            const others = prev.filter(b => b.userEmail?.toLowerCase() !== payload.userEmail!.toLowerCase());
            const serverCodes = new Set(fresh.map(b => b.code));
            const localOnly = prev.filter(b =>
              (!b.userEmail || b.userEmail.toLowerCase() === payload.userEmail!.toLowerCase()) &&
              !serverCodes.has(b.code)
            );
            return [...fresh, ...localOnly, ...others];
          });
        } catch {
          // Fallback: thêm vé mới nếu không tải lại được, dedup theo code
          _setBookings(prev => {
            const deduped = prev.filter(b => b.code !== booking.code);
            return [booking, ...deduped];
          });
        }
      } else {
        _setBookings(prev => {
          const deduped = prev.filter(b => b.code !== booking.code);
          return [booking, ...deduped];
        });
      }
      setActiveBooking(prev => prev ? { ...prev, step: "ticket", activeTicket: booking } : null);
      return booking;
    } catch (err) {
      console.error("Lỗi khi tạo đặt vé:", err);
      onAlert("Không thể hoàn tất đặt vé. Vui lòng thử lại.");
      return null;
    }
  }, [onAlert]);

  const cancelBooking = useCallback(() => setActiveBooking(null), []);

  // ── Accounts setter ───────────────────────────────────────────────────────
  const setAccounts: React.Dispatch<React.SetStateAction<UserProfile[]>> = (updater) => {
    _setAccounts(prev => {
      const next = typeof updater === "function" ? (updater as (p: UserProfile[]) => UserProfile[])(prev) : updater;
      // Chỉ gọi updateProfile khi prev không rỗng (tránh gọi khi load data lần đầu)
      // VÀ account thực sự thay đổi so với trước
      if (prev.length > 0) {
        const updated = next.filter(n => prev.some(p =>
          p.email.toLowerCase() === n.email.toLowerCase() &&
          JSON.stringify(p) !== JSON.stringify(n)
        ));
        if (updated.length > 0) {
          (async () => {
            for (const a of updated) {
              try { await accountApi.updateProfile(a.email, a); }
              catch { onAlert("Không thể cập nhật tài khoản."); }
            }
          })();
        }
      }
      return next;
    });
  };

  return (
    <BookingContext.Provider value={{
      bookings, setBookings, refreshBookingsFromServer, loadUserBookings,
      activeBooking, setActiveBooking, startBooking, proceedToPayment, completePayment, cancelBooking,
      accounts, setAccounts,
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside <BookingProvider>");
  return ctx;
}

// ─── localStorage persistence + auto cleanup expired tickets ──────────────────

export function useBookingPersistence() {
  const { bookings, setBookings, accounts } = useBooking();

  // Sync bookings và accounts vào localStorage
  useEffect(() => { localStorage.setItem("tcd_bookings", JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem("tcd_accounts", JSON.stringify(accounts)); }, [accounts]);

  // Không tự động xóa vé — lịch sử đặt vé phải được lưu vĩnh viễn
  // để khách hàng và admin có thể tra cứu bất cứ lúc nào.
}
