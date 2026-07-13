/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CreditCard, Landmark, QrCode, AlertCircle, ShoppingBag, ShieldCheck, Ticket } from "lucide-react";
import { Showtime, Movie, Cinema } from "../../types";

interface PaymentModalProps {
  showtime: Showtime;
  movie: Movie;
  cinema: Cinema;
  selectedSeats: string[];
  totalAmount: number;
  onPaymentComplete: (paymentMethod: string) => void;
  onCancel: () => void;
  selectedCombos?: { id: string; name: string; price: number; quantity: number }[];
}

export default function PaymentModal({
  showtime,
  movie,
  cinema,
  selectedSeats,
  totalAmount,
  onPaymentComplete,
  onCancel,
  selectedCombos,
}: PaymentModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("momo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Standard Vietnam payment options
  const paymentMethods = [
    {
      id: "momo",
      name: "Ví Điện Tử MoMo",
      description: "Quét mã QR bằng ứng dụng ví MoMo để nhận ngay hoàn xu tối đa 5%.",
      icon: QrCode,
      bgColor: "bg-pink-700/10 border-pink-500 text-pink-500"
    },
    {
      id: "vnpay",
      name: "Cổng VNPAY QR",
      description: "Thanh toán quét mã giảm ngay 10% bằng ứng dụng Ngân hàng di động.",
      icon: QrCode,
      bgColor: "bg-blue-600/10 border-blue-500 text-blue-400"
    },
    {
      id: "atm",
      name: "Thẻ ATM / Internet Banking",
      description: "Thanh toán trực tiếp bằng thẻ ATM nội địa liên kết Napas bảo an.",
      icon: Landmark,
      bgColor: "bg-zinc-800 border-zinc-600 text-zinc-300"
    },
  ];

  const handleApplyPromo = () => {
    // Basic dynamic promo check matching seed codes in data.ts
    const code = promoCode.trim().toUpperCase();
    setPromoError(null);
    if (code === "TCDBAP") {
      setPromoDiscount(15);
      setPromoApplied(true);
    } else if (code === "THU4VUI") {
      setPromoDiscount(30);
      setPromoApplied(true);
    } else if (code === "WELCOME50") {
      setPromoDiscount(50);
      setPromoApplied(true);
    } else if (code === "MOMOTCD") {
      setPromoDiscount(20);
      setPromoApplied(true);
    } else if (code === "SWEETBOX") {
      setPromoDiscount(15);
      setPromoApplied(true);
    } else if (code === "X2DIEM" || code === "TRUNGTHU" || code === "LUCKYSPIN") {
      setPromoDiscount(10);
      setPromoApplied(true);
    } else {
      setPromoError("Mã khuyến mãi không tồn tại hoặc đã hết thời gian hiệu lực!");
    }
  };

  const finalAmount = totalAmount * (1 - promoDiscount / 100);

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate standard transaction wait
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentComplete(selectedMethod.toUpperCase());
    }, 2200);
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  return (
    <div className="bg-[#121212] min-h-screen py-10 text-white font-sans text-left animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Step Guide bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-6 mb-8">
          <div>
            <span className="text-[#C8102E] text-xs font-bold uppercase tracking-wider block mb-1">
              BƯỚC 2: TIẾN HÀNH THANH TOÁN
            </span>
            <h2 className="text-2xl font-black text-white">
              Hóa Đơn Đặt Vé Khám Phá
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-xs bg-[#1E1E1E] hover:bg-white/5 border border-white/10 px-4.5 py-2.5 rounded-full font-bold transition flex-shrink-0"
          >
            Quay Lại Chọn Ghế
          </button>
        </div>

        {/* Multi columns grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
          
          {/* Column Left Side: VIP Member rewards & Promotional combo showcases */}
          <div className="lg:col-span-3 space-y-5">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/10 text-left">
              <div className="flex items-center space-x-2 text-amber-500 mb-3">
                <ShieldCheck className="w-5 h-5 shrink-0 animate-pulse" />
                <h4 className="text-xs font-black uppercase tracking-wider">Đặc Quyền Hội Viên VIP</h4>
              </div>
              <ul className="space-y-3.5 text-xs text-zinc-300">
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 select-none mr-0.5 font-bold">★</span>
                  <span><strong>Tích lũy 10% điểm:</strong> Quy đổi vé 0đ cho lần đặt tiếp theo.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 select-none mr-0.5 font-bold">★</span>
                  <span><strong>Ưu đãi Quầy Bắp:</strong> Giảm giá trực tiếp 20% khi mua tại sảnh.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-amber-500 select-none mr-0.5 font-bold">★</span>
                  <span><strong>Hoàn vé linh hoạt:</strong> Đổi suất chiếu miễn phí trước 2 giờ.</span>
                </li>
              </ul>
              <div className="mt-4.5 pt-3.5 border-t border-white/5 flex items-center justify-between text-[10px] text-amber-400 font-bold font-sans">
                <span>HẠNG: THÀNH VIÊN VÀNG</span>
                <span className="bg-amber-500/20 px-1.5 py-0.5 rounded">X-VIP</span>
              </div>
            </div>

            {/* Snack & Food combos claim box */}
            <div className="p-5 rounded-2xl bg-[#1E1E1E] border border-white/5 space-y-4">
              <div className="flex items-center space-x-2 text-rose-500">
                <ShoppingBag className="w-5 h-5 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider text-rose-500">Combo Mua Kèm Khuyên Dùng</h4>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Quý khách có thể mua kèm Bắp ngọt vị Phô mai & Pepsi mát lạnh tại quầy rạp với mức giá cực hời khi xuất trình QR vé.
              </p>
              <div className="bg-black/35 rounded-xl p-3 border border-white/5 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Combo Solo Sweet</span>
                  <span className="font-mono text-amber-500 font-extrabold">65K</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">1 Bắp ngọt size L + 1 Nước ngọt lớn</p>
                <div className="border-t border-zinc-800/60 my-2"></div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">Combo Couple Love</span>
                  <span className="font-mono text-amber-500 font-extrabold">109K</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">1 Bắp lớn vị phô mai + 2 Nước ngọt lớn</p>
              </div>
            </div>

            {/* Buyer Assurance Badge */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/40 space-y-2">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Cam Kết Bảo Mật</span>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Hệ thống rạp phim <strong>X Cinema</strong> bảo đảm an toàn dữ liệu khách hàng tuyệt đối qua giao thức SSL 256-bit được mã hóa đầu cuối thông suốt.
              </p>
            </div>
          </div>

          {/* Column Middle: Selector gate and Promo Code blocks */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 border-l-3 border-[#C8102E] pl-2.5">
                1. Chọn cổng thanh toán liên kết
              </h3>

              <div className="space-y-3.5">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  return (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start space-x-3.5 ${
                        isSelected
                          ? method.bgColor
                          : "border-white/5 bg-black/20 hover:bg-black/40 text-white hover:border-white/10"
                      }`}
                    >
                      <div className="p-2 bg-white/5 rounded-lg flex-shrink-0 mt-0.5">
                        <Icon className="w-5 h-5 text-inherit" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block font-bold text-sm text-white mb-0.5">{method.name}</span>
                        <span className="block text-xs text-[#BDBDBD] font-normal leading-relaxed">{method.description}</span>
                      </div>
                      <div className="flex-shrink-0 flex items-center h-full pt-3">
                        <input
                          type="radio"
                          name="payment_method"
                          checked={isSelected}
                          onChange={() => {}}
                          aria-label={method.name}
                          className="accent-[#C8102E] w-4 h-4 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Promo Voucher block */}
            <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-white/5">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3.5 border-l-3 border-[#C8102E] pl-2.5">
                2. Nhập mã khuyến mãi (Mã Giảm Giá)
              </h3>
              <p className="text-xs text-[#BDBDBD] mb-4">
                Nhập mã ưu đãi bất kỳ quý khách nhận từ mục khuyến mãi hoặc nhập <span className="font-mono text-amber-500 font-bold bg-white/5 px-1 rounded">WELCOME50</span> (mới đăng ký), <span className="font-mono text-amber-500 font-bold bg-white/5 px-1 rounded font-sans">THU4VUI</span> (đồng giá) để nhận chiết khấu.
              </p>
              
              <div className="flex space-x-3 max-w-md">
                <input
                  type="text"
                  placeholder="Vương quốc voucher..."
                  value={promoCode}
                  aria-label="Mã khuyến mãi"
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                  className="flex-1 bg-[#121212] text-xs font-bold text-white uppercase placeholder-zinc-500 px-4 py-3 rounded-lg border border-white/10 focus:outline-none focus:border-[#C8102E] disabled:opacity-60"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={promoApplied || !promoCode}
                  className="px-5 py-3 rounded-lg text-xs font-extrabold uppercase bg-white/5 border border-white/10 hover:border-[#C8102E] hover:text-[#C8102E] text-white transition-all disabled:opacity-50 disabled:hover:text-inherit"
                >
                  {promoApplied ? "Đã Khớp" : "Áp dụng"}
                </button>
              </div>

              {promoApplied && (
                <div className="mt-3 text-xs text-green-500 font-bold flex items-center space-x-1.5 animate-pulse">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Kích hoạt thành công voucher! Đã chiết khấu giảm {promoDiscount}% trực tiếp vào hóa đơn vé.</span>
                </div>
              )}

              {promoError && (
                <div className="mt-3 text-xs text-red-500 font-bold flex items-center space-x-1.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Column Right: Complete Ticket order visual breakdown */}
          <div className="lg:col-span-4 p-5 sm:p-6 rounded-2xl bg-[#1E1E1E] border border-white/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-5 h-5 text-[#C8102E]" />
                  <h3 className="font-bold text-sm tracking-wide text-white uppercase">Cơ Cấu Vé X Cinema</h3>
                </div>
                <span className="text-[9px] text-[#BDBDBD]/60 font-mono font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 font-sans">
                  SERI: #INV-2606-{Math.floor(Math.random() * 90000) + 10000}
                </span>
              </div>

              {/* Poster description */}
              <div className="flex space-x-3.5 mb-5 pb-5 border-b border-white/5">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-16 h-22 object-cover rounded-lg shadow-md flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-white text-sm font-extrabold block truncate mb-1">{movie.title}</span>
                  <span className="text-[10px] text-[#BDBDBD] font-bold block bg-[#C8102E]/10 text-rose-500 border border-[#C8102E]/10 px-1.5 py-0.5 rounded tracking-wide max-w-max">
                    {movie.rating} • {showtime.format}
                  </span>
                  <span className="text-xs text-[#BDBDBD]/80 font-mono mt-1.5 block">
                    {cinema.name}
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown receipt elements */}
              <div className="space-y-3 text-xs pb-4.5 border-b border-white/5 text-[#BDBDBD]">
                <div className="flex justify-between">
                  <span className="text-[#BDBDBD]/70">Lịch chiếu phim:</span>
                  <span className="font-bold text-white font-mono">{showtime.time} • {showtime.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#BDBDBD]/70">Phòng chiếu (Hall):</span>
                  <span className="font-bold text-white font-mono">{showtime.room}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#BDBDBD]/70">Ghế đã chọn:</span>
                  <span className="font-bold text-red-500 font-mono text-sm tracking-wide">{selectedSeats.sort().join(", ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#BDBDBD]/70">Số lượng ghế:</span>
                  <span className="font-bold text-white font-mono">{selectedSeats.length} Vé VIP</span>
                </div>

                <div className="pt-3 border-t border-dashed border-white/10 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-[#BDBDBD]/70">Đơn giá áp dụng:</span>
                    <span className="font-semibold text-zinc-300 font-mono">
                      {formatVND((totalAmount - (selectedCombos ? selectedCombos.reduce((s, c) => s + c.price * c.quantity, 0) : 0)) / selectedSeats.length)} / Ghế
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#BDBDBD]/70">Phí dịch vụ trực tuyến:</span>
                    <span className="font-bold text-emerald-500 font-mono uppercase text-[10px]">MIỄN PHÍ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#BDBDBD]/70">Bảo an Laser 3D Secure:</span>
                    <span className="font-bold text-emerald-500 font-mono uppercase text-[10px]">ĐÃ KÍCH HOẠT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#BDBDBD]/70 font-sans">Vé bắp miễn phí tặng kèm:</span>
                    {promoCode.trim().toUpperCase() === "TCDBAP" ? (
                      <span className="font-bold text-amber-500 font-mono uppercase text-[10px] animate-pulse">01 BẮP MIỄN PHÍ</span>
                    ) : (
                      <span className="text-zinc-600 italic">Không có dịch vụ</span>
                    )}
                  </div>
                  {selectedCombos && selectedCombos.length > 0 && (
                    <div className="border-t border-white/5 my-2 pt-2 space-y-1.5 text-[11px]">
                      <p className="font-bold text-amber-500 text-[10px] uppercase">Combo bắp nước mua kèm:</p>
                      {selectedCombos.map((item) => (
                        <div key={item.id} className="flex justify-between text-zinc-300 font-sans">
                          <span>{item.name} (x{item.quantity})</span>
                          <span className="font-mono font-bold text-amber-400">{formatVND(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#BDBDBD]/70">Thuế giá trị gia tăng (VAT 8%):</span>
                    <span className="font-semibold text-zinc-300 font-mono">{formatVND(totalAmount * 0.08)}</span>
                  </div>
                </div>

                <div className="flex justify-between border-t border-zinc-800 pt-3 text-white">
                  <span>Tổng tiền trước giảm:</span>
                  <span className="font-bold font-mono">{formatVND(totalAmount)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-green-500 font-bold">
                    <span>Mã coupon giảm ({promoDiscount}%):</span>
                    <span className="font-bold font-mono">-{formatVND(totalAmount * (promoDiscount / 100))}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated Checkout Execution forms */}
            <div className="mt-8 pt-3">
              {/* Payment display scanning container for QR channels */}
              {(selectedMethod === "momo" || selectedMethod === "vnpay") && (
                <div className="mb-6 p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center text-center">
                  <div className="w-32 h-32 bg-white p-2.5 rounded-lg border-2 border-[#C8102E]/25 shadow-lg relative flex items-center justify-center animate-pulse">
                    {/* Simulated High fidelity barcode */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=X-CINEMA-BOOKING-${finalAmount}`}
                      alt="Payment Scanning QR"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider mt-3 block animate-pulse">
                    ĐANG CHỜ QUÉT MÃ QR THANH TOÁN
                  </span>
                  <span className="text-[10px] text-[#BDBDBD] text-center mt-1 leading-relaxed max-w-xs block">
                    Mở ứng dụng ví điện tử tương ứng, thực hiện quét QR để khớp thông tin chuyển khoản rạp phim.
                  </span>
                </div>
              )}

              {selectedMethod === "atm" && (
                <div className="mb-6 space-y-2.5 text-xs">
                  <p className="font-bold text-[#BDBDBD]/80 text-[10px] uppercase tracking-wider mb-1">Thông tin thẻ:</p>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    placeholder="Số thẻ ATM Napas (vd 9704...)"
                    aria-label="Số thẻ ATM"
                    className="w-full bg-[#121212] px-3.5 py-3.5 rounded-lg border border-white/10 text-white placeholder-zinc-600 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      aria-label="Ngày hết hạn"
                      className="w-full bg-[#121212] px-3.5 py-3 px-2 text-center rounded-lg border border-white/10 text-white placeholder-zinc-600 focus:outline-none"
                    />
                    <input
                      type="password"
                      required
                      maxLength={3}
                      placeholder="Mã PIN"
                      aria-label="Mã PIN"
                      className="w-full bg-[#121212] px-3.5 py-3 px-2 text-center rounded-lg border border-white/10 text-white placeholder-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-between items-baseline mb-4 text-xs font-sans">
                <span className="text-[#BDBDBD] uppercase font-bold">Thực tế phải trả:</span>
                <span className="text-2xl font-black text-[#C8102E] font-mono leading-none tracking-tight">
                  {formatVND(finalAmount)}
                </span>
              </div>

              {/* Processing Loader element or Action checkout triggers */}
              {isProcessing ? (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-t-[#C8102E] border-white/10 rounded-full animate-spin" />
                  <span className="text-xs uppercase font-extrabold tracking-wider text-amber-500 animate-pulse">
                    Đang giải trình giao dịch trực tuyến...
                  </span>
                </div>
              ) : (
                <button
                  onClick={handlePaymentSubmit}
                  className="w-full flex items-center justify-center bg-[#C8102E] hover:bg-[#a60d26] py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wide text-white shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  <Ticket className="w-4 h-4 mr-1.5" />
                  XÁC NHẬN THANH TOÁN VÉ
                </button>
              )}

              <div className="mt-4 flex items-center justify-center space-x-1.5 text-[10px] text-[#BDBDBD] font-semibold text-center">
                <AlertCircle className="w-3.5 h-3.5 text-green-500" />
                <span>Hệ thống bảo an giao dịch 3D Secure Napas & PCI-DSS rạp X Cinema</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
