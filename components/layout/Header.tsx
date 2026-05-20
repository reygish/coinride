/**
 * components/layout/Header.tsx
 * Header bar yang tampil di atas setiap halaman dalam app.
 * Berisi hamburger menu (mobile), judul halaman, dan notifikasi.
 */

"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils/formatters";
import { Menu, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Zap } from "lucide-react";

/** Map path ke judul halaman */
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/budget": "Budget",
  "/achievements": "Achievements",
  "/settings": "Settings",
};

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useAppStore();

  // Dapatkan judul dari path saat ini
  const title = PAGE_TITLES[pathname] ?? "Spendly";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/8 bg-[#090B18]/80 px-4 backdrop-blur-md lg:px-6">
      {/* Left: Hamburger + Spendly logo (mobile) / page title (desktop) */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors lg:hidden"
          aria-label="Toggle sidebar"
          aria-expanded={false}
        >
          <Menu size={20} />
        </button>

        {/* Spendly brand — tampil di mobile (sidebar tersembunyi), hidden di desktop */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group lg:hidden"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 transition-colors group-hover:bg-emerald-500/30">
            <Zap size={15} />
          </div>
          <span className="font-display text-lg font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
            Spendly
          </span>
        </Link>

        {/* Judul halaman — hidden di mobile, tampil di desktop */}
        <h1 className="hidden lg:block font-display text-lg font-semibold text-slate-100">
          {title}
        </h1>
      </div>

      {/* Right: Actions + Profile */}
      <div className="flex items-center gap-2">
        {/* Quick add transaction button */}
        <Link href="/transactions">
          <Button variant="primary" size="sm" className="hidden sm:inline-flex gap-1.5">
            <Plus size={16} />
            Add
          </Button>
        </Link>

        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
        </button>

        {/* Profile avatar — klik menuju settings/profil */}
        <Link
          href="/settings"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-violet-500 text-xs font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
          aria-label="Go to profile"
          title="Rey Harmon"
        >
          RH
        </Link>
      </div>
    </header>
  );
}
