/**
 * components/transactions/TransactionList.tsx
 * Daftar transaksi dengan filter dan search.
 */

"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { TransactionCard } from "./TransactionCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getCategoriesByType } from "@/lib/utils/categories";
import { Search, Inbox } from "lucide-react";
import type { CategoryId, TransactionType } from "@/types";

export function TransactionList() {
  const { transactions } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterCategory, setFilterCategory] = useState<"all" | CategoryId>("all");

  // Filter dan search secara memoized untuk performa
  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !search ||
        t.description.toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === "all" || t.type === filterType;
      const matchesCategory =
        filterCategory === "all" || t.category_id === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [transactions, search, filterType, filterCategory]);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...getCategoriesByType("expense").map((c) => ({
      value: c.id,
      label: `${c.icon} ${c.label}`,
    })),
    ...getCategoriesByType("income")
      .filter((c) => c.type === "income")
      .map((c) => ({ value: c.id, label: `${c.icon} ${c.label}` })),
  ];

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={16} />}
          className="flex-1"
        />
        <Select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          options={[
            { value: "all", label: "All Types" },
            { value: "expense", label: "💸 Expense" },
            { value: "income", label: "💰 Income" },
          ]}
          className="sm:w-36"
        />
        <Select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value as typeof filterCategory)
          }
          options={categoryOptions}
          className="sm:w-44"
        />
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-500">
        {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
        {(search || filterType !== "all" || filterCategory !== "all") &&
          ` (filtered from ${transactions.length})`}
      </p>

      {/* Transaction list */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Inbox size={48} className="mb-4 text-slate-600" />
          <p className="text-base font-medium text-slate-400">
            {transactions.length === 0
              ? "No transactions yet"
              : "No transactions match your filter"}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {transactions.length === 0
              ? "Add your first transaction to get started!"
              : "Try adjusting your search or filters"}
          </p>
        </div>
      )}
    </div>
  );
}
