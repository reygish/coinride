import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export type TransactionType = "income" | "expense";

export type Transaction = {
	id: string;
	user_id: string;
	date: string;
	account: string;
	amount: number;
	description: string;
	category: string;
	type: TransactionType;
};

export type TransactionPayload = Omit<Transaction, "id" | "user_id">;

const TABLE = "transactions";

async function getAuthedServerClient() {
	if (!hasEnvVars) {
		return { supabase: null, user: null, error: new Error("Supabase is not configured") };
	}

	const supabase = await createClient();
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	if (error) {
		return { supabase: null, user: null, error };
	}

	if (!user) {
		return { supabase: null, user: null, error: new Error("Not authenticated") };
	}

	return { supabase, user, error: null };
}

export async function listTransactions(): Promise<Transaction[]> {
	const { supabase, user, error } = await getAuthedServerClient();
	if (error || !supabase || !user) {
		return [];
	}

	const { data, error: queryError } = await supabase
		.from(TABLE)
		.select("id,user_id,date,account,amount,description,category,type")
		.eq("user_id", user.id)
		.order("date", { ascending: false })
		.order("id", { ascending: false });

	if (queryError) {
		return [];
	}

	return Array.isArray(data) ? (data as Transaction[]) : [];
}

export async function createTransaction(payload: TransactionPayload): Promise<Transaction> {
	const { supabase, user, error } = await getAuthedServerClient();
	if (error || !supabase || !user) {
		throw error ?? new Error("Not authenticated");
	}

	const { data, error: insertError } = await supabase
		.from(TABLE)
		.insert({ ...payload, user_id: user.id })
		.select("id,user_id,date,account,amount,description,category,type")
		.single();

	if (insertError) {
		throw insertError;
	}

	return data as Transaction;
}

export async function updateTransaction(
	id: string,
	patch: Partial<TransactionPayload>
): Promise<Transaction> {
	const { supabase, user, error } = await getAuthedServerClient();
	if (error || !supabase || !user) {
		throw error ?? new Error("Not authenticated");
	}

	const { data, error: updateError } = await supabase
		.from(TABLE)
		.update(patch)
		.eq("id", id)
		.eq("user_id", user.id)
		.select("id,user_id,date,account,amount,description,category,type")
		.single();

	if (updateError) {
		throw updateError;
	}

	return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
	const { supabase, user, error } = await getAuthedServerClient();
	if (error || !supabase || !user) {
		throw error ?? new Error("Not authenticated");
	}

	const { error: deleteError } = await supabase
		.from(TABLE)
		.delete()
		.eq("id", id)
		.eq("user_id", user.id);

	if (deleteError) {
		throw deleteError;
	}
}
