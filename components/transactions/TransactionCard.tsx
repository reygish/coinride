/**
 * components/transactions/TransactionCard.tsx
 * Card untuk menampilkan satu item transaksi dalam daftar.
 * Mendukung inline category editing (koreksi AI).
 */

"use client";

import { useState } from "react";
import { getCategoryById, CATEGORIES } from "@/lib/utils/categories";
import { formatCurrency, formatTransactionDate } from "@/lib/utils/formatters";
import { useTransactions } from "@/hooks/useTransactions";
import { cn } from "@/lib/utils/formatters";
import { Sparkles, ChevronDown, Trash2 } from "lucide-react";
import type { Transaction, CategoryId } from "@/types";

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const { correctCategory, removeTransaction } = useTransactions();
  const category = getCategoryById(transaction.category_id);

  const handleCategoryChange = async (newCategoryId: string) => {
    setIsEditingCategory(false);
    if (newCategoryId !== transaction.category_id) {
      await correctCategory(transaction.id, newCategoryId);
    }
  };

  const handleDelete = async () => {
    if (confirm("Delete this transaction?")) {
      await removeTransaction(transaction.id);
    }
  };

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-white/6 bg-[#161E33]/60 px-4 py-3 transition-all duration-150 hover:border-white/12 hover:bg-[#161E33]">
      {/* Category icon */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ backgroundColor: `${category.color}18` }}
        title={category.label}
      >
        {category.icon}
      </div>

      {/* Description & meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-200">
          {transaction.description}
        </p>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-xs text-slate-500">
            {formatTransactionDate(transaction.date)}
          </span>

          {/* Category badge — clickable untuk edit */}
          <div className="relative">
            <button
              onClick={() => setIsEditingCategory(!isEditingCategory)}
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
                "border border-white/8 bg-white/5 text-slate-400 hover:border-white/15 hover:text-slate-300"
              )}
              title="Click to change category"
            >
              {category.icon} {category.label}
              <ChevronDown size={10} />
            </button>

            {/* Category dropdown */}
            {isEditingCategory && (
              <div className="absolute left-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#0F1628] shadow-2xl">
                <p className="border-b border-white/8 px-3 py-2 text-xs font-medium text-slate-500">
                  Correct category
                </p>
                <div className="max-h-60 overflow-y-auto py-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.id)}
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors hover:bg-white/5",
                        cat.id === transaction.category_id
                          ? "text-emerald-400"
                          : "text-slate-300"
                      )}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI badge */}
          {transaction.ai_classified && (
            <span
              className="flex items-center gap-1 text-xs text-violet-400"
              title={`AI classified (${Math.round((transaction.ai_confidence ?? 0) * 100)}% confidence)`}
            >
              <Sparkles size={10} />
              AI
            </span>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p
          className={cn(
            "text-sm font-bold tabular-nums",
            transaction.type === "income" ? "text-emerald-400" : "text-slate-200"
          )}
        >
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </p>
      </div>

      {/* Delete button — tampil saat hover */}
      <button
        onClick={handleDelete}
        className="ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-600 opacity-100 transition-all hover:bg-red-500/10 hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Delete transaction"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
