"use client";

import { useState, type ReactNode } from "react";
import {
  Store,
  ShoppingCart,
  Warehouse,
  Truck,
  CreditCard,
  Bell,
  Shield,
  Save,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import type { Page } from "@/lib/types";

type SettingsSection =
  | "store"
  | "orders"
  | "inventory"
  | "shipping"
  | "payments"
  | "notifications"
  | "security";

const SECTIONS: {
  value: SettingsSection;
  label: string;
  icon: ReactNode;
  page: Page;
}[] = [
  {
    value: "store",
    label: "Store",
    icon: <Store className="w-4 h-4" />,
    page: "settings-store",
  },
  {
    value: "orders",
    label: "Orders",
    icon: <ShoppingCart className="w-4 h-4" />,
    page: "settings-orders",
  },
  {
    value: "inventory",
    label: "Inventory",
    icon: <Warehouse className="w-4 h-4" />,
    page: "settings-inventory",
  },
  {
    value: "shipping",
    label: "Shipping",
    icon: <Truck className="w-4 h-4" />,
    page: "settings-shipping",
  },
  {
    value: "payments",
    label: "Payments",
    icon: <CreditCard className="w-4 h-4" />,
    page: "settings-payments",
  },
  {
    value: "notifications",
    label: "Notifications",
    icon: <Bell className="w-4 h-4" />,
    page: "settings-notifications",
  },
  {
    value: "security",
    label: "Security",
    icon: <Shield className="w-4 h-4" />,
    page: "settings-security",
  },
];

interface SettingsProps {
  initialSection?: SettingsSection;
}

export function Settings({ initialSection = "store" }: SettingsProps) {
  const [section, setSection] = useState<SettingsSection>(initialSection);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="flex gap-5">
        {/* Section nav */}
        <div className="w-44 shrink-0">
          <Card className="p-2">
            {SECTIONS.map((s) => (
              <button
                key={s.value}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${section === s.value ? "bg-brand-muted text-brand" : "text-text-muted hover:text-text hover:bg-surface-elevated"}`}
                onClick={() => setSection(s.value)}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {section === "store" && (
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Store Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Store Name" defaultValue="Core Vault" />
                  <Input
                    label="Legal Business Name"
                    defaultValue="Core Vault Technologies Pvt. Ltd."
                  />
                  <Input label="GST Number" defaultValue="27AAACK1234N1ZA" />
                  <Input label="Email" defaultValue="support@corevault.in" />
                  <Input label="Phone" defaultValue="+91 80000 00000" />
                  <Select label="Currency">
                    <option>INR – Indian Rupee (₹)</option>
                    <option>USD – US Dollar ($)</option>
                  </Select>
                  <Input label="Timezone" defaultValue="Asia/Kolkata" />
                  <Select label="Tax Mode">
                    <option>Inclusive</option>
                    <option>Exclusive</option>
                  </Select>
                </div>
              </Card>
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Business Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Address Line 1"
                    defaultValue="Unit 4A, Tech Park"
                    className="sm:col-span-2"
                  />
                  <Input label="City" defaultValue="Bengaluru" />
                  <Input label="State" defaultValue="Karnataka" />
                  <Input label="Pincode" defaultValue="560001" />
                  <Select label="Country">
                    <option>India</option>
                  </Select>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {section === "shipping" && (
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Shipping Methods
                </h3>
                <div className="divide-y divide-border/50">
                  {[
                    {
                      name: "Standard Delivery",
                      days: "3-5 business days",
                      price: "₹99",
                      enabled: true,
                    },
                    {
                      name: "Express Delivery",
                      days: "1-2 business days",
                      price: "₹299",
                      enabled: true,
                    },
                    {
                      name: "Same Day Delivery",
                      days: "Same day (order by 12 PM)",
                      price: "₹499",
                      enabled: true,
                    },
                    {
                      name: "Free Shipping",
                      days: "Standard delivery – free above ₹999",
                      price: "Free",
                      enabled: true,
                    },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-medium text-text">
                          {m.name}
                        </p>
                        <p className="text-[11px] text-text-muted">{m.days}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-brand">
                          {m.price}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            defaultChecked={m.enabled}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-surface-elevated border border-border rounded-full peer-checked:bg-brand transition-colors" />
                          <div className="absolute left-0.5 w-3 h-3 bg-text-muted rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-surface" />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Courier Partners
                </h3>
                <p className="text-xs text-text-muted mb-3">
                  Configure courier API integrations for automated tracking and
                  label generation.
                </p>
                {[
                  {
                    name: "Bluedart",
                    status: "Connected",
                    color: "text-success",
                  },
                  {
                    name: "Delhivery",
                    status: "Connected",
                    color: "text-success",
                  },
                  { name: "Ekart", status: "Connected", color: "text-success" },
                  {
                    name: "DTDC",
                    status: "Not configured",
                    color: "text-text-muted",
                  },
                  {
                    name: "FedEx",
                    status: "Not configured",
                    color: "text-text-muted",
                  },
                ].map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                  >
                    <span className="text-xs font-medium text-text">
                      {c.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${c.color}`}>{c.status}</span>
                      <Button variant="outline" size="xs">
                        {c.status === "Connected" ? "Configure" : "Connect"}
                      </Button>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {section === "payments" && (
            <div className="space-y-4">
              <div className="bg-warning-muted border border-warning/20 rounded-xl p-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-warning shrink-0" />
                <p className="text-xs text-text-secondary">
                  Payment credentials are stored encrypted. API keys are never
                  displayed in full after initial setup.
                </p>
              </div>
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Payment Providers
                </h3>
                {[
                  {
                    name: "Razorpay",
                    status: "Active",
                    mode: "Live",
                    key: "rzp_live_••••••••••••••",
                  },
                  {
                    name: "PayU",
                    status: "Inactive",
                    mode: "Test",
                    key: "•••••••••••••",
                  },
                  {
                    name: "PhonePe",
                    status: "Active",
                    mode: "Live",
                    key: "ppe_live_••••••••••",
                  },
                ].map((p) => (
                  <div
                    key={p.name}
                    className="py-3 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-text">
                          {p.name}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${p.status === "Active" ? "bg-success-muted text-success" : "bg-surface-elevated text-text-muted"}`}
                        >
                          {p.status}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${p.mode === "Live" ? "bg-warning-muted text-warning" : "bg-blue-500/10 text-blue-300"}`}
                        >
                          {p.mode}
                        </span>
                      </div>
                      <Button variant="outline" size="xs">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-text-muted flex-1">
                        {p.key}
                      </span>
                      <button className="text-text-muted hover:text-text transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Refund Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-text">
                        Auto-refund on cancellation
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Automatically initiate refund when order is cancelled
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-surface-elevated border border-border rounded-full peer-checked:bg-brand transition-colors" />
                      <div className="absolute left-0.5 w-3 h-3 bg-text-muted rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-surface" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-text">
                        Require approval for refunds above ₹10,000
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Super Admin must approve large refunds
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-8 h-4 bg-surface-elevated border border-border rounded-full peer-checked:bg-brand transition-colors" />
                      <div className="absolute left-0.5 w-3 h-3 bg-text-muted rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-surface" />
                    </label>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {section === "security" && (
            <div className="space-y-4">
              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Password Policy
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Minimum password length",
                      input: (
                        <input
                          type="number"
                          defaultValue={12}
                          className="w-16 h-7 rounded-lg border border-border bg-surface-elevated text-xs text-center text-text focus:outline-none"
                        />
                      ),
                    },
                    {
                      label: "Require uppercase letters",
                      input: (
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded accent-brand"
                        />
                      ),
                    },
                    {
                      label: "Require numbers",
                      input: (
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded accent-brand"
                        />
                      ),
                    },
                    {
                      label: "Require special characters",
                      input: (
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 rounded accent-brand"
                        />
                      ),
                    },
                    {
                      label: "Password expiry (days)",
                      input: (
                        <input
                          type="number"
                          defaultValue={90}
                          className="w-16 h-7 rounded-lg border border-border bg-surface-elevated text-xs text-center text-text focus:outline-none"
                        />
                      ),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-xs text-text-secondary">
                        {row.label}
                      </span>
                      {row.input}
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-4">
                  Session & Login
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <p className="text-xs font-medium text-text">
                        Session Timeout
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Auto-logout after inactivity
                      </p>
                    </div>
                    <Select className="w-28">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>8 hours</option>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <div>
                      <p className="text-xs font-medium text-text">
                        Max login attempts
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Account locked after N failed attempts
                      </p>
                    </div>
                    <input
                      type="number"
                      defaultValue={5}
                      className="w-16 h-7 rounded-lg border border-border bg-surface-elevated text-xs text-center text-text focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-xs font-medium text-text">
                        Two-Factor Authentication
                      </p>
                      <p className="text-[11px] text-text-muted">
                        Require 2FA for Super Admin — coming soon
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded bg-surface-elevated text-text-muted border border-border">
                      Coming Soon
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-text mb-3">
                  Active Sessions
                </h3>
                {[
                  {
                    device: "Chrome / macOS",
                    ip: "49.36.xx.xx",
                    location: "Bengaluru, IN",
                    current: true,
                    time: "Current session",
                  },
                  {
                    device: "Safari / iPhone",
                    ip: "49.36.xx.xx",
                    location: "Bengaluru, IN",
                    current: false,
                    time: "2 hours ago",
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-text">
                          {s.device}
                        </p>
                        {s.current && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-success-muted text-success font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted">
                        {s.ip} · {s.location} · {s.time}
                      </p>
                    </div>
                    {!s.current && (
                      <Button variant="danger" size="xs">
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* Other settings sections placeholder */}
          {(section === "orders" ||
            section === "inventory" ||
            section === "notifications") && (
            <Card className="p-8 text-center">
              <p className="text-sm font-medium text-text mb-1">
                {SECTIONS.find((s) => s.value === section)?.label} Settings
              </p>
              <p className="text-xs text-text-muted">
                Configuration options for this section are available here.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                icon={<Save className="w-3.5 h-3.5" />}
              >
                Save Settings
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
