/**
 * components/ui/ProgressBar.tsx
 * Progress bar animasi untuk budget tracking dan XP bar.
 */

"use client";

import { cn } from "@/lib/utils/formatters";
import { clamp } from "@/lib/utils/formatters";

interface ProgressBarProps {
  value: number;           // 0-100
  max?: number;            // default 100
  color?: "green" | "amber" | "red" | "purple" | "blue";
  hexColor?: string;       // override dengan warna hex kategori (e.g. "#F59E0B")
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  color = "green",
  hexColor,
  size = "md",
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  // Clamp antara 0-100 untuk keamanan
  const percentage = clamp((value / max) * 100, 0, 100);

  const colors = {
    green: "bg-emerald-400",
    amber: "bg-amber-400",
    red: "bg-red-400",
    purple: "bg-violet-400",
    blue: "bg-blue-400",
  };

  const sizes = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  // Pilih warna berdasarkan persentase (untuk budget tracking)
  const getAutoColor = () => {
    if (percentage > 100) return colors.red;
    if (percentage > 75) return colors.amber;
    return colors.green;
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-white/8",
          sizes[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            animated && "animate-none",
            !hexColor && (color === "green" && percentage > 75
              ? getAutoColor()
              : colors[color])
          )}
          style={{
            width: `${Math.min(percentage, 100)}%`,
            ...(hexColor ? { backgroundColor: hexColor } : {}),
          }}
        />
        {/* Shimmer effect untuk progress bar aktif */}
        {percentage < 100 && percentage > 0 && (
          <div
            className="absolute inset-0 -skew-x-12 animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent"
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
      {showLabel && (
        <span className="min-w-[3rem] text-right text-xs font-medium text-slate-400">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}
