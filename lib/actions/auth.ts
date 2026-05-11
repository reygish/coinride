"use server";

import { createClient } from "@/lib/supabase/server";
import { hasEnvVars } from "@/lib/utils";

export type AuthActionResult =
  | { ok: true }
  | {
      ok: false;
      error: string;
    };

export async function getAuthedServerClient() {
    if (!hasEnvVars) {
        return {
            supabase: null,
            user: null,
            error: new Error("Supabase is not configured"),
        };
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
        return {
            supabase: null,
            user: null,
            error: new Error("Not authenticated"),
        };
    }
    
  return { user, error: null };
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthActionResult> {
  if (!hasEnvVars) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const safeEmail = typeof email === "string" ? email.trim() : "";
  const safePassword = typeof password === "string" ? password : "";

  if (!safeEmail || !safePassword) {
    return { ok: false, error: "Missing email or password" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: safeEmail,
      password: safePassword,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    console.error("loginWithPassword failed", err);
    return { ok: false, error: "Unable to reach the authentication service." };
  }
}

export async function registerWithPassword(
  name: string,
  email: string,
  password: string,
): Promise<AuthActionResult> {
  if (!hasEnvVars) {
    return { ok: false, error: "Supabase is not configured" };
  }

  const safeName = typeof name === "string" ? name.trim() : "";
  const safeEmail = typeof email === "string" ? email.trim() : "";
  const safePassword = typeof password === "string" ? password : "";

  if (!safeName || !safeEmail || !safePassword) {
    return { ok: false, error: "Missing name, email, or password" };
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signUp({
      email: safeEmail,
      password: safePassword,
      options: {
        data: { full_name: safeName },
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    console.error("registerWithPassword failed", err);
    return { ok: false, error: "Unable to reach the authentication service." };
  }
}
