/**
 * app/api/ai/classify/route.ts
 * Server-side endpoint untuk AI classification.
 *
 * Kenapa harus lewat server route (bukan panggil langsung dari browser)?
 * → HUGGINGFACE_API_TOKEN adalah server-only env var (tanpa NEXT_PUBLIC_).
 *   Di browser nilainya undefined, sehingga API call selalu gagal 401.
 *   Dengan route ini, token aman di server dan tidak terekspos ke client.
 *
 * Tidak memerlukan auth — boleh dipanggil tanpa login (untuk dev dan UX yang cepat).
 */

import { NextRequest, NextResponse } from "next/server";
import { classifyTransaction } from "@/lib/ai/classifier";
import type { ApiResponse, AIClassificationResult } from "@/types";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<AIClassificationResult>>> {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length < 2) {
      return NextResponse.json(
        { data: null, error: "Text must be at least 2 characters" },
        { status: 400 }
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { data: null, error: "Text too long (max 500 characters)" },
        { status: 400 }
      );
    }

    // classifyTransaction otomatis fallback ke keyword matching
    // jika HUGGINGFACE_API_TOKEN tidak dikonfigurasi
    const result = await classifyTransaction(text.trim());

    return NextResponse.json({ data: result, error: null });
  } catch (error) {
    console.error("[POST /api/ai/classify]", error);
    return NextResponse.json(
      { data: null, error: "Classification failed" },
      { status: 500 }
    );
  }
}
