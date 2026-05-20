/**
 * components/ui/Button.tsx
 * Komponen Button yang reusable dengan berbagai variant dan ukuran.
 * Menerapkan prinsip Reusable dan Extensible melalui props yang fleksibel.
 */

import { cn } from "@/lib/utils/formatters";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
      primary:
        "bg-emerald-500 hover:bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-500/25",
      secondary:
        "bg-violet-500 hover:bg-violet-400 text-white shadow-lg shadow-violet-500/25",
      ghost:
        "bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10",
      danger: "bg-red-500 hover:bg-red-400 text-white shadow-lg shadow-red-500/25",
      outline:
        "border border-emerald-500/50 hover:border-emerald-400 text-emerald-400 hover:bg-emerald-500/10",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-5 text-sm",
      lg: "h-12 px-6 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
