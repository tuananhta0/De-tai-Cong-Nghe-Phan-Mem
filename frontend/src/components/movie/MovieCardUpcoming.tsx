/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Play, Calendar, Timer, Volume2, VolumeX } from "lucide-react";
import { Movie } from "../../types";
import { getYouTubeId } from "../../utils/helpers";

interface MovieCardUpcomingProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  key?: string;
}

export default function MovieCardUpcoming({ movie, onSelectMovie }: MovieCardUpcomingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Extract YouTube ID
  const youtubeId = getYouTubeId(movie.trailerUrl);

  // Calculate real-time countdown
  useEffect(() => {
    // Generate a default target date if countdownEnd is not specified or in the past
    let targetStr = movie.countdownEnd;
    if (!targetStr) {
      // Parse releaseDate ("dd/mm/yyyy")
      const parts = movie.releaseDate.split("/");
      if (parts.length === 3) {
        targetStr = `${parts[2]}-${parts[1]}-${parts[0]}T00:00:00`;
      } else {
        targetStr = "2026-12-31T00:00:00";
      }
    }

    const targetDate = new Date(targetStr).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [movie.countdownEnd, movie.releaseDate]);

  return (
    <article
      onClick={() => onSelectMovie(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsMuted(true);
      }}
      className="group bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-black/70 border border-white/5 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col h-full"
    >
      {/* Upper Preview Section */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-black select-none">
        {/* Poster Image */}
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transform scale-100 group-hover:scale-102 transition-all duration-500 ${
            isHovered ? "opacity-0" : "opacity-100"
          }`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image";
          }}
        />

        {/* Muted Autoplay Video on Hover */}
        {isHovered && youtubeId && (
          <div className="absolute inset-0 w-full h-full">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&loop=1&playlist=${youtubeId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&autohide=1`}
              title={`${movie.title} Trailer Preview`}
              allow="autoplay; encrypted-media"
              className="w-full h-full object-cover scale-110 pointer-events-none"
              onError={() => {/* YouTube block — ảnh poster vẫn hiện bên dưới */}}
            />
            {/* Custom Sound Toggle Controller over trailer */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute bottom-3 right-3 z-30 p-2 rounded-full bg-black/60 hover:bg-[#C8102E] text-white flex items-center justify-center transition shadow-md"
              aria-label={isMuted ? "Mở tiếng" : "Tắt tiếng"}
            >
              {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
            </button>
          </div>
        )}

        {/* Rating Badge */}
        <span className={`absolute top-2.5 left-2.5 z-10 font-bold text-[9px] px-2 py-1 rounded shadow-md text-white ${
          movie.rating === "T18" ? "bg-red-600" :
          movie.rating === "T16" ? "bg-orange-500" :
          movie.rating === "T13" ? "bg-yellow-600" : "bg-green-600"
        }`}>
          Mác {movie.rating}
        </span>

        {/* Real-time Countdown Timer overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/85 to-transparent pt-8 pb-3 px-3 z-10 text-left">
          <p className="text-amber-500 text-[10px] font-bold flex items-center mb-1 animate-pulse">
            <Timer className="w-3.5 h-3.5 mr-1" />
            ĐỒNG HỒ ĐẾM NGƯỢC
          </p>
          <div className="flex space-x-1.5 font-mono text-xs">
            <div className="bg-black/80 px-2 py-1.5 rounded border border-white/5 text-center min-w-[34px]">
              <span className="text-white text-xs font-bold block">{timeLeft.days}</span>
              <span className="text-[7.5px] uppercase tracking-tighter text-[#BDBDBD] block font-sans">Ngày</span>
            </div>
            <div className="bg-black/80 px-2 py-1.5 rounded border border-white/5 text-center min-w-[34px]">
              <span className="text-white text-xs font-bold block">{timeLeft.hours}</span>
              <span className="text-[7.5px] uppercase tracking-tighter text-[#BDBDBD] block font-sans">Giờ</span>
            </div>
            <div className="bg-black/80 px-2 py-1.5 rounded border border-white/5 text-center min-w-[34px]">
              <span className="text-white text-xs font-bold block">{timeLeft.minutes}</span>
              <span className="text-[7.5px] uppercase tracking-tighter text-[#BDBDBD] block font-sans">Phút</span>
            </div>
            <div className="bg-black/80 px-2 py-1.5 rounded border border-white/5 text-center min-w-[34px]">
              <span className="text-red-500 text-xs font-bold block">{timeLeft.seconds}</span>
              <span className="text-[7.5px] uppercase tracking-tighter text-[#BDBDBD] block font-sans">Giây</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info elements */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white text-sm font-bold tracking-tight mb-1 line-clamp-1 group-hover:text-[#C8102E] transition-colors leading-snug">
            {movie.title}
          </h3>
          <p className="text-[#BDBDBD] text-[11px] font-mono tracking-wide mb-2 truncate">
            {movie.genre.join(" / ")}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/5 text-[11px] text-amber-500 font-semibold font-sans">
          <span className="flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1" />
            Khởi chiếu: {movie.releaseDate}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectMovie(movie);
            }}
            className="text-xs bg-[#C8102E]/10 border border-[#C8102E]/30 text-[#C8102E] px-2.5 py-0.5 rounded-full hover:bg-[#C8102E] hover:text-white transition-all font-bold"
          >
            Sắp chiếu
          </button>
        </div>
      </div>
    </article>
  );
}
