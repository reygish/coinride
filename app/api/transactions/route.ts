import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

type TransactionType = "income" | "expense";

type TransactionRecord = {
  id: string;
  user_id: string;
  date: string;
  account: string;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
};

type TransactionPayload = Omit<TransactionRecord, "id" | "user_id">;

const TABLE = "transactions";

function isTransactionType(value: unknown): value is TransactionType {
  return value === "income" || value === "expense";
}

function validatePayload(payload: any): asserts payload is TransactionPayload {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }

  if (typeof payload.date !== "string" || payload.date.trim().length === 0) {
    throw new Error("Missing date");
  }

  if (typeof payload.account !== "string" || payload.account.trim().length === 0) {
    throw new Error("Missing account");
  }

  const amountNumber = Number(payload.amount);
  if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
    throw new Error("Invalid amount");
  }

  if (typeof payload.description !== "string") {
    throw new Error("Missing description");
  }

  if (typeof payload.category !== "string" || payload.category.trim().length === 0) {
    throw new Error("Missing category");
  }

  if (!isTransactionType(payload.type)) {
    throw new Error("Invalid type");
  }
}

async function getAuthedSupabase() {
  if (!hasEnvVars) {
    return { errorResponse: NextResponse.json({ error: "Supabase is not configured" }, { status: 503 }) };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return { errorResponse: NextResponse.json({ error: error.message }, { status: 401 }) };
  }

  if (!user) {
    return { errorResponse: NextResponse.json({ error: "Not authenticated" }, { status: 401 }) };
  }

  return { supabase, user };
}

export async function GET() {
  const auth = await getAuthedSupabase();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { supabase, user } = auth;

  const { data, error } = await supabase
    .from(TABLE)
    .select("id,user_id,date,account,amount,description,category,type")
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(Array.isArray(data) ? data : []);
}

export async function POST(request: Request) {
  const auth = await getAuthedSupabase();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { supabase, user } = auth;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    validatePayload(payload);
  } catch (validationError) {
    const message = validationError instanceof Error ? validationError.message : "Invalid payload";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const insertData = {
    user_id: user.id,
    date: payload.date,
    account: payload.account,
    amount: Number(payload.amount),
    description: payload.description,
    category: payload.category,
    type: payload.type,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(insertData)
    .select("id,user_id,date,account,amount,description,category,type")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data satisfies TransactionRecord);
}

export async function PATCH(request: Request) {
  const auth = await getAuthedSupabase();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { supabase, user } = auth;

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = typeof payload?.id === "string" ? payload.id : null;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const update: Partial<TransactionPayload> = {};
  if (payload.date !== undefined) update.date = String(payload.date);
  if (payload.account !== undefined) update.account = String(payload.account);
  if (payload.amount !== undefined) update.amount = Number(payload.amount);
  if (payload.description !== undefined) update.description = String(payload.description);
  if (payload.category !== undefined) update.category = String(payload.category);
  if (payload.type !== undefined) {
    if (!isTransactionType(payload.type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
    update.type = payload.type;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id,user_id,date,account,amount,description,category,type")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data satisfies TransactionRecord);
}

export async function DELETE(request: Request) {
  const auth = await getAuthedSupabase();
  if ("errorResponse" in auth) return auth.errorResponse;

  const { supabase, user } = auth;

  const url = new URL(request.url);
  const idFromQuery = url.searchParams.get("id");

  let id = idFromQuery;
  if (!id) {
    try {
      const body = await request.json();
      if (typeof body?.id === "string") {
        id = body.id;
      }
    } catch {
      // ignore
    }
  }

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { error } = await supabase.from(TABLE).delete().eq("id", id).eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
