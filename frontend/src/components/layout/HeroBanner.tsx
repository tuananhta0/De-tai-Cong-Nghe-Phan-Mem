/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Play, Ticket, ChevronLeft, ChevronRight, Star, Clock } from "lucide-react";
import { Movie } from "../../types";

interface HeroBannerProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onBookMovie: (movie: Movie) => void;
}

export default function HeroBanner({ movies, onSelectMovie, onBookMovie }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Focus on top blockbuster movies for our slider (e.g. Mai, Lật mặt, Dune, Inside Out)
  const featuredIds = ["m-1", "m-2", "m-3", "m-5"];
  const featured = movies.filter((m) => featuredIds.includes(m.id));

  // Default fallback if we cannot find those specific IDs
  const sliderMovies = featured.length > 0 ? featured : movies.slice(0, 4);

  // Swipe & Drag States
  const [startX, setStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [currentTranslate, setCurrentTranslate] = useState(0);

  const dragThreshold = 80; // pixels of movement trigger

  useEffect(() => {
    // Suspend auto shift if dragging
    if (isDragging) return;
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderMovies.length);
    }, 6000); // Shift every 6 seconds
    return () => clearInterval(timer);
  }, [sliderMovies.length, isDragging]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? sliderMovies.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % sliderMovies.length);
  };

  // Drag and touch handlers
  const handleStart = (clientX: number) => {
    setStartX(clientX);
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (startX === null || !isDragging) return;
    const diff = clientX - startX;
    // Dampen translation slightly for rich tactile weight
    setCurrentTranslate(diff * 0.85);
  };

  const handleEnd = () => {
    if (startX === null) return;
    if (Math.abs(currentTranslate) > dragThreshold) {
      if (currentTranslate > 0) {
        // Swiped right -> Prevous
        setCurrentIndex((prev) => (prev === 0 ? sliderMovies.length - 1 : prev - 1));
      } else {
        // Swiped left -> Next
        setCurrentIndex((prev) => (prev + 1) % sliderMovies.length);
      }
    }
    setStartX(null);
    setIsDragging(false);
    setCurrentTranslate(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) return;
    handleStart(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX);
  };

  const handleMouseUpOrLeave = () => {
    if (isDragging) {
      handleEnd();
    }
  };

  if (sliderMovies.length === 0) return null;

  const currentMovie = sliderMovies[currentIndex];

  return (
    <section
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      className={`relative h-[450px] sm:h-[550px] md:h-[620px] bg-black overflow-hidden select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {/* Background Slides */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: `translateX(${currentTranslate}px)`,
          transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {sliderMovies.map((movie, index) => (
          <div
            key={movie.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Ambient image backdrop */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out transform scale-105"
              style={{ backgroundImage: `url(${movie.bannerUrl})` }}
            />
            {/* Visual cinema dark overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/90 via-[#121212]/30 to-transparent" />
          </div>
        ))}
      </div>

      {/* Slide Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 text-white/80 hover:bg-[#C8102E] hover:text-white flex items-center justify-center border border-white/10 transition-all transform hover:scale-110"
        aria-label="Ảnh trước"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 text-white/80 hover:bg-[#C8102E] hover:text-white flex items-center justify-center border border-white/10 transition-all transform hover:scale-110"
        aria-label="Ảnh tiếp theo"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Content Layout */}
      <div className="absolute inset-0 z-20 flex items-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-14 md:pb-20">
          <div className="max-w-2xl text-left animate-slideUp">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-[10px] font-bold text-white shadow-sm ${
                currentMovie.rating === "T18" ? "bg-red-600" :
                currentMovie.rating === "T16" ? "bg-orange-500" :
                currentMovie.rating === "T13" ? "bg-yellow-600" : "bg-green-600"
              }`}>
                Mác {currentMovie.rating}
              </span>
              <span className="bg-white/10 text-white border border-white/20 text-[10px] font-bold px-2 py-1 rounded">
                {currentMovie.genre.join(" / ")}
              </span>
              <span className="flex items-center text-amber-400 text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 mr-1 inline" />
                {currentMovie.score.toFixed(1)} / 10
              </span>
              <span className="flex items-center text-[#BDBDBD] text-[10px] font-medium bg-white/5 border border-white/10 px-2 py-1 rounded">
                <Clock className="w-3.5 h-3.5 mr-1" />
                {currentMovie.duration} phút
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-lg leading-tight mb-3">
              {currentMovie.title}
            </h1>
            
            {/* Transliterated subtitle */}
            {currentMovie.originalTitle && (
              <p className="text-sm font-mono text-[#BDBDBD] tracking-wider mb-4 opacity-90 uppercase">
                {currentMovie.originalTitle}
              </p>
            )}

            {/* Description Paragraph */}
            <p className="text-white/80 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 font-normal drop-shadow">
              {currentMovie.description}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => onBookMovie(currentMovie)}
                className="flex items-center justify-center bg-[#C8102E] hover:bg-[#a60d26] text-white text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-[#C8102E]/30 transform hover:-translate-y-0.5"
              >
                <Ticket className="w-4 h-4 mr-2" />
                Đặt Vé Ngay
              </button>
              <button
                onClick={() => onSelectMovie(currentMovie)}
                className="flex items-center justify-center bg-[#1E1E1E]/80 hover:bg-[#1E1E1E] text-white border border-white/20 text-xs font-bold uppercase tracking-wider px-8 py-3.5 rounded-full transition hover:-translate-y-0.5 hover:border-white/40"
              >
                <Play className="w-4 h-4 mr-2 fill-white text-white" />
                Chi Tiết & Trailer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative slider indicator lines */}
      <div className="absolute right-8 bottom-6 z-20 flex space-x-2">
        {sliderMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-8 bg-[#C8102E]" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Ảnh ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
