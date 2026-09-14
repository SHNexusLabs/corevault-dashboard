"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Download, Filter, Loader2, X } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput, Select } from "@/components/ui/Input";
import {
  Table,
  Thead,
  Tbody,
  Th,
  Td,
  Tr,
  Pagination,
} from "@/components/ui/Table";

import { formatDate } from "@/lib/utils";
import { getAdminActivities, type AdminActivity } from "@/lib/admin-activity";

const MODULE_COLORS: Record<string, string> = {
  Orders: "bg-blue-500/15 text-blue-300",
  Inventory: "bg-cyan-500/15 text-cyan-300",
  Staff: "bg-purple-500/15 text-purple-300",
  Roles: "bg-indigo-500/15 text-indigo-300",
  Products: "bg-emerald-500/15 text-emerald-300",
  Settings: "bg-amber-500/15 text-amber-300",
  Payments: "bg-green-500/15 text-green-300",
  Customers: "bg-orange-500/15 text-orange-300",
  Catalog: "bg-teal-500/15 text-teal-300",
  System: "bg-surface-elevated text-text-muted",
};

const MODULE_ENTITY_TYPES: Record<string, string> = {
  Orders: "ORDER",
  Inventory: "INVENTORY",
  Staff: "USER",
  Roles: "ROLE",
  Products: "PRODUCT",
  Settings: "SETTINGS",
  Payments: "PAYMENT",
  Customers: "CUSTOMER",
  Catalog: "CATEGORY",
};

const MODULE_ORDER = [
  "Orders",
  "Inventory",
  "Staff",
  "Roles",
  "Products",
  "Settings",
  "Payments",
  "Customers",
  "Catalog",
];

function getModule(activity: AdminActivity): string {
  const entityType = activity.entityType.toUpperCase();

  /*
   * Inventory adjustments currently use PRODUCT
   * as their entity type, so action must take priority.
   */
  if (activity.action.startsWith("STOCK_")) {
    return "Inventory";
  }

  if (
    activity.action.startsWith("STAFF_") ||
    activity.action.startsWith("USER_")
  ) {
    return "Staff";
  }

  if (
    activity.action.startsWith("ROLE_") ||
    activity.action.includes("PERMISSION")
  ) {
    return "Roles";
  }

  if (activity.action.startsWith("ORDER_")) {
    return "Orders";
  }

  if (activity.action.startsWith("PRODUCT_")) {
    return "Products";
  }

  if (activity.action.startsWith("PAYMENT_")) {
    return "Payments";
  }

  if (activity.action.startsWith("SETTING_")) {
    return "Settings";
  }

  if (entityType === "ORDER") {
    return "Orders";
  }

  if (entityType === "PRODUCT") {
    return "Products";
  }

  if (entityType === "INVENTORY") {
    return "Inventory";
  }

  if (entityType === "USER") {
    return "Staff";
  }

  if (entityType === "ROLE") {
    return "Roles";
  }

  if (entityType === "SETTING" || entityType === "SETTINGS") {
    return "Settings";
  }

  if (entityType === "PAYMENT") {
    return "Payments";
  }

  if (entityType === "CUSTOMER") {
    return "Customers";
  }

  if (entityType === "CATEGORY") {
    return "Catalog";
  }

  return "System";
}

function getMetadataValue(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }

  const value = (metadata as Record<string, unknown>)[key];

  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function getTarget(activity: AdminActivity): string {
  const name = getMetadataValue(activity.metadata, "name");

  if (name) {
    return name;
  }

  const target = getMetadataValue(activity.metadata, "target");

  if (target) {
    return target;
  }

  return activity.entityId ?? "—";
}

function getPreviousValue(activity: AdminActivity): string | null {
  return (
    getMetadataValue(activity.metadata, "previousValue") ??
    getMetadataValue(activity.metadata, "previousStock")
  );
}

