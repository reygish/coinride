import { User, Mail, Pencil } from "lucide-react";

const UserProfileCard = ({ user, onEdit }) => {
  return (
    <div className="w-[320px] p-6 rounded-2xl shadow-lg bg-white text-center space-y-3">
      <img
        src={user.avatar || "https://i.pravatar.cc/150"}
        alt="avatar"
        className="w-24 h-24 rounded-full mx-auto object-cover"
      />

      <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
        <User size={18} />
        {user.name || "no name"}
      </h2>

      <p className="text-gray-500 flex items-center justify-center gap-2 text-sm">
        <Mail size={16} />
        {user.email || "no email"}
      </p>

      <p className="text-sm text-gray-700">
        {user.bio || "no bio"}
      </p>

      <button
        onClick={onEdit}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
      >
        <Pencil size={16} />
        edit profile
      </button>
    </div>
  );
};

export default UserProfileCard;