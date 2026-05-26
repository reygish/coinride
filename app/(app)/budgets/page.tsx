"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";
import { formatCurrency } from "@/lib/utils/formatters";

type BudgetPeriod = "daily" | "weekly" | "monthly";

type Category = {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
};

type Budget = {
  id: string;
  category_id: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  categories?: Category | null;
};

type BudgetFormState = {
  categoryId: string;
  amount: string;
  period: BudgetPeriod;
  startDate: string;
};

const PERIOD_OPTIONS: { value: BudgetPeriod; label: string; days: number }[] = [
  { value: "daily", label: "Daily", days: 1 },
  { value: "weekly", label: "Weekly", days: 7 },
  { value: "monthly", label: "Monthly", days: 30 },
];

function computeEndDate(startDate: string, period: BudgetPeriod) {
  const base = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;

  if (period === "monthly") {
    const nextMonth = new Date(base);
    nextMonth.setMonth(base.getMonth() + 1);
    return nextMonth;
  }

  const days = PERIOD_OPTIONS.find((item) => item.value === period)?.days ?? 1;
  const result = new Date(base);
  result.setDate(result.getDate() + days);
  return result;
}

export default function BudgetsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState("IDR");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [form, setForm] = useState<BudgetFormState>({
    categoryId: "",
    amount: "",
    period: "monthly",
    startDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const [{ data: profile }, { data: categoryRows }, { data: budgetRows }] =
        await Promise.all([
          supabase
            .from("user_profiles")
            .select("currency")
            .eq("user_id", user.id)
            .single(),
          supabase
            .from("categories")
            .select("id,name,color,icon")
            .or(`user_id.eq.${user.id},user_id.is.null`)
            .order("name", { ascending: true }),
          supabase
            .from("budgets")
            .select(
              "id,category_id,amount,period,start_date,end_date,categories(id,name,color,icon)",
            )
            .eq("user_id", user.id)
            .order("start_date", { ascending: false }),
        ]);

      if (profile?.currency) {
        setCurrency(profile.currency);
      }

      setCategories((categoryRows ?? []) as Category[]);
      setBudgets((budgetRows ?? []) as unknown as Budget[]);
      setIsLoading(false);
    };

    loadData();
  }, [router, supabase, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.categoryId || !form.amount || !form.startDate) {
      setError("Please fill in all required fields.");
      return;
    }

    const endDate = computeEndDate(form.startDate, form.period);
    if (!endDate) {
      setError("Please select a valid start date.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("budgets")
      .insert({
        user_id: user.id,
        category_id: form.categoryId,
        amount: Number.parseFloat(form.amount),
        period: form.period,
        start_date: new Date(`${form.startDate}T00:00:00`).toISOString(),
        end_date: endDate.toISOString(),
      })
      .select(
        "id,category_id,amount,period,start_date,end_date,categories(id,name,color,icon)",
      )
      .single();

    if (insertError) {
      setError("Unable to create budget. Please try again.");
      setIsSaving(false);
      return;
    }

    if (data) {
      setBudgets((prev) => [data as unknown as Budget, ...prev]);
      setForm((prev) => ({
        ...prev,
        amount: "",
      }));
    }

    setIsSaving(false);
  };

  const handleDelete = async (budgetId: string) => {
    if (!user) return;
    await supabase
      .from("budgets")
      .delete()
      .eq("id", budgetId)
      .eq("user_id", user.id);
    setBudgets((prev) => prev.filter((item) => item.id !== budgetId));
  };

  const startEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setEditAmount(String(budget.amount));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAmount("");
  };

  const handleUpdate = async (budget: Budget) => {
    if (!user) return;
    const nextAmount = Number.parseFloat(editAmount);
    if (Number.isNaN(nextAmount)) {
      setError("Please enter a valid amount.");
      return;
    }

    setIsSaving(true);
    const { data, error: updateError } = await supabase
      .from("budgets")
      .update({ amount: nextAmount })
      .eq("id", budget.id)
      .eq("user_id", user.id)
      .select(
        "id,category_id,amount,period,start_date,end_date,categories(id,name,color,icon)",
      )
      .single();

    if (updateError) {
      setError("Unable to update budget.");
      setIsSaving(false);
      return;
    }

    if (data) {
      setBudgets((prev) =>
        prev.map((item) => (item.id === budget.id ? (data as unknown as Budget) : item)),
      );
    }
    setIsSaving(false);
    cancelEdit();
  };

  const summary = useMemo(() => {
    return budgets.reduce(
      (acc, budget) => acc + Number(budget.amount || 0),
      0,
    );
  }, [budgets]);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-foreground">
          Budgets
        </h1>
        <p className="text-sm text-muted-foreground">
          Set spending limits per category and keep your goals on track.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h2 className="text-lg font-light tracking-[-0.02em] text-foreground">
              New Budget
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a category, amount, and period.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Category
            </label>
            <select
              value={form.categoryId}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  categoryId: event.target.value,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Amount
            </label>
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  amount: event.target.value,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              placeholder="0"
            />

            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Period
            </label>
            <select
              value={form.period}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  period: event.target.value as BudgetPeriod,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Start date
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  startDate: event.target.value,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Create Budget"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total budgeted</p>
            <p
              className="text-2xl font-light tracking-[-0.02em] text-foreground"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatCurrency(summary, currency)}
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              Loading budgets...
            </div>
          ) : budgets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              No budgets yet. Create one to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {budgets.map((budget) => (
                <div
                  key={budget.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-light tracking-[-0.01em] text-foreground">
                      {budget.categories?.name || "Uncategorized"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {budget.period} · {new Date(budget.start_date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        timeZone: "UTC",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === budget.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editAmount}
                        onChange={(event) => setEditAmount(event.target.value)}
                        className="w-28 rounded-lg border border-input bg-background px-2 py-1 text-sm text-foreground"
                      />
                    ) : (
                      <span
                        className="text-sm font-light text-foreground"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {formatCurrency(Number(budget.amount), currency)}
                      </span>
                    )}
                    {editingId === budget.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleUpdate(budget)}
                          disabled={isSaving}
                          className="text-xs font-semibold text-primary"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-xs text-muted-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(budget)}
                          className="text-xs font-semibold text-primary"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(budget.id)}
                          className="text-xs text-muted-foreground"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
