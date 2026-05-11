"use client";

import TransactionItem from "./transaction-item";
import { Transaction } from "./types";

type TransactionListProps = {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  // onRetry: () => void;
};

export default function TransactionList({
  transactions,
  loading,
  error,
  // onRetry,
}: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-2xl border border-dashed border-border bg-muted/40"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        {/* <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground"
        >
          Try again
        </button> */}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
        <p className="text-base font-medium text-foreground">No transactions yet</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Add your first income or expense entry using the form on the left, or refresh to sync the latest records.
        </p>
        {/* <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          Refresh list
        </button> */}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </div>
  );
}
