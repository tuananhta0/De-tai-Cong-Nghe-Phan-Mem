/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  RefreshCw, 
  Server, 
  FileText, 
  HelpCircle, 
  CheckCircle,
  Eye,
  AlertTriangle,
  UserCheck
} from "lucide-react";

export default function SecurityPolicyView() {
  const [activeSubTab, setActiveSubTab] = useState<"payment" | "privacy" | "account" | "refund">("payment");

  const sections = [
    {
      id: "payment",
      title: "Thanh Toán An Toàn",
      icon: CreditCard,
      badge: "SSL/TLS 256-bit",
      description: "Quy chuẩn mã hóa giao dịch vé trực tuyến, hợp tác với vNPAY, Momo và ngân hàng thương mại Việt Nam."
    },
    {
      id: "privacy",
      title: "Quyền Riêng Tư",
      icon: FileText,
      badge: "GDPR/NDPR",
      description: "Cam kết bảo vệ dữ liệu nhân thân, thông tin liên hệ và lịch sử giao dịch điện ảnh của quý khách hàng."
    },
    {
      id: "account",
      title: "Bảo Mật Tài Khoản",
      icon: Lock,
      badge: "OTP & 2FA",
      description: "Quy chế bảo mật thông tin tài khoản, tích điểm thành viên và lịch sử vé đã mua."
    },
    {
      id: "refund",
      title: "Chính Sách Đổi Trả",
      icon: RefreshCw,
      badge: "Luật X Cinema",
      description: "Quy trình hỗ trợ đổi suất chiếu, điều kiện hoàn tiền hoặc xử lý sự cố lỗi thanh toán tự động."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn text-left">
      {/* Page Title Header */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-red-950/20 to-[#121111]/95 border border-white/5 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] bg-[#C8102E] text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest leading-none">
              Trung tâm tin cậy
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
              Đầy đủ chuẩn mực an ninh số 2026
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-[#C8102E]" />
            TRANG AN TÂM & CHÍNH SÁCH BẢO AN
          </h2>
          <p className="text-xs text-[#BDBDBD] max-w-2xl font-normal leading-relaxed">
            Tại X Cinema, an toàn giao dịch và quyền riêng tư của quý khách luôn là sứ mệnh ưu tiên số một. Chúng tôi phát triển giải pháp bảo mật đa lớp để bảo vệ tài khoản của bạn khỏi rò rỉ dữ liệu.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 rounded-xl border border-zinc-800 shrink-0 self-start md:self-auto">
          <Server className="w-5 h-5 text-[#C8102E]" />
          <div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Mã hoá sảnh rạp</p>
            <p className="text-xs text-white font-mono font-bold">HTTPS Secure SSL</p>
          </div>
        </div>
      </div>

      {/* Bento Grid layout containing 4 main policy sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Navigation panel */}
        <div className="lg:col-span-4 space-y-3">
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1.5 block">Danh sách danh mục</p>
          {sections.map((sect) => {
            const Icon = sect.icon;
            const isActive = activeSubTab === sect.id;
            return (
              <button
                key={sect.id}
                onClick={() => setActiveSubTab(sect.id as any)}
                className={`w-full p-4.5 rounded-xl border text-left relative overflow-hidden group cursor-pointer transition duration-200 block ${
                  isActive
                    ? "bg-[#C8102E]/10 border-[#C8102E]/60 text-white shadow-lg shadow-red-950/20"
                    : "bg-[#161515] border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg transition-transform group-hover:scale-105 ${
                    isActive ? "bg-[#C8102E] text-white" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wide">{sect.title}</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-black/40 text-zinc-400 font-mono rounded border border-white/5">
                        {sect.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 leading-snug truncate">
                      {sect.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}

          <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/80 space-y-3">
            <h4 className="text-[10px] text-zinc-400 font-black uppercase tracking-wider flex items-center">
              <HelpCircle className="w-4 h-4 mr-1.5 text-zinc-500" />
              Bạn cần hỗ trợ khẩn cấp?
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Nếu phát hiện hành vi xâm nhập tài khoản hoặc sự cố sai số tiền vé, vui lòng liên hệ ngay tổng đài CSKH.
            </p>
            <div className="text-[10px] text-zinc-500 font-mono space-y-1">
              <p>☎ Điện thoại hỗ trợ: <strong className="text-white">1900.2288</strong> (Phím 2)</p>
              <p>✉ Email pháp lý: <strong className="text-white">security@xcinema.com.vn</strong></p>
            </div>
          </div>
        </div>

        {/* Dynamic Detail Content Panel */}
        <div className="lg:col-span-8 p-6 sm:p-8 bg-[#161515] border border-white/5 rounded-2xl shadow-xl space-y-6">
          
          {activeSubTab === "payment" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider font-mono">
                  Giao dịch an toàn khép kín
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                  CHÍNH SÁCH BẢO MẬT THANH TOÁN QUỐC TẾ & NỘI ĐỊA
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Tổ hợp cổng vé bóng X Cinema sử dụng các nền tảng trung gian thanh toán đã được Ngân hàng Nhà nước Việt Nam cấp phép, tuân thủ chặt chẽ tiêu chuẩn quốc tế <strong className="text-white">PCI DSS (Payment Card Industry Data Security Standard) Level 1</strong> - cấp độ bảo mật cao nhất hiện nay đối với hạ tầng thẻ tín dụng/ATM nội địa.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: "Mã hóa SSL 256-bit",
                    detail: "Mọi thông tin số thẻ, ngày hết hạn và số CVV được truyền trực tiếp qua kênh SSL mã hóa, không lưu giữ trực tiếp tại cơ sở máy chủ lưu trữ của X Cinema dưới dạng thô."
                  },
                  {
                    title: "Bảo mật hai lớp OTP (One-Time Password)",
                    detail: "Hệ thống tự động kích hoạt tính năng xác thực 3D Secure từ phía ngân hàng phát hành (Vietcombank, Techcombank, v.v.). Khách hàng buộc phải nhập mã OTP gửi tới số điện thoại cá nhân để hoàn tất thanh toán."
                  },
                  {
                    title: "Chống gian lận thẻ tín dụng giả mạo",
                    detail: "Công nghệ dò tìm hành vi bất thường sẽ tự động từ chối giao dịch giả mạo từ IP hoặc thiết bị lạ để bảo vệ chủ thẻ khỏi các vụ trộm cắp thông tin tín dụng."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3 text-xs leading-relaxed text-zinc-300">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>
                  <strong className="text-white uppercase font-bold block mb-1">Cảnh báo giả mạo:</strong>
                  X Cinema không bao giờ yêu cầu khách hàng gửi ảnh chụp thẻ tín dụng hoặc mật khẩu tài khoản ngân hàng qua email, tin nhắn Zalo, hay cuộc gọi điện thoại bất kỳ.
                </span>
              </div>
            </div>
          )}

          {activeSubTab === "privacy" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[9px] bg-blue-500/10 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-500/20 uppercase tracking-wider font-mono">
                  Bảo vệ thông tin cá nhân
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                  QUYỀN RIÊNG TƯ & CAM KẾT BẢO MẬT THÔNG TIN CÁ NHÂN (GDPR COMPLIANT)
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Chúng tôi hiểu rằng thông tin cá nhân của quý khách (Số điện thoại, email, họ tên, giới tính) được thu thập nhằm mục đích duy nhất là cung cấp và kiểm soát vé sảnh, cũng như tích lũy điểm thưởng chiết khấu. Chúng tôi cam kết hành xử minh bạch đúng theo luật bảo vệ người tiêu dùng Việt Nam.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-2 text-[#C8102E]">
                    <Eye className="w-4 h-4" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Thu Thập Thông Tin</h4>
                  </div>
                  <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside leading-relaxed">
                    <li>Họ tên, tuổi kiểm tra mác phim.</li>
                    <li>SĐT, Email để xuất hóa đơn số & QR vé.</li>
                    <li>Thiết bị duyệt rạp và lịch sử giao dịch.</li>
                  </ul>
                </div>

                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <UserCheck className="w-4 h-4" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Quyền Hạn Của Khách</h4>
                  </div>
                  <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside leading-relaxed">
                    <li>Yêu cầu xóa sạch lịch sử khỏi máy chủ.</li>
                    <li>Chỉnh sửa thông tin hồ sơ bất kỳ lúc nào.</li>
                    <li>Từ chối nhận email thông báo quảng cáo.</li>
                  </ul>
                </div>
              </div>

              <div className="p-4.5 bg-zinc-900 border border-zinc-800 rounded-xl">
                <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-2">Cam Kết Tuyệt Đối</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  X Cinema cam kết tuyệt đối <strong className="text-white">không bao giờ bán, cho thuê, thương mại hóa</strong> cơ sở dữ liệu khách hàng cho bất kỳ bên thứ ba hoạt động quảng cáo marketing nào ngoài hệ thống bảo bối rạp.
                </p>
              </div>
            </div>
          )}

          {activeSubTab === "account" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wider font-mono">
                  Quản lý tài khoản
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                  AN TOÀN HỒ SƠ THÀNH VIÊN & ĐIỂM SỬ DỤNG
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Tài khoản khách hàng trực tuyến giúp tích điểm đổi các món bắp nước hoặc giảm giá đơn vé sau. Để tạo sự an tâm tối đa khi tham gia đặt vé trực tuyến:
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-[#121111] rounded-xl border border-white/5 flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-[#C8102E] shrink-0">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Mật khẩu mã hóa Bcrypt một chiều</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Mật khẩu của bạn được băm một chiều và lưu ở định dạng Salted Bcrypt. Đội ngũ kỹ sư hay cả ban quản lý rạp X Cinema cũng không thể xem hay đảo ngược chuỗi để xem mật khẩu thô của bạn.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-[#121111] rounded-xl border border-white/5 flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Chống Bruteforce chặn IP</h4>
                    <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                      Các tài khoản thao tác đăng nhập dò mật khóa sai liên tục 5 lần sẽ bị hệ thống đóng băng truy cập tức thì trong 15 phút, ngăn chặn các cuộc mò tài khoản tinh vi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "refund" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-white/5 pb-4">
                <span className="text-[9px] bg-red-500/10 text-red-500 font-bold px-2 py-0.5 rounded border border-red-500/20 uppercase tracking-wider font-mono">
                  Sòng phẳng & Minh bạch
                </span>
                <h3 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                  ĐIỀU KHOẢN ĐỔI TRẢ VÉ & XỬ LÝ SỰ CỐ GIAO DỊCH
                </h3>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Khi sử dụng dịch vụ của X Cinema, chúng tôi áp dụng cơ chế điều khoản hoàn đổi vé sòng phẳng để bảo toàn lợi ích tài chính của khách hàng trong trường hợp bất khả kháng:
              </p>

              <div className="space-y-4 text-xs font-sans text-zinc-300 leading-relaxed">
                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] mr-2"></span>
                    1. Điều khoản Thay đổi Suất Chiếu:
                  </h4>
                  <p className="pl-3.5 text-zinc-400 text-[11px]">
                    Quý khách có thể yêu cầu đổi sảnh chiếu, suất chiếu hoặc đổi ghế cùng mệnh giá vé tối thiểu <strong className="text-white">60 phút</strong> trước giờ chiếu phim gốc diễn ra qua hotline hoặc quầy trực tiếp. Vé đã mua không thể huỷ lấy lại tiền mặt trực tiếp nếu phim đã chính thức chiếu và kết thúc.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-white flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C8102E] mr-2"></span>
                    2. Hoàn Tiền do Lỗi Hệ Thống:
                  </h4>
                  <p className="pl-3.5 text-zinc-400 text-[11px]">
                    Nếu quý khách đã bị trừ tiền ngân hàng nhưng hệ thống rạp không xuất ra được mã vạch QR hoặc báo lỗi chỗ ngồi trùng nhau, hệ thống X Cinema sẽ tự động rà soát đối soát hoàn lại 100% tài chính về tài khoản ngân hàng nguồn trong vòng <strong className="text-white">5 - 45 phút</strong> kể từ khi có quyết định đối chiếu thành công.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
