/**
 * App.tsx — đã tái cấu trúc
 *
 * UI/layout/logic giữ nguyên 100% so với bản gốc.
 * Toàn bộ state đã chuyển vào:
 *   useAuth()    — appMode, userProfile, operatorProfile, toggleFavoriteMovie
 *   useMovies()  — movies, cinemas, showtimes, promotionsList, newsList, comboDeals
 *   useBooking() — bookings, activeBooking, booking flow actions
 *   useUI()      — activeTab, navigateToTab, searchQuery, globalAlert, selectedMovie
 */

import React, { useState, useEffect } from "react";
import {
  Film, Sparkles, MapPin, Tag, Newspaper,
  AlertCircle, Heart, Star, ChevronRight, Search,
  LayoutGrid, Shield, User, Award, Copy, Check,
  ArrowUp, ThumbsUp, Clock, HeartHandshake,
} from "lucide-react";

// ─── Contexts ─────────────────────────────────────────────────────────────────
import { useAuth } from "./contexts/AuthContext";
import { useMovies } from "./contexts/MovieContext";
import { useBooking } from "./contexts/BookingContext";
import { useUI } from "./contexts/UIContext";

// ─── Types ────────────────────────────────────────────────────────────────────
import type { Movie, Showtime } from "./types";

// ─── Components ───────────────────────────────────────────────────────────────
import Header from "./components/layout/Header";
import HeroBanner from "./components/layout/HeroBanner";
import MovieCardPlaying from "./components/movie/MovieCardPlaying";
import MovieCardUpcoming from "./components/movie/MovieCardUpcoming";
import MovieDetailModal from "./components/movie/MovieDetailModal";
import SeatMap from "./components/booking/SeatMap";
import PaymentModal from "./components/booking/PaymentModal";
import ETicket from "./components/booking/ETicket";
import SecurityPolicyView from "./components/common/SecurityPolicyView";

// ─── Pages ────────────────────────────────────────────────────────────────────
import UserProfileView from "./pages/Profile";
import AdminPanel from "./pages/Admin";
import StaffPortal from "./pages/Staff";
import CinemasView from "./pages/Cinemas";
import PromosNewsView from "./pages/Promotions";
import AuthView from "./pages/Auth";

// ─── Utils ────────────────────────────────────────────────────────────────────
import { removeDiacritics } from "./utils/helpers";
import { accountApi } from "./services/api";

