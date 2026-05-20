/**
 * app/api/auth/callback/route.ts
 * Supabase Auth callback handler untuk OAuth dan email verification.
 *
 * Supabase mengarahkan user ke URL ini setelah:
 * - Login dengan OAuth (Google, GitHub, dll.)
 * - Klik link verifikasi email
 * - Klik link reset password
 *
 * URL ini harus didaftarkan di Supabase Dashboard:
 *   Authentication → URL Configuration → Redirect URLs
 *   Tambahkan: http://localhost:3000/api/auth/callback (dev)
 *              https://yourdomain.com/api/auth/callback (production)
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard"; // Redirect tujuan setelah login

  if (code) {
    const supabase = await createClient();

    // Exchange authorization code menjadi session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Berhasil — redirect ke halaman tujuan
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Gagal — redirect ke halaman error atau login dengan pesan error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
