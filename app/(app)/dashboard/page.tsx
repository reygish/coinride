"use client";

import { SpendingChart } from "@/components/charts/SpendingChart";
import { WeeklySpendingChart } from "@/components/charts/WeeklySpendingChart";
import { MonthlySpendingChart } from "@/components/charts/MonthlySpendingChart";

export default function Page() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Track spending patterns and weekly momentum at a glance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Spending by category</h2>
          <SpendingChart />
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Weekly spending</h2>
          <WeeklySpendingChart />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground">Monthly spending</h2>
        <MonthlySpendingChart />
      </div>
    </div>
  );
}
