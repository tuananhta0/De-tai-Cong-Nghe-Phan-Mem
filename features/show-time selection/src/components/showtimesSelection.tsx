import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';[cite: 5]
import { motion, AnimatePresence } from 'motion/react'; // Sử dụng thư viện motion có sẵn trong dự án[cite: 5]
import { DailyShowtime, ShowtimeSlot } from '../types/showtime';

interface ShowtimeSelectionProps {
  movieId: string;
  onSelectShowtime: (showtimeId: string, details: any) => void;
}

export const ShowtimeSelection: React.FC<ShowtimeSelectionProps> = ({ movieId, onSelectShowtime }) => {
  const [showtimesData, setShowtimesData] = useState<DailyShowtime[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Gọi API lấy dữ liệu suất chiếu
    fetch(`/api/showtimes?movieId=${movieId}`)
      .then((res) => res.json())
      .then((data) => {
        setShowtimesData(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date); // Mặc định chọn ngày đầu tiên
        }
        setLoading(false);
      })
      .catch((err) => console.error("Lỗi fetch showtimes:", err));
  }, [movieId]);

  // Lọc dữ liệu theo ngày đang được chọn
  const activeDateData = showtimesData.find((item) => item.date === selectedDate);

  if (loading) {
    return <div className="text-center text-[#a0a5b1] py-10">Đang tải lịch chiếu...</div>;
  }

  return (
    <div className="bg-[#1a1b1e] p-6 rounded-xl border border-[#2a2c32] max-w-4xl mx-auto my-6">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
        <span className="w-2 h-5 bg-[#ff5263] rounded-sm"></span>
        Lịch Chiếu & Chọn Suất Chiếu
      </h2>

      {/* 1. Thanh chọn ngày (Date Selector) - Cuộn ngang */}
      <div className="flex gap-3 overflow-x-auto pb-3 mb-6 border-b border-[#2a2c32] scrollbar-none">
        {showtimesData.map((item) => {
          const isSelected = item.date === selectedDate;
          const [year, month, day] = item.date.split('-');
          return (
            <button
              key={item.date}
              onClick={() => setSelectedDate(item.date)}
              className={`flex flex-col items-center min-w-[100px] py-3 px-4 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#ff5263] border-[#ff5263] text-white shadow-lg shadow-[#ff5263]/20'
                  : 'bg-[#121315] border-[#2a2c32] text-[#a0a5b1] hover:border-[#ff5263]/50 hover:text-white'
              }`}
            >
              <Calendar size={16} className="mb-1" />
              <span className="text-xs opacity-80">Tháng {month}</span>
              <span className="text-lg font-bold">{day}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Danh sách rạp và khung giờ tương ứng */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeDateData && activeDateData.cinemas.length > 0 ? (
            activeDateData.cinemas.map((cinema) => (
              <motion.div
                key={cinema.cinemaId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-[#121315] p-4 rounded-lg border border-[#2a2c32]"
              >
                {/* Tên rạp */}
                <div className="flex items-center gap-2 text-white font-semibold mb-4 border-b border-[#2a2c32]/50 pb-2">
                  <MapPin size={18} className="text-[#ff5263]" />
                  {cinema.cinemaName}
                </div>

                {/* Grid Khung giờ */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {cinema.slots.map((slot: ShowtimeSlot) => (
                    <button
                      key={slot.showtimeId}
                      onClick={() => onSelectShowtime(slot.showtimeId, {
                        date: selectedDate,
                        cinemaName: cinema.cinemaName,
                        ...slot
                      })}
                      className="group flex flex-col items-center justify-center p-3 rounded bg-[#1a1b1e] border border-[#2a2c32] cursor-pointer hover:border-[#ff5263] transition-all"
                    >
                      <div className="flex items-center gap-1 text-white font-bold text-lg group-hover:text-[#ff5263] transition-colors">
                        <Clock size={14} />
                        {slot.time}
                      </div>
                      <div className="text-xs text-[#a0a5b1] mt-1">
                        {slot.format} • {slot.price.toLocaleString('vi-VN')}đ
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-[#a0a5b1] py-6">Không có suất chiếu nào cho ngày này.</div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
