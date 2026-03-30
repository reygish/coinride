import TransactionManager from "./_components/transaction-manager";
import { Transaction } from "./_components/types";

const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: "txn-101",
    date: "2026-03-12",
    account: "Primary Checking",
    amount: 3800,
    description: "Product design retainer",
    category: "Consulting Income",
    type: "income",
  },
  {
    id: "txn-102",
    date: "2026-03-11",
    account: "Corporate Card",
    amount: 275,
    description: "Leadership offsite catering",
    category: "Team Meals",
    type: "expense",
  },
  {
    id: "txn-103",
    date: "2026-03-09",
    account: "Savings",
    amount: 950,
    description: "Monthly dividend payout",
    category: "Passive Income",
    type: "income",
  },
  {
    id: "txn-104",
    date: "2026-03-07",
    account: "Primary Checking",
    amount: 128,
    description: "Team transit passes",
    category: "Transportation",
    type: "expense",
  },
  {
    id: "txn-105",
    date: "2026-03-04",
    account: "Corporate Card",
    amount: 640,
    description: "Q2 marketing toolkit",
    category: "Growth Budget",
    type: "expense",
  },
  {
    id: "txn-106",
    date: "2026-03-01",
    account: "Savings",
    amount: 1200,
    description: "Recurring SaaS revenue",
    category: "Subscription Income",
    type: "income",
  },
];

export default function TransactionsPage() {
  const initialTransactions = DUMMY_TRANSACTIONS;

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
