/**
 * app/(app)/transactions/page.tsx
 * Halaman manajemen transaksi — list semua transaksi + form tambah baru.
 */

"use client";

import { useState } from "react";
import { TransactionList } from "@/components/transactions/TransactionList";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { formatCurrency } from "@/lib/utils/formatters";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";

export default function TransactionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { transactions } = useAppStore();

  // Hitung total income dan expense dari semua transaksi yang dimuat
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.type === "income") acc.income += t.amount;
      else acc.expense += t.amount;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-slate-100">
            Transactions
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            All your income and expenses in one place
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          <Plus size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <TrendingUp size={20} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Total Income</p>
            <p className="font-display text-base font-bold text-emerald-400 tabular-nums">
              {formatCurrency(totals.income)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
          <TrendingDown size={20} className="text-amber-400 shrink-0" />
          <div>
            <p className="text-xs text-slate-500">Total Expense</p>
            <p className="font-display text-base font-bold text-amber-400 tabular-nums">
              {formatCurrency(totals.expense)}
            </p>
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 px-4 py-3 sm:col-span-1">
          <div>
            <p className="text-xs text-slate-500">Net</p>
            <p
              className={`font-display text-base font-bold tabular-nums ${
                totals.income - totals.expense >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {formatCurrency(Math.abs(totals.income - totals.expense))}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction list with filter */}
      <Card>
        <TransactionList />
      </Card>

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Add Transaction"
        size="md"
      >
        <TransactionForm onSuccess={() => setIsFormOpen(false)} />
      </Modal>
    </div>
  );
}
