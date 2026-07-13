/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Tag, Calendar, Copy, Check, Eye, Newspaper, ArrowLeft, Heart, Sparkles, BookOpen } from "lucide-react";
import { Promotion, News } from "../types";

interface PromosNewsViewProps {
  promotions: Promotion[];
  news: News[];
  initialMode?: "promotions" | "news";
}

export default function PromosNewsView({
  promotions,
  news,
  initialMode = "promotions",
}: PromosNewsViewProps) {
  const [currentMode, setCurrentMode] = useState<"promotions" | "news">(initialMode);
  const [selectedArticle, setSelectedArticle] = useState<News | null>(null);
  const [copiedCodeCode, setCopiedCodeCode] = useState<string | null>(null);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeCode(code);
    setTimeout(() => {
      setCopiedCodeCode(null);
    }, 2000);
  };

  return (
    <div className="bg-[#121212] min-h-screen py-10 text-white font-sans text-left animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Toggle switch row */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-6 mb-8 gap-6">
          <div>
            <span className="text-[#C8102E] text-xs font-black uppercase tracking-wider block mb-1">
              {currentMode === "promotions" ? "Đặc Quyền Hội Viên & Ưu Đãi" : "Báo chí Sự Kiện Bom Tấn"}
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              {currentMode === "promotions" ? "Ưu đãi hấp dẫn nhất" : "Bản tin thế giới điện ảnh"}
            </h2>
          </div>

          <div className="inline-flex p-1 bg-[#1E1E1E] rounded-xl border border-white/5 w-full sm:w-auto">
            <button
              onClick={() => {
                setCurrentMode("promotions");
                setSelectedArticle(null);
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition ${
                currentMode === "promotions"
                  ? "bg-[#C8102E] text-white shadow-md shadow-[#C8102E]/10"
                  : "text-[#BDBDBD] hover:text-white"
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Khuyến Mãi ({promotions.length})</span>
            </button>
            <button
              onClick={() => {
                setCurrentMode("news");
              }}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-extrabold uppercase tracking-wide transition ${
                currentMode === "news"
                  ? "bg-[#C8102E] text-white shadow-md shadow-[#C8102E]/10"
                  : "text-[#BDBDBD] hover:text-white"
              }`}
            >
              <Newspaper className="w-4 h-4" />
              <span>Tin Tức ({news.length})</span>
            </button>
          </div>
        </div>

        {/* Layout details based on active state */}
        {!selectedArticle ? (
          <div>
            {currentMode === "promotions" ? (
              /* PROMOTIONS INTERACTIVE CARD GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {promotions.map((promo) => {
                  const isCopied = copiedCodeCode === promo.code;
                  return (
                    <article
                      key={promo.id}
                      className="group bg-[#1E1E1E] border border-white/5 rounded-2xl overflow-hidden hover:border-[#C8102E]/35 hover:shadow-xl transition duration-300 flex flex-col justify-between"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-black/20 select-none border-b border-white/5">
                        <img
                          src={promo.imageUrl}
                          alt={promo.title}
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-[1.03] transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                        <span className="absolute bottom-3 left-3 text-white text-[11px] font-black uppercase bg-[#C8102E] px-2 py-0.5 rounded shadow">
                          Hot Deal
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <h3 className="text-white text-base font-black tracking-tight leading-snug mb-2 group-hover:text-[#C8102E] transition-colors line-clamp-1">
                            {promo.title}
                          </h3>
                          <p className="text-[#BDBDBD] text-xs font-normal leading-relaxed line-clamp-3 mb-5">
                            {promo.description}
                          </p>
                        </div>

                        {/* Interactive Coupon Code Block */}
                        <div className="space-y-3.5 pt-4 border-t border-white/5 mt-auto">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-zinc-500 font-medium flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-[#C8102E]" />
                              {promo.validity}
                            </span>
                            <span className="text-amber-500 font-extrabold">Giảm {promo.discountPercent}% vé</span>
                          </div>

                          <div
                            onClick={(e) => handleCopyCode(promo.code, e)}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                              isCopied
                                ? "bg-green-600/10 border-green-500 text-green-500"
                                : "bg-black/25 border-white/5 hover:bg-black/45 hover:border-white/10 text-[#C8102E]"
                            }`}
                          >
                            <span className="font-mono text-center font-black text-sm tracking-widest text-[#BDBDBD] uppercase italic">
                              {promo.code}
                            </span>
                            <button
                              aria-label={isCopied ? "Đã sao chép" : "Sao chép mã"}
                              className="flex items-center space-x-1 text-xs font-bold font-sans hover:scale-105 active:scale-95 transition"
                            >
                              {isCopied ? (
                                <>
                                  <Check className="w-4 h-4" />
                                  <span>Đã sao chép</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 text-[#BDBDBD]" />
                                  <span>Copy mã</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* NEWS GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => {
                      setSelectedArticle(item);
                      // Auto scroll to top of reader
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="group bg-[#1E1E1E] rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-white/10 transition-transform duration-300 transform hover:-translate-y-1.5 flex flex-col h-full text-left"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-black select-none border-b border-white/5">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-102 transition"
                      />
                      <span className="absolute top-3 left-3 bg-[#121212] text-[#BDBDBD] border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-sans">
                        {item.category}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Meta view counters */}
                        <div className="flex items-center space-x-3 text-[10px] text-zinc-500 font-bold mb-2 uppercase">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            {item.views > 0 ? item.views : 120} Xem
                          </span>
                        </div>
                        <h3 className="text-white text-sm font-bold tracking-tight mb-2 leading-snug group-hover:text-[#C8102E] transition line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-[#BDBDBD] text-xs font-normal leading-relaxed line-clamp-3">
                          {item.summary}
                        </p>
                      </div>

                      <div className="pt-3.5 mt-4 border-t border-white/5 flex justify-between items-center text-xs font-semibold text-[#C8102E] group-hover:translate-x-1 transition-transform">
                        <span>Đọc Chi Tiết Bản Tin</span>
                        <span>→</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* RICH EDITORIAL ARTICLE READER MODE OVERLAY */
          <div className="max-w-3xl mx-auto rounded-3xl bg-[#1E1E1E] border border-white/5 overflow-hidden animate-slideUp">
            
            {/* Header controls */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <button
                onClick={() => setSelectedArticle(null)}
                className="flex items-center space-x-1.5 text-xs font-bold text-[#BDBDBD] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>VỀ DANH SÁCH BẢN TIN</span>
              </button>
              <div className="text-zinc-500 text-[10px] uppercase font-bold font-mono tracking-widest flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>EDITORIAL ARTICLE</span>
              </div>
            </div>

            {/* Poster graphic */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden bg-black select-none border-b border-white/5">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-[#1E1E1E]/40 to-black/20" />
              <div className="absolute bottom-4 left-5 right-5 text-left">
                <span className="bg-[#C8102E] text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-2 inline-block">
                  {selectedArticle.category}
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow">
                  {selectedArticle.title}
                </h1>
              </div>
            </div>

            {/* Detailed Content body */}
            <div className="p-6 md:p-8 space-y-6">
              
              {/* Publication details */}
              <div className="flex items-center space-x-4 border-b border-white/5 pb-4.5 text-xs text-zinc-500 font-semibold uppercase">
                <span>By X Cinema Editorial Team</span>
                <span>•</span>
                <span>Ngày xuất bản: {selectedArticle.date}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Eye className="w-3.5 h-3.5 mr-1 text-[#C8102E]" />
                  {selectedArticle.views > 0 ? selectedArticle.views + 120 : 240} Lượt đọc
                </span>
              </div>

              {/* Summary italic highlighted block */}
              <p className="text-white text-xs sm:text-sm font-bold border-l-4 border-[#C8102E] pl-4 italic leading-relaxed text-zinc-200">
                "{selectedArticle.summary}"
              </p>

              {/* Rich narrative content paragraphs */}
              <div className="text-xs sm:text-sm text-[#BDBDBD] font-normal leading-relaxed text-zinc-300/95 space-y-4">
                <p>
                  {selectedArticle.content}
                </p>
                <p>
                  Sau hàng loạt những khảo cứu và nhận xét phản chiếu từ công chúng yêu điện ảnh, rạp phim X Cinema tự tin khẳng định xu hướng dấn thân sâu sắc vào nghệ thuật bản sắc văn hóa Việt đang phát triển rực rỡ vượt qua mọi thành kiến. Trách nhiệm đặt ưu thế thưởng ngoạn chân dung chân thật, xúc cảm dâng trào của quý khách hàng là tôn chỉ rạp.
                </p>
                <p>
                  Để liên tục cập nhật thêm hàng loạt những dự án điện ảnh bom tấn quốc tế cũng như nội địa khởi chiếu sắp tới trong tháng và rinh sỉ những chiếc bắp ngọt thơm lừng hoàn toàn miễn phí, quý độc giả vui lòng check-in đều đặn sảnh trang, liên kết thông tin cá nhân và tích lũy nâng cấp bảo an.
                </p>
              </div>

              {/* Decorative signature footer */}
              <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase select-none">
                <span>TRẢI NGHIỆM ĐIỆN ẢNH ĐỈNH CAO © 2026</span>
                <span className="text-[#C8102E]">X CINEMA CO. LTD</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
