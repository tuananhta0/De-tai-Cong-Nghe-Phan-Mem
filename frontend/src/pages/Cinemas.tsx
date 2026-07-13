/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MapPin, Phone, HelpCircle, Film, ArrowRight, ShieldAlert } from "lucide-react";
import { Cinema, Movie, Showtime } from "../types";

interface CinemasViewProps {
  cinemas: Cinema[];
  movies: Movie[];
  showtimes: Showtime[];
  onSelectMovie: (movie: Movie) => void;
}

export default function CinemasView({ cinemas, movies, showtimes, onSelectMovie }: CinemasViewProps) {
  const [selectedCinemaId, setSelectedCinemaId] = useState<string>(cinemas[0].id);

  const activeCinema = cinemas.find((c) => c.id === selectedCinemaId) || cinemas[0];

  // So sánh theo đúng ngày dương lịch hiện tại (dd/mm/yyyy) của thiết bị người
  // dùng, không phụ thuộc giờ trong ngày - một suất chiếu bất kỳ giờ nào trong
  // hôm nay vẫn được coi là "hôm nay".
  const isToday = (displayDate: string): boolean => {
    const parts = displayDate.split("/");
    if (parts.length !== 3) return false;
    const [dd, mm, yyyy] = parts;
    const now = new Date();
    return (
      parseInt(dd, 10) === now.getDate() &&
      parseInt(mm, 10) === now.getMonth() + 1 &&
      parseInt(yyyy, 10) === now.getFullYear()
    );
  };

  // Find playing movies that have showtimes TRONG HÔM NAY tại rạp đang chọn.
  // Trước đây chỉ lọc theo cinemaId nên hiển thị lẫn lộn cả suất chiếu cũ/quá
  // khứ lẫn tương lai, không khớp với tiêu đề "Các Phim Có Suất Hôm Nay".
  const activeCinemaShowtimes = showtimes.filter(
    (st) => st.cinemaId === selectedCinemaId && isToday(st.date)
  );
  
  // Unique movie IDs scheduled in this cinema today/tomorrow
  const movieIdsInCinema = Array.from(new Set(activeCinemaShowtimes.map((st) => st.movieId)));
  const scheduledMovies = movies.filter((m) => movieIdsInCinema.includes(m.id));

  return (
    <div className="bg-[#121212] min-h-screen py-10 text-white font-sans text-left animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title row */}
        <div className="border-b border-white/5 pb-5 mb-8">
          <span className="text-[#C8102E] text-xs font-black uppercase tracking-wider block mb-1">HỆ THỐNG CỤM RẠP CHIẾU TOÀN QUỐC</span>
          <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
            Khám phá hệ thống rạp X Cinema
          </h2>
          <p className="text-xs text-[#BDBDBD] font-normal mt-1 max-w-2xl leading-relaxed">
            Sở hữu hệ thống máy chiếu tia Laser IMAX thế hệ mới và âm thanh Dolby Atmos tiên tiến bậc nhất. Hãy chọn một chi nhánh rạp bên dưới để tìm kiếm các mác giờ chiếu trực tiếp và đặt vé ngay.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Cinema selection list */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24 max-h-[calc(100vh-140px)] overflow-y-auto pr-2">
            <span className="block text-[#BDBDBD] text-[10px] uppercase font-bold tracking-wider mb-2">DANH SÁCH CHI NHÁNH RẠP</span>
            
            {cinemas.map((cinema) => {
              const isSelected = cinema.id === selectedCinemaId;
              return (
                <div
                  key={cinema.id}
                  onClick={() => setSelectedCinemaId(cinema.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition flex space-x-4 items-center ${
                    isSelected
                      ? "border-[#C8102E] bg-[#1E1E1E]"
                      : "border-white/5 bg-black/20 hover:bg-black/30 hover:border-white/10"
                  }`}
                >
                  <img
                    src={cinema.imageUrl}
                    alt={cinema.name}
                    className="w-14 h-14 object-cover rounded-lg shadow-md flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="block font-bold text-sm text-white mb-1 truncate leading-tight group-hover:text-[#C8102E]">
                      {cinema.name}
                    </span>
                    <span className="block text-[11px] text-[#BDBDBD] truncate font-normal">
                      {cinema.address}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Detailed selected cinema presentation and today schedules */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-white/5 space-y-5">
              
              {/* Image banner */}
              <div className="relative h-48 rounded-xl overflow-hidden bg-black select-none border border-white/5">
                <img
                  src={activeCinema.imageUrl}
                  alt={activeCinema.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <h3 className="text-xl font-black text-white tracking-tight drop-shadow leading-tight">
                    {activeCinema.name}
                  </h3>
                  <p className="text-xs text-[#BDBDBD] truncate font-normal mt-0.5">
                    {activeCinema.address}
                  </p>
                </div>
              </div>

              {/* Specs & map coordinates description layout */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                  <span className="text-[#BDBDBD] text-[10px] uppercase block mb-1">Đường dây nóng hotline:</span>
                  <span className="text-white font-mono font-bold block">{activeCinema.phone}</span>
                </div>
                <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                  <span className="text-[#BDBDBD] text-[10px] uppercase block mb-1">Dịch vụ tích hợp:</span>
                  <span className="text-amber-500 font-bold block">IMAX 3D / Sweetbox / 4DX</span>
                </div>
              </div>

              {/* Map embed layout placeholder */}
              <div className="bg-[#121212] p-4 rounded-xl border border-white/5 flex items-center justify-center text-center py-7">
                <div className="max-w-md">
                  <MapPin className="w-7 h-7 text-[#C8102E] mx-auto mb-2 animate-bounce" />
                  <span className="block font-bold text-xs text-white uppercase mb-1">Định vị vệ tinh rạp X Cinema</span>
                  <span className="block text-[10px] text-[#BDBDBD] leading-relaxed max-w-sm">
                    {activeCinema.address}. Đừng quên quét mã QR check-in tại sảnh sảnh rạp để được miễn phí 3 tiếng gửi xe máy / ô tô khi xem phim.
                  </span>
                </div>
              </div>

            </div>

            {/* Scheduled Movies Grid in this exact cinema */}
            <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-white/5 text-left">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-l-3 border-[#C8102E] pl-2.5">
                Các Phim Có Múi Suất Hôm Nay
              </h3>

              {scheduledMovies.length > 0 ? (
                <div className="space-y-4">
                  {scheduledMovies.map((movie) => {
                    // Showtimes for this specific movie in this specific cinema
                    const movieShowtimes = activeCinemaShowtimes.filter((st) => st.movieId === movie.id);
                    return (
                      <div
                        key={movie.id}
                        className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex space-x-3.5 min-w-0">
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-11 h-15 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="min-w-0 flex flex-col justify-center">
                            <span className="text-white text-xs font-bold leading-tight truncate">{movie.title}</span>
                            <span className="text-[10px] text-[#BDBDBD] font-mono tracking-wide mt-1 block">
                              Mác {movie.rating} • {movie.duration}ph • {movie.genre.slice(0, 2).join(", ")}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectMovie(movie)}
                          className="flex items-center space-x-1 border border-[#C8102E]/30 text-[#C8102E] bg-[#C8102E]/5 hover:bg-[#C8102E] hover:text-white px-4 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0"
                        >
                          <span>Chọn Suất Chiếu</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-white/10 rounded-xl text-center text-[#BDBDBD] text-xs">
                  Hôm nay hiện tại các phòng máy rạp này đã kín suất hoạt động hoặc hoàn thành phát sáng. Vui lòng quay trở lại màn hình phim để đặt online sớm cho ngày mai!
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
