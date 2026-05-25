"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import EditProfileForm from "./_components/EditProfileForm";
import UserProfileCard, {
  type UserProfile,
} from "./_components/UserProfileCard";
import { useUser } from "@/app/_components/providers/UserProvider";

type ProfileFormValues = {
  name: string;
  email: string;
  avatar: string;
  bio: string;
};

export default function Page() {
  const router = useRouter();
  const supabase = createClient();
  const { user: currentUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const loadProfile = async () => {
    // protect route
    if (!currentUser) {
      router.replace("/login");
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
          user={
            userProfile
              ? {
                  name: userProfile.full_name,
                  email: userProfile.email,
                  avatar: userProfile.profile_picture_url ?? "",
                  bio: userProfile.bio ?? "",
                }
              : {
                  name: "",
                  email: currentUser?.email ?? "",
                  avatar: "",
                  bio: "",
                }
          }
          onSave={async (updatedUser: ProfileFormValues) => {
            if (!currentUser) return;

            const { data } = await supabase
              .from("user_profiles")
              .upsert(
                {
                  user_id: currentUser.id,
                  email: currentUser.email,
                  full_name: updatedUser.name,
                  profile_picture_url: updatedUser.avatar || null,
                  bio: updatedUser.bio || null,
                },
                { onConflict: "user_id" }
              )
              .select("*")
              .single();

            if (data) {
              setUserProfile(data);
            }
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
