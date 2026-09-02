"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Clock,
  Cog,
  Truck,
  CheckCircle2,
  DollarSign,
  BarChart2,
  TrendingDown,
  Package,
  RotateCcw,
  Eye,
  AlertCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { KPICard, Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { apiFetch } from "@/lib/api";
import { getDashboardStats, type DashboardStats } from "@/lib/dashboard";
import { getAdminOrders, type AdminOrder } from "@/lib/admin-orders";

import type { Page } from "@/lib/types";

const DATE_FILTERS = [
  "Today",
  "Yesterday",
  "7 Days",
  "30 Days",
  "3 Months",
] as const;

type DateFilter = (typeof DATE_FILTERS)[number];

type AnalyticsPoint = {
  date: string;
  revenue?: number;
  orders?: number;
};

type StatusDistribution = {
  status: string;
  count: number;
};

type AnalyticsResponse = {
  success: boolean;
  range: {
    from: string;
    to: string;
    granularity: "day" | "week" | "month";
  };
  revenueSeries: AnalyticsPoint[];
  orderSeries: AnalyticsPoint[];
  statusDistribution: StatusDistribution[];
  metrics?: {
    revenue?: number;
    orders?: number;
    averageOrderValue?: number;
    cancelledOrders?: number;
  };
};

type ActivityItem = {
  id: string;
  user?: {
    id: string;
    name: string;
  };
  userName?: string;
  action: string;
  target?: string | null;
  description?: string;
  createdAt: string;
  timestamp?: string;
};

type ActivityResponse = {
  success: boolean;
  activities: ActivityItem[];
};

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-surface-card border border-border rounded-lg p-2.5 shadow-xl text-xs">
      {" "}
      <p className="text-text-secondary mb-1">{label}</p>
      {payload.map((item, index) => (
        <p
          key={`${String(item.name)}-${index}`}
          style={{ color: item.color }}
          className="font-mono"
        >
          {item.name === "revenue"
            ? formatCurrency(Number(item.value ?? 0))
            : `${item.value ?? 0} orders`}
        </p>
      ))}
    </div>
  );
}

function mapPaymentStatus(status: AdminOrder["paymentStatus"]) {
  return status.toLowerCase() as import("@/lib/types").PaymentStatus;
}

function mapOrderStatus(status: AdminOrder["status"]) {
  return status.toLowerCase() as import("@/lib/types").OrderStatus;
}

function getDateRange(filter: DateFilter) {
  const today = new Date();

  const toDate = new Date(today);
  toDate.setHours(23, 59, 59, 999);

  const fromDate = new Date(today);

  switch (filter) {
    case "Today":
      fromDate.setHours(0, 0, 0, 0);
      break;

    case "Yesterday":
      fromDate.setDate(fromDate.getDate() - 1);
      fromDate.setHours(0, 0, 0, 0);
      toDate.setDate(toDate.getDate() - 1);
      toDate.setHours(23, 59, 59, 999);
      break;

    case "7 Days":
      fromDate.setDate(fromDate.getDate() - 6);
      fromDate.setHours(0, 0, 0, 0);
      break;

    case "30 Days":
      fromDate.setDate(fromDate.getDate() - 29);
      fromDate.setHours(0, 0, 0, 0);
      break;

    case "3 Months":
      fromDate.setMonth(fromDate.getMonth() - 3);
      fromDate.setHours(0, 0, 0, 0);
      break;
  }

  return {
    from: fromDate.toISOString().slice(0, 10),
    to: toDate.toISOString().slice(0, 10),
  };
}

function getGranularity(filter: DateFilter): "day" | "week" | "month" {
  switch (filter) {
    case "3 Months":
      return "week";

    default:
      return "day";
  }
}

function formatChartDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}

function getStatusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  PROCESSING: "#a855f7",
  SHIPPED: "#38bdf8",
  DELIVERED: "#34d399",
  CANCELLED: "#f87171",
};

