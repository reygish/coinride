/**
 * components/budget/BudgetForm.tsx
 * Form untuk membuat atau mengedit budget per kategori.
 */

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { getCategoriesByType } from "@/lib/utils/categories";
import { formatCurrency } from "@/lib/utils/formatters";
import toast from "react-hot-toast";
import type { BudgetWithSpending, CategoryId } from "@/types";
import { useAppStore } from "@/store/useAppStore";

interface BudgetFormProps {
  existingBudget?: BudgetWithSpending;
  onSuccess?: () => void;
}

export function BudgetForm({ existingBudget, onSuccess }: BudgetFormProps) {
  const { budgets, setBudgets } = useAppStore();
  const [categoryId, setCategoryId] = useState<CategoryId>(
    existingBudget?.category_id ?? "food"
  );
  const [amount, setAmount] = useState(
    existingBudget ? String(existingBudget.amount) : ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const expenseCategories = getCategoriesByType("expense").map((cat) => ({
    value: cat.id,
    label: `${cat.icon} ${cat.label}`,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    setIsLoading(true);
    try {
      // TODO (Backend): Implementasi POST/PATCH /api/budget
      // const url = existingBudget ? `/api/budget/${existingBudget.id}` : "/api/budget";
      // const method = existingBudget ? "PATCH" : "POST";
      // const response = await fetch(url, { method, body: JSON.stringify({ category_id: categoryId, amount: parsedAmount }) });

      // Mock: update state lokal
      const now = new Date().toISOString();
      const spent = existingBudget?.spent ?? 0;
      const remaining = parsedAmount - spent;
      const percentage = (spent / parsedAmount) * 100;
      const status =
        percentage > 100 ? "exceeded" : percentage > 75 ? "warning" : "safe";

      if (existingBudget) {
        setBudgets(
          budgets.map((b) =>
            b.id === existingBudget.id
              ? { ...b, amount: parsedAmount, remaining, percentage, status, updated_at: now }
              : b
          )
        );
        toast.success("Budget updated!");
      } else {
        const newBudget: BudgetWithSpending = {
          id: `b${Date.now()}`,
          user_id: "user-123",
          category_id: categoryId,
          amount: parsedAmount,
          spent,
          remaining: parsedAmount,
          percentage: 0,
          status: "safe",
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          created_at: now,
          updated_at: now,
        };
        setBudgets([...budgets, newBudget]);
        toast.success("Budget created!");
      }
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value as CategoryId)}
        options={expenseCategories}
        disabled={!!existingBudget} // Tidak bisa ganti kategori saat edit
      />

      <Input
        label="Monthly Budget (IDR)"
        type="number"
        placeholder="e.g. 500000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        min="1"
        step="1"
        helperText={
          amount
            ? `= ${formatCurrency(parseFloat(amount) || 0)} per month`
            : undefined
        }
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full"
        disabled={!amount || parseFloat(amount) <= 0}
      >
        {existingBudget ? "Update Budget" : "Set Budget"}
      </Button>
    </form>
  );
}
