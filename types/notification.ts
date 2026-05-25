export type NotificationType =
  | "goal_reached"
  | "budget_overspent"
  | "achievement_unlocked"
  | "leaderboard_top_n"
  | "system";

  export interface Notification {
  id: string;

  user_id: string;

  title: string;

  message: string;

  type: NotificationType;

  is_read: boolean;

  created_at: string;
}