"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/app/_components/providers/UserProvider";

type TopbarProps = {
  className?: string;
  availableBalance?: number;
  notificationCount?: number;
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Topbar({
  className,
  availableBalance = 0,
  notificationCount = 0,
}: TopbarProps) {
  const { user } = useUser();
  const username = user?.email?.split("@")[0] || "Guest";
  const avatarUrl = user?.user_metadata?.avatar_url;

  const initials =
    username
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <header className={cn("h-16 border-b border-border bg-card", className)}>
      <div className="flex h-full items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-4">
          {/* Tweak: Point this to your preferred landing route */}
          <Link
            href="/dashboard"
            className="text-lg font-semibold text-foreground"
          >
            CoinRide
          </Link>

          {/*
            Tweak: If you want this to open a modal instead of navigating,
            swap Link for a button and handle it in the parent layout.
          */}
          <Link
            href="/dashboard/transactions"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Transaction
          </Link>
          <div className="hidden flex-col items-start leading-tight px-2 sm:flex">
            <span className="text-xs text-muted-foreground">
              Current Balance
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-10 w-5 items-center justify-center rounded-xl bg-background transition hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />

            {/* Badge */}
            {notificationCount > 0 ? (
              <span className="absolute right-2 top-2 inline-flex h-2 w-2 rounded-full bg-destructive" />
            ) : null}
          </button>

          {/* Tweak: Change href if your profile route differs */}
          <Link
            href="/profile"
            className="flex items-center gap-3 rounded-xl py-1 transition hover:bg-muted"
          >
            <div className="h-9 w-9 overflow-hidden rounded-full border border-input bg-muted">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="User avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>

            <span className="hidden text-sm font-medium text-foreground sm:inline">
              {username}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
