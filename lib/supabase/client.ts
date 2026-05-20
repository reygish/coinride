/**
 * lib/supabase/client.ts
 * Supabase client untuk digunakan di komponen Client-side (browser).
 *
 * Menggunakan @supabase/ssr untuk SSR compatibility dengan Next.js App Router.
 * Client ini hanya dibuat SEKALI per browser session (singleton pattern)
 * untuk menghindari multiple connections yang tidak perlu (Efficient).
 */

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

/**
 * Buat Supabase client untuk komponen yang berjalan di browser.
 * Gunakan fungsi ini di Client Components ("use client").
 *
 * Environment variables HARUS diset di .env.local:
 * - NEXT_PUBLIC_SUPABASE_URL: URL project Supabase kamu
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Anon/public key dari Supabase
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
