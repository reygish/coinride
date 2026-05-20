/**
 * app/api/transactions/[id]/route.ts
 * Endpoint untuk operasi pada satu transaksi spesifik.
 *
 * Endpoint:
 *   GET    /api/transactions/:id   — Ambil detail transaksi
 *   PATCH  /api/transactions/:id   — Update transaksi (e.g., koreksi kategori)
 *   DELETE /api/transactions/:id   — Hapus transaksi
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse, Transaction } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

// ─── GET /api/transactions/:id ────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    /**
     * TODO (Backend):
     * const { data, error } = await supabase
     *   .from("transactions")
     *   .select()
     *   .eq("id", id)
     *   .eq("user_id", user.id) // Security: pastikan transaksi milik user ini
     *   .single();
     *
     * if (!data) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
     * if (error) throw error;
     * return NextResponse.json({ data, error: null });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[GET /api/transactions/:id]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/transactions/:id ─────────────────────────────────────────────
/**
 * Update sebagian field transaksi.
 * Digunakan untuk koreksi kategori AI atau update nominal.
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<Transaction>>> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const updates = await request.json();

    // Whitelist field yang boleh diupdate (keamanan)
    const allowedFields = ["description", "amount", "category_id", "ai_classified", "date", "note"] as const;
    const safeUpdates = Object.fromEntries(
      Object.entries(updates).filter(([key]) => allowedFields.includes(key as typeof allowedFields[number]))
    );

    /**
     * TODO (Backend):
     * const { data, error } = await supabase
     *   .from("transactions")
     *   .update(safeUpdates)
     *   .eq("id", id)
     *   .eq("user_id", user.id) // Security: user hanya bisa update transaksi miliknya
     *   .select()
     *   .single();
     *
     * if (!data) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
     * if (error) throw error;
     * return NextResponse.json({ data, error: null });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[PATCH /api/transactions/:id]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/transactions/:id ─────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    /**
     * TODO (Backend):
     * const { error } = await supabase
     *   .from("transactions")
     *   .delete()
     *   .eq("id", id)
     *   .eq("user_id", user.id); // Security: pastikan milik user ini
     *
     * if (error) throw error;
     * return NextResponse.json({ data: null, error: null }, { status: 200 });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[DELETE /api/transactions/:id]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
