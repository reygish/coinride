"use client";

import { useState } from "react";
import UserProfileCard from "@/lib/profile/UserProfileCard";
import EditProfileForm from "@/lib/profile/EditProfileForm";

export default function Page() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {isEditing ? (
        <EditProfileForm
          user={user}
          onSave={(updatedUser) => {
            setUser(updatedUser);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <UserProfileCard
          user={user}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}