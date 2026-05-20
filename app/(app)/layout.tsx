/**
 * app/(app)/layout.tsx
 * Layout utama untuk semua halaman dalam app (setelah login).
 * Berisi sidebar, header, dan area konten utama.
 *
 * Di sini juga tempat inisialisasi mock data (untuk development).
 * TODO (Backend): Ganti initializeMockData() dengan fetch dari Supabase.
 */

"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAppStore } from "@/store/useAppStore";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { initializeMockData } = useAppStore();

  // Load mock data saat app pertama kali dibuka (untuk development)
  useEffect(() => {
    initializeMockData();
  }, [initializeMockData]);

  return (
    <div className="gradient-mesh flex h-full min-h-screen">
      {/* Sidebar — fixed di sebelah kiri */}
      <Sidebar />

      {/* Main content area — offset ke kanan sejauh lebar sidebar di desktop */}
      <div className="flex flex-1 flex-col lg:ml-64">
        {/* Header — sticky di atas */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="mx-auto max-w-6xl animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
