"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Page, UserRole } from "@/lib/types";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  X,
  Command,
  Activity,
} from "lucide-react";
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_CUSTOMERS } from "@/lib/data";
import { OrderStatusBadge } from "../ui/Badge";

const PAGE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  orders: "All Orders",
  "order-detail": "Order Details",
  processing: "Processing Queue",
  packing: "Packing Queue",
  "packing-detail": "Packing Details",
  "ready-to-ship": "Ready to Ship",
  shipping: "Shipping",
  returns: "Returns",
  "return-detail": "Return Details",
  products: "Products",
  "product-detail": "Product Details",
  categories: "Categories",
  inventory: "Inventory",
  customers: "Customers",
  "customer-detail": "Customer Details",
  analytics: "Analytics",
  payments: "Payments",
  invoices: "Invoices",
  notifications: "Notifications",
  staff: "Staff Management",
  "roles-permissions": "Roles & Permissions",
  "activity-log": "Activity Log",
  "settings-store": "Store Settings",
  "settings-orders": "Order Settings",
  "settings-inventory": "Inventory Settings",
  "settings-shipping": "Shipping Settings",
  "settings-payments": "Payment Settings",
  "settings-notifications": "Notification Settings",
  "settings-security": "Security Settings",
  profile: "My Profile",
};

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page, entityId?: string) => void;
  role: UserRole;
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  userName: string;
  onLogout?: () => void;
}

type Notification = {
  id: number;
  type: "order" | "payment" | "stock" | "return";
  message: string;
  time: string;
  unread: boolean;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    type: "order",
    message: "New order #CV-12549 placed",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "payment",
    message: "Payment received for #CV-12548",
    time: "5 min ago",
    unread: true,
  },
  {
    id: 3,
    type: "stock",
    message: "Low stock: Corsair RM850x PSU (3 left)",
    time: "18 min ago",
    unread: true,
  },
  {
    id: 4,
    type: "order",
    message: "Order #CV-12547 packed",
    time: "30 min ago",
    unread: true,
  },
  {
    id: 5,
    type: "return",
    message: "Return request for #CV-12530",
    time: "1h ago",
    unread: false,
  },
  {
    id: 6,
    type: "payment",
    message: "Payment failed for #CV-12542",
    time: "2h ago",
    unread: false,
  },
  {
    id: 7,
    type: "stock",
    message: "Out of stock: Crucial 32GB DDR5",
    time: "3h ago",
    unread: false,
  },
  {
    id: 8,
    type: "order",
    message: "Order #CV-12538 delivered",
    time: "4h ago",
    unread: false,
  },
];