function getNewValue(activity: AdminActivity): string | null {
  return (
    getMetadataValue(activity.metadata, "newValue") ??
    getMetadataValue(activity.metadata, "newStock")
  );
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

export function ActivityLog() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");

  const [page, setPage] = useState(1);

  const [activities, setActivities] = useState<AdminActivity[]>([]);

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [showDateFilter, setShowDateFilter] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const perPage = 10;

  /*
   * Load activity data from backend.
   */
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getAdminActivities(page, perPage, {
          search: search.trim() || undefined,

          entityType:
            moduleFilter && moduleFilter !== "Inventory"
              ? MODULE_ENTITY_TYPES[moduleFilter]
              : undefined,

          userId: userFilter || undefined,

          from: fromDate ? `${fromDate}T00:00:00` : undefined,

          to: toDate ? `${toDate}T23:59:59.999` : undefined,
        });

        if (cancelled) {
          return;
        }

        let nextActivities = response.activities;

        /*
         * Inventory and Products currently share PRODUCT
         * entityType in the backend.
         *
         * Filter Inventory client-side after fetching
         * when Inventory is selected.
         */
        if (moduleFilter === "Inventory") {
          nextActivities = nextActivities.filter(
            (activity) =>
              activity.action.startsWith("STOCK_") ||
              activity.entityType.toUpperCase() === "INVENTORY",
          );
        }

        setActivities(nextActivities);
        setTotal(
          moduleFilter === "Inventory"
            ? nextActivities.length
            : response.pagination.total,
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error ? err.message : "Failed to load activity log",
        );

        setActivities([]);
        setTotal(0);
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
  }, [page, search, moduleFilter, userFilter, fromDate, toDate]);

  /*
   * Users available from loaded activity records.
   */
  const users = useMemo(() => {
    const map = new Map<string, string>();

    for (const activity of activities) {
      map.set(activity.user.id, activity.user.name);
    }

    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [activities]);

  const modules = MODULE_ORDER;

  const clearDateFilter = () => {
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  /*
   * Export currently loaded filtered activities.
   */
  const handleExport = () => {
    if (activities.length === 0 || exporting) {
      return;
    }

    setExporting(true);

    try {
      const headers = [
        "User",
        "Email",
        "Action",
        "Module",
        "Target",
        "Previous",
        "New Value",
        "Timestamp",
      ];

      const rows = activities.map((activity) => {
        const activityModule = getModule(activity);

        return [
          activity.user.name,
          activity.user.email,
          formatAction(activity.action),
          activityModule,
          getTarget(activity),
          getPreviousValue(activity) ?? "",
          getNewValue(activity) ?? "",
          activity.createdAt,
        ];
      });

      const csv = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(","))
        .join("\n");

      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download = `corevault-activity-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-y-auto p-5">
      <Card className="w-full">
        {/* =====================================================
            Header
        ====================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-text-muted" />

            <h2 className="text-sm font-semibold text-text">Activity Log</h2>

            <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-xs text-text-muted">
              {total}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={
                exporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5" />
                )
              }
              onClick={handleExport}
              disabled={loading || exporting || activities.length === 0}
            >
              {exporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>

        {/* =====================================================
            Filters
        ====================================================== */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <SearchInput
            className="w-52"
            placeholder="Search actions, targets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Modules</option>

            {modules.map((activityModule) => (
              <option key={activityModule} value={activityModule}>
                {activityModule}
              </option>
            ))}
          </Select>

          <Select
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Users</option>

            {users.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>

          <Button
            variant="ghost"
            size="sm"
            icon={<Filter className="h-3.5 w-3.5" />}
            onClick={() => setShowDateFilter((current) => !current)}
          >
            Date Range
          </Button>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={clearDateFilter}
              className="inline-flex items-center gap-1 rounded-md bg-brand/10 px-2 py-1 text-xs text-brand transition-colors hover:bg-brand/20"
            >
              <X className="h-3 w-3" />
              Clear dates
            </button>
          )}
        </div>

        {/* =====================================================
            Date Range
        ====================================================== */}
        {showDateFilter && (
          <div className="flex flex-wrap items-end gap-3 border-b border-border bg-surface/40 px-4 py-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">From</span>

              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus:border-brand"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-text-muted">To</span>

              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus:border-brand"
              />
            </label>
          </div>
        )}

        {/* =====================================================
            Error
        ====================================================== */}
        {error && (
          <div className="m-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* =====================================================
            Table
        ====================================================== */}
        <div className="overflow-x-auto">
          <Table>
            <Thead>
              <tr>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Module</Th>
                <Th>Target</Th>
                <Th>Previous</Th>
                <Th>New Value</Th>
                <Th sortable>Timestamp</Th>
              </tr>
            </Thead>

            <Tbody>
              {loading ? (
                <Tr>
                  <Td>
                    <div className="flex items-center gap-2 py-8 text-sm text-text-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading activity...
                    </div>
                  </Td>
                </Tr>
              ) : activities.length === 0 ? (
                <Tr>
                  <Td>
                    <div className="py-8 text-center text-sm text-text-muted">
                      No activity found.
                    </div>
                  </Td>
                </Tr>
              ) : (
                activities.map((log) => {
                  const activityModule = getModule(log);

                  const previousValue = getPreviousValue(log);

                  const newValue = getNewValue(log);

                  return (
                    <Tr key={log.id}>
                      {/* User */}
                      <Td>
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-brand/20 bg-brand-muted text-[9px] font-bold text-brand">
                            {getInitials(log.user.name)}
                          </div>

                          <span className="whitespace-nowrap text-xs text-text-secondary">
                            {log.user.name}
                          </span>
                        </div>
                      </Td>

                      {/* Action */}
                      <Td>
                        <span className="text-xs text-text">
                          {formatAction(log.action)}
                        </span>
                      </Td>

                      {/* Module */}
                      <Td>
                        <span
                          className={`rounded px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                            MODULE_COLORS[activityModule] ??
                            "bg-surface-elevated text-text-muted"
                          }`}
                        >
                          {activityModule}
                        </span>
                      </Td>

                      {/* Target */}
                      <Td>
                        <span className="font-mono text-xs text-brand">
                          {getTarget(log)}
                        </span>
                      </Td>

                      {/* Previous */}
                      <Td>
                        {previousValue ? (
                          <span className="block max-w-25 truncate font-mono text-xs text-text-muted">
                            {previousValue}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </Td>

                      {/* New Value */}
                      <Td>
                        {newValue ? (
                          <span className="block max-w-25 truncate font-mono text-xs text-success">
                            {newValue}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </Td>

                      {/* Timestamp */}
                      <Td>
                        <span className="whitespace-nowrap text-xs text-text-muted">
                          {formatDate(new Date(log.createdAt))}
                        </span>
                      </Td>
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
        </div>

        {/* =====================================================
            Pagination
        ====================================================== */}
        {!loading && total > 0 && (
          <Pagination
            page={page}
            total={total}
            perPage={perPage}
            onChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}
