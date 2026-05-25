/**
 * lib/utils/achievements.ts
 * Konfigurasi semua achievement yang tersedia di Spendly.
 * Single source of truth untuk definisi achievement.
 */

import type { Achievement } from "@/types";

export const ACHIEVEMENTS_CONFIG: Achievement[] = [
  {
    id: "first_transaction",
    title: "First Step!",
    description: "Log your very first transaction",
    icon: "🌟",
    rarity: "common",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Log transactions 7 days in a row",
    icon: "🔥",
    rarity: "rare",
  },
  {
    id: "streak_30",
    title: "30-Day Legend",
    description: "Log transactions 30 days in a row",
    icon: "💎",
    rarity: "legendary",
  },
  {
    id: "first_saver",
    title: "First Saver",
    description: "First time your income exceeds expenses in a month",
    icon: "💰",
    rarity: "rare",
  },
  {
    id: "budget_master",
    title: "Budget Master",
    description: "Stay within all budgets for an entire month",
    icon: "🎯",
    rarity: "epic",
  },
  {
    id: "frugal_foodie",
    title: "Frugal Foodie",
    description: "Keep food spending under budget this week",
    icon: "🥗",
    rarity: "common",
  },
  {
    id: "logger_30",
    title: "30-Day Logger",
    description: "Log at least one transaction every day for 30 days",
    icon: "📅",
    rarity: "epic",
  },
  {
    id: "ai_trainer",
    title: "AI Trainer",
    description: "Correct AI category classification 10 times",
    icon: "🤖",
    rarity: "rare",
  },
];

/** Warna untuk setiap rarity level */
export const RARITY_COLORS: Record<Achievement["rarity"], string> = {
  common: "#94A3B8",
  rare: "#3B82F6",
  epic: "#8B5CF6",
  legendary: "#F59E0B",
};

/** XP yang didapat dari setiap rarity */
export const RARITY_XP: Record<Achievement["rarity"], number> = {
  common: 50,
  rare: 100,
  epic: 200,
  legendary: 500,
};
