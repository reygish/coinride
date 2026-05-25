"use client";

import Link from "next/link";
import {
  BarChart3,
  Bell,
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
      // Tweak: Update this route once you add the page.
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        disabled: true,
      },
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
        disabled: true,
      },
      {
        label: "Saving Goals",
        href: "/saving-goals",
        icon: PiggyBank,
        disabled: true,
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
        disabled: true,
      },
      {
        label: "Leaderboard",
        href: "/leaderboard",
        icon: Medal,
        disabled: true,
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
        disabled: true,
      },
      { label: "Profile", href: "/profile", icon: User },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        disabled: true,
      },
    ],
  },
];

function SidebarItem({ label, href, icon: Icon, disabled }: NavItem) {
  const baseClassName =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition";

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
        "min-h-0 w-72 shrink-0 overflow-y-auto border-r border-border bg-card",
        "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40",
        className,
      )}
    >
      {/* level */}
      <div className="mx-3 mt-4 rounded-xl bg-gradient-to-br from-violet-500/15 to-emerald-500/10 border border-white/8 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Level {level}
          </span>
          <span className="text-xs text-slate-400">{unlockedCount} badges</span>
        </div>
        <ProgressBar
          value={xpInCurrentLevel}
          max={xpToNextLevel}
          color="purple"
          size="sm"
        />
        <p className="mt-1.5 text-xs text-slate-500">
          {xpInCurrentLevel} / {xpToNextLevel} XP to Level {level + 1}
        </p>
      </div>

      <div className="py-4 px-2">
        <nav className="space-y-6">
          {NAV.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
  const [streak, setStreak] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [xpInCurrentLevel, setXpInCurrentLevel] = useState<number>(0);
  const [xpToNextLevel, setXpToNextLevel] = useState<number>(1000);
  const [unlockedCount, setUnlockedCount] = useState<number>(0);

  useEffect(() => {
    // Simple local/demo implementation. In a real app this would come from an API or global state.
    try {
      const rawTotalXP = localStorage.getItem("totalXP");
      const totalXP = rawTotalXP ? parseInt(rawTotalXP, 10) : 1250; // default demo XP
      const xpPerLevel = 1000;

      const computedLevel = Math.floor(totalXP / xpPerLevel) + 1;
      const computedXpInLevel = totalXP % xpPerLevel;

      setLevel(computedLevel);
      setXpInCurrentLevel(computedXpInLevel);
      setXpToNextLevel(xpPerLevel);

      const rawStreak = localStorage.getItem("streak");
      setStreak(rawStreak ? parseInt(rawStreak, 10) : 3);

      const rawBadges = localStorage.getItem("badges");
      // badges stored as JSON array of ids/names in localStorage for demo
      if (rawBadges) {
        try {
          const parsed = JSON.parse(rawBadges);
          setUnlockedCount(Array.isArray(parsed) ? parsed.length : 0);
        } catch {
          setUnlockedCount(0);
        }
      } else {
        setUnlockedCount(4);
      }
    } catch (e) {
      // fallback defaults
      setStreak(0);
      setLevel(1);
      setXpInCurrentLevel(0);
      setXpToNextLevel(1000);
      setUnlockedCount(0);
    }
  }, []);

  return { streak, level, xpInCurrentLevel, xpToNextLevel, unlockedCount };
}
