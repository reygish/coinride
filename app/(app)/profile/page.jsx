"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EditProfileForm from "./_components/EditProfileForm";
import UserProfileCard from "./_components/UserProfileCard";
import { useUser } from "@/app/_components/providers/user-provider";


export default function Page() {
  const router = useRouter();
  const supabase = createClient();
  const { user: currentUser } = useUser();

  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    // protect route
    if (!currentUser) {
      router.replace("/auth/login");
      return;
    }

    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    if (data) {
      setUserProfile(data);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {isEditing ? (
        <EditProfileForm
          user={userProfile || {
            name: "",
            email: currentUser?.email || "",
            avatar: "",
            bio: ""
          }}
          onSave={async (updatedUser) => {
            if (!currentUser) return;

            await supabase.from("profiles").upsert({
              id: currentUser.id,
              email: currentUser.email,
              ...updatedUser,
            });

            setUserProfile(updatedUser);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <UserProfileCard
          user={userProfile}
          onEdit={() => setIsEditing(true)}
        />
      )}
    </div>
  );
}