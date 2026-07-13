/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { User, Mail, Phone, Calendar, Heart, Award, ArrowRight, Hourglass, Landmark, History, Film, QrCode } from "lucide-react";
import { UserProfile, Booking, Movie } from "../types";

interface UserProfileViewProps {
  user: UserProfile;
  bookings: Booking[];
  allMovies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onOpenTicket: (booking: Booking) => void;
  onToggleFavorite?: (movieId: string) => void;
  onSwitchMode?: (mode: "admin" | "employee" | "customer") => void;
}

export default function UserProfileView({
  user,
  bookings,
  allMovies,
  onSelectMovie,
  onOpenTicket,
  onToggleFavorite,
  onSwitchMode,
}: UserProfileViewProps) {
  const [activeProfileTab, setActiveProfileTab] = useState<"tickets" | "favorites">("tickets");

  // Filter favorite movies objects
  const favoriteMoviesList = allMovies.filter((m) => user.favoriteMovies.includes(m.id));

  // Chỉ hiện vé của user đang đăng nhập, sort mới nhất lên đầu
  const userBookings = bookings.filter(
    (b) => !b.userEmail || b.userEmail.toLowerCase() === user.email.toLowerCase()
  );
  const sortedBookings = [...userBookings].sort((a, b) => {
    if (!a.bookingTime) return -1;
    if (!b.bookingTime) return 1;
    return new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime();
  });

  // Calculate membership level based on points
  const points = user.points;
  let memberLevel = "Bạc";
  let nextLevelPoints = 2000;
  let cardColor = "from-[#708090] via-[#A9A9A9] to-[#D2B48C]";
  let levelColor = "text-zinc-300";

  if (points >= 1500) {
    memberLevel = "Kim Cương";
    nextLevelPoints = 5000;
    cardColor = "from-amber-600 via-yellow-500 to-amber-700";
    levelColor = "text-amber-400 animate-pulse";
  } else if (points >= 1000) {
    memberLevel = "Vàng";
    nextLevelPoints = 1500;
    cardColor = "from-yellow-400 via-amber-500 to-yellow-600";
    levelColor = "text-yellow-400";
  }

  const progressPercent = Math.min(100, (points / nextLevelPoints) * 100);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="bg-[#121212] min-h-screen py-10 text-white font-sans text-left animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Grid Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column Left: Visual ID card, profile metadata info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Visual Loyalty Card */}
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${cardColor} shadow-xl relative overflow-hidden group select-none text-left`}>
              {/* Glassmorphic decor rings */}
              <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-black/10 rounded-full blur-xl" />

              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/50 block">Thành Viên Rạp Phim</span>
                  <span className="font-sans font-black text-2xl tracking-tighter text-black">
                    X <span className="opacity-75">CINEMA</span>
                  </span>
                </div>
                <div className="bg-black/20 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/5">
                  LEVEL: {memberLevel}
                </div>
              </div>

              {/* ID and User metadata */}
              <div className="mb-6">
                <span className="text-[11px] font-sans font-bold text-black/60 block">HỌ VÀ TEN CHỦ THẺ</span>
                <span className="text-lg font-black text-black tracking-tight leading-tight uppercase">
                  {user.name}
                </span>
                <span className="text-xs font-mono font-bold text-black/80 block mt-1 tracking-wider">
                  ID: {user.membershipId}
                </span>
              </div>

              {/* Points meter */}
              <div className="border-t border-black/10 pt-4.5">
                <div className="flex justify-between text-xs text-black/80 font-bold mb-1.5">
                  <span>Điểm tích lũy: {user.points}đ</span>
                  <span>Mục tiêu kế: {nextLevelPoints}đ</span>
                </div>
                <div className="w-full bg-black/15 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-black h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-[10px] text-black/60 font-medium mt-1.5 block">
                  Tích thêm {nextLevelPoints - user.points} điểm vé để nâng cấp chương trình đặc biệt.
                </span>
              </div>
            </div>

            {/* Profile Personal Information section */}
            <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-white/5 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-l-3 border-[#C8102E] pl-2.5">
                Thông tin cá nhân
              </h3>

              <div className="flex items-center space-x-3 text-xs">
                <Mail className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
                <div>
                  <span className="text-[#BDBDBD] text-[10px] uppercase block">Email liên kết:</span>
                  <span className="text-white font-bold block truncate max-w-xs">{user.email}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <Phone className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
                <div>
                  <span className="text-[#BDBDBD] text-[10px] uppercase block">Điện thoại di động:</span>
                  <span className="text-white font-bold block">{user.phone}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <Award className="w-4 h-4 text-[#C8102E] flex-shrink-0" />
                <div>
                  <span className="text-[#BDBDBD] text-[10px] uppercase block">Hạng loyalty:</span>
                  <span className={`font-bold block ${levelColor}`}>{memberLevel} Member</span>
                </div>
              </div>

              {user.role === "admin" && onSwitchMode && (
                <div className="pt-2 select-none">
                  <button
                    onClick={() => onSwitchMode("admin")}
                    className="w-full py-2 bg-gradient-to-r from-[#C8102E] to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-extrabold tracking-wider rounded-xl text-[10.5px] uppercase transition cursor-pointer shadow-md shadow-[#C8102E]/20 flex items-center justify-center gap-1.5 border border-white/5 active:scale-97"
                  >
                    <span>🔑 Vào Vùng Quản Trị Hệ Thống</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {user.role === "employee" && onSwitchMode && (
                <div className="pt-2 select-none">
                  <button
                    onClick={() => onSwitchMode("employee")}
                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-extrabold tracking-wider rounded-xl text-[10.5px] uppercase transition cursor-pointer shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 border border-white/5 active:scale-97"
                  >
                    <span>🧑‍💼 Vào CổNg Vận Hành Sảnh</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-2">
                <div className="p-3 bg-[#121212] rounded-xl border border-white/5 text-[10px] text-[#BDBDBD] leading-relaxed">
                  Quý khách đổi mã giảm giá bắp nước từ điểm tích lũy bằng cách quét thẻ tại bất cứ quầy quầy dịch vụ hoặc nhập mã coupon trực tiếp khi thanh toán.
                </div>
              </div>
            </div>

          </div>

          {/* Column Right: Selected Tab view contents */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Navigative profile views togglers */}
            <div className="flex bg-[#1E1E1E] p-1.5 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveProfileTab("tickets")}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-xs font-extrabold tracking-wide uppercase transition ${
                  activeProfileTab === "tickets"
                    ? "bg-[#C8102E] text-white shadow-md"
                    : "text-[#BDBDBD] hover:text-white"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Hoạt Động Vé Phim ({sortedBookings.length})</span>
              </button>
              <button
                onClick={() => setActiveProfileTab("favorites")}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg text-xs font-extrabold tracking-wide uppercase transition ${
                  activeProfileTab === "favorites"
                    ? "bg-[#C8102E] text-white shadow-md"
                    : "text-[#BDBDBD] hover:text-white"
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>Yêu Thích Gần Đây ({favoriteMoviesList.length})</span>
              </button>
            </div>

            {/* Render items based on active sub tab choice */}
            {activeProfileTab === "tickets" ? (
              <div className="space-y-4 text-left">
                {sortedBookings.length > 0 ? (
                  sortedBookings.map((bk) => (
                    <article
                      key={bk.id}
                      className="p-5 bg-[#1E1E1E] border border-white/5 rounded-2xl hover:border-white/10 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-5"
                    >
                      {/* Ticket synopsis details */}
                      <div className="flex space-x-4 select-none">
                        <img
                          src={bk.moviePoster}
                          alt={bk.movieTitle}
                          className="w-14 h-20 object-cover rounded-lg shadow-md"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image"; }}
                        />
                        <div className="min-w-0 flex flex-col justify-center">
                          <span className="text-[10px] text-[#C8102E] font-black uppercase tracking-wider block">Đặt Vé Trực Tuyến</span>
                          <h4 className="text-white text-base font-extrabold truncate leading-tight mt-0.5">{bk.movieTitle}</h4>
                          <p className="text-[11px] text-[#BDBDBD] mt-1">
                            {bk.cinemaName.replace("X Cinema ", "").replace("TCD Cinema ", "")} • <span className="font-mono text-zinc-300 font-bold">{bk.room}</span> • Ghế: <span className="font-mono text-red-500 font-bold">{bk.seats.sort().join(", ")}</span>
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                            Suất: <span className="text-amber-500 font-bold">{bk.showTime}</span> ngày {bk.showDate}
                          </p>
                          <div className="flex gap-1.5 mt-2">
                            <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                              bk.isCheckedIn 
                                ? "bg-green-500/10 text-green-400 border border-green-500/20" 
                                : "bg-[#161616] text-zinc-500 border border-white/5"
                            }`}>
                              {bk.isCheckedIn ? "🟢 Đã soát vé" : "⚪ Chưa soát vé"}
                            </span>
                            {bk.combos && bk.combos.length > 0 && (
                              <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                                bk.isComboRedeemed 
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                  : "bg-amber-500/10 text-amber-500 border border-amber-500/20 animation-pulse"
                              }`}>
                                {bk.isComboRedeemed ? "🍿 Đã nhận bắp nước" : "🥤 Chờ lấy combo"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right button action details look */}
                      <div className="w-full md:w-auto flex md:flex-col justify-between items-center md:items-end gap-3.5 border-t md:border-t-0 border-white/5 pt-4.5 md:pt-0">
                        <div>
                          <span className="block text-[10px] text-[#BDBDBD] md:text-right">TỔNG MUA BH</span>
                          <span className="block text-sm font-black font-mono text-[#C8102E] md:text-right">{formatVND(bk.totalAmount)}</span>
                        </div>
                        <button
                          onClick={() => onOpenTicket(bk)}
                          className="flex items-center space-x-1.5 bg-white/5 hover:bg-[#C8102E] text-white border border-white/10 hover:border-[#C8102E] px-4 py-2 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Xuất vé QR</span>
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="py-16 text-center border-2 border-dashed border-white/5 rounded-2xl bg-[#1E1E1E]/50">
                    <History className="w-12 h-12 text-[#BDBDBD]/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white mb-1">Hiện chưa có lịch sử bán vé!</p>
                    <p className="text-xs text-[#BDBDBD] max-w-xs mx-auto leading-relaxed">
                      Lịch sử đặt vé điện tử cá nhân của quý khách hiện trống trơn. Hãy quay lại trang chủ, khám phá 20 tựa phim bom tấn đang chiếu và đặt ngay!
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {favoriteMoviesList.length > 0 ? (
                  favoriteMoviesList.map((movie) => (
                    <div
                      key={movie.id}
                      onClick={() => onSelectMovie(movie)}
                      className="group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-[#C8102E]/20 hover:shadow-lg transition-all relative"
                    >
                      <div className="relative aspect-[3/4] overflow-hidden bg-black/20">
                        {onToggleFavorite && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Avoid triggering open detail modal
                              onToggleFavorite(movie.id);
                            }}
                            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/70 hover:bg-red-600 border border-white/10 hover:border-red-500 text-red-500 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm"
                            title="Xóa khỏi danh sách yêu thích"
                          >
                            <Heart className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-103 transitionduration-300"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                        <span className="absolute bottom-2.5 left-2.5 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold">
                          {movie.rating} • {movie.duration}ph
                        </span>
                      </div>
                      <div className="p-3 text-left">
                        <h4 className="text-white text-xs font-bold truncate group-hover:text-[#C8102E] transition">
                          {movie.title}
                        </h4>
                        <span className="text-[10px] text-[#BDBDBD] font-medium font-mono">
                          {movie.genre.slice(0, 2).join(" / ")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center border-2 border-dashed border-white/5 rounded-2xl bg-[#1E1E1E]/50">
                    <Heart className="w-12 h-12 text-[#BDBDBD]/30 mx-auto mb-3" />
                    <p className="text-sm font-bold text-white mb-1">Tiêu mục phim yêu thích trống!</p>
                    <p className="text-xs text-[#BDBDBD] max-w-xs mx-auto leading-relaxed">
                      Để thêm bộ phim tâm đắc bất kỳ vào mục này, hãnh chọn phim, nhấp vào nút hình trái tim chi tiết phim để tiện lợi đặt sớm.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
