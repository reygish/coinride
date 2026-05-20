/**
 * hooks/useGamification.ts
 * Custom hook untuk data gamifikasi: streak, achievements, level.
 */

"use client";

import { useAppStore } from "@/store/useAppStore";
import { ACHIEVEMENTS_CONFIG } from "@/lib/utils/achievements";
import type { AchievementId } from "@/types";

export function useGamification() {
  const { streak, achievements } = useAppStore();

  /** Set achievement IDs yang sudah di-unlock */
  const unlockedIds = new Set<AchievementId>(
    achievements.map((a) => a.achievement_id as AchievementId)
  );

  /** Semua achievement dengan status locked/unlocked */
  const allAchievements = ACHIEVEMENTS_CONFIG.map((achievement) => ({
    ...achievement,
    isUnlocked: unlockedIds.has(achievement.id),
    unlockedAt: achievements.find((a) => a.achievement_id === achievement.id)
      ?.unlocked_at,
  }));

  /** Hitung total XP dari achievements yang di-unlock */
  const totalXP = achievements.length * 100;

  /** Tentukan level berdasarkan XP */
  const level = Math.floor(totalXP / 500) + 1;
  const xpInCurrentLevel = totalXP % 500;
  const xpToNextLevel = 500;

  return {
    streak,
    achievements: allAchievements,
    unlockedCount: achievements.length,
    totalCount: ACHIEVEMENTS_CONFIG.length,
    totalXP,
    level,
    xpInCurrentLevel,
    xpToNextLevel,
  };
}
