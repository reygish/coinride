/**
 * lib/supabase/server.ts
 * Supabase client untuk digunakan di Server Components dan API Routes.
 *
 * Di Next.js App Router, Server Components berjalan di server dan tidak bisa
 * mengakses browser APIs. Karena itu kita perlu client yang berbeda.
 * Client ini membaca/menulis cookies untuk mengelola auth session.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";

/**
 * Buat Supabase client untuk Server Components dan API Routes.
 * Fungsi ini harus di-await karena cookies() mengembalikan Promise di Next.js 15+.
 *
 * @example
 * // Di Server Component:
 * const supabase = await createClient();
 * const { data: { user } } = await supabase.auth.getUser();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Baca semua cookies dari request
        getAll() {
          return cookieStore.getAll();
        },
        // Tulis cookies ke response (untuk update session)
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll dipanggil dari Server Component — tidak masalah jika gagal
            // karena middleware sudah menangani refresh session
          }
        },
      },
    }
  );
}
