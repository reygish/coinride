"use client";

import { useEffect, useState } from "react";
import { Medal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LeaderboardEntry = {
  id: string;
  user_id: string;
  full_name: string;
  level: number;
  total_xp: number;
  profile_picture_url: string | null;
};

export default function LeaderboardPage() {
  const supabase = createClient();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);

      const { data } = await supabase
        .from("user_profiles")
        .select("id,user_id,full_name,level,total_xp,profile_picture_url")
        .order("level", { ascending: false })
        .order("total_xp", { ascending: false })
        .limit(10);

      setEntries((data ?? []) as LeaderboardEntry[]);
      setIsLoading(false);
    };

    loadLeaderboard();
  }, [supabase]);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-foreground">
          Leaderboard
        </h1>
        <p className="text-sm text-muted-foreground">
          See who is building the biggest balance streaks.
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Loading leaderboard...
        </div>
      ) : entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          No leaderboard data available yet.
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, index) => {
            const rank = index + 1;
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
                    {rank}
                  </div>
                  <div>
                    <p className="text-sm font-light tracking-[-0.01em] text-foreground">
                      {entry.full_name}
                    </p>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      Level {entry.level} · {entry.total_xp} XP
                    </p>
                  </div>
                </div>
                <div className="text-primary">
                  <Medal className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
