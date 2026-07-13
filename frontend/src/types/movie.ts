export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  genre: string[];
  duration: number;
  rating: "P" | "K" | "T13" | "T16" | "T18";
  score: number;
  votes: number;
  releaseDate: string;
  isUpcoming: boolean;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  description: string;
  director: string;
  cast: string[];
  language: string;
  countdownEnd?: string;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  mapEmbed?: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  cinemaId: string;
  date: string;
  time: string;
  room: string;
  format: "2D Phụ đề" | "3D Phụ đề" | "IMAX 3D" | "2D lồng tiếng";
  priceStandard: number;
  priceVIP: number;
  priceDouble: number;
}
