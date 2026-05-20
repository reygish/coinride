/**
 * app/api/transactions/route.ts
 * API endpoints untuk CRUD transaksi.
 *
 * UNTUK BACKEND TEAM — implementasikan fungsi di dalam setiap handler.
 * Semua endpoint sudah dilengkapi dengan:
 * - Auth check menggunakan Supabase
 * - Request validation
 * - Type-safe response
 * - Error handling
 *
 * Endpoint yang tersedia:
 *   GET    /api/transactions  — Ambil semua transaksi user (dengan pagination & filter)
 *   POST   /api/transactions  — Buat transaksi baru
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, PaginatedResponse, Transaction, CreateTransactionInput } from "@/types";

// ─── GET /api/transactions ────────────────────────────────────────────────────
/**
 * Mengambil daftar transaksi user yang sedang login.
 *
 * Query params yang didukung:
 *   - page: nomor halaman (default: 1)
 *   - per_page: jumlah item per halaman (default: 20, max: 100)
 *   - type: filter berdasarkan tipe ("income" | "expense")
 *   - category: filter berdasarkan category_id
 *   - month: filter bulan (1-12)
 *   - year: filter tahun
 *   - search: search di kolom description
 */
export async function GET(request: NextRequest): Promise<NextResponse<PaginatedResponse<Transaction>>> {
  try {
    // 1. Autentikasi: cek apakah user sudah login
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { data: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 0 }, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") ?? "20")));
    const type = searchParams.get("type") as "income" | "expense" | null;
    const category = searchParams.get("category");
    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : null;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : null;
    const search = searchParams.get("search");

    // 3. TODO: Query ke Supabase
    /**
     * let query = supabase
     *   .from("transactions")
     *   .select("*", { count: "exact" })
     *   .eq("user_id", user.id)
     *   .order("date", { ascending: false })
     *   .order("created_at", { ascending: false })
     *   .range((page - 1) * perPage, page * perPage - 1);
     *
     * if (type) query = query.eq("type", type);
     * if (category) query = query.eq("category_id", category);
     * if (search) query = query.ilike("description", `%${search}%`);
     * if (month && year) {
     *   const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
     *   const endDate = new Date(year, month, 0).toISOString().split("T")[0];
     *   query = query.gte("date", startDate).lte("date", endDate);
     * }
     *
     * const { data, count, error } = await query;
     * if (error) throw error;
     *
     * return NextResponse.json({
     *   data: data ?? [],
     *   meta: {
     *     page,
     *     per_page: perPage,
     *     total: count ?? 0,
     *     total_pages: Math.ceil((count ?? 0) / perPage),
     *   },
     *   error: null,
     * });
     */

    // Placeholder response — ganti dengan query Supabase di atas
    return NextResponse.json({
      data: [],
      meta: { page, per_page: perPage, total: 0, total_pages: 0 },
      error: null,
    });
  } catch (error) {
    console.error("[GET /api/transactions]", error);
    return NextResponse.json(
      { data: [], meta: { page: 1, per_page: 20, total: 0, total_pages: 0 }, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST /api/transactions ───────────────────────────────────────────────────
/**
 * Membuat transaksi baru.
 *
 * Request body (JSON):
 * {
 *   description: string,
 *   amount: number,
 *   type: "expense" | "income",
 *   category_id: string,
 *   ai_classified: boolean,
 *   ai_confidence: number | null,
 *   date: string,          // ISO date "YYYY-MM-DD"
 *   note: string | null
 * }
 *
 * Setelah berhasil:
 * - Update streak harian user
 * - Cek apakah ada achievement baru yang harus di-unlock
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    // 1. Autentikasi
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse dan validasi request body
    const body = await request.json() as CreateTransactionInput;

    // Validasi field wajib
    if (!body.description?.trim()) {
      return NextResponse.json(
        { data: null, error: "Description is required" },
        { status: 400 }
      );
    }
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { data: null, error: "Amount must be a positive number" },
        { status: 400 }
      );
    }
    if (!["income", "expense"].includes(body.type)) {
      return NextResponse.json(
        { data: null, error: "Invalid transaction type" },
        { status: 400 }
      );
    }

    // 3. TODO: Insert ke Supabase
    /**
     * const { data, error } = await supabase
     *   .from("transactions")
     *   .insert({
     *     user_id: user.id,
     *     description: body.description.trim(),
     *     amount: Math.round(body.amount), // Bulatkan ke integer IDR
     *     type: body.type,
     *     category_id: body.category_id,
     *     ai_classified: body.ai_classified ?? false,
     *     ai_confidence: body.ai_confidence ?? null,
     *     date: body.date,
     *     note: body.note?.trim() ?? null,
     *   })
     *   .select()
     *   .single();
     *
     * if (error) throw error;
     *
     * // 4. Update streak (panggil helper function)
     * await updateUserStreak(supabase, user.id);
     *
     * // 5. Check & unlock achievements
     * await checkAndUnlockAchievements(supabase, user.id);
     *
     * return NextResponse.json({ data, error: null }, { status: 201 });
     */

    // Placeholder
    return NextResponse.json({ data: null, error: "Not implemented — backend team please implement" }, { status: 501 });
  } catch (error) {
    console.error("[POST /api/transactions]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
