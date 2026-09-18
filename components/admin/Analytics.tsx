"use client";

import { useCallback, useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Package,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, KPICard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import {
  getAdminAnalytics,
  getAdminAnalyticsByRange,
  type AdminAnalytics,
  type AdminAnalyticsCustomRange,
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

type CustomDateRange = {
  from: string;
  to: string;
};

type DateFilter = AnalyticsPeriod | "custom";

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

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (range: CustomDateRange) => void;
  onApply: () => void;
  onCancel: () => void;
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

/* -------------------------------------------------------------------------- */
/* Custom date picker                                                         */
/* -------------------------------------------------------------------------- */

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function formatInputDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatDisplayDate(value: string) {
  if (!value) return "Select date";

  const date = parseLocalDate(value);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateBetween(date: Date, from: string, to: string) {
  if (!from || !to) return false;

  const start = parseLocalDate(from);
  const end = parseLocalDate(to);

  return date > start && date < end;
}

function DateRangePicker({
  from,
  to,
  onChange,
  onApply,
  onCancel,
}: DateRangePickerProps) {
  const initialDate = from ? parseLocalDate(from) : new Date();

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
  );

  const [open, setOpen] = useState(true);

  const [selecting, setSelecting] = useState<"from" | "to">("from");

  const monthLabel = visibleMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const daysInMonth = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth() + 1,
    0,
  ).getDate();

  const firstDay = new Date(
    visibleMonth.getFullYear(),
    visibleMonth.getMonth(),
    1,
  ).getDay();

  // Monday-first calendar
  const leadingDays = firstDay === 0 ? 6 : firstDay - 1;

  const calendarDays = Array.from(
    { length: leadingDays + daysInMonth },
    (_, index) => {
      if (index < leadingDays) return null;

      return index - leadingDays + 1;
    },
  );

  const goPreviousMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
    );
  };

  const goNextMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
    );
  };

  const handleDayClick = (day: number) => {
    const selectedDate = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth(),
      day,
    );

    const selected = formatInputDate(selectedDate);

    if (selecting === "from") {
      onChange({
        from: selected,
        to: "",
      });

      setSelecting("to");
      return;
    }

    if (from && selected < from) {
      onChange({
        from: selected,
        to: from,
      });
    } else {
      onChange({
        from,
        to: selected,
      });
    }

    setSelecting("from");
  };

  const handleToday = () => {
    const today = new Date();
    const todayValue = formatInputDate(today);

    setVisibleMonth(new Date(today.getFullYear(), today.getMonth(), 1));

    onChange({
      from: todayValue,
      to: todayValue,
    });

    setSelecting("from");
  };

  const canApply = Boolean(from && to && from <= to);

  return (
    <div className="relative w-full">
      {/* Selected range summary */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 min-w-65 items-center gap-2 rounded-lg border border-border bg-surface-card px-3 text-left transition-colors hover:border-brand/50"
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-brand" />

        <div className="min-w-0 flex-1">
          <p className="text-[10px] leading-none text-text-muted">
            Custom range
          </p>

          <p className="mt-1 truncate text-xs font-medium text-text">
            {from && to
              ? `${formatDisplayDate(from)} → ${formatDisplayDate(to)}`
              : "Select date range"}
          </p>
        </div>

        <ChevronRight
          className={`h-3.5 w-3.5 text-text-muted transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-11 z-50 w-80 rounded-xl border border-border bg-surface-card p-3 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={goPreviousMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <p className="text-xs font-semibold text-text">{monthLabel}</p>

            <button
              type="button"
              onClick={goNextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Selection status */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div
              className={`rounded-lg border px-2.5 py-2 ${
                selecting === "from"
                  ? "border-brand/50 bg-brand-muted"
                  : "border-border bg-surface-elevated"
              }`}
            >
              <p className="text-[10px] text-text-muted">From</p>

              <p className="mt-0.5 text-xs font-medium text-text">
                {from ? formatDisplayDate(from) : "Select date"}
              </p>
            </div>

            <div
              className={`rounded-lg border px-2.5 py-2 ${
                selecting === "to"
                  ? "border-brand/50 bg-brand-muted"
                  : "border-border bg-surface-elevated"
              }`}
            >
              <p className="text-[10px] text-text-muted">To</p>

              <p className="mt-0.5 text-xs font-medium text-text">
                {to ? formatDisplayDate(to) : "Select date"}
              </p>
            </div>
          </div>

          {/* Weekdays */}
          <div className="mt-4 grid grid-cols-7">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <div
                key={day}
                className="py-1 text-center text-[10px] font-medium text-text-muted"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="h-8" />;
              }

              const date = new Date(
                visibleMonth.getFullYear(),
                visibleMonth.getMonth(),
                day,
              );

              const value = formatInputDate(date);

              const isFrom = from ? value === from : false;

              const isTo = to ? value === to : false;

              const inRange = isDateBetween(date, from, to);

              const today = isSameDate(date, new Date());

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className={`relative h-8 rounded-md text-xs transition-colors ${
                    isFrom || isTo
                      ? "bg-brand font-semibold text-surface"
                      : inRange
                        ? "bg-brand/10 text-brand"
                        : "text-text-secondary hover:bg-surface-elevated hover:text-text"
                  }`}
                >
                  {day}

                  {today && !isFrom && !isTo && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={handleToday}
              className="text-[11px] font-medium text-brand transition-colors hover:text-text"
            >
              Today
            </button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => {
                  setOpen(false);
                  onCancel();
                }}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="primary"
                size="xs"
                disabled={!canApply}
                onClick={() => {
                  setOpen(false);
                  onApply();
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Analytics                                                                  */
/* -------------------------------------------------------------------------- */

export function Analytics() {
  const [dateFilter, setDateFilter] = useState<DateFilter>("30d");

  const today = new Date();
  const todayString = today.toISOString().slice(0, 10);

  const defaultFromDate = new Date(today);
  defaultFromDate.setDate(defaultFromDate.getDate() - 6);

  const defaultFromString = defaultFromDate.toISOString().slice(0, 10);

  const [customFrom, setCustomFrom] = useState(defaultFromString);

  const [customTo, setCustomTo] = useState(todayString);

  const [appliedCustomRange, setAppliedCustomRange] = useState<CustomDateRange>(
    {
      from: defaultFromString,
      to: todayString,
    },
  );

  const [customDateError, setCustomDateError] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<
    AdminAnalytics | AdminAnalyticsCustomRange | null
  >(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (dateFilter === "custom") {
        const response = await getAdminAnalyticsByRange(
          appliedCustomRange.from,
          appliedCustomRange.to,
        );

        setAnalytics(response);
        return;
      }

      const response = await getAdminAnalytics(dateFilter);

      setAnalytics(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [dateFilter, appliedCustomRange]);

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
          className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
            dateFilter === "custom"
              ? "bg-brand text-surface"
              : "bg-surface-elevated border border-border text-text-secondary hover:text-text"
          }`}
          onClick={() => {
            setCustomDateError(null);
            setDateFilter("custom");
          }}
        >
          Custom
        </button>
      </div>

      {/* Custom date range */}
      {dateFilter === "custom" && (
        <div className="rounded-xl border border-border bg-surface-elevated p-4">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-medium text-text">Custom date range</p>

              <p className="mt-0.5 text-xs text-text-secondary">
                Choose the start and end dates for your analytics.
              </p>
            </div>

            <DateRangePicker
              from={customFrom}
              to={customTo}
              onChange={(range) => {
                setCustomFrom(range.from);
                setCustomTo(range.to);
                setCustomDateError(null);
              }}
              onCancel={() => {
                setCustomFrom(appliedCustomRange.from);
                setCustomTo(appliedCustomRange.to);
                setCustomDateError(null);
              }}
              onApply={() => {
                if (!customFrom || !customTo) {
                  setCustomDateError("Please select both dates.");
                  return;
                }

                if (customFrom > customTo) {
                  setCustomDateError("From date cannot be after the To date.");
                  return;
                }

                setCustomDateError(null);

                setAppliedCustomRange({
                  from: customFrom,
                  to: customTo,
                });
              }}
            />

            {customDateError && (
              <p className="text-xs text-danger">{customDateError}</p>
            )}
          </div>
        </div>
      )}

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
          <p className="text-sm font-medium text-text">
            No analytics available
          </p>vs

          <p className="mt-1 text-xs text-text-muted">
            There is no analytics data for the selected period.
          </p>
        </Card>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard
              label="Total Revenue"
              value={formatCurrency(analytics.overview.revenue)}
              change={Number(analytics.overview.growth.revenue.toFixed(1))}
              changeLabel=" vs prev period"
              icon={<DollarSign className="w-5 h-5 text-brand" />}
              iconBg="bg-brand-muted border border-brand/20"
            />

            <KPICard
              label="Total Orders"
              value={analytics.overview.orders.toLocaleString("en-IN")}
              change={Number(analytics.overview.growth.orders.toFixed(1))}
              changeLabel=""
              icon={<ShoppingCart className="w-5 h-5 text-purple-400" />}
              iconBg="bg-purple-500/10 border border-purple-500/20"
            />

            <KPICard
              label="Avg Order Value"
              value={formatCurrency(analytics.overview.averageOrderValue)}
              change={Number(
                analytics.overview.growth.averageOrderValue.toFixed(1),
              )}
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
                    {metric.value === null
                      ? "Insufficient tracking data"
                      : metric.metric === "Cancellation Rate"
                        ? "Cancelled orders / total orders"
                        : metric.metric === "Return Rate"
                          ? "Return requests / active orders"
                          : "Calculated from order tracking"}
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
