/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Search, CheckCircle2, Coffee, Film, QrCode, UserCheck, 
  Smile, Power, Ticket, MapPin, TrendingUp, XCircle, 
  Tv, Calendar, Sparkles, Clock, Check, RefreshCw,
  Plus, Minus, ShoppingBag, Store, Armchair, CreditCard,
  Wallet, Banknote, ArrowLeft, User
} from "lucide-react";
import { Movie, Cinema, Showtime, Booking, ComboItem } from "../types";
import SeatMap from "../components/booking/SeatMap";
import { useAdminBookingEvents } from "../services/useWebSocket";

interface StaffPortalProps {
  movies: Movie[];
  showtimes: Showtime[];
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  onRefreshBookings?: () => void | Promise<void>;
  cinemas: Cinema[];
  comboDeals?: ComboItem[];
}

export default function StaffPortal({
  movies,
  showtimes,
  bookings,
  setBookings,
  onRefreshBookings,
  cinemas,
  comboDeals = [],
}: StaffPortalProps) {
  // Staff configuration and active shifts
  const [selectedStaffCinema, setSelectedStaffCinema] = useState<string>(() => {
    return cinemas[0]?.id || "";
  });
  const [staffName] = useState("Nguyễn Minh Anh");
  const [staffRole] = useState("Trưởng Nhóm Kiểm Vé & CSKH 🎖️");
  const [shiftTime] = useState("Ca sáng (08:00 - 16:00)");

  // Tab state: checkin mode, calling popcorn mode, or counter ticket booking mode
  const [activeSubTab, setActiveSubTab] = useState<"checkin" | "counter-food" | "counter-booking">("checkin");

  // ===== Bán Vé Tại Quầy (Counter Ticket Booking) states =====
  type CounterStep = "movie" | "showtime" | "seats" | "checkout" | "done";
  const [counterStep, setCounterStep] = useState<CounterStep>("movie");
  const [counterMovie, setCounterMovie] = useState<Movie | null>(null);
  const [counterShowtime, setCounterShowtime] = useState<Showtime | null>(null);
  const [counterSeats, setCounterSeats] = useState<string[]>([]);
  const [counterCombos, setCounterCombos] = useState<{ id: string; name: string; price: number; quantity: number }[]>([]);
  const [counterTotal, setCounterTotal] = useState(0);
  const [counterMovieSearch, setCounterMovieSearch] = useState("");
  const [counterCustomerName, setCounterCustomerName] = useState("");
  const [counterCustomerPhone, setCounterCustomerPhone] = useState("");
  const [counterPaymentMethod, setCounterPaymentMethod] = useState<"Tiền mặt" | "Thẻ / Quẹt máy POS" | "Chuyển khoản QR">("Tiền mặt");
  const [counterCompletedTicket, setCounterCompletedTicket] = useState<Booking | null>(null);

  const resetCounterFlow = () => {
    setCounterStep("movie");
    setCounterMovie(null);
    setCounterShowtime(null);
    setCounterSeats([]);
    setCounterCombos([]);
    setCounterTotal(0);
    setCounterCustomerName("");
    setCounterCustomerPhone("");
    setCounterPaymentMethod("Tiền mặt");
    setCounterCompletedTicket(null);
  };

  // Counter bắp nước states
  const [foodCart, setFoodCart] = useState<Record<string, number>>({});
  const [orderType, setOrderType] = useState<"retail" | "assign">("retail");
  const [retailPhone, setRetailPhone] = useState("");
  const [retailName, setRetailName] = useState("");
  const [targetBookingIdForFood, setTargetBookingIdForFood] = useState("");
  const [foodSearchQuery, setFoodSearchQuery] = useState("");

  // Local state for searching tickets
  const [searchPhrase, setSearchPhrase] = useState("");
  const [searchedBooking, setSearchedBooking] = useState<Booking | null>(null);
  
  // Alert message banner / toast values
  const [notification, setNotification] = useState<{
    msg: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // Scanner Simulator controls
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success">("idle");
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [recentRedemptions, setRecentRedemptions] = useState<string[]>([]);

  // Show status banner Helper
  const triggerToast = (msg: string, type: "success" | "error" | "info") => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.msg === msg ? null : prev));
    }, 4500);
  };

  // Real-time: nghe sự kiện đơn vé mới / cập nhật từ backend C++ qua WebSocket,
  // hữu ích khi nhiều nhân viên cùng trực quầy (vd: nhân viên A vừa bán vé tại
  // quầy, nhân viên B đang soát vé thấy ngay đơn mới mà không cần bấm làm mới).
  useAdminBookingEvents(async (evt) => {
    if (evt.type === "new_booking") {
      const title = evt.movieTitle || evt.booking?.movieTitle || "";
      triggerToast(`🎟️ Có đơn vé mới: ${title}`, "info");
    }
    if (onRefreshBookings) {
      try {
        await onRefreshBookings();
      } catch (err) {
        console.warn("Không thể tải lại danh sách vé sau sự kiện real-time:", err);
      }
    }
  });

  // 1. Search booking handler
  const handleSearchTicket = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchPhrase.trim().toUpperCase();
    if (!query) {
      triggerToast("Vui lòng nhập Mã Vé (VD: XC-...) hoặc Số điện thoại!", "info");
      return;
    }

    // Find in global bookings list
    const found = bookings.find(
      (b) => b.code.toUpperCase() === query || 
             b.paymentMethod.toLowerCase().includes(query.toLowerCase()) || 
             b.seats.join(",").includes(query)
    );

    if (found) {
      setSearchedBooking(found);
      triggerToast("Tìm thấy giao dịch đặt vé thành công!", "success");
    } else {
      setSearchedBooking(null);
      triggerToast("Không phát hiện giao dịch vé tương thích. Thử lại mã khác!", "error");
    }
  };

  // 2. Perform Quick validation checking
  const handleCheckInTicket = (bookingId: string) => {
    setBookings((prev) => {
      return prev.map((b) => {
        if (b.id === bookingId) {
          const alreadyCheckedIn = b.isCheckedIn;
          const updated = { ...b, isCheckedIn: !alreadyCheckedIn };
          
          if (!alreadyCheckedIn) {
            triggerToast("Soát vé thành công! Khách hàng được phép vào phòng chiếu.", "success");
            setRecentRedemptions((prevLogs) => [
              `[VÉ ENTRY] Thành công vé ${b.code} - lúc ${new Date().toLocaleTimeString()}`,
              ...prevLogs,
            ]);
          } else {
            triggerToast("Đã hoàn tác xác thực vé về trạng thái chưa soát.", "info");
          }
          
          // Update searched booking view in real-time
          if (searchedBooking && searchedBooking.id === bookingId) {
            setSearchedBooking(updated);
          }
          return updated;
        }
        return b;
      });
    });
  };

  // 3. Perform Popcorn/Combo food redeem validation
  const handleRedeemCombo = (bookingId: string) => {
    setBookings((prev) => {
      return prev.map((b) => {
        if (b.id === bookingId) {
          const alreadyRedeemed = b.isComboRedeemed;
          const updated = { ...b, isComboRedeemed: !alreadyRedeemed };

          if (!alreadyRedeemed) {
            triggerToast("Cung cấp Combo thành công! Đã trừ bắp nước ra khỏi hệ thống.", "success");
            setRecentRedemptions((prevLogs) => [
              `[COMBO] Khách lấy bắp nước vé ${b.code} - lúc ${new Date().toLocaleTimeString()}`,
              ...prevLogs,
            ]);
          } else {
            triggerToast("Cập nhật: Mở khoá khôi phục bắp nước.", "info");
          }

          // Update searched booking view on the fly
          if (searchedBooking && searchedBooking.id === bookingId) {
            setSearchedBooking(updated);
          }
          return updated;
        }
        return b;
      });
    });
  };

  // Simulate a live QR Code scanner camera sweep
  const triggerQuickScan = (booking: Booking) => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("success");
      setSearchedBooking(booking);
      setSearchPhrase(booking.code);
      
      // Auto-validate ticket checkin
      setBookings((prev) => {
        return prev.map((b) => {
          if (b.id === booking.id) {
            if (!b.isCheckedIn) {
              setRecentRedemptions((prevLogs) => [
                `[QUÉT QR] Auto-CheckIn vé ${b.code} - lúc ${new Date().toLocaleTimeString()}`,
                ...prevLogs,
              ]);
              return { ...b, isCheckedIn: true };
            }
          }
          return b;
        });
      });

      // Synchronize back if search matches
      setSearchedBooking(prev => prev ? { ...prev, isCheckedIn: true } : null);

      triggerToast(`Quét tự động mã QR thành công cho vé: ${booking.code}`, "success");
      setTimeout(() => {
        setShowScannerModal(false);
        setScanState("idle");
      }, 1000);
    }, 1200);
  };

  // Get active local stats for selected cinema
  const staffCinemaName = cinemas.find(c => c.id === selectedStaffCinema)?.name || "Chi Nhánh";
  const filteredBookings = bookings.filter(b => b.cinemaName === staffCinemaName);
  const checkedInCount = filteredBookings.filter(b => b.isCheckedIn).length;
  const comboRedeemedCount = filteredBookings.filter(b => b.isComboRedeemed).length;
  const totalVolume = filteredBookings.length;

  const activeCinemaShowtimes = showtimes.filter(s => s.cinemaId === selectedStaffCinema);

  // Movies that have at least one showtime today at the selected cinema (counter-booking step 1)
  const counterAvailableMovies = movies.filter(
    (m) => !m.isUpcoming && activeCinemaShowtimes.some((st) => st.movieId === m.id)
  ).filter((m) => {
    const q = counterMovieSearch.trim().toLowerCase();
    if (!q) return true;
    return m.title.toLowerCase().includes(q);
  });

  const counterMovieShowtimes = counterMovie
    ? activeCinemaShowtimes.filter((st) => st.movieId === counterMovie.id)
    : [];

  // 4. Finalize counter sale: create a brand new Booking record sold at the counter
  const handleConfirmSeatsAtCounter = (
    seats: string[],
    total: number,
    combos?: { id: string; name: string; price: number; quantity: number }[]
  ) => {
    setCounterSeats(seats);
    setCounterTotal(total);
    setCounterCombos(combos || []);
    setCounterStep("checkout");
  };

  const handleFinalizeCounterSale = () => {
    if (!counterMovie || !counterShowtime || counterSeats.length === 0) {
      triggerToast("Thiếu thông tin ghế hoặc suất chiếu. Vui lòng thực hiện lại từ đầu.", "error");
      return;
    }

    const dateNonce = Date.now().toString().slice(-4);
    const code = `XC-COUNTER-${dateNonce}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${code}`;

    const newTicket: Booking = {
      id: `b-counter-${Date.now()}`,
      movieTitle: counterMovie.title,
      moviePoster: counterMovie.posterUrl,
      cinemaName: staffCinemaName,
      showDate: counterShowtime.date,
      showTime: counterShowtime.time,
      room: counterShowtime.room,
      format: counterShowtime.format,
      seats: counterSeats,
      totalAmount: counterTotal,
      paymentMethod: `${counterPaymentMethod} (Bán tại quầy)${counterCustomerPhone ? " - SĐT: " + counterCustomerPhone : ""}${counterCustomerName ? " - " + counterCustomerName : ""}`,
      code: code,
      qrCodeUrl: qrCodeUrl,
      bookingTime: new Date().toISOString(),
      combos: counterCombos,
      isCheckedIn: false,
      isComboRedeemed: false,
    };

    setBookings((prev) => [newTicket, ...prev]);

    setRecentRedemptions((prevLogs) => [
      `[BÁN VÉ QUẦY] Vé ${newTicket.code} - ${counterMovie.title} (${counterSeats.join(", ")}) - ${counterPaymentMethod} - lúc ${new Date().toLocaleTimeString()}`,
      ...prevLogs,
    ]);

    triggerToast(`Đã xuất vé thành công cho khách! Mã vé: ${newTicket.code}`, "success");
    setCounterCompletedTicket(newTicket);
    setCounterStep("done");
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-xs text-zinc-300 antialiased font-sans animate-fadeIn">
      {/* 1. Portal header info workspace banner */}
      <div className="bg-gradient-to-r from-amber-950/20 via-[#1C1917]/70 to-[#121212] border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none scale-150">
          <Tv className="w-24 h-24 text-amber-500" />
        </div>
        
        <div className="space-y-2 text-left z-10">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 roundedbg rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest animate-pulse">
              CỔNG NHÂN VIÊN (STAFF PORTAL)
            </span>
            <span className="text-[10px] text-zinc-500 block font-mono">ID: {selectedStaffCinema || "TCD-MAIN"}</span>
          </div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
            XIN CHÀO, <span className="text-amber-500 px-1">{staffName}</span> 🚪
          </h2>
          <p className="text-[11px] text-zinc-400">
            Nơi quản lý công việc vận hành, soát vé khách hàng khi vào rạp và phân phối quà combo bắp nước an toàn.
          </p>
        </div>

        {/* Selected cinema workspace supervisor selector */}
        <div className="bg-black/50 border border-white/5 p-3 rounded-xl flex items-center space-x-2.5 z-10 text-left min-w-[260px]">
          <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <span className="block text-[8px] text-zinc-500 font-extrabold uppercase">ĐỊA ĐIỂM TRỰC NƠI SẢNH</span>
            <select
              value={selectedStaffCinema}
              onChange={(e) => setSelectedStaffCinema(e.target.value)}
              className="w-full bg-transparent text-white font-bold font-sans text-xs outline-none border-none py-0.5 cursor-pointer"
            >
              {cinemas.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#121212] text-white py-1">
                  {c.name.replace("X Cinema ", "")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shifts Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { title: "Mã Nhân Viên", value: "EMP-XCN-85920", desc: `${staffRole}`, color: "text-amber-500" },
          { title: "Phiên Đăng Ký", value: `${shiftTime}`, desc: "Hết phiên lúc 16:00 hôm nay", color: "text-zinc-300" },
          { title: "Số Vé Đã Soát (Checkin)", value: `${checkedInCount} / ${totalVolume} vé`, desc: "Trong ca trực hôm nay tại sảnh", color: "text-green-400" },
          { title: "Gói Combo Đã Trao", value: `${comboRedeemedCount} phần combo`, desc: "Đã giao cho các khách hàng đặt trước", color: "text-emerald-400" },
        ].map((item, idx) => (
          <div key={idx} className="bg-[#161515] border border-white/5 p-4 rounded-xl text-left space-y-1">
            <span className="text-[9px] text-zinc-500 font-extrabold uppercase block">{item.title}</span>
            <span className={`text-sm font-black block tracking-tight ${item.color}`}>{item.value}</span>
            <span className="text-[10px] text-zinc-400 block truncate">{item.desc}</span>
          </div>
        ))}
      </div>

      {/* 1.5 Sub-Tab Switcher for Employee Modes */}
      <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-white/5 max-w-xl">
        <button
          type="button"
          onClick={() => setActiveSubTab("checkin")}
          className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all gap-2 flex items-center justify-center cursor-pointer ${
            activeSubTab === "checkin"
              ? "bg-[#C8102E] text-white shadow-lg shadow-[#C8102E]/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Soát Vé Sảnh 🎟️</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubTab("counter-booking");
            resetCounterFlow();
          }}
          className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all gap-2 flex items-center justify-center cursor-pointer ${
            activeSubTab === "counter-booking"
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Armchair className="w-4 h-4" />
          <span>Bán Vé Tại Quầy 🛒</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("counter-food")}
          className={`flex-1 py-1 px-2 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all gap-2 flex items-center justify-center cursor-pointer ${
            activeSubTab === "counter-food"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Gọi Bắp Nước 🍿</span>
        </button>
      </div>

      {/* 2. Interactive Toast notifications inside panel */}
      {notification && (
        <div className={`p-3.5 rounded-xl border flex items-center justify-between text-left ${
          notification.type === "success" 
            ? "bg-green-500/10 border-green-500/35 text-green-300" 
            : notification.type === "error"
            ? "bg-red-500/10 border-red-500/35 text-red-300"
            : "bg-blue-500/10 border-blue-500/35 text-blue-300"
        }`}>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 animate-spin-slow flex-shrink-0" />
            <span className="font-semibold">{notification.msg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setNotification(null)}
            className="text-zinc-500 hover:text-white px-2 py-1 font-mono text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. CORE VALIDATION WORKSPACE */}
      {activeSubTab === "checkin" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COMPONENT (COL 7): SEARCH TICKET & INTERACTIVE TICKET DETAILS SCREEN */}
        <div className="lg:col-span-7 bg-[#161515] rounded-2xl border border-white/5 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-amber-500" />
                SOÁT VÉ & ĐỐI SOÁT DỊCH VỤ KHÁCH HÀNG
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">Tìm mã vé QR in trên điện thoại khách hàng hoặc sử dụng cổng giả quét mô phỏng.</p>
            </div>
            
            <button
              onClick={() => setShowScannerModal(true)}
              className="flex items-center space-x-1 border border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500 text-amber-500 hover:text-black font-black text-[9.5px] uppercase tracking-wider px-3 py-1.5 rounded-full transition cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Quét Camera Giả Lập</span>
            </button>
          </div>

          {/* Quick Find input bar */}
          <form onSubmit={handleSearchTicket} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Nhập mã vé đặt (XC-...) hoặc tên/chi tiết của vé..."
                value={searchPhrase}
                onChange={(e) => setSearchPhrase(e.target.value)}
                className="w-full bg-[#121212] pl-8.5 pr-8 py-2.5 text-xs text-white rounded-xl border border-zinc-800 focus:border-amber-500 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
            </div>
            <button
              type="submit"
              className="bg-zinc-800 hover:bg-amber-500 hover:text-black text-white px-4 py-2.5 rounded-xl font-bold uppercase transition tracking-wide text-[11px] cursor-pointer"
            >
              TÌM VÉ
            </button>
          </form>

          {/* Active Ticket Details Workspace */}
          {searchedBooking ? (
            <div className="bg-[#121212] border border-white/5 rounded-xl p-5 space-y-4 animate-scaleUp text-left">
              {/* Ticket Top Meta information */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/5 gap-2">
                <div>
                  <span className="block text-[8px] text-zinc-500 font-extrabold uppercase">MÃ VÉ DIỆN TỬ DÀNH RIÊNG</span>
                  <span className="text-sm font-mono font-black text-white text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 block">
                    {searchedBooking.code}
                  </span>
                </div>
                
                {/* Visual state stamps */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${
                    searchedBooking.isCheckedIn 
                      ? "bg-green-500/10 border-green-500/30 text-green-400" 
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}>
                    {searchedBooking.isCheckedIn ? "✓ Đã Soát Vé" : "✗ Chưa Soát"}
                  </span>

                  {searchedBooking.combos && searchedBooking.combos.length > 0 && (
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold uppercase border ${
                      searchedBooking.isComboRedeemed 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                        : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }`}>
                      {searchedBooking.isComboRedeemed ? "✓ Đã Đổi Popcorn" : "🍕 Đang Chờ Đồ Ăn"}
                    </span>
                  )}
                </div>
              </div>

              {/* Core screening / Booking credentials summary */}
              <div className="flex gap-4 items-start items-center">
                <img
                  src={searchedBooking.moviePoster}
                  alt={searchedBooking.movieTitle}
                  className="w-16 h-20 rounded-lg object-cover bg-black/20 border border-white/5 shadow-md flex-shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-white font-extrabold text-sm uppercase tracking-tight truncate">
                    {searchedBooking.movieTitle}
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-zinc-400">
                    <div>
                      <span className="text-zinc-500">Nơi chiếu:</span> <strong className="text-zinc-200">{searchedBooking.cinemaName}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Phòng:</span> <strong className="text-zinc-200 font-mono">{searchedBooking.room}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Giờ & Suất:</span> <strong className="text-amber-500 font-mono">{searchedBooking.showTime}</strong> ({searchedBooking.format})
                    </div>
                    <div>
                      <span className="text-zinc-500">Ngày chiếu:</span> <strong className="text-zinc-200 font-mono">{searchedBooking.showDate}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500">Danh mục ghế:</span> <strong className="text-white font-mono">{searchedBooking.seats.join(", ")}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popcorn Combos specifications included inside ticket */}
              {searchedBooking.combos && searchedBooking.combos.length > 0 ? (
                <div className="p-3 bg-zinc-950/50 rounded-lg border border-white/5 text-[11px] space-y-1 rounded-xl">
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider flex items-center">
                    <Coffee className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                    Bắp Nước & Combo Ăn Kèm Đi Kèm
                  </span>
                  <div className="divide-y divide-white/5">
                    {searchedBooking.combos.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1.5">
                        <span className="text-zinc-300 font-medium">
                          {item.name} <strong className="text-amber-500 font-mono ml-0.5">x{item.quantity}</strong>
                        </span>
                        <span className="text-zinc-500">Đơn vị sảnh trực</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-zinc-500 italic block">Giao dịch này không chọn kèm bắp nước ẩm thực.</p>
              )}

              {/* ACTION STATS VERIFICATION FOR STAFF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Checkin button */}
                <button
                  type="button"
                  onClick={() => handleCheckInTicket(searchedBooking.id)}
                  className={`w-full py-3 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    searchedBooking.isCheckedIn 
                      ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20" 
                      : "bg-[#C8102E] hover:bg-red-700 text-white shadow-lg"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{searchedBooking.isCheckedIn ? "HUỶ SOÁT VÉ (Khôi phục)" : "XÁC NHẬN SOÁT VÉ (Vào rạp)"}</span>
                </button>

                {/* Popcorn Combo redemption toggle button */}
                {searchedBooking.combos && searchedBooking.combos.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleRedeemCombo(searchedBooking.id)}
                    className={`w-full py-3 rounded-xl font-mono text-[10px] uppercase font-black tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      searchedBooking.isComboRedeemed 
                        ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20" 
                        : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                    }`}
                  >
                    <Coffee className="w-4 h-4" />
                    <span>{searchedBooking.isComboRedeemed ? "HOÀN TÁC COMBO (Mở khoá)" : "ĐÃ GIAO BẮP NƯỚC (Tính kho)"}</span>
                  </button>
                ) : (
                  <div className="p-3 bg-zinc-900 text-center text-zinc-500 font-bold border border-white/5 rounded-xl flex items-center justify-center gap-1">
                    <Smile className="w-4 h-4 text-zinc-600" />
                    <span>KHÔNG CÓ COMBO</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-12 px-6 border-2 border-dashed border-white/5 rounded-xl text-center space-y-2">
              <Ticket className="w-10 h-10 text-zinc-600 mx-auto" />
              <h4 className="text-zinc-400 font-black text-xs uppercase tracking-wider">Chưa Có Vé Nào Được Tra Cứu</h4>
              <p className="text-[10px] text-zinc-500 max-w-xs mx-auto">
                Nhập Mã Vé vào hộp thoại bên trên hoặc click lựa chọn một khách hàng trong danh mục hàng chờ mô phỏng bên phải để thẩm tra.
              </p>
            </div>
          )}
        </div>

        {/* RIGHT COMPONENT (COL 5): SIMULATED QUEUE & SHIFT LOGS */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Sub-Card: Queue Simulation waiting for check-in */}
          <div className="bg-[#161515] rounded-2xl border border-white/5 p-5 text-left space-y-3">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                HÀNG CHỜ KHÁCH HÀNG ƯU TIÊN SẢNH rạp
              </h3>
              <p className="text-[10px] text-zinc-400">Khách hàng mới giao dịch trực tuyến. Nhân viên click để soát vé lập tức.</p>
            </div>

            <div className="space-y-2 max-h-[195px] overflow-y-auto pr-1">
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  onClick={() => {
                    setSearchedBooking(b);
                    setSearchPhrase(b.code);
                    triggerToast(`Đã tải vé ${b.code} lên khu vực đối soát.`, "info");
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left flex items-center justify-between gap-2.5 ${
                    searchedBooking?.id === b.id 
                      ? "bg-amber-500/10 border-amber-500/50" 
                      : b.isCheckedIn 
                      ? "bg-green-500/5 hover:bg-green-500/10 border-green-500/10 opacity-70"
                      : "bg-[#121212] hover:bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={b.moviePoster}
                      alt={b.movieTitle}
                      className="w-8 h-10 rounded object-cover flex-shrink-0 bg-black/10"
                    />
                    <div className="text-[10px] min-w-0">
                      <span className="font-extrabold text-[#BDBDBD] hover:text-white truncate block max-w-[170px]">
                        {b.movieTitle}
                      </span>
                      <span className="font-mono text-zinc-500 block">
                        {b.code} • {b.seats.join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-amber-500 font-bold block">{b.showTime}</span>
                    <span className={`text-[8px] font-black uppercase rounded px-1.5 py-0.5 inline-block ${
                      b.isCheckedIn 
                        ? "bg-green-500/10 text-green-400" 
                        : "bg-red-500/10 text-red-500"
                    }`}>
                      {b.isCheckedIn ? "Checked-in" : "Chờ Soát"}
                    </span>
                  </div>
                </div>
              ))}

              {filteredBookings.length === 0 && (
                <p className="text-[10px] text-zinc-500 italic py-6 text-center block">Không phát hiện khách đặt vé tại rạp này ngày hôm nay.</p>
              )}
            </div>
          </div>

          {/* Sub-Card: Shift audit log registers */}
          <div className="bg-[#161515] rounded-2xl border border-white/5 p-5 text-left space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  SỔ GHI LỊCH TRÌNH CA TRỰC NHÂN VIÊN
                </h3>
                <p className="text-[10px] text-zinc-400">Các hoạt động kiểm duyệt nghiệp vụ trong ca rạp hiện tại.</p>
              </div>

              <button 
                type="button" 
                onClick={() => {
                  setRecentRedemptions([]);
                  triggerToast("Đã dọn sạch nhật ký kiểm tra tạm thời.", "info");
                }}
                className="text-[9px] font-black text-zinc-500 hover:text-white uppercase transition-colors"
              >
                Xóa ghi chép
              </button>
            </div>

            <div className="bg-[#121212] rounded-xl p-3 border border-white/5 space-y-2 min-h-[145px] max-h-[145px] overflow-y-auto font-mono text-[9.5px]">
              {recentRedemptions.length > 0 ? (
                recentRedemptions.map((log, idx) => (
                  <div key={idx} className="text-zinc-400 border-b border-white/5 pb-1 flex justify-between gap-1">
                    <span className="truncate">{log}</span>
                    <span className="text-green-500">✓ OK</span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 gap-1 mt-6">
                  <RefreshCw className="w-4 h-4 animate-spin-slow text-zinc-700" />
                  <span className="italic">Đang đợi các thao tác giao dịch vé...</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
      ) : activeSubTab === "counter-booking" ? (
        /* ===== BÁN VÉ TẠI QUẦY (Counter Ticket Booking) ===== */
        <div className="animate-fadeIn space-y-6">
          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#161515] border border-white/5 rounded-xl p-3">
            {([
              { key: "movie", label: "1. Chọn Phim" },
              { key: "showtime", label: "2. Chọn Suất" },
              { key: "seats", label: "3. Chọn Ghế & Bắp Nước" },
              { key: "checkout", label: "4. Thanh Toán" },
              { key: "done", label: "5. Xuất Vé" },
            ] as { key: CounterStep; label: string }[]).map((s, idx, arr) => {
              const order = arr.map(a => a.key);
              const currentIdx = order.indexOf(counterStep);
              const thisIdx = order.indexOf(s.key);
              const isActive = s.key === counterStep;
              const isDone = thisIdx < currentIdx;
              return (
                <React.Fragment key={s.key}>
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wide whitespace-nowrap ${
                    isActive ? "bg-blue-600 text-white" : isDone ? "text-emerald-400" : "text-zinc-600"
                  }`}>
                    {isDone ? <Check className="w-3 h-3" /> : null}
                    <span>{s.label}</span>
                  </div>
                  {idx < arr.length - 1 && <div className="w-3 sm:w-6 h-px bg-white/10 flex-shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>

          {/* STEP 1: Chọn phim */}
          {counterStep === "movie" && (
            <div className="bg-[#161515] rounded-2xl border border-white/5 p-5 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-blue-400" />
                    BƯỚC 1: CHỌN PHIM CHO KHÁCH HÀNG TẠI QUẦY
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Chỉ hiển thị các phim đang có suất chiếu hôm nay tại {staffCinemaName}.</p>
                </div>
                <div className="relative w-full sm:w-60">
                  <input
                    type="text"
                    placeholder="Tìm tên phim..."
                    value={counterMovieSearch}
                    onChange={(e) => setCounterMovieSearch(e.target.value)}
                    className="w-full bg-[#121212] pl-8 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-blue-500 outline-none"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[560px] overflow-y-auto pr-1">
                {counterAvailableMovies.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => {
                      setCounterMovie(m);
                      setCounterShowtime(null);
                      setCounterStep("showtime");
                    }}
                    className="group text-left bg-[#121212] border border-white/5 hover:border-blue-500 rounded-xl overflow-hidden transition cursor-pointer"
                  >
                    <div className="aspect-[2/3] overflow-hidden bg-black">
                      <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image"; }} />
                    </div>
                    <div className="p-2 space-y-0.5">
                      <span className="text-[10.5px] font-extrabold text-white block leading-tight line-clamp-2">{m.title}</span>
                      <span className="text-[9px] text-amber-500 font-bold uppercase">{m.rating} • {m.duration}p</span>
                    </div>
                  </button>
                ))}

                {counterAvailableMovies.length === 0 && (
                  <div className="col-span-full py-10 text-center text-zinc-500 italic border border-dashed border-white/5 rounded-xl">
                    Không tìm thấy phim nào còn suất chiếu hôm nay tại rạp này.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Chọn suất chiếu */}
          {counterStep === "showtime" && counterMovie && (
            <div className="bg-[#161515] rounded-2xl border border-white/5 p-5 space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 gap-3">
                <div className="flex items-center gap-3">
                  <img src={counterMovie.posterUrl} alt={counterMovie.title} className="w-12 h-16 rounded-lg object-cover border border-white/5 flex-shrink-0"  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image"; }} />
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">{counterMovie.title}</h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">BƯỚC 2: Chọn suất chiếu phù hợp với khách hàng tại quầy.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCounterStep("movie")}
                  className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full flex-shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Đổi phim
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {counterMovieShowtimes.map((st) => (
                  <button
                    type="button"
                    key={st.id}
                    onClick={() => {
                      setCounterShowtime(st);
                      setCounterStep("seats");
                    }}
                    className="text-left bg-[#121212] border border-white/5 hover:border-blue-500 rounded-xl p-3.5 transition cursor-pointer space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-base font-black text-blue-400">{st.time}</span>
                      <span className="text-[8.5px] bg-zinc-800 text-amber-500 font-extrabold px-1.5 py-0.5 rounded font-mono">{st.room}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span>{st.format}</span>
                      <span className="font-mono">{st.date}</span>
                    </div>
                    <div className="text-[9.5px] text-zinc-500 pt-1 border-t border-white/5 mt-1.5">
                      Thường <strong className="text-zinc-300">{formatVND(st.priceStandard)}</strong> • VIP <strong className="text-zinc-300">{formatVND(st.priceVIP)}</strong>
                    </div>
                  </button>
                ))}

                {counterMovieShowtimes.length === 0 && (
                  <div className="col-span-full py-10 text-center text-zinc-500 italic border border-dashed border-white/5 rounded-xl">
                    Phim này không còn suất chiếu nào tại rạp đang chọn hôm nay.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Chọn ghế & bắp nước - reuse the existing customer SeatMap component */}
          {counterStep === "seats" && counterMovie && counterShowtime && (
            <div className="rounded-2xl overflow-hidden border border-white/5 -mx-4 sm:-mx-6 lg:-mx-8 -mt-6">
              <div className="bg-blue-950/30 border-b border-blue-500/20 px-5 py-2.5 flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                  <Armchair className="w-3.5 h-3.5" /> Đang chọn ghế giúp khách hàng tại quầy — {staffCinemaName}
                </span>
                <button
                  type="button"
                  onClick={() => setCounterStep("showtime")}
                  className="flex items-center gap-1 text-[10px] font-black uppercase text-blue-300 hover:text-white border border-blue-500/30 px-3 py-1 rounded-full cursor-pointer flex-shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Đổi suất chiếu
                </button>
              </div>
              <SeatMap
                showtime={counterShowtime}
                movie={counterMovie}
                cinema={cinemas.find(c => c.id === selectedStaffCinema) || cinemas[0]}
                bookings={bookings}
                comboDeals={comboDeals}
                onConfirmSeats={handleConfirmSeatsAtCounter}
                onBack={() => setCounterStep("showtime")}
              />
            </div>
          )}

          {/* STEP 4: Thanh toán tại quầy */}
          {counterStep === "checkout" && counterMovie && counterShowtime && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 bg-[#161515] rounded-2xl border border-white/5 p-5 space-y-4 text-left">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" />
                    BƯỚC 4: THÔNG TIN KHÁCH HÀNG & THANH TOÁN
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCounterStep("seats")}
                    className="flex items-center gap-1 text-[10px] font-black uppercase text-zinc-400 hover:text-white border border-white/10 px-3 py-1.5 rounded-full cursor-pointer flex-shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Sửa ghế
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-1">Tên khách hàng (tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Văn A..."
                      value={counterCustomerName}
                      onChange={(e) => setCounterCustomerName(e.target.value)}
                      className="w-full bg-black px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-1">Số điện thoại (tích điểm)</label>
                    <input
                      type="text"
                      placeholder="VD: 0987654321..."
                      value={counterCustomerPhone}
                      onChange={(e) => setCounterCustomerPhone(e.target.value)}
                      className="w-full bg-black px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <span className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-1.5">Hình thức thanh toán tại quầy</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: "Tiền mặt" as const, icon: Banknote },
                      { key: "Thẻ / Quẹt máy POS" as const, icon: CreditCard },
                      { key: "Chuyển khoản QR" as const, icon: Wallet },
                    ].map(({ key, icon: Icon }) => (
                      <button
                        type="button"
                        key={key}
                        onClick={() => setCounterPaymentMethod(key)}
                        className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-[9.5px] font-bold uppercase transition cursor-pointer ${
                          counterPaymentMethod === key
                            ? "bg-blue-600 border-blue-400 text-white"
                            : "bg-[#121212] border-white/5 text-zinc-400 hover:border-zinc-600"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-center leading-tight">{key}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-5 bg-[#161515] rounded-2xl border border-white/5 p-5 text-left flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex gap-3 pb-3 border-b border-white/5">
                    <img src={counterMovie.posterUrl} alt={counterMovie.title} className="w-12 h-16 rounded-lg object-cover border border-white/5 flex-shrink-0"  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image"; }} />
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{counterMovie.title}</h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{counterShowtime.room} • {counterShowtime.format}</p>
                      <p className="text-[10px] font-mono text-blue-400 mt-0.5">{counterShowtime.time} • {counterShowtime.date}</p>
                    </div>
                  </div>
                  <div className="text-[11px] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Ghế đã chọn:</span>
                      <span className="font-mono font-bold text-white">{counterSeats.join(", ")}</span>
                    </div>
                    {counterCombos.length > 0 && (
                      <div className="pt-1.5 border-t border-white/5 space-y-1">
                        {counterCombos.map((c) => (
                          <div key={c.id} className="flex justify-between text-amber-400">
                            <span>{c.name} x{c.quantity}</span>
                            <span className="font-mono">{formatVND(c.price * c.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-white/5">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-xs text-zinc-400">TỔNG THANH TOÁN:</span>
                    <span className="text-xl font-black text-blue-400 font-mono">{formatVND(counterTotal)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleFinalizeCounterSale}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-xs transition cursor-pointer shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> XÁC NHẬN & XUẤT VÉ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Xuất vé thành công */}
          {counterStep === "done" && counterCompletedTicket && (
            <div className="bg-[#161515] rounded-2xl border border-emerald-500/20 p-8 text-center space-y-4 max-w-lg mx-auto">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-black text-white uppercase">Xuất Vé Thành Công!</h3>
              <div className="bg-black/30 rounded-xl border border-white/5 p-4 text-left space-y-1.5 text-[11px]">
                <div className="flex justify-between"><span className="text-zinc-500">Mã vé:</span><strong className="font-mono text-amber-500">{counterCompletedTicket.code}</strong></div>
                <div className="flex justify-between"><span className="text-zinc-500">Phim:</span><strong className="text-white">{counterCompletedTicket.movieTitle}</strong></div>
                <div className="flex justify-between"><span className="text-zinc-500">Ghế:</span><strong className="font-mono text-white">{counterCompletedTicket.seats.join(", ")}</strong></div>
                <div className="flex justify-between"><span className="text-zinc-500">Suất chiếu:</span><strong className="font-mono text-white">{counterCompletedTicket.showTime} • {counterCompletedTicket.showDate}</strong></div>
                <div className="flex justify-between"><span className="text-zinc-500">Tổng tiền:</span><strong className="text-emerald-400">{formatVND(counterCompletedTicket.totalAmount)}</strong></div>
              </div>
              <p className="text-[10px] text-zinc-500">Vui lòng in vé hoặc đọc mã vé cho khách hàng. Vé đã được lưu vào hệ thống và có thể soát vé ngay tại tab "Soát Vé Sảnh".</p>
              <button
                type="button"
                onClick={resetCounterFlow}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase tracking-widest text-xs transition cursor-pointer"
              >
                + Bán Vé Mới Cho Khách Khác
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Here goes the awesome Gọi Bắp Nước UI! */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          {/* LEFT SECTION (Col 7) - Products Selection Grid */}
          <div className="lg:col-span-7 bg-[#161515] rounded-2xl border border-white/5 p-5 space-y-4 text-left">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-amber-500" />
                  THỰC ĐƠN BẮP NƯỚC SẢNH RẠP
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Lựa chọn các gói combo hoặc sản phẩm bắp ngọt, caramel, nước giải khát lạnh.</p>
              </div>

              {/* Filter product input bar */}
              <div className="relative w-full sm:w-60">
                <input
                  type="text"
                  placeholder="Lọc tên bắp nước..."
                  value={foodSearchQuery}
                  onChange={(e) => setFoodSearchQuery(e.target.value)}
                  className="w-full bg-[#121212] pl-8 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none"
                />
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2.5" />
                {foodSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setFoodSearchQuery("")}
                    className="absolute right-2 top-2 text-zinc-500 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Combos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {comboDeals
                .filter(cb => cb.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) || cb.description.toLowerCase().includes(foodSearchQuery.toLowerCase()))
                .map((cb) => {
                  const qtyInCart = foodCart[cb.id] || 0;
                  return (
                    <div 
                      key={cb.id} 
                      className={`bg-[#121212] border rounded-xl overflow-hidden flex flex-col justify-between transition duration-200 group ${
                        qtyInCart > 0 ? "border-amber-500/50 shadow-lg shadow-amber-500/5" : "border-white/5 hover:border-zinc-700"
                      }`}
                    >
                      {/* Thumbnail wrapper */}
                      <div className="relative aspect-video bg-black overflow-hidden select-none shrink-0 border-b border-white/5">
                        <img
                          src={cb.imageUrl || "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300"}
                          alt={cb.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-amber-500 font-extrabold font-mono border border-white/5">
                          {cb.price.toLocaleString("vi-VN")}đ
                        </div>
                      </div>

                      {/* Info & action block */}
                      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                        <div className="space-y-1">
                          <h4 className="text-white font-black text-xs group-hover:text-amber-500 transition-colors leading-snug">{cb.name}</h4>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{cb.description}</p>
                        </div>

                        {/* Order controls */}
                        <div className="pt-2">
                          {qtyInCart === 0 ? (
                            <button
                              type="button"
                              onClick={() => {
                                setFoodCart(prev => ({ ...prev, [cb.id]: 1 }));
                              }}
                              className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-500 hover:text-black text-zinc-300 hover:font-extrabold text-[10.5px] transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Chọn Gọi Món</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-zinc-900 border border-amber-500/20 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => {
                                  setFoodCart(prev => {
                                    const next = { ...prev };
                                    if (next[cb.id] <= 1) {
                                      delete next[cb.id];
                                    } else {
                                      next[cb.id] -= 1;
                                    }
                                    return next;
                                  });
                                }}
                                className="w-6 h-6 rounded bg-[#161515] text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center font-bold"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="font-mono text-white text-xs font-black">{qtyInCart}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setFoodCart(prev => ({ ...prev, [cb.id]: (prev[cb.id] || 0) + 1 }));
                                }}
                                className="w-6 h-6 rounded bg-[#161515] text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 flex items-center justify-center font-bold"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

              {comboDeals.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 italic">
                  Không tìm thấy bắp nước nào. Vui lòng thêm dữ liệu bắp nước.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CHECKOUT PANEL (Col 5) - Current Cart Details & Transaction Assignment */}
          <div className="lg:col-span-5 bg-[#161515] rounded-2xl border border-white/5 p-5 space-y-4 text-left flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  ĐƠN GỌI BẮP NƯỚC SẢNH RẠP
                </h3>
                {Object.keys(foodCart).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFoodCart({});
                      triggerToast("Đã dọn sạch giỏ hàng bắp nước.", "info");
                    }}
                    className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-wider transition"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Cart Items List */}
              <div className="space-y-2 border-b border-white/5 pb-3 max-h-[160px] overflow-y-auto pr-1">
                {Object.keys(foodCart).map(id => {
                  const deal = comboDeals.find(d => d.id === id);
                  const qty = foodCart[id];
                  if (!deal) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-[11px] bg-black/40 border border-white/5 p-2 rounded-xl">
                      <div className="min-w-0">
                        <span className="font-extrabold text-white block truncate">{deal.name}</span>
                        <span className="text-zinc-500 font-mono">
                          {deal.price.toLocaleString("vi-VN")}đ x {qty} phần
                        </span>
                      </div>
                      <span className="font-mono text-amber-500 font-extrabold text-xs">
                        {(deal.price * qty).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                  );
                })}

                {Object.keys(foodCart).length === 0 && (
                  <div className="py-8 text-center text-zinc-600 italic space-y-1">
                    <Coffee className="w-8 h-8 text-zinc-700 mx-auto" />
                    <p className="text-[10px] text-zinc-500">Giỏ hàng rỗng. Click chọn món bắp nước bên cạnh để phục vụ khách.</p>
                  </div>
                )}
              </div>

              {/* Calculations block */}
              {Object.keys(foodCart).length > 0 && (() => {
                const totalGoods = Object.keys(foodCart).reduce((sum, id) => {
                  const deal = comboDeals.find(d => d.id === id);
                  return sum + (deal ? deal.price * foodCart[id] : 0);
                }, 0);
                const vat = Math.floor(totalGoods * 0.08); // 8% simulation
                const finalPay = totalGoods + vat;

                return (
                  <div className="bg-[#121212] p-3 rounded-xl border border-white/5 text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between text-zinc-400">
                      <span>Cộng tiền hàng:</span>
                      <span>{totalGoods.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                      <span>Thuế VAT (8%):</span>
                      <span>{vat.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="flex justify-between text-white font-extrabold border-t border-white/5 pt-1.5 text-xs">
                      <span className="text-amber-500">Tổng thanh toán:</span>
                      <span className="text-amber-500">{finalPay.toLocaleString("vi-VN")}đ</span>
                    </div>
                  </div>
                );
              })()}

              {/* Target/Mode Setup Form */}
              <div className="bg-[#121212]/70 border border-white/5 rounded-xl p-3 space-y-3">
                <span className="text-[8.5px] text-zinc-500 font-black uppercase tracking-wider block">THIẾT LẬP PHƯƠNG THỨC GIAO</span>

                <div className="flex p-0.5 rounded bg-[#121212] border border-white/5 text-center">
                  <button
                    type="button"
                    onClick={() => setOrderType("retail")}
                    className={`flex-1 py-1.5 rounded transition text-[9px] uppercase font-black cursor-pointer ${
                      orderType === "retail" ? "bg-amber-500 text-black font-extrabold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    👤 Bán lẻ sảnh
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("assign")}
                    className={`flex-1 py-1.5 rounded transition text-[9px] uppercase font-black cursor-pointer ${
                      orderType === "assign" ? "bg-amber-500 text-black font-extrabold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    🎟️ Gán vào vé
                  </button>
                </div>

                {orderType === "retail" ? (
                  <div className="space-y-2 animate-scaleUp">
                    <div>
                      <label className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-1">Số điện thoại khách (nhận điểm)</label>
                      <input
                        type="text"
                        placeholder="VD: 0987654321..."
                        value={retailPhone}
                        onChange={(e) => setRetailPhone(e.target.value)}
                        className="w-full bg-black px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none animate-fadeIn"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-1">Tên khách sảnh (tùy chọn)</label>
                      <input
                        type="text"
                        placeholder="VD: Nguyễn Văn A..."
                        value={retailName}
                        onChange={(e) => setRetailName(e.target.value)}
                        className="w-full bg-black px-2.5 py-2 text-xs text-white rounded-lg border border-zinc-800 focus:border-amber-500 outline-none animate-fadeIn"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 animate-scaleUp text-left">
                    <label className="block text-[8px] text-zinc-500 font-extrabold uppercase mb-1">CHỌN VÉ CẦN GÁN BẮP NƯỚC</label>
                    <select
                      value={targetBookingIdForFood}
                      onChange={(e) => setTargetBookingIdForFood(e.target.value)}
                      className="w-full bg-black text-white rounded-lg border border-zinc-800 px-2.5 py-2 text-xs outline-none cursor-pointer animate-fadeIn"
                    >
                      <option value="" className="bg-[#121212] text-zinc-500 text-xs">-- Ấn chọn vé cần gán --</option>
                      {filteredBookings.map(b => (
                        <option key={b.id} value={b.id} className="bg-[#121212] text-white py-1">
                          {b.code} - {b.movieTitle.substring(0,25)}... (Ghế {b.seats.join(", ")})
                        </option>
                      ))}
                    </select>

                    {/* Displays small selected ticket overview */}
                    {(() => {
                      const selBooking = bookings.find(b => b.id === targetBookingIdForFood);
                      if (!selBooking) return null;
                      return (
                        <div className="p-2.5 bg-black rounded-lg border border-white/5 text-[11px] text-zinc-400 space-y-1 mt-1 font-sans animate-fadeIn">
                          <div><span className="text-zinc-500">Phim:</span> <strong className="text-white">{selBooking.movieTitle}</strong></div>
                          <div className="flex justify-between">
                            <span>Phòng: <strong className="text-white font-mono">{selBooking.room}</strong></span>
                            <span>Suất: <strong className="text-amber-500 font-mono">{selBooking.showTime}</strong></span>
                          </div>
                          {selBooking.combos && selBooking.combos.length > 0 && (
                            <div className="text-[10px] text-zinc-400 pt-1 border-t border-white/5 mt-1">
                              <span className="text-zinc-500 block font-bold mb-1">Bắp nước hiện tại của vé:</span>
                              {selBooking.combos.map((cb, i) => (
                                <span key={i} className="inline-block bg-white/5 rounded px-1.5 py-0.5 text-[9px] mr-1 mb-1 font-mono text-zinc-300 border border-white/5">
                                  {cb.name} x{cb.quantity}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Form submit/checkout CTA */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => {
                  // Validations
                  if (Object.keys(foodCart).length === 0) {
                    triggerToast("Vui lòng chọn ít nhất 1 món bắp nước để thực hiện cuộc gọi!", "error");
                    return;
                  }

                  const totalGoods = Object.keys(foodCart).reduce((sum, id) => {
                    const deal = comboDeals.find(d => d.id === id);
                    return sum + (deal ? deal.price * foodCart[id] : 0);
                  }, 0);
                  const formattedTotal = totalGoods.toLocaleString("vi-VN") + "đ";

                  if (orderType === "retail") {
                    // Retail sale simulation
                    const phone = retailPhone.trim() || "09x-xxxx-xxx";
                    const name = retailName.trim() || "Khách vãng lai";
                    const comboSummary = Object.keys(foodCart).map(id => {
                      const deal = comboDeals.find(d => d.id === id);
                      return `${deal ? deal.name : id} (x${foodCart[id]})`;
                    }).join(", ");

                    // Add to log
                    setRecentRedemptions((prevLogs) => [
                      `[BÁN LẺ QUẦY] Giao ${comboSummary} cho SĐT ${phone} (${name}) - Trị giá: ${formattedTotal} - lúc ${new Date().toLocaleTimeString()}`,
                      ...prevLogs,
                    ]);

                    triggerToast(`Đã bán thành công! Tổng cộng: ${formattedTotal}. Đã xuất bắp nước phục vụ tại quầy cho khách.`, "success");

                    // Reset states
                    setFoodCart({});
                    setRetailPhone("");
                    setRetailName("");
                  } else {
                    // Assign to booking logic
                    if (!targetBookingIdForFood) {
                      triggerToast("Vui lòng lựa chọn một rạp vé hợp sảnh để gán bắp nước!", "error");
                      return;
                    }

                    const bookingToModify = bookings.find(b => b.id === targetBookingIdForFood);
                    if (!bookingToModify) {
                      triggerToast("Dữ liệu vé bị lỗi. Vui lòng chọn lại!", "error");
                      return;
                    }

                    // Format combos array to inject
                    const combosToInject = Object.keys(foodCart).map(id => {
                      const deal = comboDeals.find(d => d.id === id);
                      return {
                        id,
                        name: deal ? deal.name : "Sản phẩm",
                        price: deal ? deal.price : 50000,
                        quantity: foodCart[id]
                      };
                    });

                    // Perform mutability updates on shared bookings list
                    setBookings(prevBookings => {
                      return prevBookings.map(b => {
                        if (b.id === targetBookingIdForFood) {
                          const currentCombos = b.combos ? [...b.combos] : [];
                          
                          // Merge fresh ordered combos
                          combosToInject.forEach(fresh => {
                            const existingIdx = currentCombos.findIndex(item => item.id === fresh.id);
                            if (existingIdx > -1) {
                              currentCombos[existingIdx] = {
                                ...currentCombos[existingIdx],
                                quantity: currentCombos[existingIdx].quantity + fresh.quantity
                              };
                            } else {
                              currentCombos.push(fresh);
                            }
                          });

                          // Calculate extra payment
                          const additionalAmount = combosToInject.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                          return {
                            ...b,
                            combos: currentCombos,
                            totalAmount: b.totalAmount + additionalAmount,
                            isComboRedeemed: false // resetting delivery state to pending so customers get a fresh pop pop corn notification!
                          };
                        }
                        return b;
                      });
                    });

                    // Add to logs
                    setRecentRedemptions((prevLogs) => [
                      `[ĐẶT THÊM] Vé ${bookingToModify.code} gọi thêm bắp nước: ${combosToInject.map(c => `${c.name} x${c.quantity}`).join(", ")} - Trị giá: ${formattedTotal} - lúc ${new Date().toLocaleTimeString()}`,
                      ...prevLogs,
                    ]);

                    triggerToast(`Đã đặt thêm bắp nước vào Vé ${bookingToModify.code} thành công qua sảnh!`, "success");

                    // Clear cart and search variables
                    setFoodCart({});
                    setTargetBookingIdForFood("");
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase mt-1 tracking-widest text-xs transition duration-200 cursor-pointer shadow-lg shadow-amber-500/20 text-center select-none block"
              >
                ✓ XÁC NHẬN GỌI & GIAO NGAY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TODAY'S BROADCAST SCHEDULE AT TARGET SELECTED CINEMA */}
      <div className="bg-[#161515] border border-white/5 rounded-2xl p-5 text-left space-y-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Tv className="w-4.5 h-4.5 text-zinc-300" />
            LỊCH KHỞI CHIẾU TIÊU ĐIỂM NGÀY HÔM NAY ({activeCinemaShowtimes.length} suất chơi)
          </h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">Giúp nhân viên rạp hướng dẫn chỗ ngồi, hướng dẫn hành lang cho khách hàng tìm phòng chiếu.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeCinemaShowtimes.map((st) => {
            const correlatedMovie = movies.find(m => m.id === st.movieId);
            return (
              <div key={st.id} className="bg-[#121212] border border-white/5 p-3 rounded-xl flex justify-between items-center gap-2">
                <div className="min-w-0">
                  <span className="font-extrabold text-white text-[11px] truncate block max-w-[210px]">{correlatedMovie ? correlatedMovie.title : "Tác phẩm điện ảnh"}</span>
                  <div className="flex items-center space-x-2 mt-0.5">
                    <span className="bg-zinc-800 text-amber-500 font-extrabold px-1.5 py-0.5 rounded font-mono text-[8.5px]">
                      {st.room}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">Định dạng {st.format}</span>
                    {correlatedMovie ? (
                      <span className="text-[8.5px] px-1 bg-red-950/20 text-[#C8102E] rounded border border-red-900/10 font-bold uppercase">
                        {correlatedMovie.rating}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  <span className="block font-mono text-xs text-amber-400 font-black tracking-tight">{st.time}</span>
                  <span className="text-[9px] text-zinc-500 block font-mono">{st.date}</span>
                </div>
              </div>
            );
          })}

          {activeCinemaShowtimes.length === 0 && (
            <div className="col-span-3 py-6 text-center text-zinc-500 font-bold italic border border-white/5 bg-black/10 rounded-xl">
              Không có suất chiếu nào hoạt động hôm nay tại cơ sở này.
            </div>
          )}
        </div>
      </div>

      {/* 5. CAMERA SCANNER MODAL SIMULATOR */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#161515] border border-amber-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
            <button
              onClick={() => setShowScannerModal(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white font-sans text-sm p-1 cursor-pointer"
            >
              ✕ Huy bỏ
            </button>

            <div className="space-y-1">
              <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                <QrCode className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                MÔ PHỎNG CAMERA SOÁT VÉ QR-TỐC ĐỘ CAO
              </h4>
              <p className="text-[10px] text-zinc-400">Chọn một khách hàng đứng trước hàng để giả lập hành vi quét QR</p>
            </div>

            {/* Visual scan sweeping container */}
            <div className="relative aspect-video w-full max-w-[320px] mx-auto bg-black border border-white/15 rounded-xl flex items-center justify-center overflow-hidden">
              {/* Sweeping laser light */}
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)] top-1/2 left-0 right-0 animate-bounce"></div>
              
              <div className="space-y-1.5 z-10 flex flex-col items-center">
                {scanState === "idle" && (
                  <>
                    <QrCode className="w-12 h-12 text-zinc-600 animate-pulse" />
                    <span className="text-[9px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-widest font-extrabold animate-pulse">SẴN SÀNG QUÉT</span>
                  </>
                )}
                {scanState === "scanning" && (
                  <>
                    <RefreshCw className="w-10 h-10 text-amber-500 animate-spin" />
                    <span className="text-[9px] text-amber-400 uppercase tracking-widest font-black">Đang đọc mã QR...</span>
                  </>
                )}
                {scanState === "success" && (
                  <>
                    <Check className="w-12 h-12 text-green-500 bg-green-500/20 rounded-full p-2.5" />
                    <span className="text-[9px] text-green-400 uppercase tracking-widest font-black">XÁC MINH THÀNH CÔNG!</span>
                  </>
                )}
              </div>
            </div>

            {/* Select queue to trigger scan input */}
            <div className="space-y-2">
              <span className="block text-left text-[9px] text-zinc-500 font-extrabold uppercase">KHÁCH ĐANG ĐỨNG TRƯỚC HÀNG QUÉT:</span>
              <div className="grid grid-cols-1 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
                {filteredBookings.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => triggerQuickScan(b)}
                    className="w-full text-left bg-black p-2 rounded-xl text-[10px] border border-white/5 flex items-center justify-between hover:border-amber-500 transition cursor-pointer"
                  >
                    <div>
                      <span className="font-extrabold text-white block">{b.code}</span>
                      <span className="text-zinc-500 block truncate max-w-[200px]">{b.movieTitle}</span>
                    </div>
                    <span className="text-[8.5px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded uppercase font-black tracking-wider">
                      Đưa mã quét
                    </span>
                  </button>
                ))}

                {filteredBookings.length === 0 && (
                  <p className="text-[10px] text-zinc-500 italic py-4 block">Chưa tìm thấy khách vé hợp lệ đứng xếp hàng.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
