/**
 * app/(auth)/layout.tsx
 * Layout untuk halaman autentikasi (login, register).
 * Tidak ada sidebar — layout yang clean dan terfokus.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gradient-mesh flex min-h-screen items-center justify-center px-4 py-12">
      {/* Decorative background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-2xl">
            ⚡
          </div>
          <h1 className="font-display text-3xl font-bold text-white">Spendly</h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-powered money management for the next gen
          </p>
        </div>

        {/* Auth card */}
        <div className="rounded-2xl border border-white/10 bg-[#0F1628]/80 p-5 sm:p-8 shadow-2xl backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
