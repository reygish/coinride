import { User, Mail, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;

  user_id: string;
  full_name: string;
  email: string;

  profile_picture_url: string | null;
  bio: string | null;

  total_balance: number;
  available_balance: number;

  currency: string;

  dark_mode: boolean;
  receive_notifications: boolean;

  created_at: string;
}

type UserProfileCardProps = {
  user: UserProfile | null;
};

const UserProfileCard = ({ user }: UserProfileCardProps) => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="w-full rounded-lg bg-card text-center space-y-3">
      <img
        src={"https://i.pravatar.cc/150"}
        alt="avatar"
        className="w-20 h-20 rounded-full mx-auto object-cover border border-border"
      />

      <h2 className="text-foreground font-light tracking-[-0.01em] flex items-center justify-center gap-2">
        <User size={18} />
        {user?.full_name || "Full Name"}
      </h2>

      <p className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
        <Mail size={16} />
        {user?.email || "your@email.com"}
      </p>

      <p className="text-sm text-muted-foreground">
        {user?.bio || "No bio added yet"}
      </p>

      <button
        onClick={handleLogout}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm font-semibold text-foreground transition hover:bg-muted"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default UserProfileCard;
