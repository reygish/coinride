/**
 * components/ui/Card.tsx
 * Komponen Card yang digunakan sebagai container konten di dashboard.
 */

import { cn } from "@/lib/utils/formatters";
import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: "green" | "purple" | "amber" | "none";
}

function Card({ className, glow = "none", children, ...props }: CardProps) {
  const glowStyles = {
    none: "",
    green: "shadow-emerald-500/10 hover:shadow-emerald-500/20",
    purple: "shadow-violet-500/10 hover:shadow-violet-500/20",
    amber: "shadow-amber-500/10 hover:shadow-amber-500/20",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-white/8 bg-[#161E33] p-5 shadow-xl transition-shadow duration-300",
        glow !== "none" && glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-base font-semibold text-slate-200", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardContent };
