"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";

type Achievement = {
  id: string;
  title: string;
  description: string;
  unlocked_at: string;
};

const ALL_ACHIEVEMENTS = [
  {
    title: "Beginner Badge",
    description: "Logged your first transaction.",
  },
  {
    title: "Bronze Saver",
    description: "Reached level 5.",
  },
  {
    title: "Silver Saver",
    description: "Reached level 10.",
  },
  {
    title: "Gold Saver",
    description: "Reached level 30.",
  },
  {
    title: "Gold+ Saver",
    description: "Reached level 50.",
  },
  {
    title: "Diamond Saver",
    description: "Reached level 80.",
  },
];

export default function AchievementsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const loadAchievements = async () => {
      setIsLoading(true);

      const { data } = await supabase
        .from("achievements")
        .select("id,title,description,unlocked_at")
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });

      setAchievements((data ?? []) as Achievement[]);
      setIsLoading(false);
    };

    loadAchievements();
  }, [router, supabase, user]);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-foreground">
          Achievements
        </h1>
        <p className="text-sm text-muted-foreground">
          Track your milestones and streaks as you manage your finances.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Loading achievements...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ALL_ACHIEVEMENTS.map((achievement) => {
            const earned = achievements.find(
              (item) => item.title === achievement.title,
            );
            return (
              <div
                key={achievement.title}
                className={`rounded-lg border border-border p-4 ${
                  earned
                    ? "bg-card"
                    : "bg-muted/20 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-light tracking-[-0.01em] text-foreground">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <span
                    className={`rounded-full p-2 ${
                      earned
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Trophy className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {earned
                    ? `Unlocked ${new Date(earned.unlocked_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          timeZone: "UTC",
                        },
                      )}`
                    : "Not unlocked yet"}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
