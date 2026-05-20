/**
 * app/api/reminders/route.ts
 * API untuk Smart Reminder — pengingat otomatis via email.
 *
 * Sistem reminder berjalan sebagai berikut:
 * 1. User set konfigurasi reminder di halaman Settings
 * 2. Konfigurasi disimpan di tabel `reminders`
 * 3. Supabase Edge Function (cron) berjalan setiap jam
 * 4. Edge Function membaca semua reminder aktif dan mengirim email
 *    ke user yang jadwalnya cocok dengan waktu sekarang
 *
 * Endpoint:
 *   GET    /api/reminders  — Ambil konfigurasi reminder user
 *   POST   /api/reminders  — Buat atau update reminder
 *   DELETE /api/reminders  — Nonaktifkan/hapus reminder
 *
 * TODO (Backend):
 * - Setup Supabase Edge Function di /supabase/functions/send-reminders/
 * - Setup cron di Supabase Dashboard: setiap jam (0 * * * *)
 * - Gunakan Resend atau SendGrid untuk kirim email
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Reminder, CreateReminderInput } from "@/types";

// ─── GET /api/reminders ───────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse<ApiResponse<Reminder | null>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    /**
     * TODO (Backend):
     * const { data, error } = await supabase
     *   .from("reminders")
     *   .select()
     *   .eq("user_id", user.id)
     *   .single();
     *
     * // data null = user belum set reminder, bukan error
     * if (error && error.code !== "PGRST116") throw error;
     * return NextResponse.json({ data: data ?? null, error: null });
     */

    return NextResponse.json({ data: null, error: null });
  } catch (error) {
    console.error("[GET /api/reminders]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/reminders ──────────────────────────────────────────────────────
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Reminder>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as CreateReminderInput;

    // Validasi
    if (!body.email || !body.frequency) {
      return NextResponse.json(
        { data: null, error: "Email and frequency are required" },
        { status: 400 }
      );
    }
    if (body.frequency === "daily" && !body.time) {
      return NextResponse.json(
        { data: null, error: "Time is required for daily reminders" },
        { status: 400 }
      );
    }

    /**
     * TODO (Backend): Upsert reminder (buat jika belum ada, update jika sudah ada)
     *
     * const { data, error } = await supabase
     *   .from("reminders")
     *   .upsert({
     *     user_id: user.id,
     *     email: body.email,
     *     frequency: body.frequency,
     *     time: body.time ?? null,
     *     is_active: body.is_active ?? true,
     *     updated_at: new Date().toISOString(),
     *   }, { onConflict: "user_id" })
     *   .select()
     *   .single();
     *
     * if (error) throw error;
     * return NextResponse.json({ data, error: null });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[POST /api/reminders]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
