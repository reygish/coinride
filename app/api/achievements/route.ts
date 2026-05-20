/**
 * app/api/achievements/route.ts
 * API untuk sistem achievement gamifikasi.
 *
 * Endpoint:
 *   GET  /api/achievements  — Ambil achievements user yang sudah di-unlock
 *   POST /api/achievements  — Unlock achievement baru (dipanggil dari backend logic)
 *
 * Logic unlock achievement:
 * - Dipanggil setiap kali user berhasil POST /api/transactions
 * - Cek kondisi setiap achievement dan unlock jika belum
 * - Achievement yang sudah di-unlock tidak bisa di-unlock lagi (idempotent)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, UserAchievement, AchievementId } from "@/types";

// ─── GET /api/achievements ────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse<ApiResponse<UserAchievement[]>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    /**
     * TODO (Backend):
     * const { data, error } = await supabase
     *   .from("user_achievements")
     *   .select()
     *   .eq("user_id", user.id)
     *   .order("unlocked_at", { ascending: false });
     *
     * if (error) throw error;
     * return NextResponse.json({ data: data ?? [], error: null });
     */

    return NextResponse.json({ data: [], error: null });
  } catch (error) {
    console.error("[GET /api/achievements]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/achievements ───────────────────────────────────────────────────
/**
 * Internal endpoint — dipanggil oleh backend logic setelah transaksi dibuat.
 * Cek dan unlock achievement berdasarkan kondisi.
 *
 * Logika pengecekan achievement per ID:
 *
 * "first_transaction" → user_id punya >= 1 transaksi
 * "streak_7" → current_streak >= 7
 * "streak_30" → current_streak >= 30
 * "first_saver" → bulan lalu: total income > total expense
 * "budget_master" → bulan ini: semua budget tidak exceeded
 * "frugal_foodie" → minggu ini: food spending < food budget
 * "logger_30" → longest_streak >= 30
 * "ai_trainer" → jumlah transaksi di mana ai_classified=true lalu diubah manual >= 10
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserAchievement[]>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    /**
     * TODO (Backend): Implementasi logika unlock achievement
     *
     * const newlyUnlocked: UserAchievement[] = [];
     *
     * // Cek setiap achievement dan unlock jika belum
     * const achievementsToCheck: AchievementId[] = [
     *   "first_transaction", "streak_7", "streak_30",
     *   "first_saver", "budget_master", "frugal_foodie", "logger_30", "ai_trainer"
     * ];
     *
     * for (const achievementId of achievementsToCheck) {
     *   const shouldUnlock = await checkAchievementCondition(supabase, user.id, achievementId);
     *   if (shouldUnlock) {
     *     const { data } = await supabase
     *       .from("user_achievements")
     *       .upsert({ user_id: user.id, achievement_id: achievementId }, { onConflict: "user_id,achievement_id", ignoreDuplicates: true })
     *       .select()
     *       .single();
     *     if (data) newlyUnlocked.push(data);
     *   }
     * }
     *
     * return NextResponse.json({ data: newlyUnlocked, error: null });
     */

    return NextResponse.json({ data: [], error: null });
  } catch (error) {
    console.error("[POST /api/achievements]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
