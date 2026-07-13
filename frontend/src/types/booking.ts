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
  userEmail?: string;
}
