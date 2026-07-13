/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Film, 
  Play, 
  Server, 
  Coins, 
  Database, 
  Trash2, 
  Plus, 
  Users, 
  Ticket, 
  Tag, 
  Newspaper, 
  Search, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  RefreshCcw, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  Check, 
  ShieldAlert 
} from "lucide-react";
import { Movie, Cinema, Showtime, Booking, Promotion, News, ComboItem, UserProfile } from "../types";
import { getYouTubeId, removeDiacritics } from "../utils/helpers";
import { useAdminBookingEvents } from "../services/useWebSocket";
import { accountApi, showtimeApi } from "../services/api";

interface AdminPanelProps {
  movies: Movie[];
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
  showtimes: Showtime[];
  setShowtimes: React.Dispatch<React.SetStateAction<Showtime[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  onRefreshBookings?: () => void | Promise<void>;
  promotionsList: Promotion[];
  setPromotionsList: React.Dispatch<React.SetStateAction<Promotion[]>>;
  newsList: News[];
  setNewsList: React.Dispatch<React.SetStateAction<News[]>>;
  cinemas: Cinema[];
  onRestoreDefaults?: () => void;
  comboDeals?: ComboItem[];
  setComboDeals?: React.Dispatch<React.SetStateAction<ComboItem[]>>;
  accounts?: UserProfile[];
  setAccounts?: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

export default function AdminPanel({
  movies,
  setMovies,
  showtimes,
  setShowtimes,
  bookings,
  setBookings,
  onRefreshBookings,
  promotionsList,
  setPromotionsList,
  newsList,
  setNewsList,
  cinemas,
  onRestoreDefaults,
  comboDeals = [],
  setComboDeals,
  accounts = [],
  setAccounts,
}: AdminPanelProps) {
  const [adminTab, setAdminTab] = useState<"movies" | "showtimes" | "bookings" | "promotions" | "news" | "overview" | "accounts">("overview");
  const [adminToast, setAdminToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Tải danh sách tài khoản từ C++ backend ngay khi Admin panel mở.
  // Không tải ở App.tsx vì GET /api/accounts yêu cầu role admin.
  React.useEffect(() => {
    if (!setAccounts) return;
    accountApi.getAll()
      .then(data => { if (data.length > 0) setAccounts(data); })
      .catch(err => console.warn("Không tải được /api/accounts:", err));
  }, []);

  // Real-time: nghe sự kiện từ backend C++ qua WebSocket khi có đơn đặt vé mới
  // hoặc trạng thái vé thay đổi (check-in/nhận combo), để Dashboard/Danh sách vé
  // tự cập nhật ngay mà không cần Admin bấm F5.
  useAdminBookingEvents(async (evt) => {
    if (evt.type === "new_booking") {
      // BookingController gửi full booking trong evt.booking; main.cpp gửi trực tiếp evt.movieTitle
      const title = evt.movieTitle || evt.booking?.movieTitle || "";
      const amount = evt.totalAmount ?? evt.booking?.totalAmount ?? 0;
      setAdminToast({
        message: `🎟️ Đơn vé mới: ${title} - ${Number(amount).toLocaleString("vi-VN")}đ`,
        type: "success",
      });
    }
    // Cả 2 loại sự kiện đều cần tải lại danh sách vé mới nhất từ server.
    // Dùng onRefreshBookings (ghi thẳng state, không phát sinh PUT ngược lên
    // server) thay vì setBookings thường để tránh vòng lặp request vô nghĩa.
    if (onRefreshBookings) {
      try {
        await onRefreshBookings();
      } catch (err) {
        console.warn("Không thể tải lại danh sách vé sau sự kiện real-time:", err);
      }
    }
  });

  // New staff registration form states
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [searchAccountQuery, setSearchAccountQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<"all" | "customer" | "employee" | "admin">("all");

  // New combo form states
  const [newCombo, setNewCombo] = useState({
    name: "",
    description: "",
    price: 50000,
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300"
  });

  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [editCombo, setEditCombo] = useState({
    name: "",
    description: "",
    price: 50000,
    imageUrl: ""
  });

  const [searchComboQuery, setSearchComboQuery] = useState("");

  // Auto-clear admin toast alerts
  // Tải toàn bộ danh sách vé từ server ngay khi Admin panel mở.
  // bookingApi.getAll() gọi GET /api/bookings với header admin → trả tất cả vé.
  React.useEffect(() => {
    if (onRefreshBookings) {
      onRefreshBookings();
    }
  }, []);

  React.useEffect(() => {
    if (adminToast) {
      const timer = setTimeout(() => {
        setAdminToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [adminToast]);

  // Filter & Search states for highly scientific management
  const [searchMovieQuery, setSearchMovieQuery] = useState("");
  const [filterMovieGenre, setFilterMovieGenre] = useState("Tất Cả");
  const [searchShowtimeQuery, setSearchShowtimeQuery] = useState("");
  const [searchBookingQuery, setSearchBookingQuery] = useState("");
  const [searchPromoQuery, setSearchPromoQuery] = useState("");
  const [searchNewsQuery, setSearchNewsQuery] = useState("");

  // Showtime creation modes: "single" or "bulk" (automatic multi-day auto-spaced schedule)
  const [showtimeMode, setShowtimeMode] = useState<"single" | "bulk">("single");

  // New showtime form states
  const [newShowtime, setNewShowtime] = useState({
    movieId: "",
    cinemaId: "",
    date: "", // yyyy-mm-dd
    time: "", // hh:mm
    room: "Phòng 1",
    format: "2D Phụ đề" as "2D Phụ đề" | "3D Phụ đề" | "IMAX 3D" | "2D lồng tiếng",
    priceStandard: 85000,
    priceVIP: 110000,
    priceDouble: 240000
  });

  // Bulk / Auto showtime form states based on movie duration + cleaning time buffer
  const [bulkShowtime, setBulkShowtime] = useState({
    movieId: "",
    cinemaId: "",
    startDate: "", // yyyy-mm-dd
    numberOfDays: 3, // consecutive days
    room: "Phòng 1",
    format: "2D Phụ đề" as "2D Phụ đề" | "3D Phụ đề" | "IMAX 3D" | "2D lồng tiếng",
    firstStartTime: "08:00", // first screening start HH:MM
    lastEndTime: "23:00", // midnight or latest screening start time limit HH:MM
    cleanupTime: 30, // 30 mins cleaning buffer by default
    priceStandard: 85000,
    priceVIP: 110000,
    priceDouble: 240000
  });

  // New movie form states
  const [newMovie, setNewMovie] = useState({
    title: "",
    originalTitle: "",
    genre: "",
    duration: 120,
    rating: "T13" as "P" | "K" | "T13" | "T16" | "T18",
    score: 9.0,
    votes: 1200,
    releaseDate: "12/06/2026",
    isUpcoming: false,
    posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
    bannerUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
    trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
    description: "",
    director: "Đạo Diễn Việt Nam",
    cast: "Diễn Viên 1, Diễn Viên 2",
    language: "Tiếng Việt",
  });

  // New promotion state
  const [newPromo, setNewPromo] = useState({
    title: "",
    description: "",
    code: "",
    discountPercent: 15,
    validity: "Đến hết 31/12/2026",
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=400"
  });

  // New News state
  const [newNews, setNewNews] = useState({
    title: "",
    summary: "",
    content: "",
    category: "Điện Ảnh" as "Điện Ảnh" | "Khuyến Mãi" | "Sự Kiện" | "Hậu Trường",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600"
  });

  // Calculate stats
  const totalSales = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTicketsSold = bookings.reduce((sum, b) => sum + b.seats.length, 0);
  const currentMonthSales = bookings
    .filter(b => b.showDate.includes("/06/"))
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const handleDeleteMovie = (id: string) => {
    if (window.confirm("Bạn có chắc muốn xóa bộ phim này khỏi danh sách?")) {
      setMovies(movies.filter((m) => m.id !== id));
    }
  };

  const handleAddMovie = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMovie.title.trim()) {
      setAdminToast({ message: "Vui lòng nhập tên phim!", type: "error" });
      return;
    }

    const added: Movie = {
      id: `m-${Date.now()}`,
      title: newMovie.title,
      originalTitle: newMovie.originalTitle,
      genre: newMovie.genre ? newMovie.genre.split(",").map((s) => s.trim()) : ["Chưa phân loại"],
      duration: Number(newMovie.duration) || 120,
      rating: newMovie.rating,
      score: Number(newMovie.score) || 9.0,
      votes: Number(newMovie.votes) || 100,
      releaseDate: newMovie.releaseDate || "12/06/2026",
      isUpcoming: newMovie.isUpcoming,
      posterUrl: newMovie.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
      bannerUrl: newMovie.bannerUrl || "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
      trailerUrl: newMovie.trailerUrl || "https://www.youtube.com/embed/Idh8n5XuYIA",
      description: newMovie.description.trim() || "Mô tả nội dung rạp chiếu bóng.",
      director: newMovie.director || "Đạo Diễn",
      cast: newMovie.cast ? newMovie.cast.split(",").map((s) => s.trim()) : ["Diễn Viên"],
      language: newMovie.language || "Tiếng Việt",
    };

    setMovies([added, ...movies]);
    setNewMovie({
      title: "",
      originalTitle: "",
      genre: "",
      duration: 120,
      rating: "T13",
      score: 9.0,
      votes: 1200,
      releaseDate: "12/06/2026",
      isUpcoming: false,
      posterUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=600",
      bannerUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=1200",
      trailerUrl: "https://www.youtube.com/embed/Idh8n5XuYIA",
      description: "",
      director: "Đạo Diễn Việt Nam",
      cast: "Diễn Viên 1, Diễn Viên 2",
      language: "Tiếng Việt",
    });
    setAdminToast({ message: "Thêm bộ phim mới thành công vào hệ thống dữ liệu!", type: "success" });
  };

  const handleAddPromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.title.trim() || !newPromo.code.trim()) {
      setAdminToast({ message: "Vui lòng nhập đầy đủ tiêu đề và mã khuyến mãi!", type: "error" });
      return;
    }

    const added: Promotion = {
      id: `p-${Date.now()}`,
      title: newPromo.title.trim(),
      description: newPromo.description.trim(),
      code: newPromo.code.toUpperCase().trim(),
      discountPercent: Number(newPromo.discountPercent) || 10,
      validity: newPromo.validity || "Đến hết năm",
      imageUrl: newPromo.imageUrl || "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=400"
    };

    setPromotionsList([added, ...promotionsList]);
    setNewPromo({
      title: "",
      description: "",
      code: "",
      discountPercent: 15,
      validity: "Đến hết 31/12/2026",
      imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=400"
    });
    setAdminToast({ message: "Khởi tạo ưu đãi coupon thành công!", type: "success" });
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title.trim() || !newNews.summary.trim()) {
      setAdminToast({ message: "Vui lòng nhập đầy đủ tiêu đề và tóm tắt bài viết!", type: "error" });
      return;
    }

    const added: News = {
      id: `n-${Date.now()}`,
      title: newNews.title.trim(),
      summary: newNews.summary.trim(),
      content: newNews.content.trim() || newNews.summary.trim(),
      date: "11/06/2026",
      category: newNews.category,
      imageUrl: newNews.imageUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600",
      views: 0
    };

    setNewsList([added, ...newsList]);
    setNewNews({
      title: "",
      summary: "",
      content: "",
      category: "Điện Ảnh",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=600"
    });
    setAdminToast({ message: "Xuất bản tin tức giải trí thành công!", type: "success" });
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Safe search utility ignoring diacritics
  const matchesSearch = (text: string, query: string) => {
    if (!query.trim()) return true;
    const cleanText = removeDiacritics(text.toLowerCase());
    const cleanQuery = removeDiacritics(query.toLowerCase());
    return cleanText.includes(cleanQuery);
  };

  // Filtered lists for simple, responsive search in tables
  const filteredMovies = movies.filter((m) => {
    const isGenreMatch = filterMovieGenre === "Tất Cả" || m.genre.includes(filterMovieGenre);
    const isQueryMatch = matchesSearch(m.title, searchMovieQuery) || 
                         matchesSearch(m.originalTitle || "", searchMovieQuery) ||
                         matchesSearch(m.director, searchMovieQuery) ||
                         m.genre.some((g) => matchesSearch(g, searchMovieQuery));
    return isGenreMatch && isQueryMatch;
  });

  const filteredShowtimes = showtimes.filter((st) => {
    const corMovie = movies.find((m) => m.id === st.movieId);
    const corCinema = cinemas.find((c) => c.id === st.cinemaId);
    const movieText = corMovie ? corMovie.title : "";
    const cinemaText = corCinema ? corCinema.name : "";
    return matchesSearch(movieText, searchShowtimeQuery) || 
           matchesSearch(cinemaText, searchShowtimeQuery) || 
           matchesSearch(st.date, searchShowtimeQuery) ||
           matchesSearch(st.time, searchShowtimeQuery) ||
           matchesSearch(st.format, searchShowtimeQuery);
  }).sort((a, b) => {
    // Sắp xếp mới nhất lên đầu: so sánh date (dd/mm/yyyy) + time
    const toMs = (date: string, time: string) => {
      const [d, m, y] = date.split("/");
      return new Date(`${y}-${m}-${d}T${time}`).getTime();
    };
    return toMs(b.date, b.time) - toMs(a.date, a.time);
  });

  const filteredBookings = bookings.filter((bk) => {
    return matchesSearch(bk.code, searchBookingQuery) || 
           matchesSearch(bk.movieTitle, searchBookingQuery) || 
           matchesSearch(bk.cinemaName, searchBookingQuery) || 
           matchesSearch(bk.showDate, searchBookingQuery);
  });

  const filteredPromos = promotionsList.filter((pr) => {
    return matchesSearch(pr.title, searchPromoQuery) || 
           matchesSearch(pr.code, searchPromoQuery) || 
           matchesSearch(pr.description, searchPromoQuery);
  });

  const filteredNews = newsList.filter((nw) => {
    return matchesSearch(nw.title, searchNewsQuery) || 
           matchesSearch(nw.summary, searchNewsQuery) || 
           matchesSearch(nw.category, searchNewsQuery);
  });

  // Extract genre variants for filter dropdown
  const allGenresList = Array.from(new Set(movies.flatMap(m => m.genre)));

  return (
    <div className="bg-[#0e0d0d] min-h-screen py-8 text-slate-100 font-sans text-left animate-fadeIn">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Scientific Header row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between p-6 bg-gradient-to-r from-[#1E1B1B] to-[#121111]/95 border border-white/5 rounded-2xl mb-8 gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#C8102E]/20 rounded-2xl border border-[#C8102E]/30 text-[#C8102E] shadow-lg shadow-red-950/20">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-[#C8102E] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest leading-none">
                  Hạ Tầng X Cinema Core
                </span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1"></span>
                  Bản mẫu đồng bộ 2026
                </span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                BẢNG ĐIỀU HÀNH VIP QUẢN TRỊ VIÊN
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {onRestoreDefaults && (
              <button
                onClick={() => {
                  if (window.confirm("Khôi phục toàn bộ danh sách tài nguyên rạp, bài viết và đơn hàng mẫu về cấu hình chuẩn ban đầu? Mọi đơn hàng mới tạo sẽ bị đặt lại.")) {
                    onRestoreDefaults();
                    setAdminToast({ message: "Đặt lại cơ sở dữ liệu mẫu thành công!", type: "success" });
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition shadow-md"
              >
                <RefreshCcw className="w-3.5 h-3.5 text-zinc-400 animate-spin-hover" />
                <span>Hoàn Nguyên Dữ Liệu Gốc</span>
              </button>
            )}
            <div className="text-zinc-500 text-xs text-right hidden lg:block">
              <p className="font-mono">IP máy khách: localhost:3000</p>
              <p className="font-mono">Bộ nhớ Cache: Hoạt động (Durable Local)</p>
            </div>
          </div>
        </div>

        {/* Outer Split Screen Grid Layout: Sticky Navigation on Left, Active Tab Content on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Sticky Sidebar Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-4">
            <div className="flex flex-col bg-[#151414] p-2.5 rounded-2xl border border-white/5 gap-1.5 shadow-xl">
              <span className="block text-zinc-505 text-[10px] uppercase font-black tracking-widest px-3 py-1 mb-1 border-b border-white/5 text-zinc-500">
                Menu quản lý hệ thống
              </span>
              
              <button
                onClick={() => setAdminTab("overview")}
                className={`flex items-center space-x-3 py-3.5 px-4 rounded-xl text-xs font-bold tracking-wide uppercase transition duration-300 w-full text-left cursor-pointer ${
                  adminTab === "overview"
                    ? "bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles className="w-5 h-5 shrink-0" />
                <span>Tổng quan quản trị</span>
              </button>
              
              {[
                { id: "movies", label: "Kho Phim", icon: Film, count: movies.length },
                { id: "showtimes", label: "Lịch Trình Suất", icon: Server, count: showtimes.length },
                { id: "bookings", label: "Sổ Hoá Đơn Vé", icon: Ticket, count: bookings.length },
                { id: "promotions", label: "Voucher Ưu Đãi", icon: Tag, count: promotionsList.length },
                { id: "news", label: "Bài Tin Tức", icon: Newspaper, count: newsList.length },
                { id: "accounts", label: "Cán Bộ Nhân Viên 🧑‍💼", icon: Users, count: accounts.length },
              ].map((item) => {
                const Icon = item.icon;
                const isTabActive = adminTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setAdminTab(item.id as any)}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl text-xs font-bold tracking-wide uppercase transition duration-300 w-full text-left cursor-pointer ${
                      isTabActive
                        ? "bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/20"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-black min-w-[22px] text-center ${
                      isTabActive 
                        ? "bg-white text-[#C8102E]"
                        : "bg-white/10 text-zinc-400"
                    }`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel: Active Tab Content */}
          <div className="lg:col-span-9 space-y-8">

            {/* TAB 0: OVERVIEW INFO GRAPHICS */}
            {adminTab === "overview" && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* 3 Analytics Cards specifically integrated inside Overview tab */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-br from-[#1A1818] to-[#121111] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-[#C8102E]/20 transition-all duration-300">
                    <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition text-[#C8102E]">
                      <Film className="w-12 h-12" />
                    </div>
                    <span className="text-[10px] text-zinc-400 block font-black uppercase tracking-wider">Tổng sản lượng kho</span>
                    <span className="text-2xl font-black text-white block mt-1 tracking-tight">{movies.length} <span className="text-xs text-zinc-500 font-medium">bản phim v1.4</span></span>
                    <div className="mt-2.5 flex items-center text-[10px] text-zinc-500">
                      <span className="text-amber-500 font-extrabold mr-1">
                        {movies.filter(m => m.isUpcoming).length} phim sắp chiếu 
                      </span>
                      • {movies.filter(m => !m.isUpcoming).length} đang rạp
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-[#1A1818] to-[#121111] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                    <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition text-emerald-400">
                      <Coins className="w-12 h-12" />
                    </div>
                    <span className="text-[10px] text-zinc-400 block font-black uppercase tracking-wider">Doanh thu thu ngân</span>
                    <span className="text-2xl font-black text-emerald-400 block mt-1 tracking-tight font-mono">
                      {formatVND(totalSales)}
                    </span>
                    <div className="mt-2.5 flex items-center text-[10px] text-emerald-500/80 font-bold">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      <span>Tháng 6: {formatVND(currentMonthSales)}</span>
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-br from-[#1A1818] to-[#121111] border border-white/5 rounded-2xl relative overflow-hidden group hover:border-amber-400/20 transition-all duration-300">
                    <div className="absolute right-3 top-3 opacity-10 group-hover:opacity-20 transition text-amber-500">
                      <Ticket className="w-12 h-12" />
                    </div>
                    <span className="text-[10px] text-zinc-400 block font-black uppercase tracking-wider">Lượt in vé thành công</span>
                    <span className="text-2xl font-black text-amber-500 block mt-1 tracking-tight">{totalTicketsSold} <span className="text-xs text-zinc-300/60 font-medium">lượt vé</span></span>
                    <div className="mt-2.5 flex items-center text-[10px] text-zinc-500">
                      <span className="text-[#C8102E] font-bold mr-1">{bookings.length}</span> hóa đơn thanh toán thành công
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  <div className="lg:col-span-2 p-6 bg-[#161515] border border-white/5 rounded-2xl space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                    <Database className="w-4 h-4 mr-2 text-[#C8102E]" />
                    Chỉ thị thao tác & Khám sức khoẻ hệ thống
                  </h3>
                  <span className="text-[10px] px-2.5 py-0.5 rounded bg-green-500/10 text-green-400 font-mono font-bold">Trực Tuyến</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
                    <span className="text-zinc-500 font-bold uppercase text-[9px] block">Mác Giới Hạn Tuổi Phim</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Đảm bảo các phim kịch bản người lớn được phân loại chính xác (<strong className="text-red-500">T18</strong> / <strong className="text-orange-400">T16</strong>) để tránh các án phạt hành chính rạp chiếu bóng từ ban văn hóa Việt Nam.
                    </p>
                  </div>
                  <div className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-2">
                    <span className="text-zinc-500 font-bold uppercase text-[9px] block">Bộ điều chỉnh Suất Chiếu</span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      Lịch chiếu được cập nhật tự động theo mốc thời gian khách hàng chọn. Khi có khách mua vé, hệ thống ghế tự động khoá dính và đảm bảo không trùng lặp ghế.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-4.5 flex items-start space-x-3.5">
                  <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-amber-500 uppercase tracking-wide">Yêu Cầu Từ Nhà Điều Hành</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Bạn có quyền chỉnh sửa, thêm bới và xoá phim hoàn toàn. Lưu ý rằng hành động xóa phim sẽ lọc sạch suất chiếu tương ứng trên trang khách hàng, đảm bảo trải nghiệm người xem đồng nhất và không rác dữ liệu.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#161515] border border-white/5 rounded-2xl relative overflow-hidden">
                <h3 className="text-sm font-black text-white uppercase tracking-wider pb-4 border-b border-white/5 mb-5 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#C8102E]" />
                  Doanh Thu Trực Tuyến
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Vé Standard đã bán</span>
                    <span className="font-mono text-white font-bold">
                      {bookings.reduce((acc, b) => acc + b.seats.filter(s => !s.startsWith("E") && !s.startsWith("F") && !s.startsWith("G") && !s.startsWith("H")).length, 0)} vé
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Vé VIP & Couple đã bán</span>
                    <span className="font-mono text-zinc-100 font-bold">
                      {bookings.reduce((acc, b) => acc + b.seats.filter(s => s.startsWith("E") || s.startsWith("F") || s.startsWith("G") || s.startsWith("H")).length, 0)} vé
                    </span>
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Doanh số thực nhận</span>
                      <strong className="text-2xl font-black text-emerald-400 font-mono tracking-tight">{formatVND(totalSales)}</strong>
                    </div>
                    <span className="text-[10px] text-green-400 font-bold bg-green-950/30 px-2 py-0.5 rounded border border-green-800/20">
                      Đã thanh toán 100%
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-white/5 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Trực quan biểu đồ tổng quát</span>
                  <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden flex">
                    <div className="bg-[#C8102E] h-full" style={{ width: `${Math.min(100, (movies.length / 20) * 100)}%` }} title="Tỷ lệ lấp đầy phim"></div>
                    <div className="bg-emerald-500 h-full" style={{ width: `${Math.min(100, (bookings.length / 10) * 100)}%` }} title="Tỷ lệ đơn thanh toán"></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                    <span>Lấp đầy phim ({movies.length}/20)</span>
                    <span>Hóa đơn ({bookings.length}/10)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick list of top 3 pending operations */}
            <div className="p-6 bg-[#161515] border border-white/5 rounded-2xl">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Các Hoạt Động Doanh Nghiệp Gần Đây</h3>
              {bookings.length > 0 ? (
                <div className="space-y-3">
                  {bookings.slice(-4).reverse().map((bk) => (
                    <div key={bk.id} className="flex justify-between items-center p-3.5 bg-[#121111] rounded-xl border border-white/5 hover:border-zinc-800 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-[#C8102E]">
                          <Ticket className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{bk.movieTitle}</p>
                          <p className="text-[10px] text-zinc-500">Mã hóa đơn: <strong className="text-zinc-400 font-mono">{bk.code}</strong> • {bk.cinemaName}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-green-400 font-mono">{formatVND(bk.totalAmount)}</p>
                        <p className="text-[9px] text-zinc-500 font-mono">Ghế {bk.seats.sort().join(", ")} • {bk.showTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600">Chưa có giao dịch bán vé trực tuyến nào.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: MOVIE LIBRARY */}
        {adminTab === "movies" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Add Movie Box - Upgraded and fully labeled */}
              <div className="lg:col-span-5 p-6 bg-gradient-to-b from-[#191818] to-[#121111] border border-white/5 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center text-[#C8102E]">
                    <PlusCircle className="w-4.5 h-4.5 mr-2 text-[#C8102E]" />
                    ĐĂNG KÝ PHIM MỚI
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1">Ghi dữ liệu phim để mở lịch đặt sảnh chiếu rạp.</p>
                </div>

                <form onSubmit={handleAddMovie} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="movie-title" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                      Tên Phim (Tiếng Việt) *
                    </label>
                    <input
                      type="text"
                      id="movie-title"
                      required
                      value={newMovie.title}
                      onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                      placeholder="Ví dụ: Lật Mặt 7: Một Điều Ước"
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="movie-original" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                      Tên Gốc / Tiếng Anh
                    </label>
                    <input
                      type="text"
                      id="movie-original"
                      value={newMovie.originalTitle}
                      onChange={(e) => setNewMovie({ ...newMovie, originalTitle: e.target.value })}
                      placeholder="Ví dụ: Face Off 7: One Wish"
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="movie-genre" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                        Thể loại (Cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        id="movie-genre"
                        value={newMovie.genre}
                        onChange={(e) => setNewMovie({ ...newMovie, genre: e.target.value })}
                        placeholder="Hành Động, Gia Đình..."
                        className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="movie-duration" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                        Thời Lượng (Phút)
                      </label>
                      <input
                        type="number"
                        id="movie-duration"
                        value={newMovie.duration}
                        onChange={(e) => setNewMovie({ ...newMovie, duration: Number(e.target.value) || 120 })}
                        placeholder="120"
                        className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="movie-rating" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                        Mác Điện Ảnh (Bộ Lọc Tuổi)
                      </label>
                      <select
                        id="movie-rating"
                        value={newMovie.rating}
                        onChange={(e) => setNewMovie({ ...newMovie, rating: e.target.value as any })}
                        className="w-full bg-[#121212] p-3 text-xs text-white rounded-lg border border-white/10 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] outline-none transition font-bold"
                      >
                        <option value="P">P (Mọi lứa tuổi)</option>
                        <option value="K">K (Dưới 13 tuổi có bảo hộ)</option>
                        <option value="T13">T13 (Cấm khán giả dưới 13)</option>
                        <option value="T16">T16 (Cấm khán giả dưới 16)</option>
                        <option value="T18">T18 (Cấm khán giả dưới 18)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="movie-upcoming" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                        Trạng Thái Trình Chiếu
                      </label>
                      <select
                        id="movie-upcoming"
                        value={newMovie.isUpcoming ? "true" : "false"}
                        onChange={(e) => setNewMovie({ ...newMovie, isUpcoming: e.target.value === "true" })}
                        className="w-full bg-[#121212] p-3 text-xs text-white rounded-lg border border-white/10 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] outline-none transition font-bold"
                      >
                        <option value="false">Đang Chiếu (Phim hot)</option>
                        <option value="true">Sắp Chiếu Bản Bản Sớm</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="movie-director" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                        Đạo diễn phụ trách
                      </label>
                      <input
                        type="text"
                        id="movie-director"
                        value={newMovie.director}
                        onChange={(e) => setNewMovie({ ...newMovie, director: e.target.value })}
                        className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="movie-language" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                        Ngôn ngữ / Phụ đề
                      </label>
                      <input
                        type="text"
                        id="movie-language"
                        value={newMovie.language}
                        onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                        className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="movie-trailer" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                      Link YouTube Trailer (Xem được 100%)
                    </label>
                    <input
                      type="text"
                      id="movie-trailer"
                      value={newMovie.trailerUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, trailerUrl: e.target.value })}
                      placeholder="Dán link youtube hoặc mã ID youtube"
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="movie-poster" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                      Đường dẫn ảnh chiều dọc (Poster URL)
                    </label>
                    <input
                      type="text"
                      id="movie-poster"
                      value={newMovie.posterUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition font-mono text-[10px]"
                    />
                  </div>

                  <div>
                    <label htmlFor="movie-banner" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                      Đường dẫn ảnh chiều ngang (Banner URL)
                    </label>
                    <input
                      type="text"
                      id="movie-banner"
                      value={newMovie.bannerUrl}
                      onChange={(e) => setNewMovie({ ...newMovie, bannerUrl: e.target.value })}
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition font-mono text-[10px]"
                    />
                  </div>

                  <div>
                    <label htmlFor="movie-desc" className="block text-zinc-400 text-[10px] uppercase font-black tracking-wider mb-1">
                      Văn mô tả tóm tắt nội dung chính
                    </label>
                    <textarea
                      id="movie-desc"
                      value={newMovie.description}
                      onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                      placeholder="Nhập nội dung tóm tắt phim..."
                      rows={3}
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4.5 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer transition transform active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-red-950/40"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Xác nhận thêm Phim
                  </button>
                </form>
              </div>

              {/* Table list films with searching & genre filtering */}
              <div className="lg:col-span-7 p-6 bg-[#161515] border border-white/5 rounded-2xl shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/5 gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                      <Film className="w-4.5 h-4.5 mr-2 text-[#C8102E]" />
                      THƯ VIỆN ĐIỆN ẢNH ({filteredMovies.length})
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1">Tìm kiếm suất, kiểm duyệt phim đang hệ thống.</p>
                  </div>
                </div>

                {/* Highly Scientific Filters panel inside Table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchMovieQuery}
                      onChange={(e) => setSearchMovieQuery(e.target.value)}
                      placeholder="Tìm tên phim, đạo diễn..."
                      className="w-full bg-[#121212] pl-8.5 pr-8 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    {searchMovieQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchMovieQuery("")}
                        className="absolute right-2 top-2.5 text-zinc-400 hover:text-white text-[10px] font-bold font-mono px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded transition-all"
                        title="Xóa tìm kiếm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <select
                      value={filterMovieGenre}
                      onChange={(e) => setFilterMovieGenre(e.target.value)}
                      className="w-full bg-[#121212] p-2 text-xs text-white rounded-lg border border-zinc-800 outline-none"
                    >
                      <option value="Tất Cả">Mọi Thể Loại</option>
                      {allGenresList.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table itself */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="py-3 px-1">Hình ảnh & ID</th>
                        <th className="py-3 px-1">Tác phẩm</th>
                        <th className="py-3 px-1">Thời lượng & Nhãn</th>
                        <th className="py-3 px-1">Phân loại thể loại</th>
                        <th className="py-3 px-1 text-center font-bold">Thu dọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMovies.map((movie) => (
                        <tr key={movie.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                          <td className="py-3 px-1">
                            <div className="relative">
                              <img
                                src={movie.posterUrl}
                                alt="Poster list layout"
                                className="w-9 h-12 object-cover rounded-md border border-white/5 shadow"
                              />
                              <span className="absolute -bottom-1 -left-1 bg-zinc-900 border border-zinc-800 text-[8px] font-mono px-1 py-0.2 rounded text-zinc-500">
                                {movie.id}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-1 max-w-[200px]">
                            <span className="block font-black text-white text-xs truncate leading-snug">{movie.title}</span>
                            <span className="block text-[10px] text-zinc-500 truncate mt-0.5 italic">{movie.originalTitle || "VN Cinema Bản Quyền"}</span>
                            <span className="block text-[9px] text-[#C8102E] font-medium mt-0.5">YoutTube ID: {getYouTubeId(movie.trailerUrl)}</span>
                          </td>
                          <td className="py-3 px-1">
                            <div className="space-y-1">
                              <span className="block font-mono font-extrabold text-white">{movie.duration} phút</span>
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-black text-white leading-none ${
                                movie.rating === "T18" ? "bg-red-600" :
                                movie.rating === "T16" ? "bg-orange-600" :
                                movie.rating === "T13" ? "bg-yellow-600 text-black" : "bg-emerald-600"
                              }`}>
                                {movie.rating}
                              </span>
                              {movie.isUpcoming && (
                                <span className="ml-1 px-1 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-800/20 rounded text-[7.5px] font-bold uppercase">Sắp Chiếu</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-1 text-zinc-300">
                            <div className="flex flex-wrap gap-1">
                              {movie.genre.map((g) => (
                                <span key={g} className="px-1.5 py-0.5 bg-zinc-900 rounded text-[9px] text-zinc-400 border border-zinc-800">
                                  {g}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-1 text-center">
                            <button
                              onClick={() => handleDeleteMovie(movie.id)}
                              className="p-2 rounded-lg bg-zinc-900 hover:bg-red-800 border border-zinc-800 hover:border-red-700 text-zinc-400 hover:text-white transition shadow-sm cursor-pointer"
                              title="Loại bỏ tác phẩm khỏi hệ thống dữ liệu"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredMovies.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                            Không tìm thấy bộ phim nào tương thích bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: SCHEDULE LISTS */}
        {adminTab === "showtimes" && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Form to create a new showtime */}
              <div className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start h-fit max-h-[calc(100vh-3rem)] overflow-y-auto p-5 bg-[#161515] rounded-2xl border border-white/5 space-y-4 text-left">
                <div>
                  <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                    <PlusCircle className="w-4.5 h-4.5 mr-0.5 text-amber-500" />
                    Quản Lý Suất Chiếu
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1">Cài đặt giờ chiếu thủ công hoặc sử dụng thuật toán thông minh xếp lịch hàng loạt.</p>
                </div>

                {/* Sub-tabs selector for layout modes */}
                <div className="flex bg-[#121212] p-1 rounded-xl text-center border border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowtimeMode("single")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer ${
                      showtimeMode === "single"
                        ? "bg-[#C8102E] text-white shadow"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    Đơn Lẻ (Thủ công)
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowtimeMode("bulk")}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition flex items-center justify-center gap-1 cursor-pointer ${
                      showtimeMode === "bulk"
                        ? "bg-amber-600/90 text-white shadow"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    Tự Động Hàng Loạt
                  </button>
                </div>

                {/* MODE A: SINGLE SHOWTIME CREATION (MANUAL) */}
                {showtimeMode === "single" && (
                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newShowtime.movieId || !newShowtime.cinemaId || !newShowtime.date || !newShowtime.time) {
                        setAdminToast({ message: "Vui lòng chỉ định Phim, Rạp, Ngày lành và Giờ chiếu rõ ràng!", type: "error" });
                        return;
                      }

                      // Build startTime theo định dạng backend yêu cầu: "YYYY-MM-DD HH:mm:ss"
                      const startTime = `${newShowtime.date} ${newShowtime.time}:00`;

                      try {
                        const result = await showtimeApi.create({
                          movieId: newShowtime.movieId,
                          cinemaId: newShowtime.cinemaId,
                          startTime,
                          format: newShowtime.format,
                          room: newShowtime.room || "Phòng 1",
                          priceStandard: Number(newShowtime.priceStandard) || 85000,
                          priceVIP: Number(newShowtime.priceVIP) || 110000,
                          priceDouble: Number(newShowtime.priceDouble) || 240000,
                        });

                        // Convert "YYYY-MM-DD" sang "DD/MM/YYYY" để hiển thị trong UI
                        const parts = newShowtime.date.split("-");
                        const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

                        const generatedItem: Showtime = {
                          id: result.id,
                          movieId: newShowtime.movieId,
                          cinemaId: newShowtime.cinemaId,
                          date: formattedDate,
                          time: newShowtime.time,
                          room: newShowtime.room || "Phòng 1",
                          format: newShowtime.format,
                          priceStandard: Number(newShowtime.priceStandard) || 85000,
                          priceVIP: Number(newShowtime.priceVIP) || 110000,
                          priceDouble: Number(newShowtime.priceDouble) || 240000
                        };

                        setShowtimes((prev) => [generatedItem, ...prev]);
                        setAdminToast({ message: `Đã kích hoạt Suất chiếu mới cho phim!`, type: "success" });

                        // Reset chỉ giờ để tiện thêm suất tiếp theo
                        setNewShowtime(prev => ({ ...prev, time: "" }));
                      } catch (err: any) {
                        setAdminToast({ message: err?.message || "Không thể thêm suất chiếu. Vui lòng kiểm tra lại!", type: "error" });
                      }
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">1. Phim Trình Chiếu</label>
                      <select
                        className="w-full bg-[#121212] px-3 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                        value={newShowtime.movieId}
                        onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })}
                      >
                        <option value="">-- Click chọn Tên Phim --</option>
                        {movies.map(m => (
                          <option key={m.id} value={m.id}>{m.title} ({m.duration} phút)</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">2. Cơ Sở Chi Nhánh Rạp</label>
                      <select
                        className="w-full bg-[#121212] px-3 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                        value={newShowtime.cinemaId}
                        onChange={(e) => setNewShowtime({ ...newShowtime, cinemaId: e.target.value })}
                      >
                        <option value="">-- Chọn chi nhánh cơ sở rạp --</option>
                        {cinemas.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">3. Chọn Ngày</label>
                        <input
                          type="date"
                          className="w-full bg-[#121212] px-3 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none font-mono"
                          value={newShowtime.date}
                          onChange={(e) => setNewShowtime({ ...newShowtime, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">4. Chọn Giờ Chiếu</label>
                        <input
                          type="time"
                          className="w-full bg-[#121212] px-3 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none font-mono"
                          value={newShowtime.time}
                          onChange={(e) => setNewShowtime({ ...newShowtime, time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">Phòng Chiếu</label>
                        <select
                          className="w-full bg-[#121212] px-3 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                          value={newShowtime.room}
                          onChange={(e) => setNewShowtime({ ...newShowtime, room: e.target.value })}
                        >
                          <option value="Phòng 1">Phòng 1</option>
                          <option value="Phòng 2 (VIP)">Phòng 2 (VIP)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">Định Dạng</label>
                        <select
                          className="w-full bg-[#121212] px-3 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                          value={newShowtime.format}
                          onChange={(e) => setNewShowtime({ ...newShowtime, format: e.target.value as any })}
                        >
                          <option value="2D Phụ đề">2D Phụ đề</option>
                          <option value="2D lồng tiếng">2D lồng tiếng</option>
                          <option value="3D Phụ đề">3D Phụ đề</option>
                          <option value="IMAX 3D">IMAX 3D</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-zinc-950/40 rounded-xl border border-white/5 space-y-2">
                      <span className="block text-[9px] text-amber-500 font-black uppercase tracking-wider">Cài Đặt Đơn Giá Vé (VND)</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-0.5">Thường</label>
                          <input
                            type="number"
                            className="w-full bg-[#121212] px-1.5 py-1 text-[11px] text-white font-mono rounded border border-zinc-800 outline-none text-center"
                            value={newShowtime.priceStandard}
                            onChange={(e) => setNewShowtime({ ...newShowtime, priceStandard: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-0.5">VIP</label>
                          <input
                            type="number"
                            className="w-full bg-[#121212] px-1.5 py-1 text-[11px] text-white font-mono rounded border border-zinc-800 outline-none text-center"
                            value={newShowtime.priceVIP}
                            onChange={(e) => setNewShowtime({ ...newShowtime, priceVIP: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-zinc-500 font-bold uppercase mb-0.5">Couple</label>
                          <input
                            type="number"
                            className="w-full bg-[#121212] px-1.5 py-1 text-[11px] text-white font-mono rounded border border-[#3E3E3E] outline-none text-center"
                            value={newShowtime.priceDouble}
                            onChange={(e) => setNewShowtime({ ...newShowtime, priceDouble: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black uppercase text-[10px] tracking-wider shadow-lg hover:shadow-red-900/10 cursor-pointer block text-center"
                    >
                      + Phát hành suất chiếu mới
                    </button>
                  </form>
                )}

                {/* MODE B: AUTOMATIC BULK GENERATION */}
                {showtimeMode === "bulk" && (() => {
                  const targetBulkMovie = movies.find(m => m.id === bulkShowtime.movieId);
                  const mDuration = targetBulkMovie ? targetBulkMovie.duration : 120;
                  const mCleanup = Number(bulkShowtime.cleanupTime) || 30;
                  const totalCycleTime = mDuration + mCleanup;

                  // Real-time calculation of simulated slots
                  let simSlots: string[] = [];
                  if (bulkShowtime.firstStartTime && bulkShowtime.lastEndTime && totalCycleTime >= 45) {
                    try {
                      const [sh, sm] = bulkShowtime.firstStartTime.split(":").map(Number);
                      const [eh, em] = bulkShowtime.lastEndTime.split(":").map(Number);
                      if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) {
                        let currMins = sh * 60 + sm;
                        const limitMins = eh * 60 + em;
                        while (currMins + mDuration <= limitMins) {
                          const hh = String(Math.floor(currMins / 60)).padStart(2, "0");
                          const mm = String(currMins % 60).padStart(2, "0");
                          simSlots.push(`${hh}:${mm}`);
                          currMins += totalCycleTime;
                        }
                      }
                    } catch (err) {}
                  }

                  return (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!bulkShowtime.movieId || !bulkShowtime.cinemaId || !bulkShowtime.startDate) {
                          setAdminToast({ message: "Vui lòng chọn thông tin Phim, Chi nhánh rạp và Ngày bắt đầu!", type: "error" });
                          return;
                        }

                        if (!targetBulkMovie) {
                          setAdminToast({ message: "Phim lựa chọn không khả dụng!", type: "error" });
                          return;
                        }

                        if (simSlots.length === 0) {
                          setAdminToast({ message: "Khoảng thời gian trong ngày quá ngắn, không xếp được suất chiếu nào!", type: "error" });
                          return;
                        }

                        const daysToRepeat = Math.min(14, Math.max(1, Number(bulkShowtime.numberOfDays) || 1));
                        const [yyyy, mmVal, ddVal] = bulkShowtime.startDate.split("-").map(Number);
                        const initialDate = new Date(yyyy, mmVal - 1, ddVal);

                        // Xây danh sách payload để gọi API
                        const apiPayloads: { startTime: string; displayDate: string; slotTime: string }[] = [];
                        for (let dIndex = 0; dIndex < daysToRepeat; dIndex++) {
                          const currentDayObj = new Date(initialDate);
                          currentDayObj.setDate(initialDate.getDate() + dIndex);

                          const dStr = String(currentDayObj.getDate()).padStart(2, "0");
                          const mStr = String(currentDayObj.getMonth() + 1).padStart(2, "0");
                          const yStr = currentDayObj.getFullYear();
                          const isoDate = `${yStr}-${mStr}-${dStr}`;
                          const displayDate = `${dStr}/${mStr}/${yStr}`;

                          simSlots.forEach((slotTime) => {
                            apiPayloads.push({
                              startTime: `${isoDate} ${slotTime}:00`,
                              displayDate,
                              slotTime,
                            });
                          });
                        }

                        setAdminToast({ message: `Đang tạo ${apiPayloads.length} suất chiếu, vui lòng chờ...`, type: "info" });

                        // QUAN TRỌNG: trước đây dùng Promise.allSettled(apiPayloads.map(...))
                        // gửi TOÀN BỘ N request tạo suất chiếu SONG SONG cùng lúc. Backend
                        // C++ (SQL Server qua ODBC) xử lý mỗi request trên 1 luồng riêng,
                        // và khi nhiều luồng cùng INSERT + đọc SCOPE_IDENTITY() đồng thời
                        // trên cùng 1 bảng, xảy ra tranh chấp khiến 1 vài request insert
                        // thất bại hoặc không lấy được ID vừa tạo -> suất chiếu bị tạo
                        // "ma" (tồn tại trong DB nhưng 0 ghế được sinh ra), gây lỗi
                        // "ghế chưa được khởi tạo" cho khách hàng dù admin thấy báo thành
                        // công. Sửa thành gửi TUẦN TỰ (chờ xong request này mới gửi request
                        // tiếp theo) để loại bỏ hoàn toàn tranh chấp đồng thời ở nguồn.
                        const settled: PromiseSettledResult<{ id: string; success: boolean }>[] = [];
                        for (let i = 0; i < apiPayloads.length; i++) {
                          setAdminToast({
                            message: `Đang tạo suất chiếu ${i + 1}/${apiPayloads.length}...`,
                            type: "info",
                          });
                          try {
                            const value = await showtimeApi.create({
                              movieId: bulkShowtime.movieId,
                              cinemaId: bulkShowtime.cinemaId,
                              startTime: apiPayloads[i].startTime,
                              format: bulkShowtime.format,
                              room: bulkShowtime.room || "Phòng 1",
                              priceStandard: Number(bulkShowtime.priceStandard) || 85000,
                              priceVIP: Number(bulkShowtime.priceVIP) || 110000,
                              priceDouble: Number(bulkShowtime.priceDouble) || 240000,
                            });
                            settled.push({ status: "fulfilled", value });
                          } catch (err) {
                            settled.push({ status: "rejected", reason: err });
                          }
                        }

                        const batchList: Showtime[] = [];
                        settled.forEach((result, idx) => {
                          if (result.status === "fulfilled") {
                            batchList.push({
                              id: result.value.id,
                              movieId: bulkShowtime.movieId,
                              cinemaId: bulkShowtime.cinemaId,
                              date: apiPayloads[idx].displayDate,
                              time: apiPayloads[idx].slotTime,
                              room: bulkShowtime.room || "Phòng 1",
                              format: bulkShowtime.format,
                              priceStandard: Number(bulkShowtime.priceStandard) || 85000,
                              priceVIP: Number(bulkShowtime.priceVIP) || 110000,
                              priceDouble: Number(bulkShowtime.priceDouble) || 240000,
                            });
                          }
                        });

                        const failCount = settled.filter(r => r.status === "rejected").length;

                        // Lọc trùng rồi cập nhật state
                        if (batchList.length > 0) {
                          setShowtimes((prev) => {
                            const duplicateKeys = new Set(batchList.map(b => `${b.cinemaId}|${b.room}|${b.date}|${b.time}`));
                            const safePrevList = prev.filter(p => !duplicateKeys.has(`${p.cinemaId}|${p.room}|${p.date}|${p.time}`));
                            return [...batchList, ...safePrevList];
                          });
                        }

                        if (failCount === 0) {
                          setAdminToast({
                            message: `Đã xuất bản thành công ${batchList.length} suất chiếu (${simSlots.length} suất/ngày) trong ${daysToRepeat} ngày tại ${bulkShowtime.room || "Phòng 1"}!`,
                            type: "success"
                          });
                        } else if (batchList.length > 0) {
                          setAdminToast({
                            message: `Đã thêm ${batchList.length} suất chiếu thành công, ${failCount} suất bị trùng hoặc lỗi (bỏ qua).`,
                            type: "success"
                          });
                        } else {
                          setAdminToast({ message: "Không thể tạo suất chiếu hàng loạt. Vui lòng thử lại!", type: "error" });
                        }
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">1. Chọn Phim Hàng Loạt</label>
                        <select
                          className="w-full bg-[#121212] px-3 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none"
                          value={bulkShowtime.movieId}
                          onChange={(e) => setBulkShowtime({ ...bulkShowtime, movieId: e.target.value })}
                        >
                          <option value="">-- Chọn Phim --</option>
                          {movies.map(m => (
                            <option key={m.id} value={m.id}>{m.title} ({m.duration}p)</option>
                          ))}
                        </select>
                      </div>

                      {targetBulkMovie && (
                        <div className="p-2.5 bg-zinc-950/50 rounded-xl border border-white/5 space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500 font-bold">Thời lượng phim:</span>
                            <span className="text-white font-extrabold">{mDuration} phút</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500 font-bold">Thời gian dọn phòng:</span>
                            <span className="text-amber-500 font-extrabold">+{mCleanup} phút</span>
                          </div>
                          <div className="border-t border-white/5 pt-1.5 mt-1 flex justify-between text-[10px]">
                            <span className="text-zinc-400 font-extrabold">Chu kỳ 1 suất (Vòng quay):</span>
                            <span className="text-green-400 font-black">{totalCycleTime} phút</span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">2. Chọn Rạp Chi Nhánh</label>
                          <select
                            className="w-full bg-[#121212] px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none"
                            value={bulkShowtime.cinemaId}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, cinemaId: e.target.value })}
                          >
                            <option value="">-- Chọn rạp --</option>
                            {cinemas.map(c => (
                              <option key={c.id} value={c.id}>{c.name.split(" ").slice(0, 3).join(" ")}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">Phòng Chiếu</label>
                          <select
                            className="w-full bg-[#121212] px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none font-semibold"
                            value={bulkShowtime.room}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, room: e.target.value })}
                          >
                            <option value="Phòng 1">Phòng 1</option>
                            <option value="Phòng 2 (VIP)">Phòng 2 (VIP)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">3. Bắt Đầu Từ Ngày</label>
                          <input
                            type="date"
                            className="w-full bg-[#121212] px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none font-mono"
                            value={bulkShowtime.startDate}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">Bao Nhiêu Ngày</label>
                          <input
                            type="number"
                            min="1"
                            max="14"
                            className="w-full bg-[#121212] px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none font-mono font-bold"
                            value={bulkShowtime.numberOfDays}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, numberOfDays: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        <div>
                          <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Gờ Đầu Ngày</label>
                          <input
                            type="time"
                            className="w-full bg-[#121212] px-1.5 py-1.5 text-xs text-white rounded border border-zinc-800 focus:border-amber-500 outline-none font-mono text-center"
                            value={bulkShowtime.firstStartTime}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, firstStartTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Giờ Cuối Ngày</label>
                          <input
                            type="time"
                            className="w-full bg-[#121212] px-1.5 py-1.5 text-xs text-white rounded border border-zinc-800 focus:border-amber-500 outline-none font-mono text-center"
                            value={bulkShowtime.lastEndTime}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, lastEndTime: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Dọn Phòng (m)</label>
                          <input
                            type="number"
                            className="w-full bg-[#121212] px-1.5 py-1.5 text-xs text-white rounded border border-zinc-800 focus:border-amber-500 outline-none font-mono text-center"
                            value={bulkShowtime.cleanupTime}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, cleanupTime: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">Định Dạng Suất</label>
                          <select
                            className="w-full bg-[#121212] px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none"
                            value={bulkShowtime.format}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, format: e.target.value as any })}
                          >
                            <option value="2D Phụ đề">2D Phụ đề</option>
                            <option value="2D lồng tiếng">2D lồng tiếng</option>
                            <option value="3D Phụ đề">3D Phụ đề</option>
                            <option value="IMAX 3D">IMAX 3D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-400 font-extrabold uppercase mb-1">Đơn Giá Vé Thường</label>
                          <input
                            type="number"
                            className="w-full bg-[#121212] px-2.5 py-2 text-xs text-green-400 rounded-lg border border-zinc-800 focus:border-amber-500 outline-none font-mono"
                            value={bulkShowtime.priceStandard}
                            onChange={(e) => setBulkShowtime({ ...bulkShowtime, priceStandard: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      {/* Simulation live tracker widget */}
                      <div className="p-3 bg-amber-500/10 border border-amber-500/15 rounded-xl space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block">MÔ PHỎNG SƠ ĐỒ LỊCH CHIẾU CHI TIẾT</span>
                          <span className="text-[9.5px] text-white/50 bg-black/50 px-1.5 rounded font-mono font-extrabold">{simSlots.length} Suất / Ngày</span>
                        </div>
                        {simSlots.length > 0 ? (
                          <div className="grid grid-cols-4 gap-1">
                            {simSlots.map(t => (
                              <span key={t} className="px-1 py-0.5 bg-black/50 text-amber-300 rounded font-mono font-bold text-[9.5px] text-center border border-white/5">
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 italic block leading-relaxed text-center py-1">Lựa chọn giờ chiếu hợp lý để bắt đầu vẽ chu kỳ lịch trình tự động.</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-[10px] tracking-wider shadow-lg hover:shadow-amber-500/20 cursor-pointer block text-center"
                      >
                        ⚡ Kích hoạt xếp lịch hàng loạt ({simSlots.length * Math.min(14, Math.max(1, bulkShowtime.numberOfDays))} suất)
                      </button>
                    </form>
                  );
                })()}
              </div>

              {/* Right Column: List of current showtimes */}
              <div className="lg:col-span-8 p-5 bg-[#161515] border border-white/5 rounded-2xl shadow-xl space-y-4 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-white/5 gap-3">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center">
                      <Server className="w-4 h-4 mr-1.5 text-red-500" />
                      LỊCH TRÌNH SUẤT CHIẾU HIỆN HÀNH ({filteredShowtimes.length} suất)
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1">Các suất chiếu mới tạo ngay lập tức được cập nhật trực tuyến tới khách hàng đặt vé.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      value={searchShowtimeQuery}
                      onChange={(e) => setSearchShowtimeQuery(e.target.value)}
                      placeholder="Tìm cơ sở, phim, ngày, giờ..."
                      className="w-full bg-[#121212] pl-8.5 pr-8 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    {searchShowtimeQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchShowtimeQuery("")}
                        className="absolute right-2 top-2 text-zinc-400 hover:text-white text-[10px] font-bold font-mono px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded transition-all"
                        title="Xóa tìm kiếm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-widest font-extrabold text-[10px]">
                        <th className="py-2.5 px-2">Suất phim rạp</th>
                        <th className="py-2.5 px-2">Cơ sở chi nhánh</th>
                        <th className="py-2.5 px-2 font-mono">Ngày chiếu</th>
                        <th className="py-2.5 px-2 font-mono">Giờ chiếu</th>
                        <th className="py-2.5 px-2">Phòng & Định dạng</th>
                        <th className="py-2.5 px-2 font-mono text-center">Ghế Thường</th>
                        <th className="py-2.5 px-2 font-mono text-center">Ghế VIP</th>
                        <th className="py-2.5 px-2 text-right">Lựa chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShowtimes.map((st) => {
                        const correlatedMovie = movies.find((m) => m.id === st.movieId);
                        const correlatedCinema = cinemas.find((c) => c.id === st.cinemaId);

                        return (
                          <tr key={st.id} className="border-b border-white/5 hover:bg-white/5 transition duration-100">
                            <td className="py-3 px-2 max-w-[180px] truncate">
                              <span className="font-extrabold text-white text-xs block truncate">{correlatedMovie ? correlatedMovie.title : "Tác phẩm phim mẫu"}</span>
                              {correlatedMovie?.rating && (
                                <span className="text-[8px] px-1 bg-red-950/40 text-[#C8102E] rounded border border-red-900/35 font-bold uppercase mt-0.5 inline-block">
                                  {correlatedMovie.rating}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-zinc-300">
                              <span className="font-semibold block">{correlatedCinema ? correlatedCinema.name.replace("X Cinema ", "").replace("TCD Cinema ", "") : "Sảnh X Cinema"}</span>
                            </td>
                            <td className="py-3 px-2 font-mono font-bold text-zinc-300">{st.date}</td>
                            <td className="py-3 px-2 font-mono text-amber-500 font-black text-xs">{st.time}</td>
                            <td className="py-3 px-2">
                              <div className="space-y-0.5">
                                <span className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono text-[8px] text-[#C8102E] font-extrabold inline-block">
                                  {st.format}
                                </span>
                                <span className="block text-[10px] text-zinc-400 font-bold">{st.room}</span>
                              </div>
                            </td>
                            <td className="py-3 px-2 font-mono text-green-400 font-bold text-center">{formatVND(st.priceStandard)}</td>
                            <td className="py-3 px-2 font-mono text-emerald-400 font-bold text-center">{formatVND(st.priceVIP)}</td>
                            <td className="py-3 px-2 text-right">
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Bạn có chắc chắn muốn xóa suất chiếu lúc ${st.time} ngày ${st.date} cho phim này không?`)) {
                                    try {
                                      await showtimeApi.remove(st.id);
                                      setShowtimes(prev => prev.filter(item => item.id !== st.id));
                                      setAdminToast({ message: "Đã xóa suất chiếu thành công!", type: "success" });
                                    } catch {
                                      setAdminToast({ message: "Không thể xóa suất chiếu. Vui lòng thử lại!", type: "error" });
                                    }
                                  }
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-2.5 py-1 rounded font-bold text-[10px] uppercase transition cursor-pointer"
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredShowtimes.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-zinc-500 italic">
                            Không phát hiện bất kỳ suất chiếu tương thích truy vấn.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-zinc-500 italic text-center mt-2 pb-1">
                  Xóa suất chiếu sẽ lập tức đồng bộ danh mục suất tại giao diện mua vé, tránh các sự cố đặt chỗ chồng chéo.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: BOOKINGS LIST */}
        {adminTab === "bookings" && (
          <div className="p-6 bg-[#161515] border border-white/5 rounded-2xl shadow-xl text-xs animate-fadeIn space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/5 gap-3">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                  <Ticket className="w-4.5 h-4.5 mr-2 text-[#C8102E]" />
                  PHÒNG THƯ VIỆN ĐƠN VÉ - SỔ HỒ SƠ KHÁCH HÀNG ({filteredBookings.length} hoá đơn)
                </h3>
                <p className="text-[10px] text-zinc-400 mt-1">Sắp xếp theo thứ tự đặt vé thời gian thực (Giảm trừ coupon tự động).</p>
              </div>
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={searchBookingQuery}
                  onChange={(e) => setSearchBookingQuery(e.target.value)}
                  placeholder="Kiểm mã CODE, tên phim, ngày..."
                  className="w-full bg-[#121212] pl-8.5 pr-8 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                {searchBookingQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchBookingQuery("")}
                    className="absolute right-2 top-2 text-zinc-400 hover:text-white text-[10px] font-bold font-mono px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded transition-all"
                    title="Xóa tìm kiếm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {filteredBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[750px]">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-widest font-extrabold text-[10px]">
                      <th className="py-3 px-2">Mã vé QR/Code</th>
                      <th className="py-3 px-2">Tên Phim</th>
                      <th className="py-3 px-2">Chi Nhánh Rạp</th>
                      <th className="py-3 px-2 font-mono">Date & Giờ</th>
                      <th className="py-3 px-2 text-center">Ghế được in</th>
                      <th className="py-3 px-2 font-mono text-right">Thành Tiền</th>
                      <th className="py-3 px-2 text-center">Hình thức ví</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((bk) => (
                      <tr key={bk.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                        <td className="py-3.5 px-2 font-mono text-[#C8102E] font-black text-xs">
                          <span className="bg-[#C8102E]/10 px-2 py-1 rounded border border-[#C8102E]/20 text-[#C8102E]">
                            {bk.code}
                          </span>
                        </td>
                        <td className="py-3.5 px-2">
                          <span className="font-extrabold text-white text-xs block max-w-[170px] truncate">{bk.movieTitle}</span>
                          {bk.combos && bk.combos.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1 leading-none max-w-[200px]">
                              {bk.combos.map((cb, idx) => (
                                <span key={idx} className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8.5px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-wide scale-95 origin-left">
                                  {cb.name} (x{cb.quantity})
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-zinc-300">{bk.cinemaName.replace("X Cinema ", "").replace("TCD Cinema ", "")}</td>
                        <td className="py-3.5 px-2 font-mono text-zinc-400">{bk.showTime} • {bk.showDate}</td>
                        <td className="py-3.5 px-2 font-mono font-bold text-amber-500 text-center bg-zinc-900/40 rounded border border-zinc-800/10">
                          {bk.seats.sort().join(", ")}
                        </td>
                        <td className="py-3.5 px-2 font-mono font-black text-emerald-400 text-right text-xs">
                          {formatVND(bk.totalAmount)}
                        </td>
                        <td className="py-3.5 px-2 text-center font-bold text-[9px] uppercase tracking-wider text-zinc-400">
                          <span className="bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded font-mono">
                            {bk.paymentMethod}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-500 italic">
                Chưa có hồ sơ vé điện tử nào được phát hiện thoả mãn yêu cầu.
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROMOTIONS */}
        {adminTab === "promotions" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-5 p-6 bg-gradient-to-b from-[#191818] to-[#121111] border border-white/5 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center text-[#C8102E]">
                    <PlusCircle className="w-4.5 h-4.5 mr-2 text-[#C8102E]" />
                    PHÁT HÀNH VOUCHER ƯU ĐÃI
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1">Hệ thống tính khấu hao % trực tiếp vào cổng hoá đơn khách.</p>
                </div>

                <form onSubmit={handleAddPromotion} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="promo-title" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                      Tiêu Đề Khuyến Mãi *
                    </label>
                    <input
                      type="text"
                      id="promo-title"
                      required
                      value={newPromo.title}
                      onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
                      placeholder="Ví dụ: Giảm giá mùa hè rực rỡ"
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="promo-desc" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                      Mô Tả & Điều Khoản Áp Dụng
                    </label>
                    <textarea
                      id="promo-desc"
                      required
                      value={newPromo.description}
                      onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
                      placeholder="Chi tiết ưu đãi: giảm 15% tổng hóa đơn, mua kèm bắp nước..."
                      rows={3}
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition lead-relaxed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="promo-code" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                        Mã Code Coupon *
                      </label>
                      <input
                        type="text"
                        id="promo-code"
                        required
                        value={newPromo.code}
                        onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
                        placeholder="Ví dụ: XCINEMA2026"
                        className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition font-black text-amber-500 uppercase"
                      />
                    </div>
                    <div>
                      <label htmlFor="promo-discount" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                        % Giảm Chiếu Khấu (%) *
                      </label>
                      <input
                        type="number"
                        id="promo-discount"
                        required
                        value={newPromo.discountPercent}
                        onChange={(e) => setNewPromo({ ...newPromo, discountPercent: Number(e.target.value) || 10 })}
                        placeholder="15"
                        className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition font-bold text-green-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="promo-validity" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                      Thời Hạn Hiệu Lực
                    </label>
                    <input
                      type="text"
                      id="promo-validity"
                      value={newPromo.validity}
                      onChange={(e) => setNewPromo({ ...newPromo, validity: e.target.value })}
                      className="w-full bg-[#121212] p-3 text-xs text-white rounded-lg border border-white/10 focus:border-[#C8102E]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer transition transform active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-red-950/40"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Kích hoạt hệ thống sỉ
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 p-6 bg-[#161515] border border-white/5 rounded-2xl shadow-xl space-y-6 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/5 gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                      <Tag className="w-4.5 h-4.5 mr-2 text-[#C8102E]" />
                      ƯU ĐÃI KHUYẾN MÃI HOẠT ĐỘNG ({filteredPromos.length})
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1">Khách hàng áp dụng trực tiếp tại form thanh toán hoá đơn.</p>
                  </div>
                  <div className="relative w-full sm:w-56">
                    <input
                      type="text"
                      value={searchPromoQuery}
                      onChange={(e) => setSearchPromoQuery(e.target.value)}
                      placeholder="Tìm code, tiêu đề..."
                      className="w-full bg-[#121212] pl-8.5 pr-8 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    {searchPromoQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchPromoQuery("")}
                        className="absolute right-2 top-2 text-zinc-400 hover:text-white text-[10px] font-bold font-mono px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded transition-all"
                        title="Xóa tìm kiếm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto col-span-1">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-widest font-extrabold text-[10px]">
                        <th className="py-2.5 px-1">Ảnh bìa</th>
                        <th className="py-2.5 px-1">Tên Ưu Đãi & Mô tả</th>
                        <th className="py-2.5 px-1 font-mono text-center">Mã Code</th>
                        <th className="py-2.5 px-1 text-center font-mono">Giảm</th>
                        <th className="py-2.5 px-1 font-mono text-right">Thời hạn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPromos.map((pr) => (
                        <tr key={pr.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                          <td className="py-3 px-1">
                            <img
                              src={pr.imageUrl}
                              alt="Voucher layout"
                              className="w-10 h-10 object-cover rounded border border-white/10"
                            />
                          </td>
                          <td className="py-3 px-1 max-w-[200px]">
                            <span className="block font-black text-white text-xs">{pr.title}</span>
                            <span className="block text-[10px] text-zinc-500 mt-0.5 line-clamp-1">{pr.description}</span>
                          </td>
                          <td className="py-3 px-1 text-center">
                            <span className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded border border-amber-500/20 font-mono font-extrabold text-xs">
                              {pr.code}
                            </span>
                          </td>
                          <td className="py-3 px-1 text-center font-bold text-green-400 text-xs">
                            {pr.discountPercent}%
                          </td>
                          <td className="py-3 px-1 text-right text-zinc-400 font-medium">
                            {pr.validity}
                          </td>
                        </tr>
                      ))}
                      {filteredPromos.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                            Chưa ghi nhận mã khuyến mãi tương thích bộ lọc tìm kiếm.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: NEWS PORTAL */}
        {adminTab === "news" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              <div className="lg:col-span-5 p-6 bg-gradient-to-b from-[#191818] to-[#121111] border border-white/5 rounded-2xl shadow-xl space-y-6">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center text-[#C8102E]">
                    <PlusCircle className="w-4.5 h-4.5 mr-2 text-[#C8102E]" />
                    BIÊN SOẠN BẢN TIN ĐIỆN ẢNH KHÁCH
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1">Đồng bộ tức thời trên tab truyền thông báo chí khách hàng.</p>
                </div>

                <form onSubmit={handleAddNews} className="space-y-4 text-xs">
                  <div>
                    <label htmlFor="news-title" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                      Tiêu Đề Bài Viết *
                    </label>
                    <input
                      type="text"
                      id="news-title"
                      required
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                      placeholder="Ví dụ: LHP Cannes 2026: Đỉnh cao văn hóa mới"
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="news-summary" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                      Đoạn Tóm Tắt Ngắn (Mở đầu) *
                    </label>
                    <textarea
                      id="news-summary"
                      required
                      value={newNews.summary}
                      onChange={(e) => setNewNews({ ...newNews, summary: e.target.value })}
                      placeholder="Viết một hoặc hai câu lôi cuốn người đọc click vào..."
                      rows={2}
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition lead-relaxed"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label htmlFor="news-category" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                        Danh Mục Chuyên Trang
                      </label>
                      <select
                        id="news-category"
                        value={newNews.category}
                        onChange={(e) => setNewNews({ ...newNews, category: e.target.value as any })}
                        className="w-full bg-[#121212] p-3 text-xs text-white rounded-lg border border-white/10 focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] outline-none transition font-bold"
                      >
                        <option value="Điện Ảnh">Review Điện Ảnh</option>
                        <option value="Khuyến Mãi">Tin Khuyến Mãi</option>
                        <option value="Sự Kiện">Sự Kiện Hot Rạp</option>
                        <option value="Hậu Trường">Góc Hậu Trường Movie</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="news-img" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                        Poster Ảnh minh họa (URL)
                      </label>
                      <input
                        type="text"
                        id="news-img"
                        value={newNews.imageUrl}
                        onChange={(e) => setNewNews({ ...newNews, imageUrl: e.target.value })}
                        className="w-full bg-[#121212] p-3 text-xs text-white rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition font-mono text-[10px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="news-content" className="block text-zinc-400 text-[10px] uppercase font-black mb-1">
                      Nội dung bài viết hoàn chỉnh
                    </label>
                    <textarea
                      id="news-content"
                      value={newNews.content}
                      onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                      placeholder="Chi tiết cấu trúc tin tức..."
                      rows={4}
                      className="w-full bg-[#121212] p-3 text-xs text-white placeholder-zinc-600 rounded-lg border border-white/10 focus:border-[#C8102E] outline-none transition leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-[#C8102E] hover:bg-red-700 text-white rounded-xl font-bold flex items-center justify-center cursor-pointer transition transform active:scale-95 text-xs uppercase tracking-wider shadow-lg shadow-red-950/40"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Đăng tin truyền thông
                  </button>
                </form>
              </div>

              <div className="lg:col-span-7 p-6 bg-[#161515] border border-white/5 rounded-2xl shadow-xl space-y-6 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/5 gap-3">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                      <Newspaper className="w-4.5 h-4.5 mr-2 text-[#C8102E]" />
                      BÀI TIN TRUYỀN THÔNG BÁO CHÍ ({filteredNews.length})
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-1">Đã được kiểm duyệt thông tin chuẩn điện ảnh.</p>
                  </div>
                  <div className="relative w-full sm:w-56">
                    <input
                      type="text"
                      value={searchNewsQuery}
                      onChange={(e) => setSearchNewsQuery(e.target.value)}
                      placeholder="Tìm bài báo, chuyên mục..."
                      className="w-full bg-[#121212] pl-8.5 pr-8 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-[#C8102E] outline-none"
                    />
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                    {searchNewsQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchNewsQuery("")}
                        className="absolute right-2 top-2 text-zinc-400 hover:text-white text-[10px] font-bold font-mono px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded transition-all"
                        title="Xóa tìm kiếm"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-zinc-400 uppercase tracking-widest font-extrabold text-[10px]">
                        <th className="py-2.5">Ấn bản minh họa</th>
                        <th className="py-2.5">Tiêu Đề & Tóm tắt</th>
                        <th className="py-2.5 text-center">Thể loại Chuyên mục</th>
                        <th className="py-2.5 text-right font-mono">Tương tác thực tế</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNews.map((nw) => (
                        <tr key={nw.id} className="border-b border-white/5 hover:bg-white/5 transition duration-150">
                          <td className="py-3 pr-2">
                            <img
                              src={nw.imageUrl}
                              alt="News snippet"
                              className="w-12 h-8 object-cover rounded border border-white/10"
                            />
                          </td>
                          <td className="py-3 pr-2 max-w-[250px]">
                            <span className="block font-black text-white text-xs truncate">{nw.title}</span>
                            <span className="block text-[10px] text-zinc-500 mt-0.5 mt-1 truncate">{nw.summary}</span>
                          </td>
                          <td className="py-3 text-center">
                            <span className="bg-[#121211] text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              {nw.category}
                            </span>
                          </td>
                          <td className="py-3 text-right text-amber-500 font-extrabold font-mono text-xs">
                            {nw.views > 0 ? `${nw.views} lượt xem` : "Vừa lên bản tin"}
                          </td>
                        </tr>
                      ))}
                      {filteredNews.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-zinc-500 italic">
                            Chưa tìm thấy bài viết tin tức phù hợp từ khóa này.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {adminTab === "accounts" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Create Lobby Staff Account Form */}
              <div className="p-6 bg-[#161515] border border-white/5 rounded-2xl space-y-6">
                <div className="pb-4 border-b border-white/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center">
                    <Users className="w-4 h-4 mr-2 text-[#C8102E]" />
                    Tạo Tài Khoản Nhân Viên Sảnh
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider">Chỉ Admin Master mới có quyền khởi tạo tài khoản cán bộ nhân viên</p>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!setAccounts) return;
                  if (!newStaffName.trim() || !newStaffEmail.trim() || !newStaffPhone.trim() || !newStaffPassword.trim()) {
                    setAdminToast({ message: "Vui lòng nhập đầy đủ tất cả thông tin", type: "error" });
                    return;
                  }
                  
                  const emailClean = newStaffEmail.trim().toLowerCase();
                  const phoneClean = newStaffPhone.trim().replace(/[^0-9]/g, "");

                  // Check uniqueness
                  const match = accounts.some(acc => {
                    const accPhone = acc.phone.replace(/[^0-9]/g, "");
                    return acc.email.trim().toLowerCase() === emailClean || accPhone === phoneClean;
                  });

                  if (match) {
                    setAdminToast({ message: "Email hoặc Số điện thoại này đã được đăng ký tài khoản!", type: "error" });
                    return;
                  }

                  const suffix = Math.floor(1000 + Math.random() * 9000);
                  const memberId = `X-STAFF-${suffix}`;

                  const newStaff: UserProfile = {
                    name: newStaffName.trim(),
                    email: emailClean,
                    phone: newStaffPhone.trim(),
                    avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${encodeURIComponent(newStaffName.trim())}`,
                    membershipId: memberId,
                    points: 500, // 500 starting point reward for staff
                    favoriteMovies: [],
                    password: newStaffPassword.trim(),
                    role: "employee"
                  };

                  setAccounts(prev => [...prev, newStaff]);
                  setAdminToast({ message: `Đã tạo thành công tài khoản Nhân viên: ${newStaff.name}!`, type: "success" });

                  // Reset
                  setNewStaffName("");
                  setNewStaffEmail("");
                  setNewStaffPhone("");
                  setNewStaffPassword("");
                }} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Họ Và Tên</label>
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Văn A..."
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full bg-[#121212] px-3.5 py-2.5 text-xs text-white rounded-xl border border-zinc-800 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 font-mono">Số Điện Thoại</label>
                    <input
                      type="tel"
                      placeholder="VD: 0911223344"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      className="w-full bg-[#121212] px-3.5 py-2.5 text-xs text-white rounded-xl border border-zinc-800 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 font-sans">Địa Chỉ Email</label>
                    <input
                      type="email"
                      placeholder="VD: staff.a@xcinema.vn"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full bg-[#121212] px-3.5 py-2.5 text-xs text-white rounded-xl border border-zinc-800 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1 font-mono">Mật Khẩu Đăng Nhập</label>
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu khóa bảo mật..."
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      className="w-full bg-[#121212] px-3.5 py-2.5 text-xs text-white rounded-xl border border-zinc-800 focus:border-[#C8102E] outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-black font-extrabold text-xs uppercase tracking-wider transition duration-150 shadow-md shadow-emerald-500/10 cursor-pointer"
                  >
                    + Cấp Tài Khoản STAFF 🧑‍💼
                  </button>
                </form>
              </div>

              {/* Right Column: List of All Registered Accounts with filters */}
              <div className="lg:col-span-2 p-6 bg-[#161515] border border-white/5 rounded-2xl space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/5 font-sans">
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-sans">Danh Sách Tài Khoản Hệ Thống</h3>
                    <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-wider font-mono">Tổng số: {accounts?.length || 0} danh mục tài khoản</p>
                  </div>
                  
                  {/* Search and Role Filter */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                      <input
                        type="text"
                        placeholder="Tìm tên, sđt, email, ID..."
                        value={searchAccountQuery}
                        onChange={(e) => setSearchAccountQuery(e.target.value)}
                        className="bg-[#121212] rounded-xl border border-zinc-850 pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-550 w-full sm:w-48 placeholder-zinc-650 font-sans font-medium"
                      />
                      <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-2.5 top-3" />
                    </div>

                    <select
                      value={selectedRoleFilter}
                      onChange={(e) => setSelectedRoleFilter(e.target.value as any)}
                      className="bg-[#121212] rounded-xl border border-zinc-850 px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-550 cursor-pointer font-sans font-semibold"
                    >
                      <option value="all">Tất cả Vai trò</option>
                      <option value="customer">Khách Hàng (Customer)</option>
                      <option value="employee">Nhân Viên (Employee)</option>
                      <option value="admin">Quản Trị Viên (Admin)</option>
                    </select>
                  </div>
                </div>

                {/* Table Accounts rendering */}
                <div className="overflow-x-auto rounded-xl border border-white/5">
                  <table className="w-full text-left min-w-[550px]">
                    <thead>
                      <tr className="bg-[#111010] text-[10px] font-black uppercase text-zinc-500 border-b border-white/5 font-sans">
                        <th className="py-3 px-4">Hình / Tên Tài Khoản</th>
                        <th className="py-3 px-4 font-mono">Thông tin liên lạc</th>
                        <th className="py-3 px-4 text-center">Vai Trò</th>
                        <th className="py-3 px-4 text-right">Mức Điểm / Mật khẩu</th>
                        <th className="py-3 px-4 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-zinc-300">
                      {(accounts || [])
                        .filter(acc => {
                          // Filter by role
                          if (selectedRoleFilter !== "all" && acc.role !== selectedRoleFilter) {
                            return false;
                          }
                          // Filter by search query
                          const query = removeDiacritics(searchAccountQuery.trim().toLowerCase());
                          if (query) {
                            const nameMatch = removeDiacritics(acc.name.toLowerCase()).includes(query);
                            const emailMatch = acc.email.toLowerCase().includes(query);
                            const phoneMatch = acc.phone.replace(/[^0-9]/g, "").includes(query);
                            const idMatch = acc.membershipId.toLowerCase().includes(query);
                            return nameMatch || emailMatch || phoneMatch || idMatch;
                          }
                          return true;
                        })
                        .map((acc, index) => {
                          const isMainAdmin = acc.email === "admin@xcinema.vn";
                          return (
                            <tr key={index} className="hover:bg-white/2 transition">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 rounded-full bg-zinc-950 p-0.5 border border-white/5 shrink-0">
                                    <img src={acc.avatar} alt={acc.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                    <p className="font-extrabold text-white leading-normal uppercase">{acc.name}</p>
                                    <span className="text-[9px] font-mono text-zinc-500 font-bold block leading-none mt-0.5">{acc.membershipId}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <div>
                                  <p className="text-zinc-400 font-medium font-sans leading-relaxed">{acc.email}</p>
                                  <p className="text-[10px] font-mono text-zinc-500 font-bold">{acc.phone}</p>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center">
                                {acc.role === "admin" ? (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    Quản trị viên ⚡
                                  </span>
                                ) : acc.role === "employee" ? (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Nhân viên sảnh 🧑‍💼
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-zinc-850 text-zinc-400 border border-zinc-750">
                                    Khách hàng 👤
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-4 text-right font-mono font-bold text-zinc-400">
                                <div className="leading-snug">
                                  <span className="text-orange-400">{acc.points} Điểm</span>
                                  <p className="text-[8.5px] text-zinc-600 font-sans mt-0.5 uppercase">Mật khẩu: {acc.password}</p>
                                </div>
                              </td>

                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  disabled={isMainAdmin}
                                  onClick={() => {
                                    if (!setAccounts) return;
                                    const confirmDel = window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${acc.name}" ra khỏi hệ thống rạp phim?`);
                                    if (!confirmDel) return;

                                    setAccounts(prev => prev.filter(item => item.email !== acc.email));
                                    setAdminToast({ message: `Đã xóa tài khoản "${acc.name}" thành công!`, type: "success" });
                                  }}
                                  className={`p-1.5 rounded-lg border transition ${
                                    isMainAdmin
                                      ? "opacity-30 border-zinc-850 text-zinc-650 cursor-not-allowed select-none"
                                      : "hover:bg-red-950 hover:text-red-400 border-white/5 text-zinc-500 hover:border-red-500/20 cursor-pointer"
                                  }`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {(accounts || []).length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-zinc-500 italic">
                            Chưa tìm thấy tài khoản nào phù hợp bộ lọc hiện tại.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
          </div> {/* Closer of Right panel lg:col-span-9 */}
        </div> {/* Closer of Outer split container grid grid-cols-1 lg:grid-cols-12 */}

      </div>

      {/* Admin Floating Toast */}
      {adminToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1E1E] border border-white/10 rounded-xl p-4 shadow-2xl flex items-center space-x-3 max-w-sm animate-slideUp select-none">
          <div className={`p-1.5 rounded-lg shrink-0 ${adminToast.type === "success" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-[#C8102E]/10 text-red-500 border border-[#C8102E]/20"}`}>
            {adminToast.type === "success" ? <Check className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-white text-xs font-sans font-extrabold">{adminToast.type === "success" ? "Thành Công" : "Cảnh Báo"}</p>
            <p className="text-[#BDBDBD] text-[11px] font-sans font-medium mt-0.5 leading-snug">{adminToast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
