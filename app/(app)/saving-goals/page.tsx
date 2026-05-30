"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";
import { formatCurrency } from "@/lib/utils/formatters";

type SavingGoal = {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  allocated_amount: number;
  target_date: string | null;
  is_completed: boolean;
  created_at: string;
};

type GoalFormState = {
  title: string;
  targetAmount: string;
  currentAmount: string;
  targetDate: string;
};

export default function SavingGoalsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [currency, setCurrency] = useState("IDR");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormState>({
    title: "",
    targetAmount: "",
    currentAmount: "",
    targetDate: "",
  });
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, string>>(
    {},
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const loadGoals = async () => {
      setIsLoading(true);
      setError(null);

      const [{ data: profile }, { data: goalRows }] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("currency")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("saving_goals")
          .select(
            "id,title,target_amount,current_amount,allocated_amount,target_date,is_completed,created_at",
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profile?.currency) {
        setCurrency(profile.currency);
      }

      setGoals((goalRows ?? []) as SavingGoal[]);
      setIsLoading(false);
    };

    loadGoals();
  }, [router, supabase, user]);

  const handleSubmit = async () => {
    if (!user) return;
    if (!form.title || !form.targetAmount) {
      setError("Please add a goal name and target amount.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("saving_goals")
      .insert({
        user_id: user.id,
        title: form.title.trim(),
        target_amount: Number.parseFloat(form.targetAmount),
        current_amount: Number.parseFloat(form.currentAmount || "0"),
        allocated_amount: 0,
        target_date: form.targetDate
          ? new Date(`${form.targetDate}T00:00:00`).toISOString()
          : null,
      })
      .select(
        "id,title,target_amount,current_amount,allocated_amount,target_date,is_completed,created_at",
      )
      .single();

    if (insertError) {
      setError("Unable to create goal. Please try again.");
      setIsSaving(false);
      return;
    }

    if (data) {
      setGoals((prev) => [data as SavingGoal, ...prev]);
      setForm({
        title: "",
        targetAmount: "",
        currentAmount: "",
        targetDate: "",
      });
    }

    setIsSaving(false);
  };

  const totals = useMemo(() => {
    const totalTarget = goals.reduce(
      (acc, goal) => acc + Number(goal.target_amount || 0),
      0,
    );
    const totalSaved = goals.reduce(
      (acc, goal) => acc + Number(goal.current_amount || 0),
      0,
    );
    return { totalTarget, totalSaved };
  }, [goals]);

  const handleUpdateCurrentAmount = async (goal: SavingGoal) => {
    if (!user) return;
    const rawAmount = pendingUpdates[goal.id] ?? "";
    const nextAmount = Number.parseFloat(rawAmount);
    if (Number.isNaN(nextAmount)) {
      setError("Please enter a valid current amount.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const isCompleted = nextAmount >= goal.target_amount;
    const { data, error: updateError } = await supabase
      .from("saving_goals")
      .update({
        current_amount: nextAmount,
        is_completed: isCompleted,
      })
      .eq("id", goal.id)
      .select(
        "id,title,target_amount,current_amount,allocated_amount,target_date,is_completed,created_at",
      )
      .single();

    if (updateError) {
      setError("Unable to update goal. Please try again.");
      setIsSaving(false);
      return;
    }

    if (data) {
      setGoals((prev) =>
        prev.map((item) => (item.id === goal.id ? (data as SavingGoal) : item)),
      );
      setPendingUpdates((prev) => ({ ...prev, [goal.id]: "" }));
    }

    setIsSaving(false);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!user) return;
    setDeletingId(goalId);
    setError(null);

    const { error: deleteError } = await supabase
      .from("saving_goals")
      .delete()
      .eq("id", goalId);

    if (deleteError) {
      setError("Unable to delete goal. Please try again.");
      setDeletingId(null);
      return;
    }

    setGoals((prev) => prev.filter((item) => item.id !== goalId));
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-foreground">
          Saving Goals
        </h1>
        <p className="text-sm text-muted-foreground">
          Track progress toward milestones and keep your savings on pace.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="space-y-4 rounded-lg border border-border bg-card p-5">
          <div>
            <h2 className="text-lg font-light tracking-[-0.02em] text-foreground">
              New Goal
            </h2>
            <p className="text-sm text-muted-foreground">
              Set a target and optional start balance.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Goal name
            </label>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              placeholder="Emergency fund"
            />

            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Target amount
            </label>
            <input
              type="number"
              min="0"
              value={form.targetAmount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  targetAmount: event.target.value,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              placeholder="0"
            />

            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Current saved
            </label>
            <input
              type="number"
              min="0"
              value={form.currentAmount}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  currentAmount: event.target.value,
                }))
              }
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              placeholder="0"
            />

            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Target date (optional)
            </label>
            <input
              type="date"
              value={form.targetDate}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  targetDate: event.target.value,
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
            {isSaving ? "Saving..." : "Create Goal"}
          </button>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total saved</p>
            <p
              className="text-2xl font-light tracking-[-0.02em] text-foreground"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {formatCurrency(totals.totalSaved, currency)}
            </p>
            <p className="text-sm text-muted-foreground">
              of {formatCurrency(totals.totalTarget, currency)} target
            </p>
          </div>

          {isLoading ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
              Loading goals...
            </div>
          ) : goals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
              No goals yet. Start one to stay motivated.
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((goal) => {
                const progress = goal.target_amount
                  ? Math.min(
                      (goal.current_amount / goal.target_amount) * 100,
                      100,
                    )
                  : 0;
                return (
                  <div
                    key={goal.id}
                    className="rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-light tracking-[-0.01em] text-foreground">
                          {goal.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <span style={{ fontVariantNumeric: "tabular-nums" }}>
                            {formatCurrency(goal.current_amount, currency)}
                          </span>
                          {" "}saved
                        </p>
                      </div>
                      <span
                        className="text-xs font-semibold text-muted-foreground"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={
                            pendingUpdates[goal.id] ??
                            String(goal.current_amount)
                          }
                          onChange={(event) =>
                            setPendingUpdates((prev) => ({
                              ...prev,
                              [goal.id]: event.target.value,
                            }))
                          }
                          className="w-32 rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCurrentAmount(goal)}
                          disabled={isSaving}
                          className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                        >
                          Update
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteGoal(goal.id)}
                        disabled={deletingId === goal.id}
                        className="inline-flex items-center justify-center rounded-full border border-border px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                      >
                        {deletingId === goal.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span style={{ fontVariantNumeric: "tabular-nums" }}>
                        Target {formatCurrency(goal.target_amount, currency)}
                      </span>
                      <span>
                        {goal.target_date
                          ? new Date(goal.target_date).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                timeZone: "UTC",
                              },
                            )
                          : "No deadline"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
