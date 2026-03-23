export type UserRole = "admin" | "player";
export type UserStatus = "active" | "inactive" | "eliminated";
export type RoundStatus = "open" | "closed" | "resolved";
export type TeamResult = "win" | "draw" | "loss";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_id: number | null;
};
