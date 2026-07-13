export interface ShowtimeSlot {
  showtimeId: string;
  time: string;
  format: string;
  price: number;
}

export interface CinemaGroup {
  cinemaId: string;
  cinemaName: string;
  slots: ShowtimeSlot[];
}

export interface DailyShowtime {
  date: string; // Định dạng YYYY-MM-DD
  cinemas: CinemaGroup[];
}
