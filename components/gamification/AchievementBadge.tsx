/**
 * components/gamification/AchievementBadge.tsx
 * Badge untuk menampilkan satu achievement (locked atau unlocked).
 * Efek glow berbeda berdasarkan rarity.
 */

"use client";

import { cn } from "@/lib/utils/formatters";
import { RARITY_COLORS } from "@/lib/utils/achievements";
import { formatRelativeTime } from "@/lib/utils/formatters";
import type { Achievement } from "@/types";
import { Lock } from "lucide-react";

interface AchievementBadgeProps {
  achievement: Achievement;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export function AchievementBadge({
  achievement,
  isUnlocked,
  unlockedAt,
}: AchievementBadgeProps) {
  const rarityColor = RARITY_COLORS[achievement.rarity];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-2xl border p-5 text-center transition-all duration-300",
        isUnlocked
          ? "border-white/12 bg-[#161E33] hover:scale-105"
          : "border-white/6 bg-[#0F1628] opacity-60"
      )}
      style={
        isUnlocked
          ? {
              boxShadow: `0 0 20px ${rarityColor}15, 0 0 0 1px ${rarityColor}20`,
            }
          : undefined
      }
    >
      {/* Rarity indicator */}
      <div
        className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
        style={{
          backgroundColor: `${rarityColor}15`,
          color: rarityColor,
        }}
      >
        {achievement.rarity}
      </div>

      {/* Badge icon */}
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-2xl text-4xl",
          isUnlocked ? "shadow-lg" : "grayscale"
        )}
        style={
          isUnlocked
            ? {
                background: `radial-gradient(circle, ${rarityColor}20, ${rarityColor}08)`,
                boxShadow: `0 4px 20px ${rarityColor}30`,
              }
            : { backgroundColor: "rgba(255,255,255,0.03)" }
        }
      >
        {isUnlocked ? achievement.icon : <Lock size={24} className="text-slate-600" />}
      </div>

      {/* Text */}
      <div>
        <p
          className={cn(
            "font-display text-sm font-bold",
            isUnlocked ? "text-slate-100" : "text-slate-500"
          )}
        >
          {achievement.title}
        </p>
        <p
          className={cn(
            "mt-1 text-xs leading-relaxed",
            isUnlocked ? "text-slate-400" : "text-slate-600"
          )}
        >
          {achievement.description}
        </p>
      </div>

      {/* Unlock timestamp */}
      {isUnlocked && unlockedAt && (
        <p className="text-xs" style={{ color: rarityColor }}>
          ✓ {formatRelativeTime(unlockedAt)}
        </p>
      )}
    </div>
  );
}
