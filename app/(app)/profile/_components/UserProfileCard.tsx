import { User, Mail, Pencil, LogOut } from "lucide-react";
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
  onEdit: () => void;
};

const UserProfileCard = ({ user, onEdit }: UserProfileCardProps) => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="w-[320px] p-6 rounded-2xl shadow-lg bg-white text-center space-y-3">
      <img
        src={"https://i.pravatar.cc/150"}
        alt="avatar"
        className="w-24 h-24 rounded-full mx-auto object-cover"
      />

      <h2 className="text-gray-900 font-semibold flex items-center justify-center gap-2">
        <User size={18} />
        {user?.full_name || "Full Name"}
      </h2>

      <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
        <Mail size={16} />
        {user?.email || "your@email.com"}
      </p>

      <p className="text-sm text-gray-700">
        {user?.bio || "No bio added yet"}
      </p>

      <button
        onClick={onEdit}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        <Pencil size={16} />
        Edit Profile
      </button>

      <button
        onClick={handleLogout}
        className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
};

export default UserProfileCard;
