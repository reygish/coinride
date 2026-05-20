/**
 * app/page.tsx
 * Halaman root — redirect user ke dashboard jika sudah login,
 * atau ke halaman login jika belum.
 *
 * TODO (Backend): Implementasi pengecekan session Supabase sebelum redirect.
 * Contoh implementasi setelah backend siap:
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   if (!user) redirect("/login");
 *   redirect("/dashboard");
 */

import { redirect } from "next/navigation";

export default function Home() {
  // Untuk development: langsung redirect ke dashboard (skip auth sementara)
  redirect("/dashboard");
}
