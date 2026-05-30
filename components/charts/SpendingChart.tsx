/**
 * components/charts/SpendingChart.tsx
 * Donut chart untuk visualisasi pengeluaran per kategori.
 * Menggunakan Recharts library.
 */

"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { formatCurrency } from "@/lib/utils/formatters";
import {
  fetchExpenseSummaryByCategory,
  CategorySummary,
} from "@/app/(app)/dashboard/_lib/categorySummary";
import { useUser } from "@/app/_components/providers/UserProvider";
import { createClient } from "@/lib/supabase/client";

export function SpendingChart() {
  const { user } = useUser();
  const supabase = createClient();
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currency, setCurrency] = useState("IDR");

  useEffect(() => {
    const loadCurrency = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("user_profiles")
        .select("currency")
        .eq("user_id", user.id)
        .single();

      if (data?.currency) {
        setCurrency(data.currency);
      }
    };

    loadCurrency();
  }, [supabase, user]);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const data = await fetchExpenseSummaryByCategory(user.id);
        setSummaries(data);
      } catch (error) {
        console.error("Failed to load category summaries:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Transform data untuk Recharts
  const chartData = summaries.map((item) => {
    return {
      name: item.category_name,
      value: item.total_amount,
      fill: item.category_color,
      stroke: item.category_color,
    };
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
        Loading chart...
      </div>
    );
  }
  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
        No spending data this month
      </div>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: { color: string } }>;
  }) => {
    if (!active || !payload?.length) return null;

    const item = payload[0];
    return (
      <div className="rounded-md border border-border bg-card px-4 py-3 shadow-[rgba(0,55,112,0.08)_0_8px_24px,rgba(0,55,112,0.04)_0_2px_6px]">
        <p className="text-sm font-light text-foreground">{item.name}</p>
        <p
          className="mt-1 text-base font-light text-foreground"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatCurrency(item.value, currency)}
        </p>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          animationBegin={0}
          animationDuration={800}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
