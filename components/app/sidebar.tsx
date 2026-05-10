import Link from "next/link";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Medal,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Trophy,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/app/theme-toggle";

type SidebarProps = {
  className?: string;
};

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      // Tweak: Update this route once you add the page.
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        disabled: true,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Transactions", href: "/dashboard/transactions", icon: Receipt },
      // Tweak: Update these routes once you add the pages.
      {
        label: "Budgets",
        href: "/dashboard/budgets",
        icon: Target,
        disabled: true,
      },
      {
        label: "Saving Goals",
        href: "/dashboard/saving-goals",
        icon: PiggyBank,
        disabled: true,
      },
    ],
  },
  {
    title: "Gamification",
    items: [
      {
        label: "Achievements",
        href: "/dashboard/achievements",
        icon: Trophy,
        disabled: true,
      },
      {
        label: "Leaderboard",
        href: "/dashboard/leaderboard",
        icon: Medal,
        disabled: true,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Notifications",
        href: "/dashboard/notifications",
        icon: Bell,
        disabled: true,
      },
      { label: "Profile", href: "/profile", icon: User },
      {
        label: "Settings",
        href: "/dashboard/settings",
        icon: Settings,
        disabled: true,
      },
      // "Theme" is rendered as a toggle button below.
    ],
  },
];

function SidebarItem({ label, href, icon: Icon, disabled }: NavItem) {
  const baseClassName =
    "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-foreground transition";

  if (!href || disabled) {
    return (
      <span
        className={cn(
          baseClassName,
          "cursor-not-allowed text-muted-foreground opacity-70",
        )}
        aria-disabled="true"
      >
        <Icon className="h-4 w-4" />
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={cn(baseClassName, "hover:bg-muted")}>
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      {label}
    </Link>
  );
}

export default function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "min-h-0 w-72 shrink-0 overflow-y-auto border-r border-border bg-card",
        className,
      )}
    >
      <div className="p-4">
        {/* Optional: Sidebar header / brand */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Menu</span>
        </div>

        <nav className="space-y-6">
          {NAV.map((section) => (
            <div key={section.title} className="space-y-2">
              <h2 className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {section.title}
              </h2>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <SidebarItem key={item.label} {...item} />
                ))}

                {section.title === "System" ? (
                  <div className="pt-1">
                    <ThemeToggle />
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
