/**
 * contexts/MovieContext.tsx
 *
 * Quản lý dữ liệu catalogue: phim, rạp, suất chiếu, khuyến mãi, tin tức.
 * Tải từ backend C++ khi app khởi động; fallback về seedData nếu offline.
 *
 * Tách riêng khỏi AuthContext và BookingContext để:
 *   - Re-render phim/suất chiếu không ảnh hưởng component auth
 *   - Dễ test từng domain độc lập
 *   - Admin thêm phim → chỉ subscriber MovieContext re-render
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Movie, Cinema, Showtime } from "../types/movie";
import type { Promotion, News } from "../types/content";
import type { ComboItem } from "../types/booking";
import {
  movieApi, cinemaApi, showtimeApi,
  promotionApi, newsApi, comboApi,
} from "../services/api";
import {
  allMovies as initialAllMovies,
  cinemas as initialCinemas,
  showtimes as initialShowtimes,
  promotions as initialPromotions,
  news as initialNews,
} from "../data/seedData";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MovieContextValue {
  // Catalogue data
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
  playingMovies: Movie[];
  upcomingMovies: Movie[];
  cinemas: Cinema[];
  showtimes: Showtime[];
  setShowtimes: React.Dispatch<React.SetStateAction<Showtime[]>>;
  // Content
  promotionsList: Promotion[];
  setPromotionsList: React.Dispatch<React.SetStateAction<Promotion[]>>;
  newsList: News[];
  setNewsList: React.Dispatch<React.SetStateAction<News[]>>;
  comboDeals: ComboItem[];
  setComboDeals: React.Dispatch<React.SetStateAction<ComboItem[]>>;
  // Meta
  isLoading: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw || raw === "null") return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch { return fallback; }
}

function toBackendDateTime(displayDate: string, time: string): string {
  const parts = displayDate.split("/");
  if (parts.length !== 3) return `${displayDate} ${time}:00`;
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm}-${dd} ${time}:00`;
}

const DEFAULT_COMBOS: ComboItem[] = [
  { id: "cb-solo", name: "Combo Solo Sweet", description: "1 Bắp ngọt lớn + 1 Nước ngọt lớn", price: 65000 },
  { id: "cb-couple", name: "Combo Couple Love", description: "1 Bắp lớn + 2 Nước ngọt lớn 32oz", price: 109000 },
  { id: "cb-gold", name: "Combo Golden Ribbon VIP", description: "Siêu bắp Caramel + 2 Ly sứ + 2 Nước cao cấp", price: 159000 },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const MovieContext = createContext<MovieContextValue | null>(null);

export function MovieProvider({
  children,
  onAlert,
}: {
  children: React.ReactNode;
  onAlert: (msg: string) => void;
}) {
  const [movies, _setMovies] = useState<Movie[]>(() => readLS("tcd_movies", initialAllMovies));
  const [cinemas, setCinemasState] = useState<Cinema[]>(initialCinemas);
  const [showtimes, _setShowtimes] = useState<Showtime[]>(() => readLS("tcd_showtimes", initialShowtimes));
  const [promotionsList, _setPromotionsList] = useState<Promotion[]>(() => readLS("tcd_promotions", initialPromotions));
  const [newsList, _setNewsList] = useState<News[]>(() => readLS("tcd_news", initialNews));
  const [comboDeals, _setComboDeals] = useState<ComboItem[]>(() => readLS("tcd_combos", DEFAULT_COMBOS));
  const [isLoading, setIsLoading] = useState(true);

  // ── Computed ───────────────────────────────────────────────────────────────
  const playingMovies = movies.filter(m => !m.isUpcoming);
  const upcomingMovies = movies.filter(m => m.isUpcoming);

  // ── API-synced setters (optimistic update + C++ backend sync) ──────────────

  const setMovies: React.Dispatch<React.SetStateAction<Movie[]>> = (updater) => {
    _setMovies(prev => {
      const next = typeof updater === "function" ? (updater as (p: Movie[]) => Movie[])(prev) : updater;
      const added = next.filter(n => !prev.some(p => p.id === n.id));
      const deleted = prev.filter(p => !next.some(n => n.id === p.id));
      const updated = next.filter(n => prev.some(p => p.id === n.id && JSON.stringify(p) !== JSON.stringify(n)));
      (async () => {
        for (const m of added) {
          try { const { id, ...rest } = m; const created = await movieApi.create(rest); _setMovies(c => c.map(x => x.id === m.id ? created : x)); }
          catch { onAlert("Không thể thêm phim lên server."); }
        }
        for (const m of updated) {
          try { const { id, ...rest } = m; await movieApi.update(id, rest); }
          catch { onAlert("Không thể cập nhật phim."); }
        }
        for (const m of deleted) {
          try { await movieApi.remove(m.id); }
          catch { onAlert("Không thể xóa phim."); }
        }
      })();
      return next;
    });
  };

  // setShowtimes chỉ cập nhật state local.
  // Admin.tsx tự gọi API trực tiếp (showtimeApi.create/remove) trước khi gọi setShowtimes,
  // nên không cần auto-sync ở đây để tránh gọi API 2 lần gây lỗi 500.
  const setShowtimes: React.Dispatch<React.SetStateAction<Showtime[]>> = (updater) => {
    _setShowtimes(prev => {
      const next = typeof updater === "function" ? (updater as (p: Showtime[]) => Showtime[])(prev) : updater;
      const deleted = prev.filter(p => !next.some(n => n.id === p.id));
      (async () => {
        for (const s of deleted) {
          try { await showtimeApi.remove(s.id); }
          catch (err) { console.warn("Không thể xóa suất chiếu khỏi server:", err); }
          // Không hiện popup lỗi — Admin.tsx đã tự xử lý toast
        }
      })();
      return next;
    });
  };

  const setPromotionsList: React.Dispatch<React.SetStateAction<Promotion[]>> = (updater) => {
    _setPromotionsList(prev => {
      const next = typeof updater === "function" ? (updater as (p: Promotion[]) => Promotion[])(prev) : updater;
      const added = next.filter(n => !prev.some(p => p.id === n.id));
      const deleted = prev.filter(p => !next.some(n => n.id === p.id));
      (async () => {
        for (const p of added) {
          try { const { id, ...rest } = p; const created = await promotionApi.create(rest); _setPromotionsList(c => c.map(x => x.id === p.id ? created : x)); }
          catch { onAlert("Không thể thêm khuyến mãi."); }
        }
        for (const p of deleted) {
          try { await promotionApi.remove(p.id); }
          catch { onAlert("Không thể xóa khuyến mãi."); }
        }
      })();
      return next;
    });
  };

  const setNewsList: React.Dispatch<React.SetStateAction<News[]>> = (updater) => {
    _setNewsList(prev => {
      const next = typeof updater === "function" ? (updater as (p: News[]) => News[])(prev) : updater;
      const added = next.filter(n => !prev.some(p => p.id === n.id));
      const deleted = prev.filter(p => !next.some(n => n.id === p.id));
      (async () => {
        for (const n of added) {
          try { const { id, views, ...rest } = n; const created = await newsApi.create(rest); _setNewsList(c => c.map(x => x.id === n.id ? created : x)); }
          catch { onAlert("Không thể thêm tin tức."); }
        }
        for (const n of deleted) {
          try { await newsApi.remove(n.id); }
          catch { onAlert("Không thể xóa tin tức."); }
        }
      })();
      return next;
    });
  };

  const setComboDeals: React.Dispatch<React.SetStateAction<ComboItem[]>> = (updater) => {
    _setComboDeals(prev => {
      const next = typeof updater === "function" ? (updater as (p: ComboItem[]) => ComboItem[])(prev) : updater;
      const added = next.filter(n => !prev.some(p => p.id === n.id));
      const deleted = prev.filter(p => !next.some(n => n.id === p.id));
      (async () => {
        for (const c of added) {
          try { const { id, ...rest } = c; const created = await comboApi.create(rest); _setComboDeals(curr => curr.map(x => x.id === c.id ? created : x)); }
          catch { onAlert("Không thể thêm combo."); }
        }
        for (const c of deleted) {
          try { await comboApi.remove(c.id); }
          catch { onAlert("Không thể xóa combo."); }
        }
      })();
      return next;
    });
  };

  // ── Initial load from C++ backend ─────────────────────────────────────────
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const [moviesRes, cinemasRes, showtimesRes, promotionsRes, newsRes, combosRes] =
        await Promise.allSettled([
          movieApi.getAll(), cinemaApi.getAll(), showtimeApi.getAll(),
          promotionApi.getAll(), newsApi.getAll(), comboApi.getAll(),
        ]);
      if (moviesRes.status === "fulfilled" && moviesRes.value.length > 0) _setMovies(moviesRes.value);
      if (cinemasRes.status === "fulfilled" && cinemasRes.value.length > 0) setCinemasState(cinemasRes.value);
      if (showtimesRes.status === "fulfilled" && showtimesRes.value.length > 0) _setShowtimes(showtimesRes.value);
      if (promotionsRes.status === "fulfilled" && promotionsRes.value.length > 0) _setPromotionsList(promotionsRes.value);
      if (newsRes.status === "fulfilled" && newsRes.value.length > 0) _setNewsList(newsRes.value);
      if (combosRes.status === "fulfilled" && combosRes.value.length > 0) _setComboDeals(combosRes.value);

      // Hiện cảnh báo nếu có API nào bị lỗi (backend tắt)
      const failed = [
        moviesRes.status === "rejected" ? "phim" : null,
        cinemasRes.status === "rejected" ? "cụm rạp" : null,
        showtimesRes.status === "rejected" ? "suất chiếu" : null,
        promotionsRes.status === "rejected" ? "khuyến mãi" : null,
        newsRes.status === "rejected" ? "tin tức" : null,
        combosRes.status === "rejected" ? "combo" : null,
      ].filter(Boolean);
      if (failed.length > 0) {
        onAlert(
          `Không thể kết nối tới server (lỗi tải: ${failed.join(", ")}). ` +
          `Dữ liệu đang hiển thị là dữ liệu đã lưu từ lần tải gần nhất, có thể không còn mới nhất.`
        );
      }
      setIsLoading(false);
    })();
  }, []);

  return (
    <MovieContext.Provider value={{
      movies, setMovies, playingMovies, upcomingMovies,
      cinemas, showtimes, setShowtimes,
      promotionsList, setPromotionsList,
      newsList, setNewsList,
      comboDeals, setComboDeals,
      isLoading,
    }}>
      {children}
    </MovieContext.Provider>
  );
}

export function useMovies(): MovieContextValue {
  const ctx = useContext(MovieContext);
  if (!ctx) throw new Error("useMovies must be used inside <MovieProvider>");
  return ctx;
}

// ─── localStorage persistence (thay thế useEffect trong App.tsx gốc) ──────────

export function useMoviePersistence() {
  // Hook này được gọi 1 lần trong main.tsx để sync state vào localStorage
  // khi bất kỳ giá trị nào thay đổi.
  const { movies, showtimes, promotionsList, newsList, comboDeals } = useMovies();

  useEffect(() => { localStorage.setItem("tcd_movies", JSON.stringify(movies)); }, [movies]);
  useEffect(() => { localStorage.setItem("tcd_showtimes", JSON.stringify(showtimes)); }, [showtimes]);
  useEffect(() => { localStorage.setItem("tcd_promotions", JSON.stringify(promotionsList)); }, [promotionsList]);
  useEffect(() => { localStorage.setItem("tcd_news", JSON.stringify(newsList)); }, [newsList]);
  useEffect(() => { localStorage.setItem("tcd_combos", JSON.stringify(comboDeals)); }, [comboDeals]);
}
