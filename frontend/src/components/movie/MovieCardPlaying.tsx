/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Star, Clock, Ticket } from "lucide-react";
import { Movie } from "../../types";

interface MovieCardPlayingProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onBookMovie: (movie: Movie) => void;
  key?: string;
}

export default function MovieCardPlaying({
  movie,
  onSelectMovie,
  onBookMovie,
}: MovieCardPlayingProps) {
  return (
    <article 
      onClick={() => onSelectMovie(movie)}
      className="group relative bg-[#1E1E1E] rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-black/65 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col h-full border border-white/5"
    >
      {/* Poster Image and Quick Hover Info overlay */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#121212]">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-all duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/600x900/1a1a2e/ffffff?text=No+Image";
          }}
        />

        {/* Rating Badge */}
        <span className={`absolute top-2.5 left-2.5 z-10 font-bold text-[9px] px-2 py-1 rounded shadow-md text-white ${
          movie.rating === "T18" ? "bg-red-600" :
          movie.rating === "T16" ? "bg-orange-500" :
          movie.rating === "T13" ? "bg-yellow-600" : "bg-green-600"
        }`}>
          Mác {movie.rating}
        </span>

        {/* Quick statistics overlay on the image top right */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-black/75 shadow-md">
          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
          <span className="text-amber-400 font-bold text-[10px]">{movie.score.toFixed(1)}</span>
        </div>

        {/* Hover quick-view overlay */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4 text-center">
          <p className="text-white text-xs font-semibold leading-relaxed line-clamp-4 px-2 mb-4">
            {movie.description}
          </p>
          <div className="flex flex-col space-y-2 w-full max-w-[150px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookMovie(movie);
              }}
              className="flex items-center justify-center w-full bg-[#C8102E] hover:bg-[#a60d26] text-white text-[10.5px] font-bold uppercase tracking-wider py-2 px-3 rounded-full transition-all hover:scale-105"
            >
              <Ticket className="w-3.5 h-3.5 mr-1" />
              Đặt Vé
            </button>
            <span className="text-[#BDBDBD] text-[10px] font-medium font-sans">
              Thời lượng: {movie.duration}ph
            </span>
          </div>
        </div>
      </div>

      {/* Content description */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white text-sm font-bold tracking-tight mb-1 line-clamp-1 group-hover:text-[#C8102E] transition-colors leading-snug">
            {movie.title}
          </h3>
          <p className="text-[#BDBDBD] text-[11px] font-mono tracking-wide">
            {movie.genre.slice(0, 2).join(" / ")}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] text-[#BDBDBD] font-medium">
          <span className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-[#C8102E]" />
            {movie.duration} phút
          </span>
          <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white font-mono font-bold">
            2D/3D/IMAX
          </span>
        </div>
      </div>
    </article>
  );
}
