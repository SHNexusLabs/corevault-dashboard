"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Eye, Save, Shield } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";

import {
  getAdminSettings,
  updateAdminSettings,
  type AdminSetting,
  type AdminSettingsSection,
} from "@/lib/admin-settings";

type SettingsProps = {
  initialSection?: AdminSettingsSection;
};

const SETTINGS_SECTIONS: Array<{
  key: AdminSettingsSection;
  label: string;
}> = [
  { key: "store", label: "Store" },
  { key: "orders", label: "Orders" },
  { key: "inventory", label: "Inventory" },
  { key: "shipping", label: "Shipping" },
  { key: "payments", label: "Payments" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

function settingValue(
  settings: Map<string, AdminSetting>,
  key: string,
  fallback: unknown,
): unknown {
  return settings.get(key)?.value ?? fallback;
}

function stringValue(
  settings: Map<string, AdminSetting>,
  key: string,
  fallback = "",
): string {
  const value = settingValue(settings, key, fallback);

  return typeof value === "string" ? value : String(value ?? fallback);
}

function numberValue(
  settings: Map<string, AdminSetting>,
  key: string,
  fallback: number,
): number {
  const value = settingValue(settings, key, fallback);

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function booleanValue(
  settings: Map<string, AdminSetting>,
  key: string,
  fallback: boolean,
): boolean {
  const value = settingValue(settings, key, fallback);

  return typeof value === "boolean" ? value : fallback;
}

function SettingToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="relative inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />

      <div className="h-4 w-8 rounded-full border border-border bg-surface-elevated transition-colors peer-checked:bg-brand" />

      <div className="absolute left-0.5 h-3 w-3 rounded-full bg-text-muted transition-all peer-checked:translate-x-4 peer-checked:bg-surface" />
    </label>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-xs font-medium text-text">{label}</p>

        {description && (
          <p className="mt-0.5 text-[11px] text-text-muted">{description}</p>
        )}
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function Settings({ initialSection = "store" }: SettingsProps) {
  const [section, setSection] = useState<AdminSettingsSection>(initialSection);

  const [settings, setSettings] = useState<AdminSetting[]>([]);

  const [draft, setDraft] = useState<Record<string, unknown>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [success, setSuccess] = useState<string | null>(null);

  /*
   * Load settings for the selected section.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await getAdminSettings(section);

        if (cancelled) {
          return;
        }

        setSettings(response.settings);

        const nextDraft: Record<string, unknown> = {};

        for (const setting of response.settings) {
          nextDraft[setting.key] = setting.value;
        }

        setDraft(nextDraft);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Unable to load settings",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [section]);

  const settingMap = useMemo(() => {
    return new Map(settings.map((setting) => [setting.key, setting]));
  }, [settings]);

  const setValue = (key: string, value: unknown) => {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));

    setSuccess(null);
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const changedSettings = settings
        .filter((setting) => {
          return (
            JSON.stringify(draft[setting.key]) !== JSON.stringify(setting.value)
          );
        })
        .map((setting) => ({
          key: setting.key,
          value: draft[setting.key],
        }));

      if (changedSettings.length === 0) {
        setSuccess("No changes to save.");
        return;
      }

      const response = await updateAdminSettings(changedSettings);

      setSettings(response.settings);

      const nextDraft: Record<string, unknown> = {};

      for (const setting of response.settings) {
        nextDraft[setting.key] = setting.value;
      }

      setDraft(nextDraft);

      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings");
    } finally {
      setSaving(false);
    }
  };

  const renderStore = () => (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">
          Store Information
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Store Name"
            value={stringValue(settingMap, "store.name")}
            onChange={(event) => setValue("store.name", event.target.value)}
          />

          <Input
            label="Legal Business Name"
            value={stringValue(settingMap, "store.legal_business_name")}
            onChange={(event) =>
              setValue("store.legal_business_name", event.target.value)
            }
          />

          <Input
            label="GST Number"
            value={stringValue(settingMap, "store.gst_number")}
            onChange={(event) =>
              setValue("store.gst_number", event.target.value)
            }
          />

          <Input
            label="Email"
            value={stringValue(settingMap, "store.email")}
            onChange={(event) => setValue("store.email", event.target.value)}
          />

          <Input
            label="Phone"
            value={stringValue(settingMap, "store.phone")}
            onChange={(event) => setValue("store.phone", event.target.value)}
          />

          <Select
            label="Currency"
            value={stringValue(settingMap, "store.currency", "INR")}
            onChange={(event) => setValue("store.currency", event.target.value)}
          >
            <option value="INR">INR – Indian Rupee (₹)</option>
            <option value="USD">USD – US Dollar ($)</option>
          </Select>

          <Input
            label="Timezone"
            value={stringValue(settingMap, "store.timezone", "Asia/Kolkata")}
            onChange={(event) => setValue("store.timezone", event.target.value)}
          />

          <Select
            label="Tax Mode"
            value={stringValue(settingMap, "store.tax_mode", "inclusive")}
            onChange={(event) => setValue("store.tax_mode", event.target.value)}
          >
            <option value="inclusive">Inclusive</option>
            <option value="exclusive">Exclusive</option>
          </Select>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">
          Business Address
        </h3>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Address Line 1"
            value={stringValue(settingMap, "store.address_line_1")}
            onChange={(event) =>
              setValue("store.address_line_1", event.target.value)
            }
            className="sm:col-span-2"
          />

          <Input
            label="City"
            value={stringValue(settingMap, "store.city")}
            onChange={(event) => setValue("store.city", event.target.value)}
          />

          <Input
            label="State"
            value={stringValue(settingMap, "store.state")}
            onChange={(event) => setValue("store.state", event.target.value)}
          />

          <Input
            label="Pincode"
            value={stringValue(settingMap, "store.pincode")}
            onChange={(event) => setValue("store.pincode", event.target.value)}
          />

          <Select
            label="Country"
            value={stringValue(settingMap, "store.country", "India")}
            onChange={(event) => setValue("store.country", event.target.value)}
          >
            <option value="India">India</option>
          </Select>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="h-3.5 w-3.5" />}
            onClick={saveSettings}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderOrders = () => (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Order Settings</h3>

      <div className="space-y-1">
        <SettingRow
          label="Auto-confirm orders"
          description="Automatically confirm valid orders"
        >
          <SettingToggle
            checked={booleanValue(settingMap, "orders.auto_confirm", true)}
            onChange={(value) => setValue("orders.auto_confirm", value)}
          />
        </SettingRow>

        <SettingRow
          label="Allow cancellation"
          description="Allow customers to cancel eligible orders"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "orders.allow_cancellation",
              true,
            )}
            onChange={(value) => setValue("orders.allow_cancellation", value)}
          />
        </SettingRow>

        <SettingRow
          label="Cancellation window"
          description="Hours after ordering during which cancellation is allowed"
        >
          <input
            type="number"
            min={0}
            value={numberValue(
              settingMap,
              "orders.cancellation_window_hours",
              24,
            )}
            onChange={(event) =>
              setValue(
                "orders.cancellation_window_hours",
                Number(event.target.value),
              )
            }
            className="h-7 w-20 rounded-lg border border-border bg-surface-elevated text-center text-xs text-text focus:outline-none"
          />
        </SettingRow>

        <SettingRow
          label="Payment required before processing"
          description="Require successful payment before processing an order"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "orders.require_payment_before_processing",
              true,
            )}
            onChange={(value) =>
              setValue("orders.require_payment_before_processing", value)
            }
          />
        </SettingRow>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          icon={<Save className="h-3.5 w-3.5" />}
          onClick={saveSettings}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Card>
  );

  const renderInventory = () => (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">
        Inventory Settings
      </h3>

      <div className="space-y-1">
        <SettingRow
          label="Default low-stock threshold"
          description="Default threshold for newly created products"
        >
          <input
            type="number"
            min={0}
            value={numberValue(settingMap, "inventory.low_stock_default", 5)}
            onChange={(event) =>
              setValue(
                "inventory.low_stock_default",
                Number(event.target.value),
              )
            }
            className="h-7 w-20 rounded-lg border border-border bg-surface-elevated text-center text-xs text-text focus:outline-none"
          />
        </SettingRow>

        <SettingRow
          label="Allow backorders"
          description="Allow customers to order products with zero stock"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "inventory.allow_backorders",
              false,
            )}
            onChange={(value) => setValue("inventory.allow_backorders", value)}
          />
        </SettingRow>

        <SettingRow
          label="Auto-disable out-of-stock products"
          description="Disable products automatically when stock reaches zero"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "inventory.auto_disable_out_of_stock",
              false,
            )}
            onChange={(value) =>
              setValue("inventory.auto_disable_out_of_stock", value)
            }
          />
        </SettingRow>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          icon={<Save className="h-3.5 w-3.5" />}
          onClick={saveSettings}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Card>
  );

  const renderShipping = () => {
    const shippingMethods = [
      {
        key: "standard",
        name: "Standard Delivery",
        daysKey: "shipping.standard.days",
        priceKey: "shipping.standard.price",
      },
      {
        key: "express",
        name: "Express Delivery",
        daysKey: "shipping.express.days",
        priceKey: "shipping.express.price",
      },
      {
        key: "same_day",
        name: "Same Day Delivery",
        daysKey: "shipping.same_day.days",
        priceKey: "shipping.same_day.price",
      },
    ];

    return (
      <div className="space-y-4">
        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">
            Shipping Methods
          </h3>

          <div className="divide-y divide-border/50">
            {shippingMethods.map((method) => (
              <div
                key={method.key}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="text-xs font-medium text-text">{method.name}</p>

                  <p className="text-[11px] text-text-muted">
                    {stringValue(settingMap, method.daysKey)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-brand">
                    ₹{numberValue(settingMap, method.priceKey, 0)}
                  </span>

                  <SettingToggle
                    checked={booleanValue(
                      settingMap,
                      `shipping.${method.key}.enabled`,
                      true,
                    )}
                    onChange={(value) =>
                      setValue(`shipping.${method.key}.enabled`, value)
                    }
                  />
                </div>
              </div>
            ))}

            <div className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-xs font-medium text-text">Free Shipping</p>

                <p className="text-[11px] text-text-muted">
                  Standard delivery – free above ₹
                  {numberValue(settingMap, "shipping.free.threshold", 999)}
                </p>
              </div>

              <SettingToggle
                checked={booleanValue(
                  settingMap,
                  "shipping.free.enabled",
                  true,
                )}
                onChange={(value) => setValue("shipping.free.enabled", value)}
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-sm font-semibold text-text">
            Courier Partners
          </h3>

          <p className="mb-3 text-xs text-text-muted">
            Configure courier API integrations for automated tracking and label
            generation.
          </p>

          {["Bluedart", "Delhivery", "Ekart", "DTDC", "FedEx"].map(
            (courier) => (
              <div
                key={courier}
                className="flex items-center justify-between border-b border-border/50 py-2.5 last:border-0"
              >
                <span className="text-xs font-medium text-text">{courier}</span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted">
                    Not configured
                  </span>

                  <Button variant="outline" size="xs" disabled>
                    Configure
                  </Button>
                </div>
              </div>
            ),
          )}
        </Card>

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={<Save className="h-3.5 w-3.5" />}
            onClick={saveSettings}
            disabled={saving || loading}
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-warning/20 bg-warning-muted p-3">
        <Shield className="h-4 w-4 shrink-0 text-warning" />

        <p className="text-xs text-text-secondary">
          Payment credentials are stored encrypted. API keys are never displayed
          in full after initial setup.
        </p>
      </div>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">
          Payment Providers
        </h3>

        {["Razorpay", "PayU", "PhonePe"].map((provider) => (
          <div
            key={provider}
            className="border-b border-border/50 py-3 last:border-0"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text">
                  {provider}
                </span>

                <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                  Not configured
                </span>
              </div>

              <Button variant="outline" size="xs" disabled>
                Configure
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex-1 font-mono text-[11px] text-text-muted">
                Credentials managed separately
              </span>

              <Eye className="h-3.5 w-3.5 text-text-muted" />
            </div>
          </div>
        ))}
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">
          Refund Settings
        </h3>

        <div className="space-y-1">
          <SettingRow
            label="Auto-refund on cancellation"
            description="Automatically initiate refund when order is cancelled"
          >
            <SettingToggle
              checked={booleanValue(
                settingMap,
                "payments.auto_refund_on_cancellation",
                true,
              )}
              onChange={(value) =>
                setValue("payments.auto_refund_on_cancellation", value)
              }
            />
          </SettingRow>

          <SettingRow
            label="Require approval for refunds"
            description="Super Admin must approve large refunds"
          >
            <SettingToggle
              checked={booleanValue(
                settingMap,
                "payments.refund_approval_required",
                true,
              )}
              onChange={(value) =>
                setValue("payments.refund_approval_required", value)
              }
            />
          </SettingRow>

          <SettingRow
            label="Refund approval threshold"
            description="Refund amount above which approval is required"
          >
            <input
              type="number"
              min={0}
              value={numberValue(
                settingMap,
                "payments.refund_approval_threshold",
                10000,
              )}
              onChange={(event) =>
                setValue(
                  "payments.refund_approval_threshold",
                  Number(event.target.value),
                )
              }
              className="h-7 w-24 rounded-lg border border-border bg-surface-elevated text-center text-xs text-text focus:outline-none"
            />
          </SettingRow>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          icon={<Save className="h-3.5 w-3.5" />}
          onClick={saveSettings}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-text">Notifications</h3>

      <div className="space-y-1">
        <SettingRow
          label="Order confirmation"
          description="Send notification when an order is confirmed"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "notifications.order_confirmation",
              true,
            )}
            onChange={(value) =>
              setValue("notifications.order_confirmation", value)
            }
          />
        </SettingRow>

        <SettingRow
          label="Order shipped"
          description="Send notification when an order is shipped"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "notifications.order_shipped",
              true,
            )}
            onChange={(value) => setValue("notifications.order_shipped", value)}
          />
        </SettingRow>

        <SettingRow
          label="Order delivered"
          description="Send notification when an order is delivered"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "notifications.order_delivered",
              true,
            )}
            onChange={(value) =>
              setValue("notifications.order_delivered", value)
            }
          />
        </SettingRow>

        <SettingRow
          label="Low stock"
          description="Notify administrators about low stock"
        >
          <SettingToggle
            checked={booleanValue(settingMap, "notifications.low_stock", true)}
            onChange={(value) => setValue("notifications.low_stock", value)}
          />
        </SettingRow>

        <SettingRow
          label="New customer"
          description="Notify administrators when a new customer registers"
        >
          <SettingToggle
            checked={booleanValue(
              settingMap,
              "notifications.new_customer",
              true,
            )}
            onChange={(value) => setValue("notifications.new_customer", value)}
          />
        </SettingRow>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          variant="primary"
          size="sm"
          icon={<Save className="h-3.5 w-3.5" />}
          onClick={saveSettings}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </Card>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">
          Password Policy
        </h3>

        <div className="space-y-1">
          <SettingRow label="Minimum password length">
            <input
              type="number"
              min={6}
              value={numberValue(
                settingMap,
                "security.minimum_password_length",
                12,
              )}
              onChange={(event) =>
                setValue(
                  "security.minimum_password_length",
                  Number(event.target.value),
                )
              }
              className="h-7 w-16 rounded-lg border border-border bg-surface-elevated text-center text-xs text-text focus:outline-none"
            />
          </SettingRow>

          <SettingRow label="Require uppercase letters">
            <SettingToggle
              checked={booleanValue(
                settingMap,
                "security.require_uppercase",
                true,
              )}
              onChange={(value) =>
                setValue("security.require_uppercase", value)
              }
            />
          </SettingRow>

          <SettingRow label="Require numbers">
            <SettingToggle
              checked={booleanValue(
                settingMap,
                "security.require_numbers",
                true,
              )}
              onChange={(value) => setValue("security.require_numbers", value)}
            />
          </SettingRow>

          <SettingRow label="Require special characters">
            <SettingToggle
              checked={booleanValue(
                settingMap,
                "security.require_special_characters",
                true,
              )}
              onChange={(value) =>
                setValue("security.require_special_characters", value)
              }
            />
          </SettingRow>

          <SettingRow label="Password expiry (days)">
            <input
              type="number"
              min={0}
              value={numberValue(
                settingMap,
                "security.password_expiry_days",
                90,
              )}
              onChange={(event) =>
                setValue(
                  "security.password_expiry_days",
                  Number(event.target.value),
                )
              }
              className="h-7 w-16 rounded-lg border border-border bg-surface-elevated text-center text-xs text-text focus:outline-none"
            />
          </SettingRow>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-4 text-sm font-semibold text-text">
          Session & Login
        </h3>

        <div className="space-y-1">
          <SettingRow
            label="Session Timeout"
            description="Auto-logout after inactivity"
          >
            <Select
              className="w-28"
              value={String(
                numberValue(settingMap, "security.session_timeout_minutes", 30),
              )}
              onChange={(event) =>
                setValue(
                  "security.session_timeout_minutes",
                  Number(event.target.value),
                )
              }
            >
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </Select>
          </SettingRow>

          <SettingRow
            label="Max login attempts"
            description="Account locked after N failed attempts"
          >
            <input
              type="number"
              min={1}
              value={numberValue(settingMap, "security.max_login_attempts", 5)}
              onChange={(event) =>
                setValue(
                  "security.max_login_attempts",
                  Number(event.target.value),
                )
              }
              className="h-7 w-16 rounded-lg border border-border bg-surface-elevated text-center text-xs text-text focus:outline-none"
            />
          </SettingRow>

          <SettingRow
            label="Two-Factor Authentication"
            description="Require 2FA for Super Admin"
          >
            <span className="rounded border border-border bg-surface-elevated px-2 py-1 text-[10px] text-text-muted">
              Coming Soon
            </span>
          </SettingRow>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-text">
          Active Sessions
        </h3>

        <div className="rounded-lg border border-border bg-surface-elevated/40 px-3 py-4 text-center">
          <p className="text-xs text-text-muted">
            Active session management is not available yet.
          </p>

          <p className="mt-1 text-[11px] text-text-muted">
            Session tracking will be enabled when the authentication session
            system is added.
          </p>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="primary"
          size="sm"
          icon={<Save className="h-3.5 w-3.5" />}
          onClick={saveSettings}
          disabled={saving || loading}
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case "store":
        return renderStore();

      case "orders":
        return renderOrders();

      case "inventory":
        return renderInventory();

      case "shipping":
        return renderShipping();

      case "payments":
        return renderPayments();

      case "notifications":
        return renderNotifications();

      case "security":
        return renderSecurity();

      default:
        return null;
    }
  };

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-5">
      <div className="mx-auto w-full max-w-7xl">
        <Card className="mb-5 p-1.5">
          <div
            className="flex gap-1 overflow-x-auto"
            role="tablist"
            aria-label="Settings sections"
          >
            {SETTINGS_SECTIONS.map((item) => {
              const active = section === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`settings-panel-${item.key}`}
                  onClick={() => {
                    if (!saving) {
                      setSection(item.key);
                    }
                  }}
                  disabled={saving}
                  className={[
                    "shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-brand/40",
                    active
                      ? "bg-brand text-surface"
                      : "text-text-muted hover:bg-surface-elevated hover:text-text",
                    saving ? "cursor-not-allowed opacity-60" : "",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </Card>

        <div
          id={`settings-panel-${section}`}
          role="tabpanel"
          aria-label={`${
            SETTINGS_SECTIONS.find((item) => item.key === section)?.label ??
            "Settings"
          } settings`}
        >
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-text-muted">Loading settings...</p>
            </Card>
          ) : error ? (
            <Card className="border-red-500/20 bg-red-500/5 p-6">
              <p className="text-sm text-red-400">{error}</p>
            </Card>
          ) : (
            <>
              {success && (
                <div className="mb-4 rounded-lg border border-success/20 bg-success-muted px-3 py-2 text-xs text-success">
                  {success}
                </div>
              )}

              {renderSection()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
