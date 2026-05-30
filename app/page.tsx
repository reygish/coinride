"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowUpRight, Sparkles, TrendingUp, Wallet, Target, Trophy, Flame, Zap, Medal } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Adaptive categorization",
    description:
      "AI signals and patterns keep your categories consistent over time, no matter how you describe your spending.",
  },
  {
    icon: TrendingUp,
    title: "Live insights",
    description:
      "Trends and spending signals surface automatically as you log entries, keeping you ahead of your budget.",
  },
  {
    icon: Target,
    title: "Goal tracking",
    description:
      "Budgets, streaks, and milestones keep momentum visible. Every transaction moves you forward.",
  },
];

const mockTransactions = [
  { name: "Weekly groceries", amount: 186_500, type: "expense" },
  { name: "Freelance project", amount: 2_500_000, type: "income" },
  { name: "Coffee & snacks", amount: 45_000, type: "expense" },
  { name: "Electric bill", amount: 312_000, type: "expense" },
  { name: "Salary deposit", amount: 8_500_000, type: "income" },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── Hero band ── */}
      <section className="relative overflow-hidden pb-16 pt-8 sm:pb-24 sm:pt-16">
        <div
          className="pointer-events-none absolute inset-0 select-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='700' viewBox='0 0 1600 700'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='70'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='1600' height='700' fill='transparent'/%3E%3Cg filter='url(%23blur)'%3E%3Cellipse cx='220' cy='200' rx='300' ry='160' fill='%23f5e9d4' fill-opacity='0.25'/%3E%3Cellipse cx='520' cy='160' rx='280' ry='180' fill='%23f3b26b' fill-opacity='0.18'/%3E%3Cellipse cx='860' cy='180' rx='340' ry='200' fill='%23c9c4ff' fill-opacity='0.25'/%3E%3Cellipse cx='1150' cy='170' rx='260' ry='180' fill='%23533afd' fill-opacity='0.12'/%3E%3Cellipse cx='1380' cy='220' rx='240' ry='180' fill='%23ea2261' fill-opacity='0.1'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 text-center">
          <motion.span
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-primary" />
            AI-Powered Money Manager
          </motion.span>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.1}
            className="text-4xl font-light leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl"
          >
            Your finances,<br />
            <span className="text-primary">intelligently tracked</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.2}
            className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            CoinRide captures every transaction, surfaces trends with AI,
            and keeps your progress visible in a calm, consistent daily flow.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0.3}
            className="flex flex-wrap justify-center gap-3 pt-2"
          >
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[rgba(83,58,253,0.25)_0_4px_14px] transition hover:bg-primary/90 hover:shadow-[rgba(83,58,253,0.35)_0_6px_20px]"
            >
              Get started free
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              Sign in
            </Link>
          </motion.div>
        </div>

        {/* ── Dashboard preview mockup ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={0.4}
          className="relative mx-auto mt-14 max-w-5xl px-6"
        >
          <div className="rounded-xl border border-border bg-card p-5 shadow-[rgba(0,55,112,0.08)_0_8px_24px,rgba(0,55,112,0.04)_0_2px_6px] sm:p-6">
            {/* Mockup top bar */}
            <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <span className="text-xs font-medium text-muted-foreground">coinride/you/dashboard</span>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Live demo
              </span>
            </div>

            {/* Mockup content */}
            <div className="grid gap-5 sm:grid-cols-[1fr_240px]">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  Recent activity
                </p>
                <div className="space-y-1.5">
                  {mockTransactions.map((tx, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-border/60 bg-background px-3 py-2"
                    >
                      <span className="text-sm text-foreground">{tx.name}</span>
                      <span
                        className={`text-sm font-light ${
                          tx.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground"
                        }`}
                        style={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {tx.type === "income" ? "+" : "-"}
                        {formatIDR(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-lg border border-border/60 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  This month
                </p>
                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] text-muted-foreground">Income</p>
                    <p
                      className="text-base font-light text-emerald-600 dark:text-emerald-400"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatIDR(11_000_000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground">Expenses</p>
                    <p
                      className="text-base font-light text-foreground"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {formatIDR(3_200_000)}
                    </p>
                  </div>
                  <div className="border-t border-border pt-2">
                    <p className="text-[11px] text-muted-foreground">Net</p>
                    <p
                      className="text-lg font-light text-emerald-600 dark:text-emerald-400"
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      +{formatIDR(7_800_000)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Warm interlude band ── */}
      <section className="bg-accent border-y border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
            >
              Why CoinRide
            </motion.p>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0.1}
              className="text-3xl font-light tracking-[-0.03em] sm:text-4xl"
            >
              Everything your money routine needs, <span className="text-primary">in one place</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0.2}
              className="mt-4 text-base text-muted-foreground"
            >
              From smart categorization to progress tracking — build habits that stick.
            </motion.p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={0.2 + index * 0.1}
                  className="group rounded-xl border border-border/80 bg-card p-6 transition-shadow hover:shadow-[rgba(0,55,112,0.06)_0_4px_16px]"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-base font-light tracking-[-0.01em] text-foreground">
                    {feature.title}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Gamification / Achievements band ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
            >
              Gamification
            </motion.p>
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0.1}
              className="text-3xl font-light tracking-[-0.03em] sm:text-4xl"
            >
              Level up your <span className="text-primary">financial habits</span>
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0.2}
              className="mt-4 text-base text-muted-foreground"
            >
              Every transaction earns XP. Build streaks, unlock badges, and watch your progress grow.
            </motion.p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.3}
            className="mt-14 grid gap-5 sm:grid-cols-4"
          >
            {[
              {
                icon: Trophy,
                label: "Badges",
                desc: "Earn achievements for milestones and streaks.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                icon: Flame,
                label: "Streak tracking",
                desc: "Log daily to build and maintain your streak.",
                color: "text-orange-500",
                bg: "bg-orange-500/10",
              },
              {
                icon: Zap,
                label: "XP system",
                desc: "Earn XP per transaction and level up over time.",
                color: "text-violet-500",
                bg: "bg-violet-500/10",
              },
              {
                icon: Medal,
                label: "Leaderboard",
                desc: "Compete with others and track your rank.",
                color: "text-primary",
                bg: "bg-primary/10",
              },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="group rounded-xl border border-border/80 bg-card p-5 text-center transition-shadow hover:shadow-[rgba(0,55,112,0.06)_0_4px_16px]"
                >
                  <div
                    className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${item.bg} ${item.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-light tracking-[-0.01em] text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA band ── */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0.2}
          className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-accent to-background p-8 sm:p-12"
        >
          <div
            className="pointer-events-none absolute inset-0 select-none opacity-30"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Cdefs%3E%3Cfilter id='blur2'%3E%3CfeGaussianBlur stdDeviation='50'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='800' height='400' fill='transparent'/%3E%3Cg filter='url(%23blur2)'%3E%3Cellipse cx='200' cy='200' rx='250' ry='140' fill='%23533afd' fill-opacity='0.08'/%3E%3Cellipse cx='600' cy='180' rx='250' ry='140' fill='%23c9c4ff' fill-opacity='0.12'/%3E%3C/g%3E%3C/svg%3E\")",
              backgroundSize: "cover",
            }}
          />

          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-light tracking-[-0.02em] text-foreground sm:text-3xl">
                Ready to take control of your money?
              </h2>
              <p className="text-sm text-muted-foreground">
                Start tracking today and see where your money really goes.
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[rgba(83,58,253,0.2)_0_4px_12px] transition hover:bg-primary/90 hover:shadow-[rgba(83,58,253,0.3)_0_6px_18px]"
              >
                Get started free
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
