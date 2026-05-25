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

/** Custom tooltip yang muncul saat hover segment chart */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1628] px-4 py-3 shadow-2xl">
      <p className="text-sm font-semibold text-slate-200">{item.name}</p>
      <p className="mt-1 text-base font-bold text-emerald-400">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

export function SpendingChart() {
  const { user } = useUser();
  const [summaries, setSummaries] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
            <span className="text-xs text-slate-400">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