export default function App() {
  // ── Contexts ────────────────────────────────────────────────────────────────
  const {
    appMode, setAppMode,
    userProfile, setUserProfile,
    operatorProfile, setOperatorProfile,
    toggleFavoriteMovie,
  } = useAuth();

  const {
    movies, cinemas, showtimes,
    setMovies, setShowtimes,
    promotionsList, setPromotionsList,
    newsList, setNewsList,
    comboDeals, setComboDeals,
  } = useMovies();

  const {
    bookings, setBookings,
    accounts, setAccounts,
    activeBooking, setActiveBooking,
    refreshBookingsFromServer,
    completePayment,
  } = useBooking();

  const {
    activeTab, navigateToTab,
    globalAlert, setGlobalAlert,
    searchQuery, setSearchQuery,
    selectedMovie, setSelectedMovie,
  } = useUI();

  // ── Local UI state (chỉ dùng trong App, không cần context) ─────────────────
  const [selectedGenre, setSelectedGenre] = useState<string>("Tất Cả");
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handleGoBack = () => {
    if (activeBooking) {
      if (activeBooking.step === "payment") {
        setActiveBooking({ ...activeBooking, step: "seats" });
        return;
      } else if (activeBooking.step === "seats" || activeBooking.step === "ticket") {
        setActiveBooking(null);
        return;
      }
    }
    if (selectedMovie) { setSelectedMovie(null); return; }
    if (activeTab !== "home") navigateToTab("home");
  };

  // ── Booking flow ────────────────────────────────────────────────────────────
  const handleQuickBookMovie = (movie: Movie) => {
    if (movie.isUpcoming) { setSelectedMovie(movie); return; }
    const available = showtimes.filter((st) => st.movieId === movie.id);
    if (available.length > 0) {
      setSelectedMovie(null);
      setActiveBooking({ movie, showtime: available[0], step: "seats", selectedSeats: [], totalAmount: 0 });
    } else {
      setGlobalAlert("Bộ phim hiện đã bán hết toàn diện các suất chiếu hôm nay. Quý khách vui lòng tham gia đặt vé cơ sở rạp khác.");
    }
  };

  const handleSelectShowtimeFromDetail = (showtime: Showtime) => {
    if (!selectedMovie) return;
    const movie = selectedMovie;
    setSelectedMovie(null);
    setActiveBooking({ movie, showtime, step: "seats", selectedSeats: [], totalAmount: 0 });
  };

  const handleConfirmSeats = (
    selectedSeats: string[],
    totalAmount: number,
    selectedCombos?: { id: string; name: string; price: number; quantity: number }[]
  ) => {
    if (!activeBooking) return;
    setActiveBooking({ ...activeBooking, step: "payment", selectedSeats, totalAmount, selectedCombos });
  };

  const handlePaymentComplete = async (paymentMethod: string) => {
    if (!activeBooking) return;
    const cinemaName = cinemas.find((c) => c.id === activeBooking.showtime.cinemaId)?.name || "X Cinema";
    const provisionalCode = `X-${activeBooking.showtime.room.replace(/\s+/g, "").toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const provisionalQr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${provisionalCode}`;
    const newTicket = await completePayment({
      showtimeId: activeBooking.showtime.id,
      movieTitle: activeBooking.movie.title,
      moviePoster: activeBooking.movie.posterUrl,
      cinemaName,
      showDate: activeBooking.showtime.date,
      showTime: activeBooking.showtime.time,
      room: activeBooking.showtime.room,
      format: activeBooking.showtime.format,
      seats: activeBooking.selectedSeats,
      totalAmount: activeBooking.totalAmount,
      paymentMethod,
      qrCodeUrl: provisionalQr,
      userEmail: userProfile?.email,
      combos: activeBooking.selectedCombos?.map((c) => ({ id: c.id, quantity: c.quantity })),
    });
    // Đồng bộ điểm tích lũy sau khi đặt vé thành công
    if (newTicket && userProfile?.email) {
      try {
        const freshProfile = await accountApi.getByEmail(userProfile.email);
        setUserProfile(freshProfile);
      } catch (err) {
        console.warn("Không thể đồng bộ điểm tích lũy mới:", err);
      }
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const handleRestoreDefaults = () => {
    // Tải lại dữ liệu mới nhất từ C++ backend
    window.location.reload();
  };

  const handleCopyPromoCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopyFeedback(code);
      setTimeout(() => setCopyFeedback(null), 2200);
    } catch (err) {
      console.error("Lỗi khi sao chép mã coupon:", err);
    }
  };

  // ── Movie filters ────────────────────────────────────────────────────────────
  const playing = movies.filter((m) => !m.isUpcoming);
  const upcoming = movies.filter((m) => m.isUpcoming);

  const filterMovies = (movieList: Movie[]) => {
    return movieList.filter((m) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return selectedGenre === "Tất Cả" || m.genre.includes(selectedGenre);
      const qN = removeDiacritics(q);
      const titleMatch = m.title.toLowerCase().includes(q) || removeDiacritics(m.title.toLowerCase()).includes(qN);
      const origMatch = m.originalTitle && (m.originalTitle.toLowerCase().includes(q) || removeDiacritics(m.originalTitle.toLowerCase()).includes(qN));
      const dirMatch = m.director.toLowerCase().includes(q) || removeDiacritics(m.director.toLowerCase()).includes(qN);
      const genreMatch = m.genre.some((g) => g.toLowerCase().includes(q) || removeDiacritics(g.toLowerCase()).includes(qN));
      return (titleMatch || origMatch || dirMatch || genreMatch) && (selectedGenre === "Tất Cả" || m.genre.includes(selectedGenre));
    });
  };

  const filteredPlaying = filterMovies(playing);
  const filteredUpcoming = filterMovies(upcoming);

  // ── renderMainContent ────────────────────────────────────────────────────────
  const renderMainContent = () => {
    if (activeBooking) {
      if (activeBooking.step === "seats") {
        const matchingCinema = cinemas.find((c) => c.id === activeBooking.showtime.cinemaId) || cinemas[0];
        return (
          <SeatMap
            showtime={activeBooking.showtime}
            movie={activeBooking.movie}
            cinema={matchingCinema}
            bookings={bookings}
            comboDeals={comboDeals}
            onConfirmSeats={handleConfirmSeats}
            onBack={() => setActiveBooking(null)}
          />
        );
      }
      if (activeBooking.step === "payment") {
        const matchingCinema = cinemas.find((c) => c.id === activeBooking.showtime.cinemaId) || cinemas[0];
        return (
          <PaymentModal
            showtime={activeBooking.showtime}
            movie={activeBooking.movie}
            cinema={matchingCinema}
            selectedSeats={activeBooking.selectedSeats}
            totalAmount={activeBooking.totalAmount}
            selectedCombos={activeBooking.selectedCombos}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => setActiveBooking({ ...activeBooking, step: "seats" })}
          />
        );
      }
      if (activeBooking.step === "ticket" && activeBooking.activeTicket) {
        return (
          <ETicket
            booking={activeBooking.activeTicket}
            onGoHome={() => setActiveBooking(null)}
            onGoProfile={() => { setActiveBooking(null); navigateToTab("profile"); }}
          />
        );
      }
    }

    if (selectedMovie) {
      return (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          cinemas={cinemas}
          showtimes={showtimes}
          onSelectShowtime={handleSelectShowtimeFromDetail}
          allMovies={movies}
          onSelectRelatedMovie={(m) => setSelectedMovie(m)}
          favoriteMovies={userProfile ? userProfile.favoriteMovies : []}
          onToggleFavorite={toggleFavoriteMovie}
        />
      );
    }

    switch (activeTab) {
      case "home":
        return (
          <div className="animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex overflow-x-auto pb-3 space-x-2.5 scrollbar-thin">
                {["Tất Cả", "Hành Động", "Tâm Lý", "Kinh Dị", "Hoạt Hình", "Hài Hước", "Phiêu Lưu", "Gia Đình"].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4.5 py-2 rounded-full text-xs font-semibold tracking-wider transition ${
                      selectedGenre === genre
                        ? "bg-[#C8102E] text-white shadow shadow-[#C8102E]/25"
                        : "bg-[#1E1E1E] text-[#BDBDBD] hover:text-white border border-white/5 hover:border-white/10"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex justify-between items-end border-b border-white/5 pb-4.5 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-[#C8102E] animate-pulse" />
                    <span>Phim Đang Chiếu</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs text-[#BDBDBD] font-normal font-sans mt-1">
                    Đặt trực tuyến, sở hữu kho ghế VIP đỉnh cao rạp chiếu.
                  </p>
                </div>
                <button onClick={() => navigateToTab("movies")} className="text-xs text-[#C8102E] font-bold hover:underline flex items-center space-x-1">
                  <span>Xem tất cả</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              {filteredPlaying.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {filteredPlaying.map((movie) => (
                    <MovieCardPlaying key={movie.id} movie={movie} onSelectMovie={(m) => setSelectedMovie(m)} onBookMovie={handleQuickBookMovie} />
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-white/10 rounded-2xl text-center text-[#BDBDBD] text-xs flex flex-col items-center justify-center space-y-4">
                  <p>Không tìm thấy bộ phim đang trình chiếu nào khớp bộ lọc yêu cầu hoặc danh mục khả dụng.</p>
                  <button onClick={handleRestoreDefaults} className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C8102E]/20">
                    Khôi phục dữ liệu phim mặc định
                  </button>
                </div>
              )}
            </section>

            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
              <div className="border-b border-white/5 pb-4.5 mb-8 text-left">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center space-x-2">
                  <Film className="w-5 h-5 text-amber-500" />
                  <span>Phim Sắp Trình Chiếu</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-[#BDBDBD] font-sans font-normal mt-1">
                  Đồng hồ countdown đếm ngược kéo rèm khởi nguyên rạp X Cinema. Phóng hờ xem trailer ngập tiếng!
                </p>
              </div>
              {filteredUpcoming.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredUpcoming.map((movie) => (
                    <MovieCardUpcoming key={movie.id} movie={movie} onSelectMovie={(m) => setSelectedMovie(m)} />
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-white/10 rounded-2xl text-center text-[#BDBDBD] text-xs flex flex-col items-center justify-center space-y-4">
                  <p>Không tìm thấy bộ phim sắp công chiếu đặc biệt nào khớp bộ lọc hoặc danh mục.</p>
                  <button onClick={handleRestoreDefaults} className="px-5 py-2.5 bg-[#C8102E] hover:bg-red-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#C8102E]/20">
                    Khôi phục dữ liệu phim mặc định
                  </button>
                </div>
              )}
            </section>
          </div>
        );

      case "movies":
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn text-left">
            <h2 className="text-2xl font-black text-white uppercase border-l-4 border-[#C8102E] pl-3.5 mb-8">
              KHO THƯ VIỆN PHIM X CINEMA ({movies.length} Tác phẩm)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 items-center">
              <div className="flex flex-wrap gap-2">
                {["Tất Cả", "Hành Động", "Tâm Lý", "Kinh Dị", "Hoạt Hình", "Gia Đình"].map((genre) => (
                  <button key={genre} onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition ${selectedGenre === genre ? "bg-[#C8102E] text-white" : "bg-[#1E1E1E] text-[#BDBDBD] hover:text-white"}`}>
                    {genre}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input type="text" placeholder="Nhập tên phim, thể loại, đạo diễn..." value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1E1E1E] text-white text-xs placeholder-[#BDBDBD]/50 pl-10 pr-12 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] transition" />
                <Search className="w-4 h-4 text-[#BDBDBD]/65 absolute left-3.5 top-3.5" />
                {searchQuery && (
                  <button onClick={() => { setSearchQuery(""); setSelectedGenre("Tất Cả"); }}
                    className="absolute right-3 top-2 px-2 py-1 text-white hover:bg-red-700 text-[10px] font-bold bg-[#C8102E] rounded transition">
                    Quay lại
                  </button>
                )}
              </div>
            </div>
            {(searchQuery || selectedGenre !== "Tất Cả") && (
              <div className="mb-6 p-3 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
                <span>
                  Đang lọc bộ phim theo:{" "}
                  {searchQuery && <span>từ khoá <strong className="text-white">"{searchQuery}"</strong></span>}
                  {searchQuery && selectedGenre !== "Tất Cả" && <span> và </span>}
                  {selectedGenre !== "Tất Cả" && <span>thể loại <strong className="text-white">"{selectedGenre}"</strong></span>}
                </span>
                <button onClick={() => { setSearchQuery(""); setSelectedGenre("Tất Cả"); }}
                  className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                  Xoá toàn bộ lọc
                </button>
              </div>
            )}
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#C8102E] animate-pulse" />
              <span>Phim Đang chiếu ({filteredPlaying.length})</span>
            </h3>
            {filteredPlaying.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-14">
                {filteredPlaying.map((m) => <MovieCardPlaying key={m.id} movie={m} onSelectMovie={(movie) => setSelectedMovie(movie)} onBookMovie={handleQuickBookMovie} />)}
              </div>
            ) : <p className="text-xs text-[#BDBDBD] italic py-6">Không tìm thấy phim đang chiếu tương ứng.</p>}
            <h3 className="text-base font-bold text-white uppercase tracking-wider mb-6 flex items-center space-x-2">
              <Film className="w-5 h-5 text-amber-500" />
              <span>Phim Sắp chiếu ({filteredUpcoming.length})</span>
            </h3>
            {filteredUpcoming.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredUpcoming.map((m) => <MovieCardUpcoming key={m.id} movie={m} onSelectMovie={(movie) => setSelectedMovie(movie)} />)}
              </div>
            ) : <p className="text-xs text-[#BDBDBD] italic py-6">Không tìm thấy phim sắp chiếu tương ứng.</p>}
          </div>
        );

      case "cinemas":
        return <CinemasView cinemas={cinemas} movies={movies} showtimes={showtimes} onSelectMovie={(m) => setSelectedMovie(m)} />;

      case "promotions":
        return <PromosNewsView promotions={promotionsList} news={newsList} initialMode="promotions" />;

      case "news":
        return <PromosNewsView promotions={promotionsList} news={newsList} initialMode="news" />;

      case "security":
        return <SecurityPolicyView />;

      case "auth":
      case "profile":
        if (!userProfile) {
          return (
            <AuthView
              accounts={accounts}
              currentProfile={userProfile}
              operatorProfile={operatorProfile}
              onLogin={(usr) => {
                if (usr.role === "admin" || usr.role === "employee") {
                  setOperatorProfile(usr);
                  setUserProfile(null);
                  setAppMode(usr.role as "admin" | "employee");
                } else {
                  setUserProfile(usr);
                  setOperatorProfile(null);
                  setAppMode("customer");
                  navigateToTab("home");
                  bookingApi.getByUser(usr.email)
                    .then((userBookings) => {
                      if (userBookings.length > 0) {
                        setBookings((prev) => {
                          const others = prev.filter((b) => b.userEmail?.toLowerCase() !== usr.email.toLowerCase());
                          return [...userBookings, ...others];
                        });
                      }
                    })
                    .catch((err) => console.warn("Không tải được lịch sử vé:", err));
                }
              }}
              onRegister={(newAcc) => setAccounts((prev) => [...prev, newAcc])}
              onLogout={() => { setUserProfile(null); setAppMode("customer"); navigateToTab("home"); }}
              onLogoutOperator={() => { setOperatorProfile(null); setAppMode("customer"); navigateToTab("auth"); }}
            />
          );
        }
        return (
          <div className="space-y-6">
            <UserProfileView
              user={userProfile}
              bookings={bookings}
              allMovies={movies}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onOpenTicket={(bk) => {
                setActiveBooking({
                  movie: movies.find((mv) => mv.title === bk.movieTitle) || movies[0],
                  showtime: showtimes[0],
                  step: "ticket",
                  selectedSeats: bk.seats,
                  totalAmount: bk.totalAmount,
                  activeTicket: bk,
                });
              }}
              onToggleFavorite={toggleFavoriteMovie}
              onSwitchMode={setAppMode}
            />
            <div className="max-w-4xl mx-auto px-4 text-center">
              <button
                onClick={() => { setUserProfile(null); setAppMode("customer"); navigateToTab("auth"); }}
                className="px-6 py-2 rounded-xl bg-zinc-900 border border-white/5 hover:bg-rose-950/40 hover:border-rose-500/30 text-zinc-400 hover:text-rose-400 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                🚪 ĐĂNG XUẤT TÀI KHOẢN
              </button>
            </div>
          </div>
        );

      case "admin":
        return (
          <AdminPanel
            movies={movies} setMovies={setMovies}
            showtimes={showtimes} setShowtimes={setShowtimes}
            bookings={bookings} setBookings={setBookings}
            onRefreshBookings={refreshBookingsFromServer}
            promotionsList={promotionsList} setPromotionsList={setPromotionsList}
            newsList={newsList} setNewsList={setNewsList}
            cinemas={cinemas}
            onRestoreDefaults={handleRestoreDefaults}
            comboDeals={comboDeals} setComboDeals={setComboDeals}
            accounts={accounts} setAccounts={setAccounts}
          />
        );

      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="bg-[#121212] min-h-screen text-white font-sans flex flex-col justify-between selection:bg-[#C8102E] selection:text-white">
      <UserProfileAccountSync />
      <div>
        {/* ── Admin mode ── */}
        {appMode === "admin" ? (
          <main className="min-h-screen">
            <div className="bg-[#1C1917]/30 border-b border-white/5 p-4 text-xs flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-red-950/20 to-stone-900 border-l-4 border-l-[#C8102E] gap-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-[#C8102E]" />
                <span className="font-extrabold text-[#C8102E] tracking-tight">VÙNG QUẢN TRỊ AN TOÀN — ADMIN WORKSPACE</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setAppMode("customer"); navigateToTab("home"); }}
                  className="px-4 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold transition text-[11px] uppercase tracking-wider border border-white/5 cursor-pointer">
                  ← TRANG KHÁCH
                </button>
                <button onClick={() => { setOperatorProfile(null); setAppMode("customer"); navigateToTab("auth"); }}
                  className="px-4 py-1.5 rounded-lg bg-[#C8102E] hover:bg-red-700 text-white font-extrabold transition text-[11px] uppercase tracking-wider shadow-lg shadow-[#C8102E]/25 cursor-pointer flex items-center gap-1.5">
                  <span>Đăng xuất 🚪</span>
                </button>
              </div>
            </div>
            <AdminPanel
              movies={movies} setMovies={setMovies}
              showtimes={showtimes} setShowtimes={setShowtimes}
              bookings={bookings} setBookings={setBookings}
              onRefreshBookings={refreshBookingsFromServer}
              promotionsList={promotionsList} setPromotionsList={setPromotionsList}
              newsList={newsList} setNewsList={setNewsList}
              cinemas={cinemas}
              onRestoreDefaults={handleRestoreDefaults}
              comboDeals={comboDeals} setComboDeals={setComboDeals}
              accounts={accounts} setAccounts={setAccounts}
            />
          </main>

        ) : appMode === "employee" ? (
          /* ── Staff mode ── */
          <main className="min-h-screen bg-[#121212]">
            <div className="bg-[#1C1613] border-b border-white/5 p-4 text-xs flex flex-col sm:flex-row justify-between items-center bg-gradient-to-r from-amber-950/20 to-zinc-900 border-l-4 border-l-amber-500 gap-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping mr-1"></span>
                <span className="font-extrabold text-amber-500 tracking-tight">CỔNG VẬN HÀNH SẢNH — STAFF WORKSPACE CENTRAL</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setAppMode("customer"); navigateToTab("home"); }}
                  className="px-4 py-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold transition text-[11px] uppercase tracking-wider border border-white/5 cursor-pointer">
                  ← TRANG KHÁCH
                </button>
                <button onClick={() => { setOperatorProfile(null); setAppMode("customer"); navigateToTab("auth"); }}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-extrabold transition text-[11px] uppercase tracking-wider shadow-lg shadow-amber-500/25 cursor-pointer flex items-center gap-1.5">
                  <span>Đăng xuất 🚪</span>
                </button>
              </div>
            </div>
            <StaffPortal
              movies={movies} showtimes={showtimes}
              bookings={bookings} setBookings={setBookings}
              onRefreshBookings={refreshBookingsFromServer}
              cinemas={cinemas} comboDeals={comboDeals}
            />
          </main>

        ) : (
          /* ── Customer mode ── */
          <>
            <Header
              activeTab={activeTab}
              setActiveTab={(tab) => navigateToTab(tab)}
              user={userProfile}
              searchQuery={searchQuery}
              setSearchQuery={(q) => {
                setSearchQuery(q);
                if (q.trim() !== "" && activeTab !== "movies") navigateToTab("movies");
              }}
              operatorProfile={operatorProfile}
              onSwitchToOperator={() => { if (operatorProfile) setAppMode(operatorProfile.role as "admin" | "employee"); }}
            />

            {(activeTab !== "home" || activeBooking || selectedMovie) && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 animate-fadeIn text-left">
                <div className="flex items-center justify-between bg-[#19191a] border border-white/5 px-4 py-3 rounded-xl text-xs backdrop-blur-md">
                  <div className="flex items-center space-x-2 text-zinc-400 select-none">
                    <button onClick={handleGoBack}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#C8102E] hover:bg-red-700 text-white font-extrabold uppercase tracking-wider text-[10px] transition cursor-pointer shadow-md shadow-[#C8102E]/20">
                      <span>← Quay Lại</span>
                    </button>
                    <span className="text-zinc-700 font-sans">|</span>
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px] font-sans">Bạn đang ở:</span>
                    <span className="text-rose-500 font-black uppercase text-[10px] tracking-wide font-sans">
                      {selectedMovie ? `Chi tiết: ${selectedMovie.title}` :
                        activeBooking ? `Đặt vé: ${activeBooking.movie.title} (${activeBooking.step === "seats" ? "Chọn Ghế" : activeBooking.step === "payment" ? "Thanh Toán" : "Vé điện tử"})` :
                        activeTab === "movies" ? "Kho thư viện phim" :
                        activeTab === "cinemas" ? "Hệ thống Chi Nhánh" :
                        activeTab === "promotions" ? "Khuyến Mãi Quà Tặng" :
                        activeTab === "news" ? "Tin Tức Sự Kiện" :
                        activeTab === "security" ? "Chính Sách & Bảo An" :
                        activeTab === "profile" ? "Hồ Sơ Cá Nhân" : "Hội Sảnh X Cinema"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "home" && !activeBooking && !selectedMovie && (
              <div className="w-full animate-fadeIn mb-5">
                <HeroBanner movies={movies} onSelectMovie={(m) => setSelectedMovie(m)} onBookMovie={handleQuickBookMovie} />
              </div>
            )}

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-5">
              <div className="flex flex-col xl:flex-row items-start gap-6">
                <div className="flex-1 min-w-0 w-full">
                  <main className="pb-12 min-h-[500px]">
                    {renderMainContent()}
                  </main>
                </div>

                {!activeBooking && !selectedMovie && (
                  <aside className="hidden xl:flex flex-col w-[300px] shrink-0 sticky top-24 space-y-6 self-start text-left">
                    <div className="bg-[#131212]/95 border border-white/5 p-5 rounded-3xl space-y-4 shadow-xl text-left select-none animate-fadeIn">
                      <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Top Phim Ưa Chuộng</h4>
                      </div>
                      <div className="space-y-3.5 pt-1">
                        {movies.filter((mt) => !mt.isUpcoming).slice(0, 3).map((mt) => (
                          <div key={mt.id} className="bg-[#191818]/80 hover:bg-[#1C1A1A] border border-white/5 rounded-2xl p-3 flex items-center space-x-3 hover:border-red-500/20 hover:shadow-lg transition-all duration-300">
                            <img src={mt.posterUrl} alt={mt.title} className="w-12 h-[64px] rounded-xl object-cover bg-neutral-800 shrink-0 shadow border border-white/5" />
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-[64px] py-0.5">
                              <div>
                                <h5 className="text-[10px] font-black text-white hover:text-[#C8102E] transition-colors truncate uppercase leading-tight tracking-wide">{mt.title}</h5>
                                <div className="flex items-center space-x-1 mt-1">
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                  <span className="text-[10px] text-amber-500 font-bold font-mono">{mt.score.toFixed(1)}/10</span>
                                </div>
                              </div>
                              <button onClick={() => handleQuickBookMovie(mt)}
                                className="w-full bg-[#C8102E] hover:bg-rose-750 text-white font-black text-[9px] uppercase tracking-wider rounded-lg py-1 px-3 transition-all duration-200 cursor-pointer text-center">
                                ⚡ Vé Nhanh
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#131212]/95 border border-white/5 p-5 rounded-3xl space-y-4 shadow-xl text-left select-none">
                      <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
                        <HeartHandshake className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-white">Yêu Cầu Trợ Giúp Nhanh</h4>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] text-[#BDBDBD] font-sans font-medium leading-relaxed">
                          Đặc quyền khi kết nối cổng Laser 2026 chính hãng hỗ trợ phản hồi trong vòng 60 giây.
                        </p>
                        <div className="space-y-2.5">
                          <button onClick={() => setGlobalAlert("Hệ thống tổng đài kết nối di động đang phát tín hiệu chuyển hướng cuộc gọi! Quý khách có thể trực tiếp liên lạc với nhóm CSKH Laser qua đường dây nóng: 1900.2288 bất cứ lúc nào.")}
                            className="w-full py-2.5 bg-[#0F5132] hover:bg-[#146c43] text-white font-black tracking-wider uppercase rounded-full transition-all duration-200 cursor-pointer text-[10px] flex items-center justify-center space-x-1.5 shadow">
                            <span>☎ Gọi CSKH Trực Tuyến</span>
                          </button>
                          <button onClick={() => navigateToTab("cinemas")}
                            className="w-full py-2.5 bg-[#212529]/80 hover:bg-[#2c3034] text-zinc-300 hover:text-white font-black tracking-wider uppercase border border-white/5 rounded-full transition-all duration-200 cursor-pointer text-[10px] flex items-center justify-center space-x-1.5 shadow">
                            <span>📍 Chi nhánh & Điện thoại chi tiết</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2.5 pt-1">
                      <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-[#1B1A1A] hover:bg-[#242323] text-zinc-300 hover:text-white border border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-wide transition duration-200 cursor-pointer shadow-md">
                        <ArrowUp className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Trở về đỉnh trang</span>
                      </button>
                      <button onClick={handleRestoreDefaults}
                        className="w-full py-2.5 bg-transparent hover:bg-red-500/5 text-zinc-650 hover:text-red-400 font-bold text-[9px] uppercase tracking-widest rounded-xl transition inline-block text-center border border-dashed border-zinc-800 hover:border-red-500/10 cursor-pointer">
                        Tải lại dữ liệu hệ thống mẫu (Reset)
                      </button>
                    </div>
                  </aside>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Footer ── */}
      {appMode === "customer" && (
        <footer className="bg-[#1E1E1E]/95 border-t border-white/5 py-12 px-4 sm:px-6 lg:px-8 text-left select-none">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 bg-gradient-to-tr from-[#C8102E] to-rose-600 rounded-lg flex items-center justify-center">
                  <span className="font-serif italic font-black text-base text-white">X</span>
                </div>
                <span className="font-sans font-black text-lg tracking-tight text-white block">
                  <span className="font-serif italic font-black text-xl text-rose-500 mr-0.5">X</span><span className="text-[#C8102E]">CINEMA</span>
                </span>
              </div>
              <p className="text-xs text-[#BDBDBD] leading-relaxed max-w-xs font-normal">
                Hệ thống rạp chiếu bóng cao cấp tiêu chuẩn kỹ nghệ Laser thế hệ mới. Trải nghiệm điện ảnh đỉnh cao, sang trọng, mang tình mẫu tử gia đình xích lại gần nhau rạng rỡ.
              </p>
            </div>
            <div>
              <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">Danh mục rạp</h4>
              <ul className="space-y-2 text-xs text-[#BDBDBD] font-semibold">
                <li><button onClick={() => navigateToTab("home")} className="hover:text-white transition">Hội sảnh chính</button></li>
                <li><button onClick={() => navigateToTab("movies")} className="hover:text-white transition">Tổng kho phim</button></li>
                <li><button onClick={() => navigateToTab("cinemas")} className="hover:text-white transition">Bản đồ chi nhánh</button></li>
                <li><button onClick={() => navigateToTab("promotions")} className="hover:text-white transition">Khuyến mãi & Tin tức</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">Chính sách bảo an</h4>
              <ul className="space-y-2 text-xs text-[#BDBDBD] font-semibold">
                <li><button onClick={() => navigateToTab("security")} className="hover:text-white text-left transition">Điều khoản sử dụng</button></li>
                <li><button onClick={() => navigateToTab("security")} className="hover:text-white text-left transition">Chính sách bảo mật quyền lợi</button></li>
                <li><button onClick={() => navigateToTab("security")} className="hover:text-white text-left transition">Quy chế đổi vé / Hoàn tiền</button></li>
                <li><button onClick={() => navigateToTab("security")} className="hover:text-white text-left transition">Bảo tài an toàn trẻ em</button></li>
              </ul>
            </div>
            <div className="space-y-3.5">
              <h4 className="text-white text-xs font-extrabold uppercase tracking-widest mb-4">CSKH Liên Hệ</h4>
              <div className="text-xs text-[#BDBDBD] space-y-1.5 font-normal">
                <p><span className="text-[#C8102E] font-bold mr-1">Hotline:</span> 1900.2288 (8:00 - 22:00)</p>
                <p className="truncate"><span className="text-[#C8102E] font-bold mr-1">Email:</span> cskh@tcdecinema.com.vn</p>
                <p className="truncate"><span className="text-[#C8102E] font-bold mr-1">HQ:</span> Tràng Tiền, Quận Hoàn Kiếm, Hà Nội</p>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-zinc-500 font-bold uppercase gap-4">
            <span>Khẩu hiệu rạp: "Trải nghiệm điện ảnh đỉnh cao" - X Cinema</span>
            <span>BẢN QUYỀN THỜI KỲ © 2026 X CINEMA SYSTEMS LIMITED. ALL RIGHTS RESERVED.</span>
          </div>
        </footer>
      )}

      {/* ── Global Alert ── */}
      {globalAlert && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#1E1E1E] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 animate-slideUp text-center">
            <div className="inline-flex p-3 bg-[#C8102E]/10 border border-[#C8102E]/20 text-red-500 rounded-full">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-white text-base font-bold tracking-tight uppercase">Thông Báo Hệ thống X Cinema</h3>
            <p className="text-[#BDBDBD] text-xs leading-relaxed font-sans">{globalAlert}</p>
            <button onClick={() => setGlobalAlert(null)}
              className="w-full py-2.5 rounded-xl bg-[#C8102E] hover:bg-[#a60d26] text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer">
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sync userProfile changes → accounts list (giống useEffect gốc) ──────────
// Đặt ở đây vì cần cả useAuth() lẫn useBooking() cùng lúc.
function UserProfileAccountSync() {
  const { userProfile } = useAuth();
  const { setAccounts } = useBooking();

  useEffect(() => {
    if (!userProfile) return;
    setAccounts((prev) =>
      prev.map((acc) => {
        const accPhone = (acc.phone || "").replace(/[^0-9]/g, "");
        const userPhone = (userProfile.phone || "").replace(/[^0-9]/g, "");
        if (accPhone === userPhone || acc.email.trim().toLowerCase() === userProfile.email.trim().toLowerCase()) {
          return {
            ...acc,
            points: userProfile.points,
            favoriteMovies: userProfile.favoriteMovies,
            name: userProfile.name,
            avatar: userProfile.avatar,
            email: userProfile.email,
            phone: userProfile.phone,
          };
        }
        return acc;
      })
    );
  }, [userProfile]);

  return null;
}
