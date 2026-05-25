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
        <h1 className="text-2xl font-semibold text-foreground">Achievements</h1>
        <p className="text-sm text-muted-foreground">
          Track your milestones and streaks as you manage your finances.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Loading achievements...
        </div>
      ) : achievements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          No achievements yet. Keep logging activity to unlock badges.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {achievement.description}
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 p-2 text-primary">
                  <Trophy className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Unlocked {new Date(achievement.unlocked_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    timeZone: "UTC",
                  },
                )}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
