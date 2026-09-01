"use client";

import { useState } from "react";
import { Shield, Check, Info, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Role = "admin" | "super_admin";

const ROLES: {
  value: Role;
  label: string;
  desc: string;
  color: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
    desc: "Operational staff",
    color: "text-blue-400",
  },
  {
    value: "super_admin",
    label: "Super Admin",
    desc: "System owner",
    color: "text-brand",
  },
];

const PERMISSIONS = [
  {
    section: "Operations",
    perms: [
      { id: "dashboard", label: "Dashboard", desc: "View the main dashboard" },
      { id: "orders.view", label: "Orders – View", desc: "View all orders" },
      {
        id: "orders.manage",
        label: "Orders – Manage",
        desc: "Update order status, add notes",
      },
      {
        id: "fulfillment",
        label: "Fulfillment",
        desc: "Processing, packing, shipping queues",
      },
      {
        id: "packing",
        label: "Packing",
        desc: "Access packing queue and packing details",
      },
      {
        id: "shipping",
        label: "Shipping",
        desc: "Shipping queue, courier assignment",
      },
      {
        id: "returns",
        label: "Returns",
        desc: "View and manage return requests",
      },
    ],
  },
  {
    section: "Catalog",
    perms: [
      {
        id: "products.view",
        label: "Products – View",
        desc: "View product catalog",
      },
      {
        id: "products.manage",
        label: "Products – Manage",
        desc: "Create, edit, archive products",
      },
      {
        id: "categories",
        label: "Categories",
        desc: "Manage product categories",
      },
      {
        id: "inventory.view",
        label: "Inventory – View",
        desc: "View stock levels",
      },
      {
        id: "inventory.adjust",
        label: "Inventory – Adjust",
        desc: "Adjust stock quantities",
      },
    ],
  },
  {
    section: "Customers & Finance",
    perms: [
      {
        id: "customers",
        label: "Customers",
        desc: "View and manage customer accounts",
      },
      {
        id: "payments.view",
        label: "Payments – View",
        desc: "View payment transactions",
      },
      {
        id: "payments.refund",
        label: "Payments – Refund",
        desc: "Initiate and approve refunds",
      },
      { id: "invoices", label: "Invoices", desc: "View and download invoices" },
      {
        id: "analytics",
        label: "Analytics",
        desc: "View analytics and reports",
      },
      { id: "export", label: "Data Export", desc: "Export data to CSV/Excel" },
    ],
  },
  {
    section: "Administration",
    superAdminOnly: true,
    perms: [
      {
        id: "staff",
        label: "Staff Management",
        desc: "Create and manage staff accounts",
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        desc: "Manage roles and permissions",
      },
      { id: "audit", label: "Audit Log", desc: "View system audit logs" },
      {
        id: "critical_overrides",
        label: "Critical Overrides",
        desc: "Force cancel, bulk delete, etc.",
      },
    ],
  },
  {
    section: "System Settings",
    superAdminOnly: true,
    perms: [
      {
        id: "settings.store",
        label: "Store Settings",
        desc: "Business info, currency, branding",
      },
      {
        id: "settings.orders",
        label: "Order Settings",
        desc: "Order processing configuration",
      },
      {
        id: "settings.inventory",
        label: "Inventory Settings",
        desc: "Stock configuration",
      },
      {
        id: "settings.shipping",
        label: "Shipping Settings",
        desc: "Couriers, methods, zones",
      },
      {
        id: "settings.payments",
        label: "Payment Settings",
        desc: "Payment providers configuration",
      },
      {
        id: "settings.security",
        label: "Security Settings",
        desc: "Password policy, sessions, lockout",
      },
    ],
  },
];

const ADMIN_DEFAULT: Set<string> = new Set([
  "dashboard",
  "orders.view",
  "orders.manage",
  "fulfillment",
  "packing",
  "shipping",
  "returns",
  "products.view",
  "products.manage",
  "categories",
  "inventory.view",
  "inventory.adjust",
  "customers",
  "payments.view",
  "invoices",
  "analytics",
  "export",
]);

