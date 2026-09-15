"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  Loader2,
  Package,
  RotateCcw,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  deleteAdminNotification,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  type AdminNotification,
} from "@/lib/admin-notifications";

type NotificationType = "order" | "payment" | "stock" | "return" | "system";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  unread: boolean;
};

type NotificationFilter = "all" | "unread" | NotificationType;

const FILTERS: Array<{
  key: NotificationFilter;
  label: string;
}> = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "order", label: "Orders" },
  { key: "payment", label: "Payments" },
  { key: "stock", label: "Stock" },
  { key: "return", label: "Returns" },
];

function getNotificationType(type: string): NotificationType {
  const normalized = type.toLowerCase();

  if (normalized.includes("order")) return "order";
  if (normalized.includes("payment")) return "payment";
  if (normalized.includes("stock") || normalized.includes("inventory")) {
    return "stock";
  }
  if (normalized.includes("return") || normalized.includes("refund")) {
    return "return";
  }

  return "system";
}

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diff = Date.now() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  if (hours < 24) {
    return `${hours}h ago`;
  }

  if (days < 7) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function mapNotification(notification: AdminNotification): NotificationItem {
  return {
    id: notification.id,
    type: getNotificationType(notification.type),
    title: notification.title,
    message: notification.message,
    time: formatRelativeTime(notification.createdAt),
    unread: !notification.isRead,
  };
}

function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "order":
      return <ShoppingCart className="h-4 w-4" />;

    case "payment":
      return <CreditCard className="h-4 w-4" />;

    case "stock":
      return <Package className="h-4 w-4" />;

    case "return":
      return <RotateCcw className="h-4 w-4" />;

    case "system":
      return <Bell className="h-4 w-4" />;
  }
}

function getNotificationIconClass(type: NotificationType) {
  switch (type) {
    case "order":
      return "bg-blue-500/10 text-blue-400";

    case "payment":
      return "bg-emerald-500/10 text-emerald-400";

    case "stock":
      return "bg-warning/10 text-warning";

    case "return":
      return "bg-purple-500/10 text-purple-400";

    case "system":
      return "bg-brand-muted text-brand";
  }
}

export function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [filter, setFilter] = useState<NotificationFilter>("all");

  const [search, setSearch] = useState("");

  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isRead = filter === "unread" ? false : undefined;

      const type = filter !== "all" && filter !== "unread" ? filter : undefined;

      const response = await getAdminNotifications(1, 100, {
        search: search.trim() || undefined,
        type,
        isRead,
      });

      setNotifications(response.notifications.map(mapNotification));

      setUnreadCount(response.unreadCount);
    } catch (err) {
      console.error("Load admin notifications error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to load notifications",
      );
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadNotifications();
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [loadNotifications]);

  const filteredNotifications = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return notifications;
    }

    return notifications.filter(
      (notification) =>
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query),
    );
  }, [notifications, search]);

  const markAsRead = async (id: string) => {
    try {
      setActionLoading(id);

      await markAdminNotificationAsRead(id);

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? { ...notification, unread: false }
            : notification,
        ),
      );

      setUnreadCount((current) => Math.max(0, current - 1));
    } catch (err) {
      console.error("Mark notification as read error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notification as read",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setActionLoading("all");

      await markAllAdminNotificationsAsRead();

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          unread: false,
        })),
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all notifications as read error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to mark notifications as read",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const removeNotification = async (id: string) => {
    try {
      setActionLoading(id);

      await deleteAdminNotification(id);

      setNotifications((current) =>
        current.filter((notification) => notification.id !== id),
      );

      const removedNotification = notifications.find(
        (notification) => notification.id === id,
      );

      if (removedNotification?.unread) {
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    } catch (err) {
      console.error("Delete notification error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to delete notification",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-brand" />

              <h1 className="text-sm font-semibold text-text">Notifications</h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-surface">
                  {unreadCount} unread
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-text-muted">
              Stay up to date with orders, payments, inventory and returns.
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={
                actionLoading === "all" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )
              }
              onClick={markAllAsRead}
              disabled={actionLoading === "all"}
            >
              Mark all as read
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-2">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
              {FILTERS.map((item) => {
                const active = filter === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setFilter(item.key)}
                    className={[
                      "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      active
                        ? "bg-brand text-surface"
                        : "text-text-muted hover:bg-surface-elevated hover:text-text",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full lg:w-64">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notifications..."
                className="pl-8"
              />
            </div>
          </div>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border border-danger/30 bg-danger/5 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-danger">{error}</p>

              <button
                type="button"
                onClick={() => setError(null)}
                className="text-text-muted hover:text-text"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </Card>
        )}

        {/* Notification list */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Loader2 className="mb-3 h-5 w-5 animate-spin text-brand" />

              <p className="text-sm font-medium text-text">
                Loading notifications...
              </p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-text-muted">
                <Bell className="h-5 w-5" />
              </div>

              <p className="text-sm font-medium text-text">
                No notifications found
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Try changing your filter or search term.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={[
                    "group flex gap-3 px-4 py-4 transition-colors",
                    notification.unread
                      ? "bg-brand-muted/20"
                      : "hover:bg-surface-elevated/50",
                  ].join(" ")}
                >
                  {/* Icon */}
                  <div
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      getNotificationIconClass(notification.type),
                    ].join(" ")}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-center gap-2">
                        {notification.unread && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        )}

                        <p className="truncate text-xs font-semibold text-text">
                          {notification.title}
                        </p>
                      </div>

                      <span className="shrink-0 text-[10px] text-text-muted">
                        {notification.time}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                      {notification.message}
                    </p>

                    {notification.unread && (
                      <button
                        type="button"
                        onClick={() => void markAsRead(notification.id)}
                        disabled={actionLoading === notification.id}
                        className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:text-cyan-300 disabled:opacity-50"
                      >
                        {actionLoading === notification.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Mark as read
                      </button>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => void removeNotification(notification.id)}
                    disabled={actionLoading === notification.id}
                    aria-label="Dismiss notification"
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted opacity-0 transition-all hover:bg-surface-elevated hover:text-text group-hover:opacity-100 disabled:opacity-50"
                  >
                    {actionLoading === notification.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Footer summary */}
        <div className="flex items-center justify-between px-1 text-[11px] text-text-muted">
          <span>
            Showing {filteredNotifications.length} of {notifications.length}{" "}
            notifications
          </span>

          {unreadCount === 0 && notifications.length > 0 && (
            <span className="flex items-center gap-1 text-success">
              <Check className="h-3 w-3" />
              All caught up
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
