/**
 * app/(app)/budget/page.tsx
 * Halaman pengelolaan budget per kategori.
 *
 * Features:
 * - Lihat semua budget bulan ini dengan progress
 * - Tambah budget baru untuk kategori yang belum ada
 * - Edit/update budget yang sudah ada
 * - Gamifikasi: badge jika semua kategori dalam budget
 */

"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { BudgetCard } from "@/components/budget/BudgetCard";
import { BudgetForm } from "@/components/budget/BudgetForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency, formatMonthYear } from "@/lib/utils/formatters";
import { Plus, Trophy, Target } from "lucide-react";
import type { BudgetWithSpending } from "@/types";

export default function BudgetPage() {
  const { budgets } = useAppStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);

  // Statistik ringkasan
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const onTrackCount = budgets.filter((b) => b.status !== "exceeded").length;
  const exceededCount = budgets.filter((b) => b.status === "exceeded").length;
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleEditBudget = (budget: BudgetWithSpending) => {
    setEditingBudget(budget);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-100">
            Budget
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {formatMonthYear()} · Set and track your spending limits
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} />
          <span className="hidden sm:inline">New Budget</span>
        </Button>
      </div>

      {/* Overall budget summary */}
      <Card glow={exceededCount === 0 ? "green" : "none"}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">
              Overall Monthly Budget
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-3xl font-black text-slate-100 tabular-nums">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-slate-500">/ {formatCurrency(totalBudgeted)}</span>
            </div>
          </div>

          {/* Achievement badge jika semua on-track */}
          {exceededCount === 0 && budgets.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <Trophy size={20} className="text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-emerald-300">
                  Budget Champion!
                </p>
                <p className="text-xs text-emerald-400/70">
                  All categories on track 🎯
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <ProgressBar
            value={overallPercentage}
            max={100}
            color={overallPercentage > 100 ? "red" : overallPercentage > 75 ? "amber" : "green"}
            size="lg"
            showLabel
          />
          <div className="mt-2 flex justify-between text-xs text-slate-500">
            <span>{onTrackCount} categories on track</span>
            {exceededCount > 0 && (
              <span className="text-red-400">
                {exceededCount} exceeded!
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Tips jika ada yang exceeded */}
      {exceededCount > 0 && (
        <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-300">
              {exceededCount} budget{exceededCount > 1 ? "s" : ""} exceeded!
            </p>
            <p className="mt-0.5 text-xs text-amber-400/80">
              Don&apos;t worry — track where the extra went and adjust next month.
              You&apos;re still doing great by noticing! 💪
            </p>
          </div>
        </div>
      )}

      {/* Budget cards grid */}
      {budgets.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
            />
          ))}
        </div>
      ) : (
        // Empty state
        <Card className="flex flex-col items-center py-16 text-center">
          <Target size={48} className="mb-4 text-slate-600" />
          <p className="text-base font-semibold text-slate-400">
            No budgets set yet
          </p>
          <p className="mt-1 mb-6 text-sm text-slate-600">
            Set spending limits per category to stay on track
          </p>
          <Button variant="primary" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} />
            Set Your First Budget
          </Button>
        </Card>
      )}

      {/* Add Budget Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Set Budget"
        size="sm"
      >
        <BudgetForm onSuccess={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title="Edit Budget"
        size="sm"
      >
        {editingBudget && (
          <BudgetForm
            existingBudget={editingBudget}
            onSuccess={() => setEditingBudget(null)}
          />
        )}
      </Modal>
    </div>
  );
}
