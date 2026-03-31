"use client";

import { Transaction } from "./types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type TransactionItemProps = {
  transaction: Transaction;
};

export default function TransactionItem({ transaction }: TransactionItemProps) {
  const amountClass =
    transaction.type === "income" ? "text-primary" : "text-destructive";

  return (
    <div className="flex items-start justify-between rounded-2xl border border-border bg-background px-4 py-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-base font-medium text-foreground">
            {transaction.description}
          </p>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {transaction.category}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {transaction.account} - {formatDate(transaction.date)}
        </p>
      </div>
      <p className={`text-base font-semibold ${amountClass}`}>
        {transaction.type === "expense" ? "-" : "+"}
        {currencyFormatter.format(Math.abs(transaction.amount))}
      </p>
    </div>
  );
}
