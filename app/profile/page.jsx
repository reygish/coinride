"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import UserProfileCard from "@/lib/profile/UserProfileCard";
import EditProfileForm from "@/lib/profile/EditProfileForm";

export default function Page() {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

  const getCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  };

  const loadProfile = async () => {
    const user = await getCurrentUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setUser(data);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {isEditing ? (
        <EditProfileForm
          user={user}
          onSave={async (updatedUser) => {
            const currentUser = await getCurrentUser();

            await supabase.from("profiles").upsert({
              id: currentUser.id,
              ...updatedUser,
            });

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