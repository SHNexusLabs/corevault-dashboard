"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";

import { Card, KPICard } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import {
  getAdminAnalytics,
  type AdminAnalytics,
  type AnalyticsPeriod,
} from "@/lib/admin-analytics";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATE_FILTERS = [
  { label: "Today", value: "today" },
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "1 Year", value: "1y" },
] as const;

interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  color?: string;
}

interface TooltipBoxProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}

function TooltipBox({ active, payload, label }: TooltipBoxProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-surface-card border border-border rounded-lg p-2.5 shadow-xl text-xs">
      <p className="text-text-muted mb-1">{label}</p>

      {payload.map((item, index) => {
        const value = item.value;

        return (
          <p
            key={`${String(item.name)}-${index}`}
            style={{ color: item.color }}
            className="font-mono"
          >
            {item.name}:{" "}
            {item.name === "revenue"
              ? formatCurrency(
                  typeof value === "number" ? value : Number(value ?? 0),
                )
              : (value ?? 0)}
          </p>
        );
      })}
    </div>
  );
}

export function Analytics() {
  const [dateFilter, setDateFilter] = useState<AnalyticsPeriod>("30d");

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminAnalytics(dateFilter);

      setAnalytics(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;

      await loadAnalytics();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadAnalytics]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Date filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {DATE_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
              dateFilter === filter.value
                ? "bg-brand text-surface"
                : "bg-surface-elevated border border-border text-text-secondary hover:text-text"
            }`}
            onClick={() => setDateFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}

        <button
          type="button"
          disabled
          title="Custom date range will be added later"
          className="h-7 px-3 rounded-lg text-xs font-medium bg-surface-elevated border border-border text-text-secondary opacity-50 cursor-not-allowed"
        >
          Custom
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/20 bg-danger-muted px-4 py-3">
          <p className="text-xs text-danger">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-24 rounded-xl border border-border bg-surface-elevated/40 animate-pulse"
              />
            ))}
          </div>

          <div className="h-56 rounded-xl border border-border bg-surface-elevated/40 animate-pulse" />
        </div>
      ) : !analytics ? (
        <Card className="p-10 text-center">
          <p className="text-xs text-text-muted">
            No analytics data available.
          </p>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard
              label="Total Revenue"
              value={formatCurrency(analytics.overview.revenue)}
              change={analytics.overview.growth.revenue}
              changeLabel=" vs prev period"
              icon={<DollarSign className="w-5 h-5 text-brand" />}
              iconBg="bg-brand-muted border border-brand/20"
            />

            <KPICard
              label="Total Orders"
              value={analytics.overview.orders.toLocaleString("en-IN")}
              change={analytics.overview.growth.orders}
              changeLabel=""
              icon={<ShoppingCart className="w-5 h-5 text-purple-400" />}
              iconBg="bg-purple-500/10 border border-purple-500/20"
            />

            <KPICard
              label="Avg Order Value"
              value={formatCurrency(analytics.overview.averageOrderValue)}
              change={analytics.overview.growth.averageOrderValue}
              changeLabel=""
              icon={<Package className="w-5 h-5 text-sky-400" />}
              iconBg="bg-sky-500/10 border border-sky-500/20"
            />

            <KPICard
              label="Growth Rate"
              value={`↑${analytics.overview.growth.orders.toFixed(1)}%`}
              icon={<TrendingUp className="w-5 h-5 text-success" />}
              iconBg="bg-success-muted border border-success/20"
            />
          </div>

          {/* Revenue + Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text mb-4">
                Revenue Over Time
              </h3>

              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={analytics.revenueOrders}
                  margin={{
                    top: 5,
                    right: 10,
                    left: -10,
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
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />

                  <Tooltip content={<TooltipBox />} />

                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={{
                      fill: "#22d3ee",
                      r: 3,
                    }}
                    name="revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text mb-4">
                Orders Over Time
              </h3>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={analytics.revenueOrders}
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

                  <Tooltip content={<TooltipBox />} />

                  <Bar
                    dataKey="orders"
                    fill="#8b5cf6"
                    radius={[3, 3, 0, 0]}
                    name="orders"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Products + Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text mb-4">
                Top Products
              </h3>

              {analytics.topProducts.length === 0 ? (
                <p className="text-xs text-text-muted">
                  No product sales for this period.
                </p>
              ) : (
                <div className="space-y-3">
                  {analytics.topProducts.map((product, index) => {
                    const maxRevenue = analytics.topProducts[0]?.revenue || 1;

                    return (
                      <div key={product.name}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 shrink-0 rounded bg-surface-elevated text-text-muted flex items-center justify-center text-[10px] font-bold">
                              {index + 1}
                            </span>

                            <span className="text-text truncate max-w-40">
                              {product.name}
                            </span>
                          </div>

                          <span className="font-mono text-text-secondary">
                            {formatCurrency(product.revenue)}
                          </span>
                        </div>

                        <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                (product.revenue / maxRevenue) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-text mb-4">
                Category Performance
              </h3>

              {analytics.categories.length === 0 ? (
                <p className="text-xs text-text-muted">
                  No category sales for this period.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={analytics.categories}
                    layout="vertical"
                    margin={{
                      top: 0,
                      right: 30,
                      left: 60,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      tick={{
                        fill: "#64748b",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) =>
                        `₹${(value / 1000).toFixed(0)}K`
                      }
                    />

                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{
                        fill: "#94a3b8",
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />

                    <Tooltip content={<TooltipBox />} />

                    <Bar
                      dataKey="revenue"
                      fill="#22d3ee"
                      radius={[0, 3, 3, 0]}
                      name="revenue"
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Operational metrics */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text mb-4">
              Operational Metrics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                {
                  metric: "Avg Processing Time",
                  value: analytics.operational.averageProcessingTime,
                },
                {
                  metric: "Avg Packing Time",
                  value: analytics.operational.averagePackingTime,
                },
                {
                  metric: "Avg Shipping Time",
                  value: analytics.operational.averageShippingTime,
                },
                {
                  metric: "Cancellation Rate",
                  value: analytics.operational.cancellationRate,
                },
                {
                  metric: "Return Rate",
                  value: analytics.operational.returnRate,
                },
                {
                  metric: "On-time Delivery",
                  value: analytics.operational.onTimeDelivery,
                },
              ].map((metric) => (
                <div
                  key={metric.metric}
                  className="p-3 rounded-xl border border-border bg-surface-elevated/30"
                >
                  <p className="text-[10px] text-text-muted mb-1">
                    {metric.metric}
                  </p>

                  <p className="text-lg font-bold font-mono text-text-secondary">
                    {metric.value === null
                      ? "N/A"
                      : metric.metric.includes("Time")
                        ? `${metric.value}`
                        : `${metric.value}%`}
                  </p>

                  <p className="text-[10px] text-text-muted mt-1">
                    Insufficient tracking data
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
