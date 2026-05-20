/**
 * app/api/categories/route.ts
 * API untuk daftar kategori.
 * Kategori bersifat static (tidak perlu database), jadi cukup return dari config.
 */

import { NextResponse } from "next/server";
import { CATEGORIES } from "@/lib/utils/categories";
import type { ApiResponse, Category } from "@/types";

// ─── GET /api/categories ──────────────────────────────────────────────────────
export async function GET(): Promise<NextResponse<ApiResponse<Category[]>>> {
  return NextResponse.json({ data: CATEGORIES, error: null });
}
