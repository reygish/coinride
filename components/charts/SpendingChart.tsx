/**
 * components/charts/SpendingChart.tsx
 * Donut chart untuk visualisasi pengeluaran per kategori.
 * Menggunakan Recharts library.
 */

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { getCategoryById } from "@/lib/utils/categories";
import { formatCurrency } from "@/lib/utils/formatters";

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
  const { categorySpending } = useAppStore();

  // Transform data untuk Recharts
  const chartData = categorySpending.map((item) => {
    const cat = getCategoryById(item.category_id);
    return {
      name: `${cat.icon} ${cat.label}`,
      value: item.total,
      color: cat.color,
    };
  });

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
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke="transparent"
              strokeWidth={0}
            />
          ))}
        </Pie>
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
