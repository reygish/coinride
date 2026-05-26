"use client";

import Link from "next/link";
import { Bell, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";

type TopbarProps = {
  className?: string;
  availableBalance?: number;
  notificationCount?: number;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function Topbar({
  className,
  availableBalance,
  notificationCount = 0,
}: TopbarProps) {
  const { user } = useUser();
  const supabase = createClient();
  const router = useRouter();
  const [currency, setCurrency] = useState("IDR");
  const [balance, setBalance] = useState(availableBalance ?? 0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const username = user?.email?.split("@")[0] || "Guest";
  const avatarUrl = user?.user_metadata?.avatar_url;
  
  useEffect(() => {
    const loadProfileMeta = async () => {
      if (!user || availableBalance !== undefined) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("currency,available_balance")
        .eq("user_id", user.id)
        .single();

      if (data?.currency) {
        setCurrency(data.currency);
      }
      if (typeof data?.available_balance === "number") {
        setBalance(data.available_balance);
      }
    };

    loadProfileMeta();
    const handleBalanceUpdate = () => {
      loadProfileMeta();
    };

    window.addEventListener("coinride:balance-updated", handleBalanceUpdate);
    return () =>
      window.removeEventListener(
        "coinride:balance-updated",
        handleBalanceUpdate,
      );
  }, [availableBalance, supabase, user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  useEffect(() => {
    if (availableBalance !== undefined) {
      setBalance(availableBalance);
    }
  }, [availableBalance]);

  const initials =
    username
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U";

  return (
    <header
      className={cn(
        "h-16 border-b border-border bg-background/95 backdrop-blur",
        className,
      )}
    >
      <div className="flex h-full items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          {/* Tweak: Point this to your preferred landing route */}
          <Link
            href="/dashboard"
            className="text-lg font-light tracking-[-0.02em] text-foreground"
          >
            CoinRide
          </Link>

          {/*
            Tweak: If you want this to open a modal instead of navigating,
            swap Link for a button and handle it in the parent layout.
          */}
          <Link
            href="/transactions"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add Transaction
          </Link>
          <div className="hidden flex-col items-start leading-tight px-2 sm:flex">
            <span className="text-xs text-muted-foreground">
              Current Balance
            </span>
            <span
              className="text-sm font-light text-foreground"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatCurrency(balance, currency)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background transition hover:bg-muted"
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
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 rounded-full px-2 py-1 transition hover:bg-muted"
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
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 top-12 w-60 rounded-lg border border-border bg-card p-4 shadow-[rgba(0,55,112,0.08)_0_8px_24px,rgba(0,55,112,0.04)_0_2px_6px]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-input bg-muted">
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
                  <div>
                    <p className="text-sm font-light tracking-[-0.01em] text-foreground">
                      {username}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email ?? ""}
                    </p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  View profile
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.replace("/");
                  }}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted"
                >
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
