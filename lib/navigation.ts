import type { Page } from "@/lib/types";

export type NavigateFn = (page: Page, entityId?: string) => void;

export function pageToHref(page: Page, entityId?: string): string {
  switch (page) {
    case "dashboard":
      return "/admin";
    case "orders":
      return "/admin/orders";
    case "order-detail":
      return entityId ? `/admin/orders/${entityId}` : "/admin/orders";
    case "processing":
      return "/admin/orders/processing";
    case "packing":
      return "/admin/orders/packing";
    case "packing-detail":
      return entityId
        ? `/admin/orders/packing/${entityId}`
        : "/admin/orders/packing";
    case "ready-to-ship":
      return "/admin/orders/ready-to-ship";
    case "shipping":
      return "/admin/orders/shipping";
    case "returns":
      return "/admin/orders/returns";
    case "return-detail":
      return entityId
        ? `/admin/orders/returns/${entityId}`
        : "/admin/orders/returns";
    case "products":
      return "/admin/products";
    case "product-detail":
      return entityId ? `/admin/products/${entityId}` : "/admin/products";
    case "categories":
      return "/admin/categories";
    case "inventory":
      return "/admin/inventory";
    case "customers":
      return "/admin/customers";
    case "customer-detail":
      return entityId ? `/admin/customers/${entityId}` : "/admin/customers";
    case "analytics":
      return "/admin/analytics";
    case "payments":
      return "/admin/payments";
    case "invoices":
      return "/admin/invoices";
    case "notifications":
      return "/admin/notifications";
    case "staff":
      return "/admin/staff";
    case "roles-permissions":
      return "/admin/roles-permissions";
    case "activity-log":
      return "/admin/activity-log";
    case "settings-store":
      return "/admin/settings/store";
    case "settings-orders":
      return "/admin/settings/orders";
    case "settings-inventory":
      return "/admin/settings/inventory";
    case "settings-shipping":
      return "/admin/settings/shipping";
    case "settings-payments":
      return "/admin/settings/payments";
    case "settings-notifications":
      return "/admin/settings/notifications";
    case "settings-security":
      return "/admin/settings/security";
    case "profile":
      return "/admin/profile";
    default:
      return "/admin";
  }
}

export function pathToPage(pathname: string): Page {
  if (pathname === "/admin") return "dashboard";
  if (/^\/admin\/orders\/packing\/.+/.test(pathname)) return "packing-detail";
  if (/^\/admin\/orders\/returns\/.+/.test(pathname)) return "return-detail";
  if (
    /^\/admin\/orders\/[^/]+$/.test(pathname) &&
    !pathname.endsWith("/processing") &&
    !pathname.endsWith("/packing") &&
    !pathname.endsWith("/ready-to-ship") &&
    !pathname.endsWith("/shipping") &&
    !pathname.endsWith("/returns")
  )
    return "order-detail";
  if (pathname === "/admin/orders") return "orders";
  if (pathname === "/admin/orders/processing") return "processing";
  if (pathname === "/admin/orders/packing") return "packing";
  if (pathname === "/admin/orders/ready-to-ship") return "ready-to-ship";
  if (pathname === "/admin/orders/shipping") return "shipping";
  if (pathname === "/admin/orders/returns") return "returns";
  if (/^\/admin\/products\/.+/.test(pathname)) return "product-detail";
  if (pathname === "/admin/products") return "products";
  if (pathname === "/admin/categories") return "categories";
  if (pathname === "/admin/inventory") return "inventory";
  if (/^\/admin\/customers\/.+/.test(pathname)) return "customer-detail";
  if (pathname === "/admin/customers") return "customers";
  if (pathname === "/admin/analytics") return "analytics";
  if (pathname === "/admin/payments") return "payments";
  if (pathname === "/admin/invoices") return "invoices";
  if (pathname === "/admin/notifications") return "notifications";
  if (pathname === "/admin/staff") return "staff";
  if (pathname === "/admin/roles-permissions") return "roles-permissions";
  if (pathname === "/admin/activity-log") return "activity-log";
  if (pathname === "/admin/settings/store") return "settings-store";
  if (pathname === "/admin/settings/orders") return "settings-orders";
  if (pathname === "/admin/settings/inventory") return "settings-inventory";
  if (pathname === "/admin/settings/shipping") return "settings-shipping";
  if (pathname === "/admin/settings/payments") return "settings-payments";
  if (pathname === "/admin/settings/notifications")
    return "settings-notifications";
  if (pathname === "/admin/settings/security") return "settings-security";
  if (pathname === "/admin/profile") return "profile";
  return "404";
}
