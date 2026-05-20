/**
 * app/layout.tsx
 * Root layout yang membungkus seluruh aplikasi.
 * Di sini kita setup font, metadata, dan global providers.
 */

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Spendly — AI Money Manager",
    template: "%s | Spendly",
  },
  description:
    "Track your finances smarter with AI-powered auto-categorization. Built for students and young adults who want to save more.",
  keywords: ["money", "finance", "budget", "tracker", "AI", "spending", "savings"],
  authors: [{ name: "Spendly Team" }],
};

export const viewport: Viewport = {
  themeColor: "#090B18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        {children}

        {/* Toast notifications — tampil di pojok kanan atas */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1D2640",
              color: "#F8FAFC",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Nunito, sans-serif",
              fontWeight: "600",
            },
            success: {
              iconTheme: { primary: "#10B981", secondary: "#1D2640" },
            },
            error: {
              iconTheme: { primary: "#EF4444", secondary: "#1D2640" },
            },
          }}
        />
      </body>
    </html>
  );
}
