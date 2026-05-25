"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/app/_components/providers/UserProvider";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    const loadNotifications = async () => {
      setIsLoading(true);

      const { data } = await supabase
        .from("notifications")
        .select("id,title,message,type,is_read,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setNotifications((data ?? []) as Notification[]);
      setIsLoading(false);
    };

    loadNotifications();
  }, [router, supabase, user]);

  const markAllRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) =>
      prev.map((item) => ({ ...item, is_read: true })),
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Stay up to date with reminders and account alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          className="inline-flex items-center justify-center rounded-xl border border-input px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Mark all read
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
          You are all caught up.
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {notification.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    },
                  )}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  notification.is_read
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {notification.is_read ? "Read" : "New"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
