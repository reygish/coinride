"use client";

import Link from "next/link";
import {
  Bell,
  Flame,
  LayoutDashboard,
  Medal,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";
import ThemeToggle from "./ThemeToggle";
import { ProgressBar } from "@/components/ui/ProgressBar";

type SidebarProps = {
  className?: string;
};

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transactions", href: "/transactions", icon: Receipt },
      // Tweak: Update these routes once you add the pages.
      {
        label: "Budgets",
        href: "/budgets",
        icon: Target,
      },
      {
        label: "Saving Goals",
        href: "/saving-goals",
        icon: PiggyBank,
      },
    ],
  },
  {
    title: "Gamification",
    items: [
      {
        label: "Achievements",
        href: "/achievements",
        icon: Trophy,
      },
      {
        label: "Leaderboard",
        href: "/leaderboard",
        icon: Medal,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
      },
      { label: "Profile", href: "/profile", icon: User },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
      },
    ],
  },
];

function SidebarItem({ label, href, icon: Icon, disabled }: NavItem) {
  const baseClassName =
    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition";

  if (!href || disabled) {
    return (
      <span
        className={cn(
          baseClassName,
          "cursor-not-allowed text-muted-foreground opacity-70",
        )}
        aria-disabled="true"
      >
        <Icon className="h-4 w-4" />
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={cn(baseClassName, "hover:bg-muted")}>
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      {label}
    </Link>
  );
}

export default function Sidebar({ className }: SidebarProps) {
  const { streak, level, xpInCurrentLevel, xpToNextLevel, unlockedCount } =
    useGamification();

  return (
    <aside
      className={cn(
        "min-h-0 w-72 shrink-0 overflow-y-auto border-r border-border bg-background",
        "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
        className,
      )}
    >
      {/* level */}
      <div className="mx-3 mt-4 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Level {level}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="h-3 w-3 text-orange-500" />
              {streak}
            </span>
            <span className="text-xs text-muted-foreground">
              {unlockedCount} badges
            </span>
          </div>
        </div>
        <ProgressBar
          value={xpInCurrentLevel}
          max={xpToNextLevel}
          color="purple"
          size="sm"
        />
        <p
          className="mt-1.5 text-xs text-muted-foreground"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {xpInCurrentLevel} / {xpToNextLevel} XP to Level {level + 1}
        </p>
      </div>

      <div className="py-4 px-2">
        <nav className="space-y-6">
          {NAV.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="px-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {section.title}
              </h2>
              <div className="">
                {section.items.map((item) => (
                  <SidebarItem key={item.label} {...item} />
                ))}

                {section.title === "System" ? (
                  <div className="pt-1">
                    <ThemeToggle />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
function useGamification(): {
  streak: number;
  level: number;
  xpInCurrentLevel: number;
  xpToNextLevel: number;
  unlockedCount: number;
} {
  const supabase = createClient();
  const { user } = useUser();
  const [streak, setStreak] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [xpInCurrentLevel, setXpInCurrentLevel] = useState<number>(0);
  const [xpToNextLevel, setXpToNextLevel] = useState<number>(1000);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const loadGamification = async () => {
      const xpPerLevel = 1000;
      const [{ data: profile }, { data: achievements }] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("total_xp,level,streak_count")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("achievements")
          .select("id")
          .eq("user_id", user.id),
      ]);

      const totalXp = Number(profile?.total_xp ?? 0);
      const computedLevel = Number(profile?.level ?? 1) || 1;
      const computedXpInLevel = totalXp % xpPerLevel;

      setLevel(computedLevel);
      setXpInCurrentLevel(computedXpInLevel);
      setXpToNextLevel(xpPerLevel);
      setStreak(Number(profile?.streak_count ?? 0));
      setUnlockedCount(Array.isArray(achievements) ? achievements.length : 0);
    };

    loadGamification();
    const handleXpUpdate = () => {
      loadGamification();
    };

    window.addEventListener("coinride:xp-updated", handleXpUpdate);
    return () => window.removeEventListener("coinride:xp-updated", handleXpUpdate);
  }, [supabase, user]);

  return { streak, level, xpInCurrentLevel, xpToNextLevel, unlockedCount };
}
