/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, Shield, 
  Sparkles, CheckCircle2, AlertCircle, ArrowRight,
  ShieldAlert, UserCheck, KeyRound, Check
} from "lucide-react";
import { UserProfile } from "../types";
import { accountApi } from "../services/api";

interface AuthViewProps {
  accounts: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: UserProfile) => void;
  currentProfile: UserProfile | null;
  onLogout: () => void;
  operatorProfile?: UserProfile | null;
  onLogoutOperator?: () => void;
}

export default function AuthView({
  accounts,
  onLogin,
  onRegister,
  currentProfile,
  onLogout,
  operatorProfile = null,
  onLogoutOperator = () => {},
}: AuthViewProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  
  // Login form states
  const [loginInput, setLoginInput] = useState(""); // Email or Phone
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form states
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Status message
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear messages when switching tabs
  const handleTabChange = (newTab: "login" | "register") => {
    setTab(newTab);
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoginInput("");
    setLoginPassword("");
  };

  // Helper to normalize/clean strings for phone comparison
  const cleanPhone = (p: string) => p.replace(/[^0-9]/g, "");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const inputCleaned = loginInput.trim();

    if (!inputCleaned) {
      setErrorMsg("Vui lòng nhập Email hoặc Số điện thoại để đăng nhập.");
      return;
    }
    if (!loginPassword) {
      setErrorMsg("Vui lòng nhập mật khẩu tài khoản.");
      return;
    }

    try {
      const found = await accountApi.login(inputCleaned, loginPassword);
      const roleText = found.role === "admin"
        ? "Quản Trị Viên ⚡"
        : found.role === "employee"
          ? "Nhân Viên Sảnh 🧑‍💼"
          : "Khách Hàng Thành Viên 👤";

      setSuccessMsg(`Chào mừng ${roleText} "${found.name}" đã kết nối thành công!`);
      setTimeout(() => {
        onLogin(found);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Thông tin tài khoản hoặc mật khẩu không chính xác.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const name = regName.trim();
    const phone = regPhone.trim();
    const email = regEmail.trim();
    const password = regPassword.trim();

    // Validations
    if (!name || !phone || !email || !password) {
      setErrorMsg("Vui lòng điền đầy đủ tất cả các trường thông tin đăng ký.");
      return;
    }

    if (phone.length < 9 || phone.length > 12) {
      setErrorMsg("Số điện thoại không hợp lệ (độ dài tiêu chuẩn từ 9 - 12 số).");
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setErrorMsg("Vui lòng nhập định dạng Email hợp lệ.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Mật khẩu tài khoản quá yếu. Vui lòng đặt mật khẩu tối thiểu từ 6 ký tự trở lên để tránh bị kẻ xấu hack!");
      return;
    }

    // CHECK PHONE NUMBER UNIQUENESS (1 phone number = 1 account rule!) - kiểm tra nhanh ở
    // client trước khi gọi API, backend vẫn sẽ kiểm tra lại email trùng ở phía SQL Server.
    const cleanedSearchPhone = cleanPhone(phone);
    const isPhoneTaken = accounts.some((acc) => cleanPhone(acc.phone) === cleanedSearchPhone);

    if (isPhoneTaken) {
      setErrorMsg(`LỖI: Số điện thoại ${phone} đã gắn với một tài khoản thành viên khác!`);
      return;
    }

    // CHECK EMAIL UNIQUENESS (1 email = 1 account rule!) - kiểm tra nhanh ở client để báo lỗi
    // ngay lập tức, không cần chờ round-trip lên server (backend vẫn sẽ kiểm tra lại lần cuối).
    const isEmailTaken = accounts.some((acc) => acc.email.trim().toLowerCase() === email.toLowerCase());

    if (isEmailTaken) {
      setErrorMsg(`LỖI: Địa chỉ email "${email}" đã gắn với một tài khoản thành viên khác!`);
      return;
    }

    try {
      const newAccount = await accountApi.register({ name, email, phone, password });
      onRegister(newAccount);
      setSuccessMsg(`Đăng ký hội viên thành công! Quý khách được tặng ngay 100 điểm Loyalty.`);
      setTimeout(() => {
        onLogin(newAccount);
      }, 1200);

      // Reset fields
      setRegName("");
      setRegPhone("");
      setRegEmail("");
      setRegPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Đăng ký không thành công.");
    }
  };

  // If already logged in as client/customer
  if (currentProfile) {
    const points = currentProfile.points;
    let memberLevel = "Bạc";
    let badgeColor = "bg-zinc-800 text-zinc-300 border-zinc-700";

    if (points >= 1500) {
      memberLevel = "Kim Cương";
      badgeColor = "bg-rose-950/50 text-rose-400 border-rose-500/30 animate-pulse";
    } else if (points >= 1000) {
      memberLevel = "Vàng";
      badgeColor = "bg-amber-950/40 text-amber-400 border-amber-500/30";
    }

    return (
      <div className="max-w-md mx-auto my-12 bg-[#1E1E1E] rounded-2xl border border-white/5 p-6 text-center space-y-6 shadow-2xl animate-scaleUp">
        <div className="w-20 h-20 bg-gradient-to-tr from-[#C8102E] to-rose-600 rounded-full mx-auto p-1 shadow-lg shadow-[#C8102E]/20">
          <img 
            src={currentProfile.avatar} 
            alt={currentProfile.name}
            className="w-full h-full object-cover rounded-full bg-zinc-950"
          />
        </div>

        <div>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">{currentProfile.name}</h2>
          <span className="text-[10px] font-mono text-zinc-400 block mt-1 tracking-widest">{currentProfile.membershipId}</span>
          
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase border ${badgeColor}`}>
              Thành viên {memberLevel}
            </span>
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded text-[9.5px] font-mono font-bold">
              💰 {currentProfile.points} Điểm
            </span>
          </div>
        </div>

        <div className="bg-[#121212] p-4 rounded-xl text-left border border-white/5 space-y-2 text-xs font-sans">
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-zinc-500">Thư điện tử:</span>
            <span className="text-white font-medium">{currentProfile.email}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-white/5">
            <span className="text-zinc-500">Số điện thoại:</span>
            <span className="text-white font-medium">{currentProfile.phone}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-zinc-500">Vai trò chính:</span>
            <span className="text-red-500 font-bold uppercase transition">
              Khách hàng thành viên 👤
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <p className="text-[11px] text-zinc-400 leading-normal">Bạn đang đăng nhập phiên giao dịch của Khách hàng tại X Cinema.</p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer border border-white/5"
          >
            Đăng xuất tài khoản
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-12 bg-[#1E1E1E] rounded-3xl border border-white/5 overflow-hidden shadow-2xl flex flex-col text-left transition-all duration-300">
      {/* Visual top border */}
      <div className="h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-rose-600 border-b border-white/5"></div>

      {/* 1 Portal Login / Register Tabs header */}
      <div className="flex bg-[#121212] border-b border-white/5 p-1 font-sans">
        <button
          type="button"
          onClick={() => handleTabChange("login")}
          className={`flex-1 py-3 text-center text-[11px] uppercase font-black tracking-wider transition cursor-pointer rounded-xl ${
            tab === "login" 
              ? "bg-zinc-800 text-white shadow-inner border-b-2 border-b-red-600" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          🔑 CỔNG ĐĂNG NHẬP CHUNG
        </button>
        <button
          type="button"
          onClick={() => handleTabChange("register")}
          className={`flex-1 py-3 text-center text-[11px] uppercase font-black tracking-wider transition cursor-pointer rounded-xl ${
            tab === "register" 
              ? "bg-zinc-800 text-white shadow-inner border-b-2 border-b-red-600" 
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          📝 ĐĂNG KÝ HỘI VIÊN
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            VÙNG TRUY CẬP HỆ THỐNG X CINEMA
          </h2>
          <p className="text-[9.5px] text-zinc-400 tracking-wider font-semibold uppercase leading-relaxed mt-1 font-sans">
            {tab === "login" 
              ? "ĐĂNG NHẬP MỘT CỔNG CHO KHÁCH HÀNG, NHÂN VIÊN & QUẢN TRỊ" 
              : "ĐĂNG KÝ THÀNH VIÊN ĐỂ TÍCH DIỂM THƯỞNG ĐỔI BẮP NƯỚC"}
          </p>
        </div>

        {/* Alerts Box */}
        {errorMsg && (
          <div className="p-3.5 bg-red-950/25 border border-red-500/30 text-red-400 text-[11px] rounded-xl flex items-start gap-2.5 animate-scaleUp font-medium leading-relaxed font-sans">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-550" />
            <p>{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-emerald-950/25 border border-emerald-500/30 text-emerald-400 text-[11px] rounded-xl flex items-start gap-2.5 animate-scaleUp font-semibold leading-relaxed font-sans">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 animate-pulse" />
            <p>{successMsg}</p>
          </div>
        )}

        {/* Forms Rendering */}
        {tab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[9.5px] text-zinc-400 font-black uppercase tracking-widest mb-1.5 font-sans">Nhập Số điện thoại hoặc Email</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: nguyenanhducdemmer@gmail.com hoặc số điện thoại..."
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full bg-[#121212] px-3.5 py-3 text-xs text-white rounded-xl border border-zinc-800 focus:border-zinc-500 outline-none pl-9 transition duration-150 font-sans font-medium"
                />
                <Mail className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[9.5px] text-zinc-400 font-black uppercase tracking-widest mb-1.5 font-mono">Mật khẩu khóa tài khoản</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Nhập khóa bảo mật..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#121212] px-3.5 py-3 text-xs text-white rounded-xl border border-zinc-800 focus:border-zinc-500 outline-none pl-9 pr-10 transition duration-150 font-sans font-medium"
                />
                <Lock className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-3.5 text-zinc-550 hover:text-white transition cursor-pointer"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-widest transition duration-150 cursor-pointer shadow-lg shadow-red-500/10 flex items-center justify-center gap-1.5"
              >
                <span>XÁC NHẬN ĐĂNG NHẬP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-[9.5px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Họ và Tên Hội Viên</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="VD: Nguyễn Anh Đức..."
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#121212] px-3.5 py-3 text-xs text-white rounded-xl border border-zinc-800 focus:border-zinc-550 outline-none pl-9 transition font-sans font-medium"
                />
                <User className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[9.5px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Số điện thoại liên lạc</label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="VD: 0987654321"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-[#121212] px-3.5 py-3 text-xs text-white rounded-xl border border-zinc-800 focus:border-zinc-550 outline-none pl-9 transition font-sans font-medium"
                />
                <Phone className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
              </div>
              <p className="text-[8.5px] text-zinc-500 mt-1 font-sans">* Nhập chính xác để tích lũy điểm khi mua vé trực tiếp tại quầy.</p>
            </div>

            <div>
              <label className="block text-[9.5px] text-zinc-400 font-black uppercase tracking-widest mb-1.5">Địa chỉ thư tín Email</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="VD: nguyenanhducdemmer@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#121212] px-3.5 py-3 text-xs text-white rounded-xl border border-zinc-800 focus:border-zinc-550 outline-none pl-9 transition font-sans font-medium"
                />
                <Mail className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-[9.5px] text-zinc-400 font-black uppercase tracking-widest mb-1.5 font-mono">Tạo mật khẩu đăng nhập</label>
              <div className="relative">
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Tạo mật khẩu (mật khẩu tối thiểu 3 ký tự)..."
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full bg-[#121212] px-3.5 py-3 text-xs text-white rounded-xl border border-zinc-800 focus:border-zinc-550 outline-none pl-9 pr-10 transition duration-150 font-sans font-medium"
                />
                <Lock className="w-4 h-4 text-zinc-650 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-3.5 text-zinc-550 hover:text-white transition cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-650 to-rose-650 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs uppercase tracking-widest transition duration-150 cursor-pointer shadow-lg shadow-red-500/10 flex items-center justify-center gap-1.5"
              >
                <span>📝 ĐĂNG KÝ HỘI VIÊN CHÍNH THỨC</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
            
            <p className="bg-[#121212] border border-white/3 text-[9.5px] leading-relaxed p-3.5 rounded-xl text-zinc-500 font-sans">
              ℹ️ <span className="font-bold text-zinc-450 uppercase text-[8.5px]">Lưu ý về tài khoản cán bộ:</span> Form đăng ký tự do này chỉ cấp tài khoản vai trò Khách hàng hội viên. Tài khoản cho Nhân viên vận hành chỉ được tạo trực tiếp bởi Admin cấp cao trong bảng điều khiển Quản Trị.
            </p>
          </form>
        )}

        {/* Unified Quick Test Presets Stack for optimal validation */}
        {tab === "login" && (
          <div className="border-t border-zinc-850 pt-4 text-center space-y-2">
            <span className="text-[8.5px] text-zinc-500 font-black uppercase tracking-widest block mb-2 font-mono">🚀 SỬ DỤNG NHANH CÁC SETUP ACCOUNT DEMO</span>
            
            <div className="grid grid-cols-1 gap-2">
              {[
                { 
                  name: "Kim Cương (Khách VIP)", 
                  email: "nguyenanhducdemmer@gmail.com", 
                  pass: "123", 
                  roleText: "Customer 👤", 
                  badgeColor: "bg-red-500/10 text-red-400 border-red-500/20" 
                },
                { 
                  name: "Staff Trần (Nhân Viên Sảnh)", 
                  email: "employee@xcinema.vn", 
                  pass: "employee", 
                  roleText: "Employee 🧑‍💼", 
                  badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                },
                { 
                  name: "Quản Trị Viên (Admin Master)", 
                  email: "admin@xcinema.vn", 
                  pass: "admin", 
                  roleText: "Admin Master ⚡", 
                  badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                }
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLoginInput(preset.email);
                    setLoginPassword(preset.pass);
                  }}
                  className="text-[10px] bg-white/2 hover:bg-white/5 text-zinc-300 p-2.5 rounded-xl border border-white/5 transition flex justify-between items-center group font-mono active:scale-98 cursor-pointer text-left"
                >
                  <div>
                    <span className="text-white font-extrabold group-hover:text-amber-400 transition-colors uppercase text-[9.5px] block">{preset.name}</span>
                    <p className="text-[8.5px] text-zinc-500 mt-0.5">Mật khẩu: <span className="text-emerald-400 font-bold font-mono">{preset.pass}</span></p>
                  </div>
                  <span className={`text-[8.5px] px-2 py-0.5 rounded font-black font-sans uppercase border ${preset.badgeColor}`}>
                    {preset.roleText}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Operator session status footer in AuthView if logged in */}
      {operatorProfile && (
        <div className="bg-[#141414] border-t border-white/5 p-4 flex items-center justify-between gap-4 animate-scaleUp font-sans">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-zinc-950 p-0.5 border border-amber-500/30 shrink-0">
              <img src={operatorProfile.avatar} alt={operatorProfile.name} className="w-full h-full rounded-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] text-zinc-500 font-bold uppercase leading-none">NHÂN SỰ ĐANG TRỰC BAN</p>
              <h4 className="text-[11px] font-black text-white truncate uppercase mt-0.5">{operatorProfile.name}</h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onLogin(operatorProfile)}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-extrabold text-[9px] uppercase tracking-wider hover:bg-amber-650 transition cursor-pointer"
            >
              Vào làm việc 🧑‍💻
            </button>
            <button
              type="button"
              onClick={onLogoutOperator}
              className="px-2 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-red-400 font-bold text-[9px] uppercase tracking-wider transition border border-white/5 cursor-pointer"
            >
              Thoát
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
