import { hasEnvVars } from "@/lib/utils";
import { Transaction } from "./types";
import { getAuthedServerClient } from "../actions/auth";
import { createClient } from "../supabase/client";

export type TransactionType = "income" | "expense";

export type TransactionPayload = Omit<Transaction, "id" | "user_id">;

const TABLE = "transactions";

// GET USER TRANSACTIONS
export async function listTransactions(): Promise<Transaction[]> {
  const { user, error } = await getAuthedServerClient();
  if (error || !user) {
    return [];
  }

  const supabase = createClient();

  const { data, error: queryError } = await supabase
    .from(TABLE)
    .select(
      "id,user_id,category_id,budget_id,description,amount,type,transaction_date,created_at,payment_method",
    )
    .eq("user_id", user.id)
    .order("transaction_date", { ascending: false })
    .order("id", { ascending: false });

  if (queryError) {
    return [];
  }

  return Array.isArray(data) ? (data as Transaction[]) : [];
}
// CREATE TRANSACTION
export async function createTransaction(
  payload: TransactionPayload,
): Promise<Transaction> {
  const { user, error } = await getAuthedServerClient();
  if (error || !user) {
    throw error;
  }

  const supabase = createClient();

  const { data, error: insertError } = await supabase
    .from(TABLE)
    .insert({
      user_id: user.id,
      category_id: payload.category_id,
      budget_id: payload.budget_id,
      description: payload.description,
      amount: payload.amount,
      type: payload.type,
      transaction_date: payload.transaction_date,
      payment_method: payload.payment_method,
    })
    .select(
      "id,user_id,category_id,budget_id,description,amount,type,transaction_date,created_at,payment_method",
    )
    .single();

  if (insertError) {
    console.error(insertError);
    throw insertError;
  }

  return data as Transaction;
}

// ===================================================================

export async function updateTransaction(
  id: string,
  patch: Partial<TransactionPayload>,
): Promise<Transaction> {
  const { user, error } = await getAuthedServerClient();
  if (error || !user) {
    throw error;
  }

  const supabase = createClient();

  const { data, error: updateError } = await supabase
    .from(TABLE)
    .update(patch)
    .eq("id", id)
    .eq("user_id", user.id)
    .select(
      "id,user_id,category_id,budget_id,description,amount,type,transaction_date,created_at,payment_method",
    )
    .single();

  if (updateError) {
    throw updateError;
  }

  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { user, error } = await getAuthedServerClient();
  if (error || !user) {
    throw error;
  }

  const supabase = createClient();

  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    throw deleteError;
  }
}