export function Header({
  currentPage,
  onNavigate,
  role,
  onSidebarToggle,
  userName,
  onLogout,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const title = PAGE_TITLES[currentPage] || "Core Vault";

  /*
   * Keyboard shortcuts
   * Ctrl/Cmd + K -> open search
   * Escape -> close active dropdown/search
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        setSearchOpen(true);
        setProfileOpen(false);
        setNotifOpen(false);
        return;
      }

      if (event.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const searchResults =
    searchQuery.length >= 2
      ? [
          ...MOCK_ORDERS.filter(
            (o) =>
              o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
              o.customerName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              o.customerEmail
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              o.transactionId.toLowerCase().includes(searchQuery.toLowerCase()),
          )
            .slice(0, 3)
            .map((o) => ({
              type: "order" as const,
              id: o.id,
              label: o.id,
              sub: o.customerName,
              status: o.orderStatus,
            })),

          ...MOCK_PRODUCTS.filter(
            (p) =>
              p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.sku.toLowerCase().includes(searchQuery.toLowerCase()),
          )
            .slice(0, 3)
            .map((p) => ({
              type: "product" as const,
              id: p.id,
              label: p.name,
              sub: p.sku,
            })),

          ...MOCK_CUSTOMERS.filter(
            (c) =>
              c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              c.phone.includes(searchQuery),
          )
            .slice(0, 2)
            .map((c) => ({
              type: "customer" as const,
              id: c.id,
              label: c.name,
              sub: c.email,
            })),
        ]
      : [];

  const unreadCount = notifications.filter((n) => n.unread).length;

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  const markAllRead = () => {
    setNotifications((items) =>
      items.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  };

  const handleSearchResult = (
    type: "order" | "product" | "customer",
    id: string,
  ) => {
    if (type === "order") {
      onNavigate("order-detail", id);
    }

    if (type === "product") {
      onNavigate("product-detail", id);
    }

    if (type === "customer") {
      onNavigate("customer-detail", id);
    }

    closeSearch();
  };

  return (
    <header className="h-12 border-b border-border bg-surface flex items-center gap-3 px-4 shrink-0 relative z-30">
      {/* Sidebar toggle */}
      <button
        type="button"
        aria-label="Toggle sidebar"
        className="w-8 h-8 rounded-lg hover:bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text transition-colors"
        onClick={() => {
          onSidebarToggle();
          setProfileOpen(false);
          setNotifOpen(false);
        }}
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Page title */}
      <div className="hidden sm:flex items-center gap-2 min-w-0">
        <h1 className="text-sm font-semibold text-text truncate">{title}</h1>
      </div>

      {/* Small system status */}
      <div className="hidden lg:flex items-center gap-1.5 ml-1 text-[10px] text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-brand" />
        <span>Live</span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        {searchOpen ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />

              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search orders, products, customers..."
                className="h-8 w-72 pl-8 pr-8 rounded-lg border border-brand/40 bg-surface-elevated text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
              />

              <button
                type="button"
                aria-label="Close search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                onClick={closeSearch}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-10 right-0 w-80 bg-surface-card border border-border rounded-xl shadow-xl overflow-hidden z-50">
                {searchResults.map((result, index) => (
                  <button
                    type="button"
                    key={`${result.type}-${result.id}-${index}`}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-elevated transition-colors text-left"
                    onClick={() => handleSearchResult(result.type, result.id)}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase",
                        result.type === "order"
                          ? "bg-blue-500/15 text-blue-300"
                          : result.type === "product"
                            ? "bg-purple-500/15 text-purple-300"
                            : "bg-green-500/15 text-green-300",
                      )}
                    >
                      {result.type}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text truncate">
                        {result.label}
                      </p>

                      <p className="text-[11px] text-text-muted truncate">
                        {result.sub}
                      </p>
                    </div>

                    {"status" in result && result.status && (
                      <OrderStatusBadge status={result.status} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            aria-label="Open search"
            className="h-8 px-3 rounded-lg border border-border bg-surface-elevated text-xs text-text-muted hover:text-text flex items-center gap-2 hover:border-border/80 transition-colors"
            onClick={() => {
              setSearchOpen(true);
              setProfileOpen(false);
              setNotifOpen(false);
            }}
          >
            <Search className="w-3.5 h-3.5" />

            <span className="hidden md:inline">Search...</span>

            <span className="hidden md:flex items-center gap-0.5 text-[10px] border border-border rounded px-1 py-0.5">
              <Command className="w-2.5 h-2.5" /> K
            </span>
          </button>
        )}
      </div>

      {/* Notifications */}
      <div className="relative">
        <button
          type="button"
          aria-label="Notifications"
          className="relative w-8 h-8 rounded-lg hover:bg-surface-elevated flex items-center justify-center text-text-muted hover:text-text transition-colors"
          onClick={() => {
            setNotifOpen((open) => !open);
            setProfileOpen(false);
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <Bell className="w-4 h-4" />

          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {notifOpen && (
          <div className="absolute top-10 right-0 w-80 bg-surface-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-text">
                Notifications
              </span>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-[11px] text-brand hover:text-cyan-300"
                  onClick={markAllRead}
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-border/50">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-4 py-2.5 flex items-start gap-2.5 hover:bg-surface-elevated transition-colors cursor-pointer",
                    notification.unread && "bg-brand-muted/30",
                  )}
                >
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      notification.unread ? "bg-brand" : "bg-transparent",
                    )}
                  />

                  <div>
                    <p className="text-xs text-text leading-snug">
                      {notification.message}
                    </p>

                    <p className="text-[11px] text-text-muted mt-0.5">
                      {notification.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 border-t border-border">
              <button
                type="button"
                className="text-xs text-brand hover:text-cyan-300 w-full text-center"
                onClick={() => {
                  onNavigate("notifications");
                  setNotifOpen(false);
                }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          type="button"
          aria-label="Open profile menu"
          className="flex items-center gap-2 h-8 pl-1 pr-2 rounded-lg hover:bg-surface-elevated transition-colors"
          onClick={() => {
            setProfileOpen((open) => !open);
            setNotifOpen(false);
            setSearchOpen(false);
            setSearchQuery("");
          }}
        >
          <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-surface text-xs font-bold shrink-0">
            {userName
              .split(" ")
              .map((name) => name[0])
              .join("")
              .slice(0, 2)}
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-text leading-tight">
              {userName}
            </p>

            <p className="text-[10px] text-text-muted leading-tight">
              {role === "super_admin" ? "Super Admin" : "Admin"}
            </p>
          </div>

          <ChevronDown className="w-3 h-3 text-text-muted hidden sm:block" />
        </button>

        {profileOpen && (
          <div className="absolute top-10 right-0 w-48 bg-surface-card border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text transition-colors"
              onClick={() => {
                onNavigate("profile");
                setProfileOpen(false);
              }}
            >
              <User className="w-3.5 h-3.5" />
              My Profile
            </button>

            {role === "super_admin" && (
              <button
                type="button"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text transition-colors"
                onClick={() => {
                  onNavigate("settings-store");
                  setProfileOpen(false);
                }}
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </button>
            )}

            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-text-secondary hover:bg-surface-elevated hover:text-text transition-colors"
              onClick={() => {
                onNavigate("activity-log");
                setProfileOpen(false);
              }}
            >
              <Activity className="w-3.5 h-3.5" />
              Activity Log
            </button>

            <div className="my-1 border-t border-border" />

            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
              onClick={() => {
                setProfileOpen(false);
                onLogout?.();
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
