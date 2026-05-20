/**
 * app/api/budget/route.ts
 * API endpoints untuk pengelolaan budget per kategori.
 *
 * Endpoint:
 *   GET  /api/budget  — Ambil semua budget user bulan ini (dengan spending aktual)
 *   POST /api/budget  — Buat budget baru
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, BudgetWithSpending, CreateBudgetInput } from "@/types";

// ─── GET /api/budget ──────────────────────────────────────────────────────────
/**
 * Mengambil semua budget user untuk bulan/tahun tertentu,
 * digabung dengan total pengeluaran aktual dari tabel transactions.
 *
 * Query params:
 *   - month: 1-12 (default: bulan ini)
 *   - year: tahun (default: tahun ini)
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BudgetWithSpending[]>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const month = parseInt(request.nextUrl.searchParams.get("month") ?? String(now.getMonth() + 1));
    const year = parseInt(request.nextUrl.searchParams.get("year") ?? String(now.getFullYear()));

    /**
     * TODO (Backend): Implementasi query berikut
     *
     * // 1. Ambil semua budget untuk bulan ini
     * const { data: budgets, error: budgetError } = await supabase
     *   .from("budgets")
     *   .select()
     *   .eq("user_id", user.id)
     *   .eq("month", month)
     *   .eq("year", year);
     *
     * if (budgetError) throw budgetError;
     *
     * // 2. Untuk setiap budget, ambil total pengeluaran dari transactions
     * const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
     * const endDate = new Date(year, month, 0).toISOString().split("T")[0];
     *
     * const budgetsWithSpending: BudgetWithSpending[] = await Promise.all(
     *   (budgets ?? []).map(async (budget) => {
     *     const { data: transactions } = await supabase
     *       .from("transactions")
     *       .select("amount")
     *       .eq("user_id", user.id)
     *       .eq("category_id", budget.category_id)
     *       .eq("type", "expense")
     *       .gte("date", startDate)
     *       .lte("date", endDate);
     *
     *     const spent = transactions?.reduce((sum, t) => sum + t.amount, 0) ?? 0;
     *     const remaining = budget.amount - spent;
     *     const percentage = (spent / budget.amount) * 100;
     *     const status = percentage > 100 ? "exceeded" : percentage > 75 ? "warning" : "safe";
     *
     *     return { ...budget, spent, remaining, percentage, status };
     *   })
     * );
     *
     * return NextResponse.json({ data: budgetsWithSpending, error: null });
     */

    return NextResponse.json({ data: [], error: null });
  } catch (error) {
    console.error("[GET /api/budget]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/budget ─────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<BudgetWithSpending>>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as CreateBudgetInput;

    // Validasi
    if (!body.category_id) {
      return NextResponse.json({ data: null, error: "Category is required" }, { status: 400 });
    }
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ data: null, error: "Amount must be positive" }, { status: 400 });
    }

    /**
     * TODO (Backend):
     * // Cek apakah budget untuk kategori ini sudah ada di bulan yang sama
     * const { data: existing } = await supabase
     *   .from("budgets")
     *   .select("id")
     *   .eq("user_id", user.id)
     *   .eq("category_id", body.category_id)
     *   .eq("month", body.month)
     *   .eq("year", body.year)
     *   .single();
     *
     * if (existing) {
     *   return NextResponse.json({ data: null, error: "Budget already exists for this category" }, { status: 409 });
     * }
     *
     * const { data, error } = await supabase
     *   .from("budgets")
     *   .insert({ user_id: user.id, ...body })
     *   .select()
     *   .single();
     *
     * if (error) throw error;
     * // Return dengan spending = 0 (budget baru)
     * return NextResponse.json({
     *   data: { ...data, spent: 0, remaining: data.amount, percentage: 0, status: "safe" },
     *   error: null
     * }, { status: 201 });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[POST /api/budget]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
