/**
 * app/(app)/dashboard/page.tsx
 * Halaman utama dashboard — overview semua data finansial user.
 *
 * Layout:
 * - Row 1: Summary cards (Total Income, Total Expense, Net Balance, Transactions)
 * - Row 2: Spending donut chart | Budget progress
 * - Row 3: Monthly trend chart | Streak + Recent transactions
 */

"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SpendingChart } from "@/components/charts/SpendingChart";
import { MonthlyChart } from "@/components/charts/MonthlyChart";
import { BudgetCard } from "@/components/budget/BudgetCard";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { TransactionCard } from "@/components/transactions/TransactionCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatCompactCurrency, formatMonthYear } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown, Wallet, ArrowLeftRight, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/formatters";

export default function DashboardPage() {
  const { summary, transactions, budgets, categorySpending } = useAppStore();

  // Hitung persentase perubahan (contoh statis untuk UI — backend bisa isi data real)
  const savingsRate = summary
    ? Math.round(((summary.total_income - summary.total_expense) / summary.total_income) * 100)
    : 0;

  // 5 transaksi terbaru
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-100">
            Hey there! 👋
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatMonthYear()} · Here&apos;s your financial snapshot
          </p>
        </div>
        <Link href="/transactions">
          <Button variant="primary" size="md">
            <Plus size={16} />
            <span className="hidden sm:inline">Add Transaction</span>
          </Button>
        </Link>
      </div>

      {/* ─── Summary cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Income */}
        <Card glow="green" className="col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Income
              </p>
              <p className="font-display mt-2 text-2xl font-black text-emerald-400 tabular-nums">
                {formatCompactCurrency(summary?.total_income ?? 0)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15">
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {formatCurrency(summary?.total_income ?? 0)}
          </p>
        </Card>

        {/* Total Expense */}
        <Card glow="amber" className="col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Expense
              </p>
              <p className="font-display mt-2 text-2xl font-black text-amber-400 tabular-nums">
                {formatCompactCurrency(summary?.total_expense ?? 0)}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
              <TrendingDown size={18} className="text-amber-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {formatCurrency(summary?.total_expense ?? 0)}
          </p>
        </Card>

        {/* Net Balance */}
        <Card
          glow={summary && summary.net_balance >= 0 ? "green" : "none"}
          className="col-span-1"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Balance
              </p>
              <p
                className={cn(
                  "font-display mt-2 text-2xl font-black tabular-nums",
                  summary && summary.net_balance >= 0
                    ? "text-emerald-400"
                    : "text-red-400"
                )}
              >
                {formatCompactCurrency(Math.abs(summary?.net_balance ?? 0))}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15">
              <Wallet size={18} className="text-blue-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {savingsRate}% savings rate
          </p>
        </Card>

        {/* Transaction count */}
        <Card className="col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                Transactions
              </p>
              <p className="font-display mt-2 text-2xl font-black text-slate-200 tabular-nums">
                {summary?.transaction_count ?? 0}
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15">
              <ArrowLeftRight size={18} className="text-violet-400" />
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500">This month</p>
        </Card>
      </div>

      {/* ─── Charts row ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Spending by category donut chart */}
        <Card className="lg:col-span-3" glow="purple">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <span className="text-xs text-slate-500">{formatMonthYear()}</span>
          </CardHeader>
          <CardContent>
            <SpendingChart />
          </CardContent>
        </Card>

        {/* Budget overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Budget Status</CardTitle>
            <Link
              href="/budget"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Manage →
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgets.slice(0, 4).map((budget) => (
                <BudgetCard key={budget.id} budget={budget} />
              ))}
              {budgets.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">
                  No budgets set yet.{" "}
                  <Link href="/budget" className="text-emerald-400 hover:underline">
                    Set one!
                  </Link>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Bottom row ─────────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Monthly trend bar chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>6-Month Trend</CardTitle>
            <span className="text-xs text-slate-500">Income vs Expense</span>
          </CardHeader>
          <CardContent>
            <MonthlyChart />
          </CardContent>
        </Card>

        {/* Right column: Streak + Recent transactions */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Streak display */}
          <StreakDisplay />

          {/* Recent transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent</CardTitle>
              <Link
                href="/transactions"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                See all →
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentTransactions.map((t) => (
                  <TransactionCard key={t.id} transaction={t} />
                ))}
                {recentTransactions.length === 0 && (
                  <p className="py-4 text-center text-sm text-slate-500">
                    No transactions yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
