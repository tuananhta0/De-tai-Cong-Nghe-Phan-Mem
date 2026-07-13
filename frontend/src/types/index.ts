/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  genre: string[];
  duration: number; // in minutes
  rating: "P" | "K" | "T13" | "T16" | "T18"; // P (All), K (under 13 with parent), T13/16/18 (restricted)
  score: number; // e.g. 9.1
  votes: number;
  releaseDate: string;
  isUpcoming: boolean;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string; // YouTube embed code or clean direct video
  description: string;
  director: string;
  cast: string[];
  language: string;
  countdownEnd?: string; // e.g., '2026-06-30T23:59:59'
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
  date: string; // dd/mm/yyyy
  time: string; // hh:mm
  room: string;
  format: "2D Phụ đề" | "3D Phụ đề" | "IMAX 3D" | "2D lồng tiếng";
  priceStandard: number;
  priceVIP: number;
  priceDouble: number;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  code: string;
  discountPercent: number;
  validity: string;
  imageUrl: string;
}

export interface News {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: "Điện Ảnh" | "Khuyến Mãi" | "Sự Kiện" | "Hậu Trường";
  imageUrl: string;
  views: number;
}

export interface ComboItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

export interface Booking {
  id: string;
  movieTitle: string;
  moviePoster: string;
  cinemaName: string;
  showDate: string;
  showTime: string;
  room: string;
  format: string;
  seats: string[];
  totalAmount: number;
  paymentMethod: string;
  code: string;
  qrCodeUrl: string;
  bookingTime: string;
  combos?: { id: string; name: string; price: number; quantity: number }[];
  isCheckedIn?: boolean;
  isComboRedeemed?: boolean;
  userEmail?: string; // email chủ vé — backend trả về từ JOIN Users
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  membershipId: string;
  points: number;
  favoriteMovies: string[]; // movieIds
  password?: string;
  role?: "customer" | "admin" | "employee";
}
