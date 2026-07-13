/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckCircle2, Download, Printer, Home, User, QrCode, Gift, Sparkles, Trophy, Star, Copy } from "lucide-react";
import { Booking } from "../../types";

interface ETicketProps {
  booking: Booking;
  onGoHome: () => void;
  onGoProfile: () => void;
}

export default function ETicket({ booking, onGoHome, onGoProfile }: ETicketProps) {
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [scratchReward, setScratchReward] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const rewardsDict = [
    { text: "01 Ly Sứ X-Cinema Độc Quyền", code: "XGIFT10" },
    { text: "01 Nước ngọt Pepsi size L miễn phí", code: "PEPSIL" },
    { text: "Voucher giảm 50K Combo bắp kèm", code: "SNACK50" },
    { text: "Tặng 200 điểm Loyalty vàng tích lũy", code: "GOLD200" }
  ];

  const handleScratch = () => {
    if (scratchRevealed) return;
    const item = rewardsDict[Math.floor(Math.random() * rewardsDict.length)];
    setScratchReward(`${item.text}`);
    setScratchRevealed(true);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#121212] min-h-screen py-10 px-4 sm:px-6 text-white font-sans text-center flex flex-col justify-center items-center animate-fadeIn select-none relative overflow-hidden">
      
      {/* Background ambient lighting effects to make both sides not feel empty */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Column Left: Lucky Loyalty Interaction and Reward Boxes */}
          <div className="lg:col-span-3 space-y-6 hidden lg:block text-left">
            <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-white/5 text-left relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center space-x-2.5 text-amber-500 mb-4">
                <Gift className="w-5 h-5 shrink-0 animate-bounce" />
                <h4 className="text-xs font-black uppercase tracking-wider">Hộp Quà May Mắn VIP</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                Chúc mừng quý khách đã hoàn tất đặt vé sảnh X Cinema! Bạn nhận được đặc quyền cào trúng thưởng phần quà tri ân ngẫu nhiên từ hệ thống.
              </p>

              {/* Scratch block container */}
              <div className="p-4 rounded-xl border border-dashed border-amber-500/30 text-center bg-black/40 min-h-[160px] flex flex-col justify-center items-center relative overflow-hidden group">
                {!scratchRevealed ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse border border-amber-500/20">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">CÀO HOẶC NHẤP GỠ QUÀ</span>
                    <button
                      onClick={handleScratch}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-[10px] font-black uppercase rounded-lg shadow-lg shadow-amber-500/10 transition transform hover:scale-105 cursor-pointer"
                    >
                      Nhận Quà Ngay
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <Trophy className="w-9 h-9 text-amber-400 mx-auto animate-bounce" />
                    <div>
                      <span className="text-[10px] text-green-500 font-extrabold uppercase block tracking-wider">BẠN ĐẠ TRÚNG THƯỞNG:</span>
                      <p className="text-xs font-black text-white mt-1 leading-normal max-w-[190px] mx-auto text-amber-300">
                        {scratchReward}
                      </p>
                    </div>
                    <span className="text-[9px] text-zinc-500 block leading-tight">Mã quà tặng đã được lưu trong mục khuyên dùng để đổi tại quầy lễ tân sảnh rạp.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-white/5 text-left relative overflow-hidden shadow-xl">
              <div className="flex items-center space-x-2.5 text-red-500 mb-4">
                <Trophy className="w-5 h-5 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider">Hành Trình Thăng Hạng</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
                Bạn đã tích luỹ thành công thêm <strong>+{Math.round(booking.totalAmount / 1000)} điểm</strong> vàng tri ân từ giao dịch đặt vé sảnh này.
              </p>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden mb-2 border border-white/5">
                <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full" style={{ width: "84%" }} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 font-bold">
                <span>VÀNG (GOLD)</span>
                <span className="text-amber-500 font-extrabold">84% ĐẾN PLATINUM</span>
              </div>
            </div>
          </div>

          {/* Column Middle: Success layout and centerpiece Ticket receipt */}
          <div className="lg:col-span-6 flex flex-col items-center">
            
            {/* Success alert card */}
            <div className="max-w-md w-full mb-6 text-center">
              <div className="inline-flex p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full mb-3 shadow-lg shadow-green-500/5 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                ĐẶT VÉ THÀNH CÔNG!
              </h2>
              <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed px-2">
                Cảm ơn quý khách đã tin dùng hệ thống đặt vé. Vé điện tử dưới đây đã được lưu trữ trong mục **Hồ Sơ Cá Nhân (Vé Sắp Xem)** để đối soát.
              </p>
            </div>

            {/* Ticket Layout Canvas */}
            <div className="max-w-md w-full bg-[#1E1E1E] rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col text-left">
              
              {/* Ticket Top bar decoration: Movie title & company banner */}
              <div className="bg-[#C8102E] p-4.5 text-center relative">
                <span className="font-serif italic font-black text-xl tracking-wider text-white">
                  <span className="text-amber-300">X</span> <span className="opacity-90 font-sans font-black text-sm">CINEMA</span>
                </span>
                <p className="text-[9px] uppercase tracking-widest text-red-100 font-bold -mt-0.5">
                  Vé Điện Tử - Electronic Admission Card
                </p>

                {/* Punch holes visual decor left and right */}
                <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-[#121212] rounded-full z-10" />
                <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-[#121212] rounded-full z-10" />
              </div>

              {/* Poster & core details wrapper */}
              <div className="p-5 flex space-x-4 border-b border-dashed border-white/10 relative">
                <img
                  src={booking.moviePoster}
                  alt={booking.movieTitle}
                  className="w-20 h-28 object-cover rounded-xl shadow-md border border-white/5 flex-shrink-0"
                />
                <div className="min-w-0 flex flex-col justify-center">
                  <span className="text-[#C8102E] text-[10px] font-black uppercase tracking-wider block mb-1">
                    Phim Điện Ảnh
                  </span>
                  <h3 className="text-white text-base font-black truncate leading-snug mb-1">
                    {booking.movieTitle}
                  </h3>
                  <span className="text-[10px] bg-white/5 text-amber-500 border border-white/10 font-bold px-1.5 py-0.5 rounded max-w-max">
                    {booking.format}
                  </span>
                  <p className="text-[#BDBDBD] text-[11px] font-medium font-sans mt-2">
                    Thể loại: Drama / Action / Sci-Fi
                  </p>
                </div>
              </div>

              {/* Cinema location details */}
              <div className="p-5 grid grid-cols-2 gap-4.5 text-xs text-left border-b border-white/5 bg-black/10">
                <div>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#BDBDBD]/50 mb-1">CƠ SỞ RẠP</span>
                  <span className="text-white text-xs font-bold leading-tight block">{booking.cinemaName}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#BDBDBD]/50 mb-1">PHÒNG CHIẾU</span>
                  <span className="text-white text-xs font-bold font-mono block">{booking.room}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#BDBDBD]/50 mb-1">NGÀY CHIẾU (DATE)</span>
                  <span className="text-white text-xs font-bold font-mono block">{booking.showDate}</span>
                </div>
                <div>
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#BDBDBD]/50 mb-1">MÚI GIỜ (TIME)</span>
                  <span className="text-white text-xs font-black font-mono text-amber-500 block leading-none">{booking.showTime}</span>
                </div>
              </div>

              {/* Seat tags and payment totals */}
              <div className="p-5 space-y-4 text-xs text-left border-b border-dashed border-white/10 bg-[#252525]/30 relative">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#BDBDBD]/50 mb-1">GHẾ NGỒI (SEATS)</span>
                    <span className="text-red-500 text-sm font-black font-mono uppercase tracking-wide block">{booking.seats.sort().join(", ")}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#BDBDBD]/50 mb-1">KIỀU THANH TOÁN</span>
                    <span className="text-emerald-400 text-xs font-black uppercase tracking-wider block">Ví Điện Tử (MOMO / VNPAY)</span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2">
                  <div className="flex justify-between text-[#BDBDBD] text-[11px]">
                    <span>Đơn Giá Vé Gốc:</span>
                    <span className="font-mono text-white font-semibold">
                      {formatVND((booking.totalAmount - (booking.combos ? booking.combos.reduce((s, c) => s + c.price * c.quantity, 0) : 0)) / booking.seats.length)} x {booking.seats.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#BDBDBD] text-[11px]">
                    <span>Phí Đặt Vé Trực Tuyến:</span>
                    <span className="font-semibold text-emerald-400 uppercase text-[10px]">Miễn phí (X Cinema Member)</span>
                  </div>
                  <div className="flex justify-between text-[#BDBDBD] text-[11px]">
                    <span>Thuế Giá Trị Gia Tăng (VAT 8%):</span>
                    <span className="font-mono text-zinc-400 font-semibold">{formatVND(booking.totalAmount * 0.08)} (Đã cộng gộp)</span>
                  </div>
                  <div className="flex justify-between text-[#BDBDBD] text-[11px]">
                    <span>Ưu Đãi Quà Đi Kèm:</span>
                    <span className="text-amber-500 font-bold uppercase text-[9px]">01 Bắp ngọt size L (Nạp mã TCDBAP)</span>
                  </div>

                  {booking.combos && booking.combos.length > 0 && (
                    <div className="border-t border-white/5 my-2 pt-2 space-y-1.5">
                      <p className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Dịch vụ bắp nước đã đặt:</p>
                      {booking.combos.map((cb, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-zinc-300 font-sans">
                          <span>{cb.name} (x{cb.quantity})</span>
                          <span className="font-mono font-bold text-amber-400">{formatVND(cb.price * cb.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between text-[#BDBDBD] text-[11px]">
                    <span>Trạng Thái Giao Dịch:</span>
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9.5px] font-black uppercase px-2 py-0.5 rounded tracking-wider animate-pulse">
                      KHỚP TOÀN PHẦN • ĐÃ THANH TOÁN
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 flex justify-between items-baseline">
                  <span className="block text-[9px] font-extrabold uppercase tracking-wider text-[#BDBDBD]/50">TỔNG TIỀN HOÁ ĐƠN</span>
                  <span className="text-white text-base font-black font-mono block">{formatVND(booking.totalAmount)}</span>
                </div>

                {/* Decore cutaway circles */}
                <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-[#121212] rounded-full z-10 border-r border-[#121212]/5" />
                <div className="absolute -right-3 -bottom-3 w-6 h-6 bg-[#121212] rounded-full z-10 border-l border-[#121212]/5" />
              </div>

              {/* QR Code and barcode section */}
              <div className="p-6 bg-black/25 flex flex-col items-center justify-center text-center relative space-y-4">
                <div className="w-36 h-36 bg-white p-2.5 rounded-xl shadow-lg relative flex items-center justify-center border-2 border-[#C8102E]/10">
                  <img
                    src={booking.qrCodeUrl}
                    alt="Booking barcode scanner verification"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                  {booking.isCheckedIn && (
                    <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-center p-2 rounded-xl border-2 border-green-500/40 animate-scaleUp">
                      <CheckCircle2 className="w-8 h-8 text-green-500 animate-pulse" />
                      <span className="text-[10px] text-green-400 uppercase tracking-wider font-black mt-1">ĐÃ SOÁT VÉ</span>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <span className="block font-mono text-md font-black text-white uppercase tracking-widest">
                    MÃ VÉ: <span className="text-[#C8102E]">{booking.code}</span>
                  </span>
                  <span className="block text-[8px] text-[#BDBDBD]/80 font-mono tracking-widest uppercase mt-1">
                    SCAN QR AT AUDITORIUM ENTRY FOR ADMISSION
                  </span>
                </div>

                {/* Simulated linear barcode at the bottom of card */}
                <div className="w-full max-w-[240px] h-10 border-t border-[#BDBDBD]/10 pt-2 opacity-50 flex items-center justify-center flex-col scale-y-95">
                  <div className="flex space-x-0.5 h-6">
                    {[2, 1, 3, 1, 4, 1, 2, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 4, 1, 2, 1].map((w, i) => (
                      <div key={i} className="bg-white h-full" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="text-[7.5px] font-mono tracking-widest text-[#BDBDBD]/60 uppercase mt-0.5">
                    *X-REC-{booking.code.replace("X-", "").replace("TCD-", "")}*
                  </span>
                </div>
              </div>

            </div>

            {/* Control buttons underneath */}
            <div className="mt-8 flex flex-wrap gap-3 justify-center w-full">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full bg-[#1E1E1E] text-white border border-white/10 hover:border-white/30 transition hover:-translate-y-0.5 shadow-md cursor-pointer"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                In Vé / PDF
              </button>
              <button
                onClick={onGoProfile}
                className="flex items-center justify-center text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-full bg-[#1E1E1E] text-white border border-white/10 hover:border-[#C8102E] hover:text-[#C8102E] transition hover:-translate-y-0.5 shadow-md cursor-pointer"
              >
                <User className="w-4 h-4 mr-1.5" />
                Xem Lịch Sử Vé
              </button>
              <button
                onClick={onGoHome}
                className="flex items-center justify-center text-xs font-black uppercase tracking-wider px-6 py-3 rounded-full bg-[#C8102E] hover:bg-[#a60d26] text-white transition hover:-translate-y-0.5 shadow-lg shadow-[#C8102E]/20 cursor-pointer"
              >
                <Home className="w-4 h-4 mr-1.5" />
                Trang Chủ
              </button>
            </div>

          </div>

          {/* Column Right: Exclusive Gift Vouchers and Cinema Specials instructions */}
          <div className="lg:col-span-3 space-y-6 hidden lg:block text-left">
            <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-white/5 text-left relative overflow-hidden shadow-xl">
              <div className="flex items-center space-x-2.5 text-amber-500 mb-4">
                <Star className="w-5 h-5 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider">Voucher Quà Tặng Độc Quyền</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                Đặc quyền ưu đãi cực lớn được X Cinema chọn lọc riêng dành tặng bạn ngay lúc này:
              </p>

              <div className="space-y-3">
                {[
                  { name: "01 Bắp Ngọt Size L Miễn Phí", code: "TCDBAP", desc: "Nạp mã khi mua vé sảnh online" },
                  { name: "Giảm 10% Cho Suất Chiếu IMAX", code: "XIMAX10", desc: "Áp dụng đổi điểm tích luỹ rạp" },
                  { name: "Combo Solo Sweet Đồng Giá 50k", code: "COMBO50", desc: "Áp dụng đổi vé combo bắp pepsi sảnh" }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-black/40 rounded-xl border border-white/5 space-y-2 relative group hover:border-[#C8102E]/30 transition duration-150">
                    <h5 className="text-xs font-bold text-white pr-6 leading-tight">{item.name}</h5>
                    <p className="text-[10px] text-zinc-500 leading-none">{item.desc}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-[10px] text-amber-400 font-extrabold px-2 py-0.5 rounded bg-amber-500/10 tracking-widest">{item.code}</span>
                      <button
                        onClick={() => handleCopyCode(item.code)}
                        className="text-[9px] font-black text-rose-500 hover:text-white uppercase transition-colors shrink-0 flex items-center gap-1 bg-white/5 px-2 py-1 rounded cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedCode === item.code ? "Đã chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4.5 rounded-2xl bg-gradient-to-br from-red-600/15 to-[#C8102E]/5 border border-[#C8102E]/20 text-left">
              <span className="text-[10px] text-amber-500 font-black tracking-wider uppercase block mb-1">X-CINEMA SPECIALS</span>
              <h5 className="text-xs font-bold text-white mb-2 leading-snug">Hướng Dẫn Xác Thực Tại Quầy Vé</h5>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                Khi đến sảnh rạp, quý khách chỉ cần bật màn hình điện thoại chụp lại **Mã QR Vé** hoặc cung cấp **Mã Vé** để nhân viên soát vé quét đầu đọc chuẩn mực, đổi vé lấy bắp trực tiếp cực nhanh không cần xếp hàng mua sắm.
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
