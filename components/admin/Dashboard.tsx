"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Clock,
  Cog,
  Box,
  Truck,
  CheckCircle2,
  DollarSign,
  BarChart2,
  TrendingDown,
  AlertTriangle,
  Package,
  RotateCcw,
  Eye,
  AlertCircle,
  Zap,
} from "lucide-react";
import { KPICard, Card, SectionHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import {
  MOCK_ORDERS,
  MOCK_PRODUCTS,
  MOCK_ACTIVITY_LOGS,
  CHART_DATA,
} from "@/lib/data";
import type { Page } from "@/lib/types";
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

const DATE_FILTERS = [
  "Today",
  "Yesterday",
  "7 Days",
  "30 Days",
  "3 Months",
] as const;

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

export function Dashboard({ onNavigate }: DashboardProps) {
  const [dateFilter, setDateFilter] = useState<string>("7 Days");

  const lowStockProducts = MOCK_PRODUCTS.filter(
    (p) => p.available > 0 && p.available <= p.lowStockThreshold,
  );

  const outOfStockProducts = MOCK_PRODUCTS.filter((p) => p.available === 0);

  const processingOrders = MOCK_ORDERS.filter(
    (o) => o.orderStatus === "processing",
  );

  const recentOrders = MOCK_ORDERS.slice(0, 6);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-5 space-y-5">
        {/* Date filter row */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-base font-bold text-text">Dashboard</p>

            <p className="text-xs text-text-muted">
              Welcome back, Admin 👋 — here&apos;s what&apos;s happening today.
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {DATE_FILTERS.map((f) => (
              <button
                key={f}
                className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
                  dateFilter === f
                    ? "bg-brand text-surface"
                    : "bg-surface-elevated border border-border text-text-secondary hover:text-text"
                }`}
                onClick={() => setDateFilter(f)}
              >
                {f}
              </button>
            ))}

            <button className="h-7 px-3 rounded-lg text-xs font-medium border border-border bg-surface-elevated text-text-secondary hover:text-text transition-colors flex items-center gap-1.5">
              Custom
            </button>
          </div>
        </div>

        {/* KPI Row 1 - Order status */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <KPICard
            label="Total Orders"
            value="1,248"
            change={18.6}
            changeLabel=" vs last 7d"
            icon={<ShoppingCart className="w-5 h-5 text-blue-400" />}
            iconBg="bg-blue-500/10 border border-blue-500/20"
            onClick={() => onNavigate("orders")}
          />

          <KPICard
            label="Pending Orders"
            value="132"
            change={-8.3}
            changeLabel=" vs last 7d"
            icon={<Clock className="w-5 h-5 text-amber-400" />}
            iconBg="bg-amber-500/10 border border-amber-500/20"
            onClick={() => onNavigate("orders")}
          />

          <KPICard
            label="Processing"
            value="86"
            change={12.7}
            changeLabel=" vs last 7d"
            icon={<Cog className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/10 border border-purple-500/20"
            onClick={() => onNavigate("processing")}
          />

          <KPICard
            label="Packed"
            value="64"
            change={5.9}
            changeLabel=" vs last 7d"
            icon={<Box className="w-5 h-5 text-cyan-400" />}
            iconBg="bg-cyan-500/10 border border-cyan-500/20"
            onClick={() => onNavigate("packing")}
          />

          <KPICard
            label="Shipped"
            value="342"
            change={15.4}
            changeLabel=" vs last 7d"
            icon={<Truck className="w-5 h-5 text-sky-400" />}
            iconBg="bg-sky-500/10 border border-sky-500/20"
            onClick={() => onNavigate("shipping")}
          />

          <KPICard
            label="Delivered"
            value="576"
            change={20.1}
            changeLabel=" vs last 7d"
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            iconBg="bg-emerald-500/10 border border-emerald-500/20"
            onClick={() => onNavigate("orders")}
          />
        </div>

        {/* KPI Row 2 - Revenue */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KPICard
            label="Today's Revenue"
            value="₹1,82,540"
            change={21.8}
            changeLabel=" vs yesterday"
            icon={<DollarSign className="w-5 h-5 text-brand" />}
            iconBg="bg-brand-muted border border-brand/20"
          />

          <KPICard
            label="Total Revenue"
            value="₹28,45,230"
            change={16.5}
            changeLabel=" vs last 7d"
            icon={<BarChart2 className="w-5 h-5 text-purple-400" />}
            iconBg="bg-purple-500/10 border border-purple-500/20"
          />

          <KPICard
            label="Avg Order Value"
            value="₹2,280"
            change={6.3}
            changeLabel=" vs last 7d"
            icon={<Package className="w-5 h-5 text-sky-400" />}
            iconBg="bg-sky-500/10 border border-sky-500/20"
          />

          <KPICard
            label="Cancelled Orders"
            value="24"
            change={-4.2}
            changeLabel=" vs last 7d"
            icon={<TrendingDown className="w-5 h-5 text-red-400" />}
            iconBg="bg-red-500/10 border border-red-500/20"
            onClick={() => onNavigate("orders")}
          />

          <KPICard
            label="Returned Orders"
            value="16"
            change={-3.1}
            changeLabel=" vs last 7d"
            icon={<RotateCcw className="w-5 h-5 text-orange-400" />}
            iconBg="bg-orange-500/10 border border-orange-500/20"
            onClick={() => onNavigate("returns")}
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Line chart */}
          <Card className="lg:col-span-2 p-4">
            <SectionHeader
              title="Orders Overview"
              action={
                <div className="flex items-center gap-2">
                  <select className="h-7 px-2 rounded-lg border border-border bg-surface-elevated text-xs text-text-secondary">
                    <option>This Week</option>
                    <option>Last Week</option>
                    <option>This Month</option>
                  </select>
                </div>
              }
              className="mb-4"
            />

            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={CHART_DATA.revenueOrders}
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
          </Card>

          {/* Donut chart */}
          <Card className="p-4">
            <SectionHeader title="Order Status Distribution" className="mb-4" />

            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={CHART_DATA.statusDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {CHART_DATA.statusDist.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
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
              {CHART_DATA.statusDist.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: s.color,
                      }}
                    />

                    <span className="text-text-secondary">{s.name}</span>
                  </div>

                  <span className="font-mono text-text-muted">
                    {s.value}{" "}
                    <span className="text-text-muted">
                      ({((s.value / 1248) * 100).toFixed(1)}%)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Alerts + Recent Orders + Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Alerts */}
          <Card className="p-4">
            <SectionHeader title="To Do / Alerts" className="mb-3" />

            <div className="space-y-2">
              {[
                {
                  icon: <Package className="w-4 h-4 text-brand" />,
                  bg: "bg-brand-muted",
                  label: `${processingOrders.length + 12} Orders`,
                  sub: "Awaiting packing",
                  page: "packing" as Page,
                },
                {
                  icon: <AlertCircle className="w-4 h-4 text-warning" />,
                  bg: "bg-warning-muted",
                  label: "8 Orders",
                  sub: "Payment verification",
                  page: "payments" as Page,
                },
                {
                  icon: <AlertTriangle className="w-4 h-4 text-danger" />,
                  bg: "bg-danger-muted",
                  label: `${lowStockProducts.length} Products`,
                  sub: "Low in stock",
                  page: "inventory" as Page,
                },
                {
                  icon: <RotateCcw className="w-4 h-4 text-orange-400" />,
                  bg: "bg-orange-muted",
                  label: "2 Returns",
                  sub: "Require attention",
                  page: "returns" as Page,
                },
                {
                  icon: <Zap className="w-4 h-4 text-amber-400" />,
                  bg: "bg-amber-500/10",
                  label: `${outOfStockProducts.length} Products`,
                  sub: "Out of stock",
                  page: "inventory" as Page,
                },
              ].map((a, i) => (
                <button
                  key={i}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-elevated transition-colors text-left group"
                  onClick={() => onNavigate(a.page)}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.bg}`}
                  >
                    {a.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text">{a.label}</p>

                    <p className="text-[11px] text-text-muted">{a.sub}</p>
                  </div>

                  <Eye className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </Card>

          {/* Recent Orders */}
          <Card className="lg:col-span-2">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Recent Orders</h3>

              <Button
                variant="ghost"
                size="xs"
                onClick={() => onNavigate("orders")}
              >
                View All
              </Button>
            </div>

            <div className="divide-y divide-border/50">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="px-4 py-2.5 flex items-center gap-3 hover:bg-surface-elevated transition-colors cursor-pointer group"
                  onClick={() => onNavigate("order-detail")}
                >
                  <div className="min-w-0 flex-1 grid grid-cols-4 gap-3 items-center">
                    <div>
                      <p className="text-xs font-mono font-semibold text-brand">
                        {order.id}
                      </p>

                      <p className="text-[11px] text-text-muted truncate">
                        {order.customerName}
                      </p>
                    </div>

                    <div className="text-xs font-mono text-text">
                      {formatCurrency(order.total)}
                    </div>

                    <PaymentStatusBadge status={order.paymentStatus} />

                    <OrderStatusBadge status={order.orderStatus} />
                  </div>

                  <div className="text-[11px] text-text-muted whitespace-nowrap hidden xl:block">
                    {formatDate(order.date).split(",")[0]}
                  </div>

                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
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
            {MOCK_ACTIVITY_LOGS.slice(0, 6).map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-surface-elevated transition-colors"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-brand mt-1.5 shrink-0" />

                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text leading-snug">
                    <span className="font-medium text-brand">
                      {log.userName}
                    </span>{" "}
                    {log.action.toLowerCase()}{" "}
                    <span className="font-medium text-text">{log.target}</span>
                  </p>

                  <p className="text-[11px] text-text-muted mt-0.5">
                    {timeAgo(log.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
