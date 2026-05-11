export interface UserProfile {
  id: string;

  user_id: string;
  full_name: string;

  profile_picture_url: string | null;
  bio: string | null;

  total_balance: number;
  available_balance: number;

  currency: string;

  dark_mode: boolean;
  receive_notifications: boolean;

  created_at: string;
}