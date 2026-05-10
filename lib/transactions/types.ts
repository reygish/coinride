export interface Transaction {
  id: string;
  user_id: string;
  category_id: string;

  title: string;
  description?: string;

  amount: number;

  type: "income" | "expense";

  transaction_date: string;

  payment_method?: string;
}

export type TransactionType =
  | "income"
  | "expense";