import TransactionManager from "./_components/transaction-manager";
import { Transaction } from "./_components/types";

import { listTransactions } from "@/lib/transactions/queries";

export default async function TransactionsPage() {
  const rawTransactions = await listTransactions();
  const initialTransactions: Transaction[] = rawTransactions;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Track every income and expense, apply quick filters, and add new items
          without leaving the page.
        </p>
      </div>
      <TransactionManager initialTransactions={initialTransactions} />
    </div>
  );
}
