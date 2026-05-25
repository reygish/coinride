import type { Transaction, TransactionType } from "../_lib/types";

export type { Transaction, TransactionType } from "../_lib/types";

export type TransactionFilter = "all" | TransactionType;

// Payload used by the client when creating a transaction.
// user_id/id/created_at are server-generated.
export type TransactionPayload = Omit<
  Transaction,
  "id" | "user_id" | "created_at"
>;
