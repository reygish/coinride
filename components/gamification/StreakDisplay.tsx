/**
 * components/gamification/StreakDisplay.tsx
 * Widget yang menampilkan streak harian user dengan efek visual yang menarik.
 * Terinspirasi dari Duolingo streak system.
 */

"use client";

import { useGamification } from "@/hooks/useGamification";
import { cn } from "@/lib/utils/formatters";
import { Flame, Zap } from "lucide-react";

export function StreakDisplay() {
  const { streak } = useGamification();

  if (!streak) return null;

  const { current_streak, longest_streak } = streak;
  const isActive = current_streak > 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5",
        isActive
          ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5"
          : "border-white/8 bg-[#161E33]/60"
      )}
    >
      {/* Background decorative element */}
      {isActive && (
        <div className="absolute -right-6 -top-6 text-8xl opacity-10">🔥</div>
      )}

      <div className="relative flex items-center gap-4">
        {/* Flame icon with glow */}
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl text-3xl",
            isActive
              ? "bg-amber-500/20 shadow-lg shadow-amber-500/20"
              : "bg-white/5"
          )}
        >
          {isActive ? "🔥" : "❄️"}
        </div>

        <div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={cn(
                "font-display text-4xl font-black tabular-nums",
                isActive ? "text-amber-300" : "text-slate-500"
              )}
            >
              {current_streak}
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                isActive ? "text-amber-400" : "text-slate-600"
              )}
            >
              day{current_streak !== 1 ? "s" : ""}
            </span>
          </div>
          <p
            className={cn(
              "text-sm font-medium",
              isActive ? "text-amber-200/80" : "text-slate-500"
            )}
          >
            {isActive
              ? current_streak >= 7
                ? "You're on fire! 🔥"
                : "Keep logging daily!"
              : "Log today to start a streak!"}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-4 flex gap-4 border-t border-white/8 pt-4">
        <div className="text-center">
          <p className="font-display text-xl font-bold text-amber-300">
            {current_streak}
          </p>
          <p className="text-xs text-slate-500">Current</p>
        </div>
        <div className="w-px bg-white/8" />
        <div className="text-center">
          <p className="font-display text-xl font-bold text-slate-300">
            {longest_streak}
          </p>
          <p className="text-xs text-slate-500">Best</p>
        </div>
        <div className="flex-1" />
        {/* Streak tip */}
        <div className="flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2">
          <Zap size={12} className="text-amber-400" />
          <p className="text-xs text-slate-400">
            {isActive ? `Day ${current_streak} of your journey` : "Start today!"}
          </p>
        </div>
      </div>
    </div>
  );
}
