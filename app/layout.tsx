import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { getAuthedServerClient } from "@/lib/auth/auth";
import { UserProvider } from "./_components/providers/UserProvider";
import { CategoryProvider } from "./_components/providers/CategoryProvider";
import "./global.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "CoinRide",
  description:
    "CoinRide - Money Management App with AI Integrated Topic Categorization",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user } = await getAuthedServerClient();
  return (
    <UserProvider user={user}>
      <CategoryProvider>{children}</CategoryProvider>
    </UserProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense>
            <AuthWrapper>{children}</AuthWrapper>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
