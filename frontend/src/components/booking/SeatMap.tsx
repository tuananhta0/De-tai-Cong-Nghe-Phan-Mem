/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Info, Armchair, Ticket, ShieldAlert } from "lucide-react";
import { Showtime, Movie, Cinema, Booking, ComboItem } from "../../types";
import { seatApi } from "../../services/api";
import { useShowtimeSeatEvents, SeatEvent } from "../../services/useWebSocket";

interface ComboSelection {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface SeatMapProps {
  showtime: Showtime;
  movie: Movie;
  cinema: Cinema;
  bookings: Booking[];
  comboDeals?: ComboItem[];
  onConfirmSeats: (
    selectedSeats: string[], 
    totalAmount: number, 
    selectedCombos?: ComboSelection[]
  ) => void;
  onBack: () => void;
}

const DEFAULT_COMBO_DEALS: ComboItem[] = [
  { 
    id: "cb-solo", 
    name: "Combo Solo Sweet", 
    description: "1 Bắp ngọt lớn + 1 Nước ngọt lớn (Pepsi / Sprite)", 
    price: 65000,
    imageUrl: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&q=80&w=300"
  },
  { 
    id: "cb-couple", 
    name: "Combo Couple Love", 
    description: "1 Bắp lớn vị Phô mai / Tảo biển + 2 Nước ngọt lớn 32oz", 
    price: 109000,
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=300"
  },
  { 
    id: "cb-gold", 
    name: "Combo Golden Ribbon VIP", 
    description: "1 Siêu bắp Caramel khổng lồ + 2 Ly sứ X Cinema + 2 Nước trái cây cao cấp", 
    price: 159000,
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=300"
  },
];

export default function SeatMap({
  showtime,
  movie,
  cinema,
  bookings,
  comboDeals = DEFAULT_COMBO_DEALS,
  onConfirmSeats,
  onBack,
}: SeatMapProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedCombos, setSelectedCombos] = useState<ComboSelection[]>([]);

  const handleUpdateComboQty = (comboId: string, name: string, price: number, delta: number) => {
    setSelectedCombos(prev => {
      const existing = prev.find(item => item.id === comboId);
      if (existing) {
        const newQty = existing.quantity + delta;
        if (newQty <= 0) {
          return prev.filter(item => item.id !== comboId);
        }
        return prev.map(item => item.id === comboId ? { ...item, quantity: newQty } : item);
      } else {
        if (delta <= 0) return prev;
        return [...prev, { id: comboId, name, price, quantity: delta }];
      }
    });
  };

  // Auto dismiss toast
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Rows configuration
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const seatsPerRow = 12;

  const [isLoadingSeats, setIsLoadingSeats] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadRealSeats = async () => {
      setIsLoadingSeats(true);
      try {
        // Lấy trạng thái ghế THẬT từ SQL Server (qua backend C++): ghế nào đã
        // "Booked" hoặc đang bị người khác "Holding" (giữ chỗ tạm 10 phút) đều
        // không cho người dùng hiện tại chọn lại.
        const realSeats = await seatApi.getByShowtime(showtime.id);
        if (cancelled) return;

        const reserved = realSeats
          .filter((s) => s.status === "Booked" || s.status === "Holding")
          .map((s) => s.seatName);

        setReservedSeats(reserved);
        setSelectedSeats([]);
      } catch (err) {
        console.warn("Không thể tải trạng thái ghế từ backend, dùng dữ liệu mô phỏng tạm thời:", err);
        if (cancelled) return;

        // Dự phòng: nếu backend chưa sẵn sàng, vẫn cho phép xem giao diện đặt
        // vé bằng thuật toán giả lập cũ, để không chặn hoàn toàn trải nghiệm demo.
        const reserved: string[] = [];
        const seed = showtime.id.charCodeAt(showtime.id.length - 1) || 5;
        rows.forEach((row) => {
          for (let i = 1; i <= seatsPerRow; i++) {
            const seatCode = `${row}${i}`;
            const shouldReserve = (seed * i + row.charCodeAt(0)) % 7 === 0;
            if (shouldReserve && seatCode !== "H1" && seatCode !== "H2") {
              reserved.push(seatCode);
            }
          }
        });
        if (bookings && Array.isArray(bookings)) {
          bookings.forEach((booking) => {
            if (
              booking.movieTitle === movie.title &&
              booking.cinemaName === cinema.name &&
              booking.showDate === showtime.date &&
              booking.showTime === showtime.time &&
              booking.room === showtime.room &&
              booking.format === showtime.format
            ) {
              booking.seats.forEach((seat) => {
                if (!reserved.includes(seat)) reserved.push(seat);
              });
            }
          });
        }
        setReservedSeats(reserved);
        setSelectedSeats([]);
      } finally {
        if (!cancelled) setIsLoadingSeats(false);
      }
    };

