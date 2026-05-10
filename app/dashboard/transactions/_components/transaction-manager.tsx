"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { classifyTransaction } from "@/lib/actions/classifyTransaction";
import FilterTabs from "./filter-tabs";
import TransactionForm from "./transaction-form";
import { Transaction, TransactionFilter, TransactionPayload } from "./types";
import TransactionList from "./transaction-list";

const TRANSACTIONS_ENDPOINT = "/api/transactions";
const PLACEHOLDER_CATEGORIES = [
  "Food & Dining",
  "Housing",
  "Transportation",
  "Healthcare",
  "Entertainment",
  "Investments",
  "Savings",
];
const SEARCH_DEBOUNCE = 350;

type TransactionManagerProps = {
  initialTransactions: Transaction[];
};

export default function TransactionManager({
  initialTransactions,
}: TransactionManagerProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filter, setFilter] = useState<TransactionFilter>("all");
  const [categoryOptions, setCategoryOptions] = useState<string[]>(PLACEHOLDER_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(initialTransactions.length === 0);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshTransactions = useCallback(
    async (isSoftRefresh = false) => {
      if (isSoftRefresh) {
        setIsRefetching(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      try {
        const response = await fetch(TRANSACTIONS_ENDPOINT, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const payload = await response.json();
        const nextTransactions: Transaction[] = Array.isArray(payload) ? payload : [];
        setTransactions(nextTransactions);
        setCategoryOptions((prev) => {
          const merged = new Set([...PLACEHOLDER_CATEGORIES, ...prev]);
          nextTransactions.forEach((tx) => {
            if (tx.category) {
              merged.add(tx.category);
            }
          });
          return Array.from(merged);
        });
      } catch (fetchError) {
        setError("Unable to load transactions right now. Please try again.");
      } finally {
        if (isSoftRefresh) {
          setIsRefetching(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    setTransactions(initialTransactions);
    if (initialTransactions.length > 0) {
      setIsLoading(false);
      setCategoryOptions((prev) => {
        const merged = new Set([...PLACEHOLDER_CATEGORIES, ...prev]);
        initialTransactions.forEach((tx) => merged.add(tx.category));
        return Array.from(merged);
      });
    }
  }, [initialTransactions]);

  useEffect(() => {
    if (initialTransactions.length === 0) {
      refreshTransactions();
    }
  }, [initialTransactions.length, refreshTransactions]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim().toLowerCase());
    }, SEARCH_DEBOUNCE);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const counts = useMemo(
    () => ({
      all: transactions.length,
      income: transactions.filter((tx) => tx.type === "income").length,
      expense: transactions.filter((tx) => tx.type === "expense").length,
    }),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filter !== "all" && transaction.type !== filter) {
        return false;
      }

      if (!debouncedSearch) {
        return true;
      }

      const haystack = `${transaction.description} ${transaction.category} ${transaction.account}`.toLowerCase();
      return haystack.includes(debouncedSearch);
    });
  }, [transactions, filter, debouncedSearch]);

  const handleCreateTransaction = useCallback(
    async (payload: TransactionPayload) => {
      setIsSubmitting(true);
      setError(null);
      const optimisticId = `temp-${Date.now()}`;
      const optimisticTransaction: Transaction = { id: optimisticId, ...payload };

      setTransactions((prev) => [optimisticTransaction, ...prev]);

      try {
        const response = await fetch(TRANSACTIONS_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Failed to create transaction");
        }

        const created: Transaction = await response.json();
        setTransactions((prev) =>
          prev.map((transaction) => (transaction.id === optimisticId ? created : transaction))
        );
      } catch (createError) {
        setTransactions((prev) => prev.filter((transaction) => transaction.id !== optimisticId));
        setError("We could not save the transaction. Please try again.");
        throw createError;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const handleAutoCategory = useCallback(async (description: string) => {
    const rawCategory = await classifyTransaction(description);
    const generatedCategory = rawCategory?.trim() || "Uncategorized";
    setCategoryOptions((prev) => {
      if (prev.includes(generatedCategory)) {
        return prev;
      }
      return [...prev, generatedCategory];
    });
    return generatedCategory;
  }, []);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
      <div className="space-y-4">
        <FilterTabs activeFilter={filter} counts={counts} onFilterChange={setFilter} />
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-foreground">Add Transaction</h2>
            <p className="text-sm text-muted-foreground">
              The filter determines the transaction type. Choose manually when "All" is active.
            </p>
          </div>
          <div className="mt-4">
            <TransactionForm
              defaultFilter={filter}
              categoryOptions={categoryOptions}
              isSubmitting={isSubmitting}
              onSubmit={handleCreateTransaction}
              onAutoGenerateCategory={handleAutoCategory}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring sm:w-auto">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4 text-muted-foreground"
            >
              <path
                d="m13.5 12.4 3.6 3.6-1.1 1.1-3.6-3.6a6 6 0 1 1 1.1-1.1zm-5.5 1a4.4 4.4 0 1 0 0-8.8 4.4 4.4 0 0 0 0 8.8z"
                fill="currentColor"
              />
            </svg>
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search description, category, or account"
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => refreshTransactions(true)}
            disabled={isRefetching}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isRefetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          loading={isLoading}
          error={error}
          onRetry={() => refreshTransactions()}
        />
      </div>
    </div>
  );
}
