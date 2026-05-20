/**
 * app/api/streak/route.ts
 * API untuk streak harian user.
 *
 * Streak logic:
 * - Bertambah jika user log transaksi hari ini (dan belum log kemarin sudah dihandle)
 * - Reset ke 0 jika melewati 1 hari tanpa log
 * - Longest streak tidak pernah turun
 *
 * Endpoint:
 *   GET   /api/streak  — Ambil data streak user
 *   PATCH /api/streak  — Update streak setelah transaksi berhasil dibuat
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, UserStreak } from "@/types";
import { format, differenceInDays, parseISO } from "date-fns";

// ─── GET /api/streak ──────────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse<ApiResponse<UserStreak | null>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    /**
     * TODO (Backend):
     * const { data, error } = await supabase
     *   .from("user_streaks")
     *   .select()
     *   .eq("user_id", user.id)
     *   .single();
     *
     * if (error && error.code !== "PGRST116") throw error;
     *
     * // Cek apakah streak sudah expired (tidak log hari ini atau kemarin)
     * if (data) {
     *   const today = format(new Date(), "yyyy-MM-dd");
     *   const daysSinceLastLog = differenceInDays(
     *     new Date(today),
     *     parseISO(data.last_log_date)
     *   );
     *   if (daysSinceLastLog > 1) {
     *     // Streak expired — reset ke 0
     *     await supabase
     *       .from("user_streaks")
     *       .update({ current_streak: 0, updated_at: new Date().toISOString() })
     *       .eq("user_id", user.id);
     *     return NextResponse.json({ data: { ...data, current_streak: 0 }, error: null });
     *   }
     * }
     *
     * return NextResponse.json({ data: data ?? null, error: null });
     */

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error("[GET /api/streak]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/streak ────────────────────────────────────────────────────────
/**
 * Dipanggil setelah transaksi berhasil dibuat untuk update streak.
 * Idempotent: aman dipanggil berkali-kali dalam satu hari.
 */
export async function PATCH(): Promise<NextResponse<ApiResponse<UserStreak>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    /**
     * TODO (Backend):
     * const today = format(new Date(), "yyyy-MM-dd");
     *
     * // Cek apakah sudah ada streak record
     * const { data: existing } = await supabase
     *   .from("user_streaks")
     *   .select()
     *   .eq("user_id", user.id)
     *   .single();
     *
     * if (!existing) {
     *   // Buat streak baru
     *   const { data, error } = await supabase
     *     .from("user_streaks")
     *     .insert({ user_id: user.id, current_streak: 1, longest_streak: 1, last_log_date: today })
     *     .select().single();
     *   if (error) throw error;
     *   return NextResponse.json({ data, error: null });
     * }
     *
     * if (existing.last_log_date === today) {
     *   // Sudah log hari ini — tidak perlu update
     *   return NextResponse.json({ data: existing, error: null });
     * }
     *
     * const daysSinceLastLog = differenceInDays(new Date(today), parseISO(existing.last_log_date));
     * const newStreak = daysSinceLastLog === 1 ? existing.current_streak + 1 : 1;
     * const newLongest = Math.max(newStreak, existing.longest_streak);
     *
     * const { data, error } = await supabase
     *   .from("user_streaks")
     *   .update({ current_streak: newStreak, longest_streak: newLongest, last_log_date: today, updated_at: new Date().toISOString() })
     *   .eq("user_id", user.id)
     *   .select().single();
     *
     * if (error) throw error;
     * return NextResponse.json({ data, error: null });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[PATCH /api/streak]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
