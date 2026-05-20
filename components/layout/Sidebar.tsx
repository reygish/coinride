/**
 * components/layout/Sidebar.tsx
 * Navigasi sidebar untuk desktop. Responsif dengan mobile overlay.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/formatters";
import { useGamification } from "@/hooks/useGamification";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Trophy,
  Settings,
  Flame,
  Zap,
  X,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: Target },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { streak, level, xpInCurrentLevel, xpToNextLevel, unlockedCount } =
    useGamification();

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-64 flex-col bg-[#0F1628] border-r border-white/8",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 group"
            onClick={() => isSidebarOpen && toggleSidebar()}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 transition-colors group-hover:bg-emerald-500/30">
              <Zap size={18} />
            </div>
            <span className="font-display text-xl font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
              Spendly
            </span>
          </Link>
          {/* Close button — mobile only */}
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* User level & XP card */}
        <div className="mx-3 mt-4 rounded-xl bg-gradient-to-br from-violet-500/15 to-emerald-500/10 border border-white/8 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Level {level}
            </span>
            <span className="text-xs text-slate-400">
              {unlockedCount} badges
            </span>
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

        {/* Streak widget */}
        {streak && streak.current_streak > 0 && (
          <div className="mx-3 mt-3 flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3">
            <Flame size={20} className="text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-300">
                {streak.current_streak} day streak!
              </p>
              <p className="text-xs text-amber-400/70">Keep it going 🔥</p>
            </div>
          </div>
        )}

        {/* Navigation links */}
        <nav className="mt-4 flex-1 space-y-1 px-3" aria-label="Main navigation">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => isSidebarOpen && toggleSidebar()}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} className="shrink-0" />
                {label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer: version info */}
        <div className="border-t border-white/8 p-4">
          <p className="text-xs text-slate-600 text-center">Spendly v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
