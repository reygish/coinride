"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();
  const { user } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const applySavedTheme = async () => {
      const { data } = await supabase
        .from("user_profiles")
        .select("dark_mode")
        .eq("user_id", user.id)
        .single();

      if (typeof data?.dark_mode === "boolean") {
        setTheme(data.dark_mode ? "dark" : "light");
      }
    };

    applySavedTheme();
  }, [supabase, user, setTheme]);

  if (!mounted) {
    return (
      <div className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition opacity-0">
        <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        Theme
        <span className="ml-auto text-xs text-muted-foreground">Dark</span>
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleToggle = async () => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
    if (!user) return;
    await supabase
      .from("user_profiles")
      .update({ dark_mode: nextTheme === "dark" })
      .eq("user_id", user.id);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-muted"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      )}
      Theme
      <span className="ml-auto text-xs text-muted-foreground">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
