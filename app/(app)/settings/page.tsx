/**
 * app/(app)/settings/page.tsx
 * Halaman pengaturan user: profil, notifikasi/reminder, dan preferensi.
 *
 * Fitur Smart Reminder:
 * - User bisa set frekuensi reminder (hourly/daily)
 * - Untuk daily: pilih jam pengiriman
 * - Email dikirim oleh backend (Supabase Edge Function + cron)
 *
 * TODO (Backend):
 * 1. Implementasi simpan profil ke user_profiles table
 * 2. Implementasi CRUD reminder di tabel reminders
 * 3. Setup Supabase Edge Function untuk kirim email reminder via cron
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils/formatters";
import { Bell, User, Shield, Trash2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  // ─── Profile state ───────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("Rey Harmon");
  const [email, setEmail] = useState("rey@gmail.com");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // ─── Reminder state ──────────────────────────────────────────────────────────
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<"hourly" | "daily">("daily");
  const [reminderTime, setReminderTime] = useState("20:00");
  const [reminderEmail, setReminderEmail] = useState("rey@gmail.com");
  const [isSavingReminder, setIsSavingReminder] = useState(false);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      /**
       * TODO (Backend): Implementasi update profil
       * const supabase = createClient();
       * const { error } = await supabase
       *   .from("user_profiles")
       *   .update({ full_name: fullName })
       *   .eq("id", user.id);
       * if (error) throw error;
       */
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Profile updated!");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveReminder = async () => {
    setIsSavingReminder(true);
    try {
      /**
       * TODO (Backend): Simpan konfigurasi reminder ke database
       * Reminder dikirim oleh Supabase Edge Function yang dijadwalkan dengan cron.
       *
       * Skema pengiriman email:
       * - Hourly: Edge Function jalan setiap jam, cek user dengan reminder hourly aktif
       * - Daily: Edge Function jalan setiap jam, cek apakah sekarang = waktu reminder user
       *
       * Email berisi: "Jangan lupa catat pengeluaran hari ini! 📊"
       * + link langsung ke /transactions
       */
      await new Promise((r) => setTimeout(r, 800));
      toast.success("Reminder settings saved! 📬");
    } finally {
      setIsSavingReminder(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-100">Settings</h2>
        <p className="mt-0.5 text-sm text-slate-500">Manage your profile and preferences</p>
      </div>

      {/* ─── Profile section ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <User size={18} className="text-slate-400" />
              Profile
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              helperText="Used for login and reminders"
            />
            <Button
              variant="primary"
              onClick={handleSaveProfile}
              isLoading={isSavingProfile}
            >
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Smart Reminder section ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Bell size={18} className="text-slate-400" />
              Smart Reminders
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              We&apos;ll send you email reminders to log your finances so you never forget.
            </p>

            {/* Enable/disable toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  Enable Reminders
                </p>
                <p className="text-xs text-slate-500">
                  Receive email nudges to log your spending
                </p>
              </div>
              <button
                onClick={() => setReminderEnabled(!reminderEnabled)}
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors duration-200",
                  reminderEnabled ? "bg-emerald-500" : "bg-white/15"
                )}
                role="switch"
                aria-checked={reminderEnabled}
              >
                <span
                  className={cn(
                    "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
                    reminderEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
            </div>

            {/* Reminder settings — only show when enabled */}
            {reminderEnabled && (
              <div className="space-y-4 animate-fade-in">
                <Input
                  label="Reminder Email"
                  type="email"
                  value={reminderEmail}
                  onChange={(e) => setReminderEmail(e.target.value)}
                  helperText="We'll send the reminder to this email"
                />

                <Select
                  label="Frequency"
                  value={reminderFrequency}
                  onChange={(e) =>
                    setReminderFrequency(e.target.value as "hourly" | "daily")
                  }
                  options={[
                    { value: "daily", label: "📅 Daily — once a day" },
                    { value: "hourly", label: "⏰ Hourly — every hour" },
                  ]}
                />

                {/* Time picker — only for daily */}
                {reminderFrequency === "daily" && (
                  <Input
                    label="Reminder Time"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    helperText="When should we remind you? (Your local time)"
                  />
                )}

                {/* Email preview */}
                <div className="rounded-xl border border-white/8 bg-white/3 p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Preview
                  </p>
                  <div className="rounded-lg border border-white/8 bg-[#0F1628] p-3 text-sm">
                    <p className="font-semibold text-slate-200">
                      📊 Don&apos;t forget to log your finances!
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Hi {fullName}! Track your spending today and keep your streak alive.
                      Click to log now →
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleSaveReminder}
              isLoading={isSavingReminder}
            >
              Save Reminder Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ─── Security section ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Shield size={18} className="text-slate-400" />
              Security
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <button
              className="flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3 text-left transition-colors hover:bg-white/5"
              onClick={() => toast("Password change coming soon!")}
            >
              <div>
                <p className="text-sm font-medium text-slate-200">Change Password</p>
                <p className="text-xs text-slate-500">Update your account password</p>
              </div>
              <span className="text-xs text-emerald-400">Change →</span>
            </button>

            {/* Danger zone: delete account */}
            <button
              className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-left transition-colors hover:bg-red-500/10"
              onClick={() =>
                confirm("Are you sure? This will permanently delete all your data.") &&
                toast.error("Account deletion — backend implementation needed")
              }
            >
              <Trash2 size={16} className="text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">Delete Account</p>
                <p className="text-xs text-slate-500">
                  Permanently remove your account and all data
                </p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
