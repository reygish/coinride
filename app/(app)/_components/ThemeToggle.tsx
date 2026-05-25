"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <span className="ml-auto text-xs text-muted-foreground">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
