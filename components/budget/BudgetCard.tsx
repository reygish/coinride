/**
 * components/budget/BudgetCard.tsx
 * Card yang menampilkan status budget satu kategori dengan progress bar.
 * Visual yang gamified: warna berubah sesuai persentase terpakai.
 */

"use client";

import { getCategoryById } from "@/lib/utils/categories";
import { formatCurrency } from "@/lib/utils/formatters";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils/formatters";
import type { BudgetWithSpending } from "@/types";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface BudgetCardProps {
  budget: BudgetWithSpending;
  onEdit?: (budget: BudgetWithSpending) => void;
}

export function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const category = getCategoryById(budget.category_id);

  const statusConfig = {
    safe: {
      color: "green" as const,
      icon: <CheckCircle2 size={14} className="text-emerald-400" />,
      textColor: "text-emerald-400",
      message: "On track",
    },
    warning: {
      color: "amber" as const,
      icon: <AlertTriangle size={14} className="text-amber-400" />,
      textColor: "text-amber-400",
      message: "Getting close",
    },
    exceeded: {
      color: "red" as const,
      icon: <XCircle size={14} className="text-red-400" />,
      textColor: "text-red-400",
      message: "Over budget!",
    },
  };

  const { color, icon, textColor, message } = statusConfig[budget.status];

  return (
    <div
      className={cn(
        "group rounded-xl border p-4 transition-all duration-200 cursor-pointer hover:border-white/15",
        budget.status === "exceeded"
          ? "border-red-500/20 bg-red-500/5 hover:bg-red-500/10"
          : "border-white/8 bg-[#161E33]/60 hover:bg-[#161E33]"
      )}
      onClick={() => onEdit?.(budget)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onEdit?.(budget)}
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{category.icon}</span>
          <span className="text-sm font-semibold text-slate-200">
            {category.label}
          </span>
        </div>
        <div className={cn("flex items-center gap-1 text-xs font-medium", textColor)}>
          {icon}
          {message}
        </div>
      </div>

      {/* Progress bar — gunakan warna kategori agar konsisten dengan chart */}
      <ProgressBar
        value={budget.percentage}
        max={100}
        hexColor={budget.status === "exceeded" ? "#EF4444" : category.color}
        size="md"
        showLabel
      />

      {/* Amount details */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
        <span>
          <span className="font-medium text-slate-300">
            {formatCurrency(budget.spent)}
          </span>{" "}
          used
        </span>
        <span>
          {budget.status === "exceeded" ? (
            <span className="font-medium text-red-400">
              {formatCurrency(budget.spent - budget.amount)} over
            </span>
          ) : (
            <>
              <span className="font-medium text-slate-300">
                {formatCurrency(budget.remaining)}
              </span>{" "}
              left
            </>
          )}
        </span>
        <span>of {formatCurrency(budget.amount)}</span>
      </div>
    </div>
  );
}
