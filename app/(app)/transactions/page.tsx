import TransactionManager from "./_components/TransactionManager";
import { listTransactions } from "./_lib/queries";
import { Transaction } from "./_lib/types";

export default async function TransactionsPage() {
  const rawTransactions = await listTransactions();
  const initialTransactions: Transaction[] = rawTransactions;

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-foreground">
          Transactions
        </h1>
        <p className="text-sm text-muted-foreground">
          Track every income and expense, apply quick filters, and add new items
          without leaving the page.
        </p>
      </div>
      <TransactionManager initialTransactions={initialTransactions} />
    </div>
  );
}
