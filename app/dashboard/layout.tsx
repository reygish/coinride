import type { ReactNode } from "react";
import Sidebar from "@/components/app/sidebar";
import Topbar from "@/components/app/topbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Topbar
        // Tweak: Replace these placeholders with real user/balance data.
        username="Guest"
        availableBalance={0}
        notificationCount={0}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Tweak: Remove `hidden md:block` if you want sidebar on mobile */}
        <Sidebar className="hidden md:block" />

        <main className="min-w-0 flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
