"use client";

import { TransactionFilter } from "./types";

type FilterTabsProps = {
  activeFilter: TransactionFilter;
  counts: Record<TransactionFilter, number>;
  onFilterChange: (filter: TransactionFilter) => void;
};

const FILTERS: { label: string; value: TransactionFilter }[] = [
  { label: "All", value: "all" },
  { label: "Income", value: "income" },
  { label: "Expense", value: "expense" },
];

export default function FilterTabs({ activeFilter, counts, onFilterChange }: FilterTabsProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-2 shadow-sm">
      <div className="grid grid-cols-3 gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter.value;
          const count = counts[filter.value];
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-transparent bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{filter.label}</span>
              <span className="text-xs text-muted-foreground">{count ?? 0} items</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