export function Dashboard({ onNavigate }: DashboardProps) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("7 Days");

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /*

* Dashboard summary + recent orders + activity.
  */
  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [dashboardResponse, ordersResponse, activityResponse] =
          await Promise.all([
            getDashboardStats(),
            getAdminOrders(1, 6),
            apiFetch<ActivityResponse>("/admin/activity?limit=6"),
          ]);

        if (cancelled) {
          return;
        }

        setStats(dashboardResponse.stats);
        setRecentOrders(ordersResponse.orders);
        setActivities(activityResponse.activities);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  /*

* Analytics changes when the dashboard date filter changes.
  */
  useEffect(() => {
    let cancelled = false;

    async function loadAnalytics() {
      try {
        setAnalyticsLoading(true);

        const { from, to } = getDateRange(dateFilter);
        const granularity = getGranularity(dateFilter);

        const response = await apiFetch<AnalyticsResponse>(
          `/admin/analytics/overview?from=${from}&to=${to}&granularity=${granularity}`,
        );

        if (!cancelled) {
          setAnalytics(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load analytics",
          );
        }
      } finally {
        if (!cancelled) {
          setAnalyticsLoading(false);
        }
      }
    }

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [dateFilter]);

  /*

* Combine revenue and order series so the line chart can display
* both datasets even when the backend returns them separately.
  */
  const chartData = useMemo(() => {
    const revenueMap = new Map(
      (analytics?.revenueSeries ?? []).map((item) => [
        item.date,
        Number(item.revenue ?? 0),
      ]),
    );

    const orderMap = new Map(
      (analytics?.orderSeries ?? []).map((item) => [
        item.date,
        Number(item.orders ?? 0),
      ]),
    );

    const dates = Array.from(
      new Set([...revenueMap.keys(), ...orderMap.keys()]),
    ).sort();

    return dates.map((date) => ({
      date: formatChartDate(date),
      revenue: revenueMap.get(date) ?? 0,
      orders: orderMap.get(date) ?? 0,
    }));
  }, [analytics]);

  const statusDistribution = useMemo(() => {
    return (analytics?.statusDistribution ?? []).map((item) => ({
      name: getStatusLabel(item.status),
      status: item.status,
      value: Number(item.count ?? 0),
      color: STATUS_COLORS[item.status] ?? "#94a3b8",
    }));
  }, [analytics]);

  const totalStatusOrders = useMemo(
    () => statusDistribution.reduce((total, item) => total + item.value, 0),
    [statusDistribution],
  );

  /*

* Revenue is supported in both the original scalar contract and
* the newer object contract.
  */

  const totalRevenue = Number(stats?.revenue.total ?? 0);
  const todayRevenue = Number(stats?.revenue.today ?? 0);

  const paidOrders = Number(stats?.orders.paid ?? 0);

  const averageOrderValue =
    analytics?.metrics?.averageOrderValue ??
    (paidOrders > 0 ? totalRevenue / paidOrders : 0);

  const cancelledOrders =
    analytics?.metrics?.cancelledOrders ?? stats?.orders.cancelled ?? 0;

  const processingAlert =
    stats?.alerts.processingOrders ?? stats?.orders.processing ?? 0;

  const paymentVerificationAlert = stats?.alerts.paymentVerification ?? 0;

  const lowStockAlert =
    stats?.alerts.lowStockProducts ?? stats?.products.lowStock ?? 0;

  const pendingReturnsAlert = stats?.alerts.pendingReturns ?? 0;

  const outOfStockAlert = stats?.alerts.outOfStockProducts ?? 0;

  return (
    <div className="flex-1 overflow-y-auto">
      {" "}
      <div className="p-5 space-y-5">
        {/* Header + date filter */}{" "}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {" "}
          <div>
            {" "}
            <p className="text-base font-bold text-text">Dashboard </p>
            <p className="text-xs text-text-muted">
              Welcome back, Admin 👋 - here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {DATE_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
                  dateFilter === filter
                    ? "bg-brand text-surface"
                    : "bg-surface-elevated border border-border text-text-secondary hover:text-text"
                }`}
                onClick={() => setDateFilter(filter)}
              >
                {filter}
              </button>
            ))}

            <button
              type="button"
              disabled
              className="h-7 px-3 rounded-lg text-xs font-medium border border-border bg-surface-elevated text-text-muted opacity-60 cursor-not-allowed"
            >
              Custom
            </button>
          </div>
        </div>
        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2 text-xs text-danger">
            Failed to load dashboard: {error}
          </div>
        )}
        {/* KPI Row 1 - Order status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="Total Orders"
            value={loading ? "—" : String(stats?.orders.total ?? 0)}
            icon={<ShoppingCart className="w-5 h-5 text-blue-400" />}
            iconBg="bg-blue-500/10 border border-blue-500/20"
            onClick={() => onNavigate("orders")}
          />

          <KPICard
            label="Pending Orders"
            value={loading ? "—" : String(stats?.orders.pending ?? 0)}
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            iconBg="bg-amber-500/10 border border-amber-500/20"
            onClick={() => onNavigate("orders")}
          />

          <KPICard
            label="Processing"
            value={loading ? "—" : String(stats?.orders.processing ?? 0)}
            icon={<Cog className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/10 border border-purple-500/20"
            onClick={() => onNavigate("processing")}
          />

          <KPICard
            label="Shipped"
            value={loading ? "—" : String(stats?.orders.shipped ?? 0)}
            icon={<Truck className="w-5 h-5 text-sky-400" />}
            iconBg="bg-sky-500/10 border border-sky-500/20"
            onClick={() => onNavigate("shipping")}
          />

          <KPICard
            label="Delivered"
            value={loading ? "—" : String(stats?.orders.delivered ?? 0)}
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10 border border-emerald-500/20"
            onClick={() => onNavigate("orders")}
          />
        </div>
        {/* KPI Row 2 - Revenue */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPICard
            label="Today's Revenue"
            value={loading ? "—" : formatCurrency(todayRevenue)}
            icon={<DollarSign className="w-5 h-5 text-brand" />}
            iconBg="bg-brand-muted border border-brand/20"
          />

          <KPICard
            label="Total Revenue"
            value={loading ? "—" : formatCurrency(totalRevenue)}
            icon={<BarChart2 className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/10 border border-purple-500/20"
          />

          <KPICard
            label="Avg Order Value"
            value={
              loading || analyticsLoading
                ? "—"
                : formatCurrency(averageOrderValue)
            }
            icon={<Package className="w-5 h-5 text-sky-400" />}
            iconBg="bg-sky-500/10 border border-sky-500/20"
          />

          <KPICard
            label="Cancelled Orders"
            value={loading || analyticsLoading ? "—" : String(cancelledOrders)}
            icon={<TrendingDown className="w-5 h-5 text-red-400" />}
            iconBg="bg-red-500/10 border border-red-500/20"
            onClick={() => onNavigate("orders")}
          />

          <KPICard
            label="Returned Orders"
            value={
              loading
                ? "—"
                : stats && pendingReturnsAlert > 0
                  ? String(pendingReturnsAlert)
                  : "—"
            }
            icon={<RotateCcw className="w-5 h-5 text-orange-400" />}
            iconBg="bg-orange-500/10 border border-orange-500/20"
            onClick={() => onNavigate("returns")}
          />
        </div>
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Orders overview */}
          <Card className="lg:col-span-2 p-4">
            <SectionHeader
              title="Orders Overview"
              action={
                <span className="text-[11px] text-text-muted">
                  {dateFilter}
                </span>
              }
              className="mb-4"
            />

            {analyticsLoading ? (
              <div className="h-45 flex items-center justify-center text-xs text-text-muted">
                Loading analytics...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-45 flex items-center justify-center text-xs text-text-muted">
                No analytics data available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart
                  data={chartData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="orders"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={{
                      fill: "#22d3ee",
                      r: 3,
                    }}
                    activeDot={{
                      r: 5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>

          {/* Order status distribution */}
          <Card className="p-4">
            <SectionHeader title="Order Status Distribution" className="mb-4" />

            {analyticsLoading ? (
              <div className="h-45 flex items-center justify-center text-xs text-text-muted">
                Loading analytics...
              </div>
            ) : statusDistribution.length === 0 ? (
              <div className="h-45 flex items-center justify-center text-xs text-text-muted">
                No status data available.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {statusDistribution.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={entry.color}
                          strokeWidth={0}
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value, name) => [value, name]}
                      contentStyle={{
                        background: "#161b2e",
                        border: "1px solid #1e293b",
                        borderRadius: 8,
                        fontSize: 11,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-1 mt-2">
                  {statusDistribution.map((status) => {
                    const percentage =
                      totalStatusOrders > 0
                        ? (status.value / totalStatusOrders) * 100
                        : 0;

                    return (
                      <div
                        key={status.status}
                        className="flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: status.color,
                            }}
                          />

                          <span className="text-text-secondary">
                            {status.name}
                          </span>
                        </div>

                        <span className="font-mono text-text-muted">
                          {status.value}{" "}
                          <span className="text-text-muted">
                            ({percentage.toFixed(1)}%)
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </div>
        {/* Alerts + Recent Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Alerts */}
          <Card className="p-4">
            <SectionHeader title="To Do / Alerts" className="mb-3" />

            <div className="space-y-2">
              {[
                {
                  icon: <Package className="w-4 h-4 text-brand" />,
                  bg: "bg-brand-muted",
                  label: loading ? "—" : `${processingAlert} Orders`,
                  sub: "Awaiting packing",
                  page: "packing" as Page,
                },
                {
                  icon: <AlertCircle className="w-4 h-4 text-warning" />,
                  bg: "bg-warning-muted",
                  label: loading ? "—" : `${paymentVerificationAlert} Orders`,
                  sub: "Payment verification",
                  page: "payments" as Page,
                },
                {
                  icon: <AlertTriangle className="w-4 h-4 text-danger" />,
                  bg: "bg-danger-muted",
                  label: loading ? "—" : `${lowStockAlert} Products`,
                  sub: "Low in stock",
                  page: "inventory" as Page,
                },
                {
                  icon: <RotateCcw className="w-4 h-4 text-orange-400" />,
                  bg: "bg-orange-muted",
                  label: loading ? "—" : `${pendingReturnsAlert} Returns`,
                  sub: "Require attention",
                  page: "returns" as Page,
                },
                {
                  icon: <Zap className="w-4 h-4 text-amber-400" />,
                  bg: "bg-amber-500/10",
                  label: loading ? "—" : `${outOfStockAlert} Products`,
                  sub: "Out of stock",
                  page: "inventory" as Page,
                },
              ].map((alert, index) => (
                <button
                  key={index}
                  type="button"
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-elevated transition-colors text-left group"
                  onClick={() => onNavigate(alert.page)}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${alert.bg}`}
                  >
                    {alert.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text">
                      {alert.label}
                    </p>

                    <p className="text-[11px] text-text-muted">{alert.sub}</p>
                  </div>

                  <Eye className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2 p-4">
            <SectionHeader
              title="Recent Orders"
              action={
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onNavigate("orders")}
                >
                  View All
                </Button>
              }
              className="mb-3"
            />

            <div className="space-y-0.5">
              {loading ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  Loading recent orders...
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="py-8 text-center text-xs text-text-muted">
                  No recent orders.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <button
                    key={order.id}
                    type="button"
                    className="w-full px-2 py-2.5 flex items-center gap-3 hover:bg-surface-elevated transition-colors cursor-pointer group text-left rounded-lg"
                    onClick={() => onNavigate("order-detail")}
                  >
                    <div className="min-w-0 flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-3 items-center">
                      <div>
                        <p className="text-xs font-mono font-semibold text-brand">
                          {order.orderNumber}
                        </p>

                        <p className="text-[11px] text-text-muted truncate">
                          {order.user.name}
                        </p>
                      </div>

                      <div className="text-xs font-mono text-text">
                        {formatCurrency(Number(order.total))}
                      </div>

                      <PaymentStatusBadge
                        status={mapPaymentStatus(order.paymentStatus)}
                      />

                      <OrderStatusBadge status={mapOrderStatus(order.status)} />
                    </div>

                    <div className="text-[11px] text-text-muted whitespace-nowrap hidden xl:block">
                      {formatDate(new Date(order.createdAt)).split(",")[0]}
                    </div>

                    <Eye className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))
              )}
            </div>
          </Card>
        </div>
        {/* Recent Activity */}
        <Card className="p-4">
          <SectionHeader
            title="Recent Activity"
            action={
              <Button
                variant="ghost"
                size="xs"
                onClick={() => onNavigate("activity-log")}
              >
                View All
              </Button>
            }
            className="mb-3"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {loading ? (
              <div className="md:col-span-2 py-6 text-center text-xs text-text-muted">
                Loading activity...
              </div>
            ) : activities.length === 0 ? (
              <div className="md:col-span-2 py-6 text-center text-xs text-text-muted">
                No recent activity.
              </div>
            ) : (
              activities.map((activity) => {
                const userName =
                  activity.user?.name ?? activity.userName ?? "System";

                const timestamp = activity.createdAt ?? activity.timestamp;

                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text leading-snug">
                        <span className="font-medium text-brand">
                          {userName}
                        </span>{" "}
                        {activity.description ??
                          activity.action.toLowerCase().replace(/_/g, " ")}
                        {activity.target && (
                          <>
                            {" "}
                            <span className="font-medium text-text">
                              {activity.target}
                            </span>
                          </>
                        )}
                      </p>

                      {timestamp && (
                        <p className="text-[11px] text-text-muted mt-0.5">
                          {timeAgo(new Date(timestamp))}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
