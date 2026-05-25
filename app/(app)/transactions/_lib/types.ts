export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;

  budget_id?: string | null;
  description?: string | null;

  amount: number;

  type: "income" | "expense";

  transaction_date: string;
  created_at?: string | null;

  payment_method?: string | null;
}

export type TransactionType = "income" | "expense";
export type TransactionFilter = "all" | TransactionType;

// Payload used by the client when creating a transaction.
// user_id/id/created_at are server-generated.
export type TransactionPayload = Omit<
  Transaction,
  "id" | "user_id" | "created_at"
>;
