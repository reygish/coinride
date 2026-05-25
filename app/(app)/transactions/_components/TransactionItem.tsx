"use client";

import { useCategories } from "@/app/_components/providers/CategoryProvider";
import { Transaction } from "../_lib/types";

const DEFAULT_LOCALE = "id-ID";

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

type TransactionItemProps = {
  transaction: Transaction;
  currency: string;
};

export default function TransactionItem({
  transaction,
  currency,
}: TransactionItemProps) {
  const { categories: categoryOptions, isLoading: isCategoriesLoading } =
    useCategories();
  const amountClass =
    transaction.type === "income" ? "text-primary" : "text-destructive";
  const category = categoryOptions.find(
    (cat) => cat.id === transaction.category_id,
  );

  const headline = transaction.description || "";

  return (
    <div className="flex items-start justify-between rounded-2xl border border-border bg-background px-4 py-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-base font-medium text-foreground">{headline}</p>
          {category && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium text-white shadow-sm"
              style={{ backgroundColor: category.color || "#6b7280" }}
            >
              {category.name}
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {(transaction.payment_method ?? "").trim() || "-"} -{" "}
          {formatDate(transaction.transaction_date)}
        </p>
      </div>
      <p className={`text-base font-semibold ${amountClass}`}>
        {transaction.type === "expense" ? "-" : "+"}
        {formatCurrency(Math.abs(transaction.amount), currency)}
      </p>
    </div>
  );
}
