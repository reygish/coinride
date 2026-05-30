"use client";

import { useState, useEffect } from "react";
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
  const supabase = createClient();
  const { user: currentUser } = useUser();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loadProfile = async () => {
    if (!currentUser) return;

    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", currentUser.id)
      .single();

    if (data) {
      setUserProfile(data);
    } else {
    }
  };

  useEffect(() => {
    loadProfile();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-10">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-4">
          <UserProfileCard user={userProfile} />
        </div>

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
          }}
          onCancel={() => undefined}
          showCancel={false}
        />
      </div>
    </div>
  );
}
