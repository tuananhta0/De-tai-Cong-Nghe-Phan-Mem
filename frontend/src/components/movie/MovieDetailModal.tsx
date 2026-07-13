/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { X, Calendar, Star, LayoutGrid, Clock, Play, MapPin, User, ArrowLeft, Ticket, Heart } from "lucide-react";
import { Movie, Cinema, Showtime } from "../../types";
import { getYouTubeId } from "../../utils/helpers";

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  cinemas: Cinema[];
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
  allMovies: Movie[];
  onSelectRelatedMovie: (movie: Movie) => void;
  favoriteMovies?: string[];
  onToggleFavorite?: (movieId: string) => void;
}

export default function MovieDetailModal({
  movie,
  onClose,
  cinemas,
  showtimes,
  onSelectShowtime,
  allMovies,
  onSelectRelatedMovie,
  favoriteMovies = [],
  onToggleFavorite,
}: MovieDetailModalProps) {
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>(cinemas[0].id);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showTrailerInModal, setShowTrailerInModal] = useState(false);

  // Check if movie is favorited
  const isFavorite = favoriteMovies.includes(movie.id);

  // Filter showtimes for this movie and selected cinema
  const movieShowtimes = showtimes.filter(
    (st) => st.movieId === movie.id && st.cinemaId === selectedCinemaId
  );

  // Helper: parse DD/MM/YYYY string to Date (midnight local time)
  const parseShowtimeDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split("/").map(Number);
    return new Date(year, month - 1, day);
  };

  // Today at midnight (no time component) for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group showtimes by date — only today and future dates
  const showtimeDates = Array.from(new Set(movieShowtimes.map((st) => st.date)))
    .filter((dateStr) => parseShowtimeDate(dateStr) >= today)
    .sort((a, b) => parseShowtimeDate(a).getTime() - parseShowtimeDate(b).getTime());

  // Pick first date as active if none chosen
  const activeDate = selectedDate || showtimeDates[0] || "";

  // Current time HH:MM for filtering past showtimes on today
  const now = new Date();
  const currentTimeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const todayStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;
  const isActiveToday = activeDate === todayStr;

  // Filter and sort active showtimes — hide past showtimes if viewing today
  const activeShowtimes = movieShowtimes
    .filter((st) => {
      if (st.date !== activeDate) return false;
      if (isActiveToday && st.time <= currentTimeStr) return false;
      return true;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  // Related movies (same genre or simply other movies omitting current one)
  const relatedMovies = allMovies
    .filter((m) => m.id !== movie.id && m.genre.some((g) => movie.genre.includes(g)))
    .slice(0, 4);

  // Extract YouTube ID
  const youtubeId = getYouTubeId(movie.trailerUrl);

  return (
    <div className="bg-[#121212] min-h-screen pb-16 text-white text-left animate-fadeIn">
      {/* Visual Header / Control actions */}
      <div className="max-w-7xl mx-auto px-4 pt-6 flex justify-between items-center relative z-30">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-[#BDBDBD] hover:text-white bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>VỀ TRANG CHỦ</span>
        </button>

        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(movie.id)}
            className={`flex items-center space-x-2 border px-4 py-2 rounded-full text-xs font-black tracking-wider transition duration-200 cursor-pointer ${
              isFavorite
                ? "bg-red-500/10 border-red-500/50 text-red-500 hover:bg-red-500/20"
                : "bg-white/5 border-white/10 text-[#BDBDBD] hover:text-white hover:bg-white/10"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-[#BDBDBD]"}`} />
            <span>{isFavorite ? "ĐÃ THÊM YÊU THÍCH" : "THÊM YÊU THÍCH"}</span>
          </button>
        )}
      </div>

      {/* Hero Banner Section */}
      <div className="relative h-[300px] md:h-[420px] w-full mt-4 bg-black overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.bannerUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/40 to-black/30" />

        {/* Big play button to trigger trailer pop */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <button
            onClick={() => setShowTrailerInModal(true)}
            className="w-16 h-16 sm:w-20 sm:h-20 bg-[#C8102E]/90 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition transform duration-250 animate-pulse relative group"
            aria-label="Xem trailer"
          >
            <Play className="w-8 h-8 fill-white ml-1 text-white" />
            <span className="absolute -bottom-8 bg-black/80 px-2.5 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
              Xem Trailer
            </span>
          </button>
        </div>
      </div>

      {/* Detailed Meta Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 sm:-mt-28 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Poster picture */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="aspect-[2/3] w-full rounded-2xl overflow-hidden border-2 border-white/10 bg-[#1E1E1E] shadow-2xl">
              <img 
                src={movie.posterUrl} 
                alt={movie.title} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image";
                }}
              />
            </div>
          </div>

          {/* Right Column: Title info details */}
          <div className="lg:col-span-9 flex flex-col justify-end pt-8 lg:pt-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded text-xs font-extrabold text-white ${
                movie.rating === "T18" ? "bg-red-600" :
                movie.rating === "T16" ? "bg-orange-500" :
                movie.rating === "T13" ? "bg-yellow-600" : "bg-green-600"
              }`}>
                MÁC {movie.rating}
              </span>
              <span className="text-xs bg-white/10 px-2.5 py-1 rounded font-semibold text-white">
                {movie.genre.join(" / ")}
              </span>
              <span className="flex items-center text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mr-1" />
                {movie.score.toFixed(1)} / 10
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-2">
              {movie.title}
            </h2>
            {movie.originalTitle && (
              <p className="text-sm font-mono text-[#BDBDBD] uppercase tracking-widest mb-6">
                {movie.originalTitle}
              </p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#1E1E1E] border border-white/5 text-xs text-[#BDBDBD]">
              <div>
                <span className="block mb-1 text-[10px] text-[#BDBDBD]/60 uppercase tracking-wider font-bold">Thời Lượng</span>
                <span className="text-sm font-bold text-white flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-[#C8102E]" />
                  {movie.duration} phút
                </span>
              </div>
              <div>
                <span className="block mb-1 text-[10px] text-[#BDBDBD]/60 uppercase tracking-wider font-bold">Ngày Khởi Chiếu</span>
                <span className="text-sm font-bold text-white flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-[#C8102E]" />
                  {movie.releaseDate}
                </span>
              </div>
              <div>
                <span className="block mb-1 text-[10px] text-[#BDBDBD]/60 uppercase tracking-wider font-bold">Đạo Diễn</span>
                <span className="text-sm font-bold text-white truncate block">{movie.director}</span>
              </div>
              <div>
                <span className="block mb-1 text-[10px] text-[#BDBDBD]/60 uppercase tracking-wider font-bold">Ngôn Ngữ</span>
                <span className="text-sm font-bold text-white truncate block">{movie.language}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs: Information vs Booking scheduler */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Main info detailed descriptions */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-white/5">
              <h3 className="text-base font-bold text-white uppercase tracking-wider border-l-4 border-[#C8102E] pl-2.5 mb-4">
                Nội dung phim
              </h3>
              <p className="text-sm text-[#BDBDBD]/90 leading-relaxed font-normal">
                {movie.description}
              </p>

              {/* Cast */}
              <div className="mt-6 pt-6 border-t border-white/5">
                <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3">
                  Diễn viên chính
                </span>
                <div className="flex flex-wrap gap-2">
                  {movie.cast.map((actor, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-[#121212] hover:bg-[#C8102E]/10 border border-white/10 hover:border-[#C8102E] px-3.5 py-1.5 rounded-full transition text-[#BDBDBD] hover:text-white flex items-center gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Showtime Scheduling System: Only display if movie is not upcoming */}
            {!movie.isUpcoming ? (
              <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-white/5 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
                  <h3 className="text-base font-bold text-white uppercase tracking-wider border-l-4 border-[#C8102E] pl-2.5">
                    LỊCH CHIẾU & ĐẶT VÉ NHÀ RẠP
                  </h3>

                  {/* Cinema Selector */}
                  <div className="relative">
                    <select
                      value={selectedCinemaId}
                      onChange={(e) => {
                        setSelectedCinemaId(e.target.value);
                        setSelectedDate(""); // reset active date to select the first matching date
                      }}
                      className="bg-[#121212] text-xs font-semibold text-white border border-white/10 px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#C8102E] transition cursor-pointer"
                    >
                      {cinemas.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <MapPin className="w-4 h-4 absolute right-10 top-3 text-[#BDBDBD] pointer-events-none" />
                  </div>
                </div>

                {/* Showtimes availability flow */}
                {showtimeDates.length > 0 ? (
                  <div className="space-y-6">
                    {/* Date filter row */}
                    <div className="flex overflow-x-auto pb-2 space-x-2 scrollbar-thin">
                      {showtimeDates.map((date) => (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`px-4 py-2.5 rounded-lg text-xs font-bold min-w-[110px] transition flex-shrink-0 text-center ${
                            activeDate === date
                              ? "bg-[#C8102E] text-white shadow-md shadow-[#C8102E]/20"
                              : "bg-[#121212] text-[#BDBDBD] border border-white/5 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5 inline mr-1" />
                          {date}
                        </button>
                      ))}
                    </div>

                    {/* Showtimes hour grid grouped */}
                    <div>
                      <p className="text-xs text-[#BDBDBD] mb-3.5 uppercase tracking-wider font-semibold">
                        Khung giờ phát sóng:
                      </p>
                      {activeShowtimes.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {activeShowtimes.map((st) => (
                            <button
                              key={st.id}
                              onClick={() => onSelectShowtime(st)}
                              className="group bg-[#121212] hover:bg-[#C8102E] border border-white/5 hover:border-[#C8102E] p-3 rounded-xl transition text-center hover:scale-[1.03] shadow-md hover:shadow-red-600/10"
                            >
                              <span className="block text-white text-sm font-black tracking-wider mb-0.5 group-hover:scale-105 transition leading-snug">
                                {st.time}
                              </span>
                              <span className="block text-[10px] text-[#BDBDBD] group-hover:text-white/80 font-mono font-medium">
                                {st.format} • {st.room}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-[#BDBDBD] border border-dashed border-white/10 rounded-xl">
                          Không có suất chiếu phù hợp cho rạp và ngày đã chọn. Vui lòng chọn rạp chiếu khác.
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-[#BDBDBD] border border-dashed border-white/10 rounded-xl">
                    Rạp đã chọn hiện không hoạt động suất trực tuyến nào cho phim này hôm nay. Quý khách vui lòng chuyển rạp Hoàn Kiếm / Cầu Giấy để đặt phòng.
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 text-center">
                <Ticket className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h4 className="text-amber-500 font-bold uppercase tracking-wider mb-2">
                  PHIM CHƯA KHỞI CHIẾU CHÍNH THỨC
                </h4>
                <p className="text-xs text-[#BDBDBD] max-w-md mx-auto leading-relaxed">
                  Tác phẩm đặc biệt này hiện đang nằm trong danh mục **Sắp Chiếu** của rạp X Cinema. Hệ thống đặt vé sớm trực tuyến sẽ tự động được mở khi bộ phim cán mốc khởi công chính thức. Vui lòng thêm phim vào danh sách yêu thích của hồ sơ để nhận chỉ dẫn.
                </p>
              </div>
            )}
          </div>

          {/* Right Column sidebar: Related Movies */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-l-3 border-[#C8102E] pl-2.5">
                Xem Thêm Phim Cùng Đề Tài
              </h3>

              {relatedMovies.length > 0 ? (
                <div className="space-y-4">
                  {relatedMovies.map((rMovie) => (
                    <div
                      key={rMovie.id}
                      onClick={() => {
                        onSelectRelatedMovie(rMovie);
                        setSelectedCinemaId(cinemas[0].id);
                        setSelectedDate("");
                      }}
                      className="flex space-x-3.5 p-2 rounded-xl bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/5 transition cursor-pointer group"
                    >
                      <img
                        src={rMovie.posterUrl}
                        alt={rMovie.title}
                        className="w-16 h-22 object-cover rounded-lg shadow-md flex-shrink-0"
                      />
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-white text-xs font-bold leading-snug tracking-tight mb-1 truncate group-hover:text-[#C8102E] transition">
                          {rMovie.title}
                        </h4>
                        <p className="text-[#BDBDBD] text-[10px] font-mono mb-1.5">
                          {rMovie.genre.slice(0, 2).join(" / ")}
                        </p>
                        <div className="flex items-center space-x-2 text-[10px] text-[#BDBDBD]">
                          <span className="flex items-center text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500 mr-0.5 inline" />
                            {rMovie.score > 0 ? rMovie.score.toFixed(1) : "Hot"}
                          </span>
                          <span>•</span>
                          <span>{rMovie.duration}ph</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#BDBDBD] italic py-3 text-center">
                  Hiện chưa có thêm đề xuất nào khác cho mảng phim này.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Iframe Trailer Overlay Portal */}
      {showTrailerInModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-[#121212] border border-white/10">
            {/* Exit trigger */}
            <button
              onClick={() => setShowTrailerInModal(false)}
              className="absolute top-4 right-4 z-50 p-2 text-white bg-[#C8102E] hover:bg-red-700 rounded-full cursor-pointer shadow-lg hover:scale-105 transition"
              aria-label="Đóng trailer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&rel=0`}
              title={`${movie.title} Official Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
