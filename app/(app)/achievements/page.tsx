/**
 * app/(app)/achievements/page.tsx
 * Halaman koleksi achievement/badge gamifikasi.
 * Menampilkan semua badge dengan status locked/unlocked dan progress.
 */

"use client";

import { useGamification } from "@/hooks/useGamification";
import { AchievementBadge } from "@/components/gamification/AchievementBadge";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Trophy, Zap, Star } from "lucide-react";
import { RARITY_COLORS } from "@/lib/utils/achievements";
import type { Achievement } from "@/types";

export default function AchievementsPage() {
  const {
    achievements,
    unlockedCount,
    totalCount,
    totalXP,
    level,
    xpInCurrentLevel,
    xpToNextLevel,
    streak,
  } = useGamification();

  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Kelompokkan achievement berdasarkan rarity
  const byRarity = achievements.reduce(
    (acc, a) => {
      if (!acc[a.rarity]) acc[a.rarity] = [];
      acc[a.rarity].push(a);
      return acc;
    },
    {} as Record<Achievement["rarity"], typeof achievements>
  );

  const rarityOrder: Achievement["rarity"][] = ["legendary", "epic", "rare", "common"];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-100">
          Achievements 🏆
        </h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Earn badges by building great financial habits
        </p>
      </div>

      {/* Level & XP card */}
      <Card glow="purple" className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-8 -top-8 text-9xl opacity-5">
          ⭐
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Level info */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/20 shadow-lg shadow-violet-500/20 text-4xl">
              ⭐
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">
                Level {level}
              </p>
              <p className="font-display text-3xl font-black text-slate-100">
                {totalXP} XP
              </p>
              <p className="text-xs text-slate-500">
                {xpInCurrentLevel} / {xpToNextLevel} XP to Level {level + 1}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 sm:flex-col sm:text-right">
            <div>
              <p className="font-display text-2xl font-black text-slate-100">
                {unlockedCount}/{totalCount}
              </p>
              <p className="text-xs text-slate-500">Badges earned</p>
            </div>
            <div>
              <p className="font-display text-2xl font-black text-amber-300">
                {streak?.current_streak ?? 0} 🔥
              </p>
              <p className="text-xs text-slate-500">Day streak</p>
            </div>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="mt-5">
          <ProgressBar
            value={xpInCurrentLevel}
            max={xpToNextLevel}
            color="purple"
            size="lg"
            showLabel
          />
        </div>

        {/* Completion summary */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {completionPercentage}% complete
          </span>
        </div>
      </Card>

      {/* Streak card */}
      <StreakDisplay />

      {/* Achievements grouped by rarity */}
      {rarityOrder.map((rarity) => {
        const items = byRarity[rarity];
        if (!items?.length) return null;
        const color = RARITY_COLORS[rarity];
        const unlocked = items.filter((a) => a.isUnlocked).length;

        return (
          <section key={rarity}>
            <div className="mb-4 flex items-center gap-2">
              <h3
                className="font-display text-lg font-bold capitalize"
                style={{ color }}
              >
                {rarity}
              </h3>
              <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ backgroundColor: `${color}15`, color }}>
                {unlocked}/{items.length}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  isUnlocked={achievement.isUnlocked}
                  unlockedAt={achievement.unlockedAt}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
