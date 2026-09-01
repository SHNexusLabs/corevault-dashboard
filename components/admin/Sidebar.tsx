"use client";

import { cn } from "@/lib/utils";
import type { Page, UserRole } from "@/lib/types";
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
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Orders",
    items: [
      {
        label: "All Orders",
        page: "orders",
        icon: <ShoppingCart className="w-4 h-4" />,
      },
      {
        label: "Processing",
        page: "processing",
        icon: <Layers className="w-4 h-4" />,
      },
      {
        label: "Packing",
        page: "packing",
        icon: <PackageOpen className="w-4 h-4" />,
        badge: 12,
      },
      {
        label: "Ready to Ship",
        page: "ready-to-ship",
        icon: <PackageCheck className="w-4 h-4" />,
      },
      {
        label: "Shipping",
        page: "shipping",
        icon: <Truck className="w-4 h-4" />,
      },
      {
        label: "Returns",
        page: "returns",
        icon: <RotateCcw className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Catalog",
    items: [
      {
        label: "Products",
        page: "products",
        icon: <Box className="w-4 h-4" />,
      },
      {
        label: "Categories",
        page: "categories",
        icon: <Tag className="w-4 h-4" />,
      },
      {
        label: "Inventory",
        page: "inventory",
        icon: <Warehouse className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        label: "Customers",
        page: "customers",
        icon: <Users className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Payments",
        page: "payments",
        icon: <CreditCard className="w-4 h-4" />,
      },
      {
        label: "Invoices",
        page: "invoices",
        icon: <FileText className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        label: "Analytics",
        page: "analytics",
        icon: <BarChart2 className="w-4 h-4" />,
      },
    ],
  },
  {
    title: "Notifications",
    items: [
      {
        label: "Notifications",
        page: "notifications",
        icon: <Bell className="w-4 h-4" />,
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
        icon: <UserCog className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Roles & Permissions",
        page: "roles-permissions",
        icon: <Shield className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Activity Log",
        page: "activity-log",
        icon: <Activity className="w-4 h-4" />,
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
        icon: <Store className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Orders",
        page: "settings-orders",
        icon: <ShoppingCart className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Inventory",
        page: "settings-inventory",
        icon: <Warehouse className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Shipping",
        page: "settings-shipping",
        icon: <Truck className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Payments",
        page: "settings-payments",
        icon: <CreditCard className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Notifications",
        page: "settings-notifications",
        icon: <Bell className="w-4 h-4" />,
        superAdminOnly: true,
      },
      {
        label: "Security",
        page: "settings-security",
        icon: <Shield className="w-4 h-4" />,
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
  onCollapse: (c: boolean) => void;
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
        "flex flex-col h-full bg-surface border-r border-border transition-all duration-300 shrink-0",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex items-center gap-2.5 px-3 py-4 border-b border-border shrink-0",
          collapsed && "justify-center px-0",
        )}
      >
        <div className="w-8 h-8 shrink-0">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2L28 8.5V23.5L16 30L4 23.5V8.5L16 2Z"
              fill="#22d3ee"
              fillOpacity="0.15"
              stroke="#22d3ee"
              strokeWidth="1.5"
            />
            <rect
              x="11"
              y="11"
              width="10"
              height="10"
              rx="2"
              stroke="#22d3ee"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M14 16h4M16 14v4"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-text tracking-wide whitespace-nowrap">
            CORE VAULT
          </span>
        )}
        {!collapsed && (
          <button
            className="ml-auto w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
            onClick={() => onCollapse(true)}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
        {NAV_SECTIONS.map((section) => {
          if (section.superAdminOnly && !isSuperAdmin) return null;
          const visibleItems = section.items.filter(
            (item) => !item.superAdminOnly || isSuperAdmin,
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-1">
              {!collapsed && (
                <p className="px-2 py-1.5 text-[10px] font-semibold tracking-widest text-text-muted uppercase">
                  {section.title}
                </p>
              )}
              {collapsed && <div className="my-1 border-t border-border/50" />}
              {visibleItems.map((item) => {
                const isActive =
                  currentPage === item.page ||
                  currentPage.startsWith(item.page + "-");
                return (
                  <button
                    key={item.page}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 group",
                      collapsed && "justify-center px-0 w-10 mx-auto",
                      isActive
                        ? "bg-brand-muted text-brand"
                        : "text-text-muted hover:text-text hover:bg-surface-elevated",
                    )}
                    onClick={() => onNavigate(item.page)}
                    title={collapsed ? item.label : undefined}
                  >
                    <span
                      className={cn(
                        "shrink-0",
                        isActive
                          ? "text-brand"
                          : "text-text-muted group-hover:text-text-secondary",
                      )}
                    >
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span className="min-w-4.5 h-4.5 bg-brand text-surface text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                            {item.badge}
                          </span>
                        ) : isActive ? (
                          <ChevronRight className="w-3 h-3 opacity-50" />
                        ) : null}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div
        className={cn(
          "px-3 py-3 border-t border-border shrink-0",
          collapsed && "px-0 flex justify-center",
        )}
      >
        {collapsed ? (
          <button
            className="w-8 h-8 rounded-lg bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            onClick={onThemeToggle}
          >
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <div className="flex items-center bg-surface-elevated border border-border rounded-lg p-0.5">
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-6 rounded text-xs font-medium transition-colors",
                theme === "dark"
                  ? "bg-surface-card text-text"
                  : "text-text-muted hover:text-text",
              )}
              onClick={() => theme !== "dark" && onThemeToggle()}
            >
              <Moon className="w-3 h-3" /> Dark
            </button>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 h-6 rounded text-xs font-medium transition-colors",
                theme === "light"
                  ? "bg-surface-card text-text"
                  : "text-text-muted hover:text-text",
              )}
              onClick={() => theme !== "light" && onThemeToggle()}
            >
              <Sun className="w-3 h-3" /> Light
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
