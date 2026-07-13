/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Film, User, Search, MapPin, Tag, Newspaper, Shield, Menu, X, Award } from "lucide-react";
import { UserProfile } from "../../types";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: UserProfile | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  operatorProfile?: UserProfile | null;
  onSwitchToOperator?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  user,
  searchQuery,
  setSearchQuery,
  operatorProfile = null,
  onSwitchToOperator = () => {},
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "home", label: "Trang Chủ", icon: Film },
    { id: "movies", label: "Phim", icon: Film },
    { id: "cinemas", label: "Rạp Chiếu", icon: MapPin },
    { id: "promotions", label: "Khuyến Mãi", icon: Tag },
    { id: "news", label: "Tin Tức", icon: Newspaper },
    { id: "security", label: "Bảo An", icon: Shield },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#121212]/95 border-b border-white/5 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <div 
            onClick={() => { setActiveTab("home"); setMobileMenuOpen(false); }}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 bg-gradient-to-tr from-[#C8102E] to-rose-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-[#C8102E]/30 relative overflow-hidden">
              <span className="font-serif italic font-black text-xl text-white select-none absolute">X</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline space-x-1">
                <span className="font-serif italic font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-[#C8102E] to-amber-500 drop-shadow-[0_0_15px_rgba(200,16,46,0.3)] select-none">
                  X
                </span>
                <span className="font-sans font-black text-xl tracking-tighter text-white group-hover:text-rose-500 transition-colors">
                  CINEMA
                </span>
              </div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#BDBDBD]/80 -mt-1 block scale-y-95">
                ĐIỆN ẢNH ĐỈNH CAO
              </span>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-1 max-w-xs mx-4 lg:mx-8 xl:mx-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm phim, thể loại..."
                value={searchQuery}
                aria-label="Tìm kiếm phim"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E1E1E] text-white text-xs placeholder-[#BDBDBD]/60 pl-9 pr-10 py-2.5 rounded-full border border-white/10 focus:outline-none focus:border-[#C8102E] focus:ring-1 focus:ring-[#C8102E] transition"
              />
              <Search className="w-4 h-4 text-[#BDBDBD]/80 absolute left-3 top-3" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-white transition-colors duration-150 py-0.5 px-1 bg-white/5 rounded text-[10px] font-sans font-bold uppercase tracking-wider"
                >
                  Xoá
                </button>
              )}
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex space-x-2 xl:space-x-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-full font-sans text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#C8102E] text-white shadow-md shadow-[#C8102E]/20"
                      : "text-[#BDBDBD] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Desktop User Loyalty Display */}
          <div className="hidden sm:flex items-center space-x-3 ml-4 xl:ml-8">
            {user ? (
              <div 
                onClick={() => setActiveTab("profile")}
                className="flex items-center space-x-2.5 bg-[#1E1E1E] px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/5 transition border border-white/5 hover:scale-103 duration-100"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-[#C8102E]/10"
                />
                <div className="text-left">
                  <span className="text-white text-[11px] font-bold block leading-tight truncate max-w-[80px]">
                    {user.name}
                  </span>
                  <span className="text-amber-500 font-mono text-[9px] font-bold flex items-center space-x-0.5">
                    <Award className="w-3" />
                    <span>{user.points}đ</span>
                  </span>
                </div>
              </div>
            ) : operatorProfile ? (
              <button
                onClick={onSwitchToOperator}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-full font-sans text-xs font-black tracking-wider bg-gradient-to-r from-amber-500 to-yellow-550 hover:from-amber-600 hover:to-yellow-600 text-black shadow-md shadow-amber-500/15 transition cursor-pointer scale-103 animate-pulse border border-white/5"
              >
                <Shield className="w-3.5 h-3.5 text-black" />
                <span>LÀM VIỆC: {operatorProfile.name.split(" ")[0]} 🧑‍💼</span>
              </button>
            ) : (
              <button 
                onClick={() => setActiveTab("auth")}
                className="flex items-center space-x-1.5 px-4.5 py-2 rounded-full font-sans text-xs font-black tracking-wide bg-gradient-to-r from-[#C8102E] to-amber-500 hover:from-red-600 hover:to-amber-600 text-white shadow-md shadow-[#C8102E]/20 transition cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>ĐĂNG NHẬP 👤</span>
              </button>
            )}
          </div>

          {/* Mobile Right Side Toggle Buttons */}
          <div className="flex items-center space-x-3 lg:hidden">
            {/* Search toggler for mobile devices */}
            <div className="relative md:hidden w-36">
              <input
                type="text"
                placeholder="Tìm phim..."
                value={searchQuery}
                aria-label="Tìm kiếm phim"
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1E1E1E] text-white text-[10px] placeholder-[#BDBDBD]/50 pl-7 pr-8 py-1.5 rounded-full border border-white/5 focus:outline-none"
              />
              <Search className="w-3 h-3 text-[#BDBDBD]/60 absolute left-2 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1.5 text-zinc-400 hover:text-white transition-colors duration-150 text-[10px] font-sans font-bold"
                >
                  ×
                </button>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#BDBDBD] hover:text-white focus:outline-none"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1E1E1E] border-b border-white/5 py-4 px-4 space-y-2 animate-fadeIn">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                  isActive
                    ? "bg-[#C8102E] text-white"
                    : "text-[#BDBDBD] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          {user ? (
            <div 
              onClick={() => {
                setActiveTab("profile");
                setMobileMenuOpen(false);
              }}
              className="pt-3 border-t border-white/5 flex items-center space-x-3 px-4 cursor-pointer hover:bg-white/5 rounded-lg transition"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full bg-[#C8102E]/10"
              />
              <div>
                <span className="text-white text-xs font-bold block">{user.name}</span>
                <span className="text-amber-500 font-mono text-[10px] font-bold flex items-center space-x-0.5">
                  <Award className="w-3.5 h-3.5 inline" />
                  <span>{user.points} Điểm tích lũy</span>
                </span>
              </div>
            </div>
          ) : operatorProfile ? (
            <div className="pt-3 border-t border-white/5 px-4">
              <button 
                onClick={() => {
                  onSwitchToOperator();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-550 text-black shadow-md transition cursor-pointer"
              >
                <Shield className="w-4 h-4 animate-pulse" />
                <span>VÀO KHU VỰC LÀM VIỆC 🧑‍💼</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/5 px-4">
              <button 
                onClick={() => {
                  setActiveTab("auth");
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#C8102E] to-amber-500 text-white transition cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>ĐĂNG NHẬP 👤</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
