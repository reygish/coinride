"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition hover:bg-muted"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      )}
      Theme
      {/* Tweak: Replace with a dropdown if you add more themes */}
      <span className="ml-auto text-xs text-muted-foreground">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
