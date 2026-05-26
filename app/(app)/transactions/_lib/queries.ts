import { hasEnvVars } from "@/lib/utils";
import { Transaction, TransactionPayload } from "./types";
import { getAuthedServerClient } from "@/lib/auth/auth";
import { createClient } from "@/lib/supabase/client";

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

  await applyBalanceDelta(user.id, transactionImpact(payload));
  await awardAchievements(user.id);

  return data as Transaction;
}

function transactionImpact(payload: Pick<TransactionPayload, "amount" | "type">) {
  const amount = Number(payload.amount ?? 0);
  return payload.type === "income" ? amount : -amount;
}

async function applyBalanceDelta(userId: string, delta: number) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("available_balance,total_balance")
    .eq("user_id", userId)
    .single();

  const available = Number(profile?.available_balance ?? 0);
  const total = Number(profile?.total_balance ?? 0);

  await supabase
    .from("user_profiles")
    .update({
      available_balance: available + delta,
      total_balance: total + delta,
    })
    .eq("user_id", userId);
}

const ACHIEVEMENTS = [
  {
    title: "Beginner Badge",
    description: "Logged your first transaction.",
    predicate: (ctx: { transactionCount: number; level: number }) =>
      ctx.transactionCount === 1,
  },
  {
    title: "Bronze Saver",
    description: "Reached level 5.",
    predicate: (ctx: { transactionCount: number; level: number }) =>
      ctx.level >= 5,
  },
  {
    title: "Silver Saver",
    description: "Reached level 10.",
    predicate: (ctx: { transactionCount: number; level: number }) =>
      ctx.level >= 10,
  },
  {
    title: "Gold Saver",
    description: "Reached level 30.",
    predicate: (ctx: { transactionCount: number; level: number }) =>
      ctx.level >= 30,
  },
  {
    title: "Gold+ Saver",
    description: "Reached level 50.",
    predicate: (ctx: { transactionCount: number; level: number }) =>
      ctx.level >= 50,
  },
  {
    title: "Diamond Saver",
    description: "Reached level 80.",
    predicate: (ctx: { transactionCount: number; level: number }) =>
      ctx.level >= 80,
  },
];

async function awardAchievements(userId: string) {
  const supabase = createClient();

  const [{ count }, { data: profile }, { data: existing }] = await Promise.all([
    supabase
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_profiles")
      .select("level")
      .eq("user_id", userId)
      .single(),
    supabase
      .from("achievements")
      .select("title")
      .eq("user_id", userId),
  ]);

  const context = {
    transactionCount: count ?? 0,
    level: Number(profile?.level ?? 1),
  };

  const earned = new Set(
    (existing ?? []).map((row: { title: string }) => row.title),
  );

  const toInsert = ACHIEVEMENTS.filter(
    (achievement) =>
      achievement.predicate(context) && !earned.has(achievement.title),
  ).map((achievement) => ({
    user_id: userId,
    title: achievement.title,
    description: achievement.description,
  }));

  if (toInsert.length > 0) {
    await supabase.from("achievements").insert(toInsert);
  }
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

  const { data: existing } = await supabase
    .from(TABLE)
    .select("amount,type")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

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

  if (existing) {
    const prevImpact = transactionImpact({
      amount: existing.amount,
      type: existing.type,
    });
    const nextImpact = transactionImpact({
      amount: data.amount,
      type: data.type,
    });
    await applyBalanceDelta(user.id, nextImpact - prevImpact);
  }

  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const { user, error } = await getAuthedServerClient();
  if (error || !user) {
    throw error;
  }

  const supabase = createClient();

  const { data: existing } = await supabase
    .from(TABLE)
    .select("amount,type")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const { error: deleteError } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (deleteError) {
    throw deleteError;
  }

  if (existing) {
    const prevImpact = transactionImpact({
      amount: existing.amount,
      type: existing.type,
    });
    await applyBalanceDelta(user.id, -prevImpact);
  }
}
