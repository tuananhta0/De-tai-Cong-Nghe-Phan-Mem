export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  membershipId: string;
  points: number;
  favoriteMovies: string[];
  password?: string;
  role?: "customer" | "admin" | "employee";
}
