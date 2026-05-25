/**
 * components/charts/MonthlyChart.tsx
 * Bar chart untuk visualisasi income vs expense per bulan (6 bulan terakhir).
 */

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useAppStore } from "@/store/useAppStore";
import { formatCompactCurrency } from "@/lib/utils/formatters";

/** Custom tooltip untuk bar chart */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0F1628] px-4 py-3 shadow-2xl">
      <p className="mb-2 text-xs font-semibold text-slate-400">{label}</p>
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <p className="text-sm font-semibold" style={{ color: item.color }}>
            {item.name}: {formatCompactCurrency(item.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

export function MonthlyChart() {
  const { monthlyData } = useAppStore();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={monthlyData} barGap={4} barCategoryGap="30%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="rgba(255,255,255,0.05)"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fill: "#64748B", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748B", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatCompactCurrency}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span className="text-xs text-slate-400 capitalize">{value}</span>
          )}
        />
        <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expense" fill="#F59E0B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
