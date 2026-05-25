import { hasEnvVars } from "@/lib/utils";
import { Transaction, TransactionPayload } from "./types";
import { getAuthedServerClient } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/client";

const TABLE = "transactions";
const XP_PER_LEVEL = 1000;

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

  await applyTransactionXP(user.id);

  return data as Transaction;
}

function toUtcDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

async function applyTransactionXP(userId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("total_xp,level,streak_count,last_streak_date")
    .eq("user_id", userId)
    .single();

  const today = toUtcDateString(new Date());
  const yesterday = toUtcDateString(
    new Date(Date.now() - 24 * 60 * 60 * 1000),
  );

  const prevStreakDate = profile?.last_streak_date ?? null;
  const prevStreak = Number(profile?.streak_count ?? 0);
  const prevXp = Number(profile?.total_xp ?? 0);

  let nextStreak = 1;
  if (prevStreakDate === today) {
    nextStreak = Math.max(prevStreak, 1);
  } else if (prevStreakDate === yesterday) {
    nextStreak = Math.max(prevStreak + 1, 1);
  }

  const xpGain = 10 * nextStreak;
  const nextXp = prevXp + xpGain;
  const nextLevel = Math.floor(nextXp / XP_PER_LEVEL) + 1;

  await supabase
    .from("user_profiles")
    .update({
      total_xp: nextXp,
      level: nextLevel,
      streak_count: nextStreak,
      last_streak_date: today,
    })
    .eq("user_id", userId);
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
