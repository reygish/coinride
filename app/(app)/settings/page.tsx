"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";

type UserSettings = {
  currency: string;
  dark_mode: boolean;
  receive_notifications: boolean;
};

const CURRENCY_OPTIONS = [
  { value: "IDR", label: "IDR (Rp)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "SGD", label: "SGD (S$)" },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const [settings, setSettings] = useState<UserSettings>({
    currency: "IDR",
    dark_mode: false,
    receive_notifications: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const loadSettings = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("user_profiles")
        .select("currency,dark_mode,receive_notifications")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSettings({
          currency: data.currency ?? "IDR",
          dark_mode: Boolean(data.dark_mode),
          receive_notifications: Boolean(data.receive_notifications),
        });
      }
      setIsLoading(false);
    };

    loadSettings();
  }, [router, supabase, user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatus(null);

    const { error } = await supabase
      .from("user_profiles")
      .update({
        currency: settings.currency,
        dark_mode: settings.dark_mode,
        receive_notifications: settings.receive_notifications,
      })
      .eq("user_id", user.id);

    if (error) {
      setStatus("Unable to save settings.");
    } else {
      setStatus("Settings saved.");
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Control your app preferences and notifications.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">
            Preferred currency
          </label>
          <select
            value={settings.currency}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                currency: event.target.value,
              }))
            }
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          >
            {CURRENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border px-3 py-3">
          <div>
            <p className="text-sm font-light tracking-[-0.01em] text-foreground">
              Notifications
            </p>
            <p className="text-xs text-muted-foreground">
              Receive reminder and budget alerts.
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.receive_notifications}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                receive_notifications: event.target.checked,
              }))
            }
            className="h-4 w-4"
          />
        </div>

        {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save settings"}
        </button>
      </div>
    </div>
  );
}
