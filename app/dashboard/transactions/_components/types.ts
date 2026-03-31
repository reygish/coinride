export type TransactionType = "income" | "expense";

export type TransactionFilter = "all" | TransactionType;

export interface Transaction {
  id: string;
  date: string;
  account: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
}

export type TransactionPayload = Omit<Transaction, "id">;
