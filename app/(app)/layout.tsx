import type { ReactNode } from "react";
import Topbar from "./_components/Topbar";
import Sidebar from "./_components/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <Topbar/>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar/>

        <main className="min-w-0 flex-1 min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
