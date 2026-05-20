/**
 * app/api/budget/[id]/route.ts
 * Endpoint untuk operasi pada satu budget spesifik.
 *
 * Endpoint:
 *   PATCH  /api/budget/:id  — Update nominal budget
 *   DELETE /api/budget/:id  — Hapus budget
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ApiResponse } from "@/types";

type RouteParams = { params: Promise<{ id: string }> };

// ─── PATCH /api/budget/:id ─────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ data: null, error: "Amount must be positive" }, { status: 400 });
    }

    /**
     * TODO (Backend):
     * const { error } = await supabase
     *   .from("budgets")
     *   .update({ amount, updated_at: new Date().toISOString() })
     *   .eq("id", id)
     *   .eq("user_id", user.id);
     *
     * if (error) throw error;
     * return NextResponse.json({ data: null, error: null });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[PATCH /api/budget/:id]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/budget/:id ────────────────────────────────────────────────────
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
     *   .from("budgets")
     *   .delete()
     *   .eq("id", id)
     *   .eq("user_id", user.id);
     *
     * if (error) throw error;
     * return NextResponse.json({ data: null, error: null });
     */

    return NextResponse.json({ data: null, error: "Not implemented" }, { status: 501 });
  } catch (error) {
    console.error("[DELETE /api/budget/:id]", error);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