const SUPER_ADMIN_ALL: Set<string> = new Set(
  PERMISSIONS.flatMap((s) => s.perms.map((p) => p.id)),
);

export function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [adminPerms, setAdminPerms] = useState<Set<string>>(
    new Set(ADMIN_DEFAULT),
  );
  const [changed, setChanged] = useState(false);

  const currentPerms =
    selectedRole === "super_admin" ? SUPER_ADMIN_ALL : adminPerms;

  const togglePerm = (id: string) => {
    if (selectedRole === "super_admin") return;
    const n = new Set(adminPerms);
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
    }
    setAdminPerms(n);
    setChanged(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Role tabs */}
      <div className="flex items-center gap-3">
        {ROLES.map((r) => (
          <button
            key={r.value}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
              selectedRole === r.value
                ? "border-brand/40 bg-brand-muted"
                : "border-border bg-surface-card hover:border-border/80",
            )}
            onClick={() => setSelectedRole(r.value)}
          >
            <Shield className={`w-5 h-5 ${r.color}`} />
            <div>
              <p className="text-sm font-semibold text-text">{r.label}</p>
              <p className="text-[11px] text-text-muted">{r.desc}</p>
            </div>
            {selectedRole === r.value && (
              <Check className="w-4 h-4 text-brand ml-2" />
            )}
          </button>
        ))}

        {changed && selectedRole === "admin" && (
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setAdminPerms(new Set(ADMIN_DEFAULT));
                setChanged(false);
              }}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setChanged(false)}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {selectedRole === "super_admin" && (
        <div className="bg-brand-muted border border-brand/20 rounded-xl p-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-brand shrink-0" />
          <p className="text-xs text-text-secondary">
            Super Admin has all permissions and they cannot be modified. This
            role is restricted to system owners only.
          </p>
        </div>
      )}

      {/* Permission matrix */}
      <div className="space-y-4">
        {PERMISSIONS.map((section) => {
          if (section.superAdminOnly && selectedRole !== "super_admin")
            return null;
          return (
            <Card key={section.section}>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-text">
                    {section.section}
                  </h3>
                  {section.superAdminOnly && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-muted text-brand border border-brand/20 font-medium">
                      Super Admin Only
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-text-muted font-mono">
                  {section.perms.filter((p) => currentPerms.has(p.id)).length}/
                  {section.perms.length}
                </span>
              </div>
              <div className="divide-y divide-border/50">
                {section.perms.map((perm) => {
                  const enabled = currentPerms.has(perm.id);
                  const locked = selectedRole === "super_admin";
                  return (
                    <div
                      key={perm.id}
                      className={cn(
                        "px-4 py-2.5 flex items-center gap-3 transition-colors",
                        !locked && "cursor-pointer hover:bg-surface-elevated",
                      )}
                      onClick={() => !locked && togglePerm(perm.id)}
                    >
                      <div
                        className={cn(
                          "w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors border",
                          enabled
                            ? "bg-brand border-brand text-surface"
                            : "border-border bg-surface-elevated text-transparent",
                        )}
                      >
                        {enabled && <Check className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-xs font-medium transition-colors",
                            enabled ? "text-text" : "text-text-secondary",
                          )}
                        >
                          {perm.label}
                        </p>
                        <p className="text-[11px] text-text-muted">
                          {perm.desc}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "text-[11px] font-mono font-medium transition-colors",
                          enabled ? "text-success" : "text-text-muted",
                        )}
                      >
                        {enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Future roles note */}
      <div className="border border-dashed border-border/50 rounded-xl p-4 text-center">
        <p className="text-xs text-text-muted">
          Future roles (Packing Staff, Inventory Staff, Support Staff, Warehouse
          Manager) can be added without redesigning this interface.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          icon={<Plus className="w-3 h-3" />}
        >
          Create Custom Role
        </Button>
      </div>
    </div>
  );
}
