"use client";

import { cn } from "@/lib/utils";
import type { Page, UserRole } from "@/lib/types";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  Truck,
  RotateCcw,
  Box,
  Tag,
  Warehouse,
  Users,
  BarChart2,
  CreditCard,
  FileText,
  Bell,
  UserCog,
  Shield,
  Activity,
  Store,
  ChevronRight,
  Moon,
  Sun,
  X,
  Layers,
  PackageCheck,
  PackageOpen,
} from "lucide-react";

interface NavItem {
  label: string;
  page: Page;
  icon: React.ReactNode;
  badge?: number;
  superAdminOnly?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  superAdminOnly?: boolean;
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        page: "dashboard",
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Orders",
    items: [
      {
        label: "All Orders",
        page: "orders",
        icon: <ShoppingCart className="h-4 w-4" />,
      },
      {
        label: "Processing",
        page: "processing",
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: "Packing",
        page: "packing",
        icon: <PackageOpen className="h-4 w-4" />,
        badge: 12,
      },
      {
        label: "Ready to Ship",
        page: "ready-to-ship",
        icon: <PackageCheck className="h-4 w-4" />,
      },
      {
        label: "Shipping",
        page: "shipping",
        icon: <Truck className="h-4 w-4" />,
      },
      {
        label: "Returns",
        page: "returns",
        icon: <RotateCcw className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Products",
        page: "products",
        icon: <Box className="h-4 w-4" />,
      },
      {
        label: "Categories",
        page: "categories",
        icon: <Tag className="h-4 w-4" />,
      },
      {
        label: "Inventory",
        page: "inventory",
        icon: <Warehouse className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        label: "Customers",
        page: "customers",
        icon: <Users className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Payments",
        page: "payments",
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        label: "Invoices",
        page: "invoices",
        icon: <FileText className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        label: "Analytics",
        page: "analytics",
        icon: <BarChart2 className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        label: "Notifications",
        page: "notifications",
        icon: <Bell className="h-4 w-4" />,
        badge: 8,
      },
    ],
  },
  {
    title: "Administration",
    superAdminOnly: true,
    items: [
      {
        label: "Staff",
        page: "staff",
        icon: <UserCog className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Roles & Permissions",
        page: "roles-permissions",
        icon: <Shield className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Activity Log",
        page: "activity-log",
        icon: <Activity className="h-4 w-4" />,
        superAdminOnly: true,
      },
    ],
  },
  {
    title: "Settings",
    superAdminOnly: true,
    items: [
      {
        label: "Store",
        page: "settings-store",
        icon: <Store className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Orders",
        page: "settings-orders",
        icon: <ShoppingCart className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Inventory",
        page: "settings-inventory",
        icon: <Warehouse className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Shipping",
        page: "settings-shipping",
        icon: <Truck className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Payments",
        page: "settings-payments",
        icon: <CreditCard className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Notifications",
        page: "settings-notifications",
        icon: <Bell className="h-4 w-4" />,
        superAdminOnly: true,
      },
      {
        label: "Security",
        page: "settings-security",
        icon: <Shield className="h-4 w-4" />,
        superAdminOnly: true,
      },
    ],
  },
];

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  role: UserRole;
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
}

export function Sidebar({
  currentPage,
  onNavigate,
  role,
  collapsed,
  onCollapse,
  theme,
  onThemeToggle,
}: SidebarProps) {
  const isSuperAdmin = role === "super_admin";

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-300",
        collapsed ? "w-14" : "w-56",
      )}
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div
        className={cn(
          "flex shrink-0 items-center gap-2.5 border-b border-border px-3 py-4",
          collapsed && "justify-center px-0",
        )}
      >
        <Image
          src="/corevault.png"
          alt="CoreVault"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 object-contain"
        />

        {!collapsed && (
          <>
            <span className="whitespace-nowrap text-sm font-bold tracking-wide text-text">
              CORE VAULT
            </span>

            <button
              type="button"
              aria-label="Collapse sidebar"
              className="ml-auto flex h-6 w-6 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50"
              onClick={() => onCollapse(true)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto py-2",
          "scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border",
          collapsed ? "px-1.5" : "px-2",
        )}
      >
        {NAV_SECTIONS.map((section) => {
          if (section.superAdminOnly && !isSuperAdmin) {
            return null;
          }

          const visibleItems = section.items.filter(
            (item) => !item.superAdminOnly || isSuperAdmin,
          );

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div key={section.title} className="mb-1">
              {/* Section heading */}
              {!collapsed ? (
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                  {section.title}
                </p>
              ) : (
                <div className="my-1.5 border-t border-border/40" />
              )}

              {/* Items */}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    currentPage === item.page ||
                    currentPage.startsWith(`${item.page}-`);

                  return (
                    <button
                      key={item.page}
                      type="button"
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex w-full items-center rounded-lg text-xs font-medium",
                        "transition-[background-color,color,transform] duration-150",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50",
                        collapsed
                          ? "mx-auto h-9 w-10 justify-center px-0"
                          : "h-8 gap-2.5 px-2",
                        isActive
                          ? "bg-brand-muted text-brand"
                          : "text-text-muted hover:bg-surface-elevated hover:text-text",
                      )}
                      onClick={() => onNavigate(item.page)}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute bg-brand",
                            collapsed
                              ? "left-0 h-4 w-0.5 rounded-r-full"
                              : "left-0 h-4 w-0.5 rounded-r-full",
                          )}
                        />
                      )}

                      {/* Icon */}
                      <span
                        className={cn(
                          "flex shrink-0 items-center justify-center transition-colors",
                          isActive
                            ? "text-brand"
                            : "text-text-muted group-hover:text-text-secondary",
                        )}
                      >
                        {item.icon}
                      </span>

                      {/* Label + badge */}
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate text-left">
                            {item.label}
                          </span>

                          {item.badge !== undefined ? (
                            <span
                              className={cn(
                                "flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full px-1",
                                "text-[10px] font-bold leading-none",
                                isActive
                                  ? "bg-brand text-surface"
                                  : "bg-brand/15 text-brand",
                              )}
                            >
                              {item.badge > 99 ? "99+" : item.badge}
                            </span>
                          ) : (
                            isActive && (
                              <ChevronRight className="h-3 w-3 shrink-0 text-brand/60" />
                            )
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div
        className={cn(
          "shrink-0 border-t border-border py-3",
          collapsed ? "flex justify-center px-0" : "px-3",
        )}
      >
        {collapsed ? (
          <button
            type="button"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-elevated text-text-muted transition-colors hover:border-brand/30 hover:text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50"
            onClick={onThemeToggle}
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <div className="flex rounded-lg border border-border bg-surface-elevated p-0.5">
            <button
              type="button"
              aria-pressed={theme === "dark"}
              className={cn(
                "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium",
                "transition-[background-color,color,box-shadow] duration-150",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50",
                theme === "dark"
                  ? "bg-surface-card text-text shadow-sm"
                  : "text-text-muted hover:text-text",
              )}
              onClick={() => {
                if (theme !== "dark") {
                  onThemeToggle();
                }
              }}
            >
              <Moon className="h-3 w-3" />
              Dark
            </button>

            <button
              type="button"
              aria-pressed={theme === "light"}
              className={cn(
                "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium",
                "transition-[background-color,color,box-shadow] duration-150",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50",
                theme === "light"
                  ? "bg-surface-card text-text shadow-sm"
                  : "text-text-muted hover:text-text",
              )}
              onClick={() => {
                if (theme !== "light") {
                  onThemeToggle();
                }
              }}
            >
              <Sun className="h-3 w-3" />
              Light
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
