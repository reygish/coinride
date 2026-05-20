/**
 * proxy.ts
 * Next.js 16 Proxy untuk mengelola Supabase Auth session.
 *
 * Saat Supabase belum dikonfigurasi (env vars kosong), proxy langsung
 * pass-through request tanpa auth check — cocok untuk development frontend.
 *
 * TODO (Backend): Uncomment route protection setelah Supabase dikonfigurasi.
 * Docs: https://nextjs.org/docs/messages/middleware-to-proxy
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  // Jika Supabase belum dikonfigurasi (development tanpa backend),
  // langsung lanjutkan request tanpa auth check
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next({ request });
  }

  // ── Kode di bawah aktif setelah Supabase dikonfigurasi ──────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session jika expired — jangan hapus baris ini
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  /**
   * TODO (Backend): Uncomment setelah auth Supabase siap
   *
   * const protectedRoutes = ["/dashboard", "/transactions", "/budget", "/achievements", "/settings"];
   * const authRoutes = ["/login", "/register"];
   *
   * if (protectedRoutes.some((r) => pathname.startsWith(r)) && !user) {
   *   return NextResponse.redirect(new URL("/login", request.url));
   * }
   * if (authRoutes.some((r) => pathname.startsWith(r)) && user) {
   *   return NextResponse.redirect(new URL("/dashboard", request.url));
   * }
   */

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