    loadRealSeats();
    return () => {
      cancelled = true;
    };
  }, [showtime.id, bookings, movie.title, cinema.name, showtime.date, showtime.time, showtime.room, showtime.format]);

  // Real-time: khi người khác đang xem CÙNG suất chiếu này khóa/đặt 1 ghế,
  // server đẩy sự kiện qua WebSocket ngay lập tức, không cần load lại trang.
  useShowtimeSeatEvents(showtime.id, (evt) => {
    const newlyTaken = evt.type === "seat_locked" && evt.seatName ? [evt.seatName] : evt.seats || [];
    if (newlyTaken.length === 0) return;

    setReservedSeats((prev) => {
      const merged = new Set(prev);
      newlyTaken.forEach((s) => merged.add(s));
      return Array.from(merged);
    });

    // Nếu ghế vừa bị người khác lấy mất trùng với ghế mình đang chọn, tự bỏ chọn
    // và báo cho người dùng biết, tránh họ thanh toán nhầm ghế đã hết.
    setSelectedSeats((prev) => {
      const stillAvailable = prev.filter((s) => !newlyTaken.includes(s));
      if (stillAvailable.length !== prev.length) {
        setErrorMessage("Một số ghế bạn chọn vừa được người khác đặt trước. Vui lòng chọn ghế khác.");
      }
      return stillAvailable;
    });
  });

  // Determine seat category & price
  const getSeatInfo = (seatCode: string) => {
    const row = seatCode.charAt(0);
    if (row === "H") {
      return {
        type: "Couple",
        label: "Ghế Đôi",
        price: showtime.priceDouble,
        colorClass: "bg-pink-900 border-pink-500 hover:bg-pink-700 text-white",
        selectedClass: "bg-pink-600 border-pink-400 ring-2 ring-pink-500 text-white"
      };
    } else if (["D", "E", "F", "G"].includes(row)) {
      return {
        type: "VIP",
        label: "Ghế VIP",
        price: showtime.priceVIP,
        colorClass: "bg-amber-900/40 border-amber-500 hover:bg-amber-800/80 text-amber-200",
        selectedClass: "bg-amber-500 border-amber-300 text-white ring-2 ring-amber-400"
      };
    } else {
      return {
        type: "Standard",
        label: "Ghế Thường",
        price: showtime.priceStandard,
        colorClass: "bg-zinc-800 border-zinc-600 hover:bg-zinc-700 text-zinc-300",
        selectedClass: "bg-[#C8102E] border-red-400 text-white ring-2 ring-red-500"
      };
    }
  };

  const handleSeatClick = async (seatCode: string) => {
    if (reservedSeats.includes(seatCode)) return;

    if (selectedSeats.includes(seatCode)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatCode));
      return;
    }

    if (selectedSeats.length >= 8) {
      setErrorMessage("Bạn chỉ được chọn tối đa 8 ghế cho mỗi giao dịch đặt vé.");
      return;
    }

    // Giữ chỗ thật trên server (10 phút) để người khác không thể chọn trùng ghế này
    try {
      await seatApi.lock(showtime.id, seatCode);
      setSelectedSeats((prev) => [...prev, seatCode]);
    } catch (err) {
      console.warn("Không thể giữ chỗ ghế:", err);
      const message = err instanceof Error ? err.message : "";

      // Phân biệt rõ 2 nguyên nhân lỗi khác nhau từ backend, thay vì gộp chung
      // thành "ghế đã bị giữ" cho mọi trường hợp (gây hiểu nhầm khi suất chiếu
      // mới tạo chưa được khởi tạo ShowtimeSeats -> backend trả 404 "Không tìm
      // thấy ghế" chứ KHÔNG phải ghế đang bị người khác giữ).
      if (message.includes("Không tìm thấy ghế")) {
        setErrorMessage(
          `Ghế ${seatCode} chưa được khởi tạo cho suất chiếu này. Vui lòng báo quản trị viên kiểm tra lại phòng chiếu/ghế của suất chiếu (lỗi cấu hình, không phải do ghế đã có người đặt).`
        );
        // Không thêm vào reservedSeats: đây không phải do ghế bị chiếm, không
        // nên khoá vĩnh viễn ghế này trên giao diện người dùng hiện tại.
      } else {
        setErrorMessage(message || `Ghế ${seatCode} vừa được người khác giữ chỗ. Vui lòng chọn ghế khác.`);
        setReservedSeats((prev) => (prev.includes(seatCode) ? prev : [...prev, seatCode]));
      }
    }
  };

  // Compute total price based on active selection
  const totalAmount = selectedSeats.reduce((sum, seatCode) => {
    return sum + getSeatInfo(seatCode).price;
  }, 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="bg-[#121212] min-h-screen py-10 text-white font-sans animate-fadeIn text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Detail Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <span className="text-[#C8102E] text-xs font-bold uppercase tracking-wider block mb-1">
              BƯỚC 1: CHỌN GHẾ NGỒI
            </span>
            <h2 className="text-2xl font-black text-white leading-tight">
              {movie.title}
            </h2>
            <p className="text-xs text-[#BDBDBD] font-medium mt-1">
              {cinema.name} • <span className="font-mono text-amber-500">{showtime.room}</span> • {showtime.date} • <span className="font-mono text-amber-500">{showtime.time}</span> • Format {showtime.format}
            </p>
          </div>
          <button
            onClick={onBack}
            className="text-xs bg-[#1E1E1E] hover:bg-white/5 border border-white/15 px-4.5 py-2.5 rounded-full font-bold transition flex-shrink-0"
          >
            Quay Lại Lịch Chiếu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Big Interactive Seat Board */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-[#1E1E1E] border border-white/5 flex flex-col items-center">
            
            {/* The Curved SCREEN Indicator element */}
            <div className="w-full max-w-md mb-12 text-center relative select-none">
              <div className="h-2 w-full bg-gradient-to-b from-[#C8102E] to-transparent rounded-full shadow-lg shadow-[#C8102E]/40" />
              <div className="w-full text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#BDBDBD]/60 py-3 font-sans">
                MÀN HÌNH CHÍNH
              </div>
            </div>

            {/* Virtual Scrollbar Container for small resolution devices */}
            <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
              <div className="min-w-[620px] px-4 flex flex-col items-center space-y-3.5 select-none">
                
                {/* Seat Rows Loop */}
                {rows.map((row) => {
                  const isCoupleRow = row === "H";
                  return (
                    <div key={row} className="flex items-center space-x-2.5">
                      {/* Left Row Identifier */}
                      <span className="w-5 text-right font-mono text-xs font-bold text-[#BDBDBD]/80 pr-1">
                        {row}
                      </span>

                      {/* Seats Horizontal Row Loop */}
                      <div className="flex items-center space-x-2">
                        {Array.from({ length: isCoupleRow ? Math.floor(seatsPerRow / 2) : seatsPerRow }, (_, idx) => {
                          const seatNumber = isCoupleRow ? idx * 2 + 1 : idx + 1;
                          const seatCode = isCoupleRow ? `${row}${idx + 1}` : `${row}${seatNumber}`;
                          const isReserved = reservedSeats.includes(seatCode);
                          const isSelected = selectedSeats.includes(seatCode);
                          
                          // Custom sizing/spacing for couple seats
                          const seatConfig = getSeatInfo(seatCode);

                          return (
                            <button
                              key={seatCode}
                              disabled={isReserved}
                              onClick={() => handleSeatClick(seatCode)}
                              className={`rounded-md transition-all flex items-center justify-center font-mono text-[9px] sm:text-[10px] font-extrabold focus:outline-none pointer-events-auto border ${
                                isReserved
                                  ? "bg-zinc-800/20 border-zinc-800 text-zinc-700 cursor-not-allowed line-through"
                                  : isSelected
                                  ? seatConfig.selectedClass
                                  : seatConfig.colorClass
                              } ${
                                isCoupleRow
                                  ? "w-[56px] h-9 rounded-lg"
                                  : "w-[30px] h-8 sm:w-[32px] sm:h-8"
                              }`}
                              title={`${seatConfig.label}: ${seatCode} (${formatVND(seatConfig.price)})`}
                            >
                              {isReserved ? "X" : seatCode}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Row Identifier */}
                      <span className="w-5 text-left font-mono text-xs font-bold text-[#BDBDBD]/80 pl-1">
                        {row}
                      </span>
                    </div>
                  );
                })}

              </div>
            </div>

            {/* Color Map / Legend Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 pt-6 border-t border-white/5 w-full text-xs max-w-lg mx-auto">
              <div className="flex items-center space-x-2 text-zinc-400">
                <Armchair className="w-4 h-4 text-zinc-400" />
                <span>Ghế Thường</span>
              </div>
              <div className="flex items-center space-x-2 text-amber-500">
                <Armchair className="w-4 h-4 text-amber-500" />
                <span>Ghế VIP</span>
              </div>
              <div className="flex items-center space-x-2 text-pink-500">
                <div className="w-6 h-4 bg-pink-900 border border-pink-500 rounded" />
                <span>Ghế Đôi</span>
              </div>
              <div className="flex items-center space-x-2 text-zinc-600 line-through">
                <Armchair className="w-4 h-4 text-zinc-700" />
                <span>Đã Đặt (Reserved)</span>
              </div>
            </div>

            {/* Note alert */}
            <div className="mt-8 flex items-start space-x-2 bg-white/5 border border-white/10 p-4 rounded-xl text-[11px] text-[#BDBDBD] max-w-xl text-left mb-6">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Vui lòng kiểm tra kỹ múi giờ chiếu và rạp, tránh đặt nhầm các hàng ghế cận màn hình (Hàng A, B, C) nếu quý khách dễ bị mỏi mắt. Vé trực tuyến sau khi thanh toán thành công sẽ không thể chuyển đổi hoặc hoàn trả tiền mặt trừ trường hợp lỗi kỹ thuật rạp.
              </p>
            </div>

            {/* Snack & Popcorn Combo Selector */}
            <div className="w-full bg-[#1E1E1E] rounded-2xl border border-white/5 p-5 sm:p-6 space-y-4 text-left">
              <div>
                <h3 className="text-xs font-black text-amber-500 uppercase tracking-wider flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">SIÊU ƯU ĐÃI</span>
                  GỌI KÈM BẮP NƯỚC ONLINE (TIẾT KIỆM ĐẾN 25%)
                </h3>
                <p className="text-[11px] text-[#BDBDBD] mt-1">Giúp gia tăng trải nghiệm tuyệt hảo khi thưởng ngoạn tác phẩm bùng nổ.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {comboDeals.map((cb) => {
                  const selection = selectedCombos.find(item => item.id === cb.id);
                  const currentQty = selection ? selection.quantity : 0;
                  return (
                    <div key={cb.id} className="bg-black/35 p-3.5 rounded-xl border border-white/5 flex flex-col justify-between hover:border-amber-500/30 transition duration-150">
                      <div className="flex gap-3">
                        <img 
                          src={cb.imageUrl} 
                          alt={cb.name} 
                          className="w-12 h-12 rounded-lg object-cover shrink-0 bg-zinc-950 border border-white/5"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white leading-tight truncate">{cb.name}</h4>
                          <p className="text-[10px] text-zinc-400 mt-1 leading-snug line-clamp-2 min-h-[30px]">{cb.description}</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5">
                        <span className="font-mono text-xs font-black text-amber-500">{formatVND(cb.price)}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateComboQty(cb.id, cb.name, cb.price, -1)}
                            className="w-5.h-5 w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-bold transition flex items-center justify-center disabled:opacity-30"
                            disabled={currentQty === 0}
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-black text-white w-4 text-center">{currentQty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateComboQty(cb.id, cb.name, cb.price, 1)}
                            className="w-5.h-5 w-6 h-6 rounded bg-amber-500 hover:bg-amber-600 text-black font-mono text-xs font-bold transition flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Reservation Bill Summary */}
          <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#1E1E1E] border border-white/5 flex flex-col justify-between text-left">
            <div>
              <div className="border-b border-white/5 pb-4 mb-4">
                <span className="text-[10px] text-[#BDBDBD] font-mono tracking-wider block">PHIM ĐANG CHÚN</span>
                <span className="text-white text-md font-bold block">{movie.title}</span>
                <span className="text-[11px] text-[#C8102E] font-medium font-sans mt-0.5 block">{movie.genre.join(" / ")}</span>
              </div>

              <div className="space-y-3.5 text-xs pb-4 border-b border-white/5">
                <div className="flex justify-between">
                  <span className="text-[#BDBDBD]">Rạp chiếu:</span>
                  <span className="font-bold text-white text-right max-w-[200px]">{cinema.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#BDBDBD]">Suất chiếu:</span>
                  <span className="font-bold text-white font-mono">{showtime.time} • {showtime.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#BDBDBD]">Định dạng:</span>
                  <span className="font-bold text-white">{showtime.format} • {showtime.room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#BDBDBD]">Ghế chọn:</span>
                  <span className="font-bold text-red-500 font-mono text-sm">
                    {selectedSeats.length > 0 ? selectedSeats.sort().join(", ") : "Chưa chọn"}
                  </span>
                </div>
              </div>

              {/* Real time detailed multiplication receipt bill */}
              {selectedSeats.length > 0 && (
                <div className="py-4 space-y-1.5 border-b border-white/5 text-[11px] text-[#BDBDBD]">
                  <p className="font-semibold text-white/90 text-xs uppercase mb-1">Chi tiết giá ghế:</p>
                  {selectedSeats.map((sc) => {
                    const info = getSeatInfo(sc);
                    return (
                      <div key={sc} className="flex justify-between">
                        <span>Ghế {sc} ({info.label})</span>
                        <span className="font-mono text-white/90">{formatVND(info.price)}</span>
                      </div>
                    );
                  })}

                  {selectedCombos.length > 0 && (
                    <>
                      <div className="border-t border-white/5 my-2 pt-2"></div>
                      <p className="font-semibold text-white/90 text-xs uppercase mb-1">Bắp nước gọi kèm:</p>
                      {selectedCombos.map((item) => (
                        <div key={item.id} className="flex justify-between text-amber-400">
                          <span>{item.name} (x{item.quantity})</span>
                          <span className="font-mono font-bold">{formatVND(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Sum section */}
            <div className="mt-6 pt-2">
              <div className="flex justify-between items-baseline mb-6">
                <span className="text-xs text-[#BDBDBD]">TỔNG TIỀN VÉ:</span>
                <span className="text-2xl font-black text-[#C8102E] tracking-tight font-mono">
                  {formatVND(totalAmount + selectedCombos.reduce((s, c) => s + c.price * c.quantity, 0))}
                </span>
              </div>

              <button
                disabled={selectedSeats.length === 0}
                onClick={() => onConfirmSeats(selectedSeats, totalAmount + selectedCombos.reduce((s, c) => s + c.price * c.quantity, 0), selectedCombos)}
                className={`w-full flex items-center justify-center py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition transform hover:-translate-y-0.5 shadow-lg ${
                  selectedSeats.length > 0
                    ? "bg-[#C8102E] hover:bg-[#a60d26] text-white shadow-[#C8102E]/25 cursor-pointer"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5"
                }`}
              >
                <Ticket className="w-4 h-4 mr-2" />
                Tiếp Tục Thanh Toán
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Floating warning toast */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#C8102E] text-white px-5 py-3.5 rounded-xl shadow-2xl border border-red-500/30 flex items-center space-x-2 text-xs font-bold font-sans animate-slideUp">
          <ShieldAlert className="w-5 h-5 shrink-0 text-white" />
          <span>{errorMessage}</span>
          <button 
            onClick={() => setErrorMessage(null)} 
            className="ml-3 font-normal opacity-80 hover:opacity-100 cursor-pointer text-sm"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
