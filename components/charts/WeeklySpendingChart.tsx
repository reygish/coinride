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

function formatDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
}

export function WeeklySpendingChart() {
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
      const start = new Date();
      start.setDate(today.getDate() - 6);

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
        const dateKey = new Date(tx.transaction_date)
          .toISOString()
          .slice(0, 10);
        totals[dateKey] = (totals[dateKey] ?? 0) + Number(tx.amount);
      });

      const nextPoints: ChartPoint[] = [];
      for (let offset = 6; offset >= 0; offset -= 1) {
        const day = new Date();
        day.setDate(today.getDate() - offset);
        const key = day.toISOString().slice(0, 10);
        nextPoints.push({
          label: formatDayLabel(day),
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
        Loading weekly spending...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p
        className="text-xs text-muted-foreground"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {formatCurrency(totalSpend, currency)} spent in last 7 days
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={points} margin={{ left: 8, right: 8 }}>
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "rgba(83, 58, 253, 0.08)" }}
            formatter={(value) => formatCurrency(Number(value), currency)}
          />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#533afd" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
