"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";
import { formatCurrency } from "@/lib/utils/formatters";

type ChartPoint = {
  label: string;
  total: number;
};

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
}

export function MonthlySpendingChart() {
  const supabase = createClient();
  const { user } = useUser();
  const [currency, setCurrency] = useState("IDR");
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setIsLoading(true);
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);

      const [{ data: profile }, { data: txs }] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("currency")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("transactions")
          .select("amount,transaction_date")
          .eq("user_id", user.id)
          .eq("type", "expense")
          .gte("transaction_date", start.toISOString())
          .lte("transaction_date", today.toISOString()),
      ]);

      if (profile?.currency) {
        setCurrency(profile.currency);
      }

      const totals: Record<string, number> = {};
      (txs ?? []).forEach((tx) => {
        const date = new Date(tx.transaction_date);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        totals[key] = (totals[key] ?? 0) + Number(tx.amount);
      });

      const nextPoints: ChartPoint[] = [];
      for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        nextPoints.push({
          label: monthLabel(date),
          total: totals[key] ?? 0,
        });
      }

      setPoints(nextPoints);
      setIsLoading(false);
    };

    load();
  }, [supabase, user]);

  const totalSpend = useMemo(
    () => points.reduce((acc, point) => acc + point.total, 0),
    [points],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Loading monthly spending...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {formatCurrency(totalSpend, currency)} spent in last 6 months
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={points} margin={{ left: 8, right: 8 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.1)" }}
            formatter={(value) => formatCurrency(Number(value), currency)}
          />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#14b8a6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
