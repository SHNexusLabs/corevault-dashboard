"use client";

import { useState } from "react";
import { TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react";
import { Card, KPICard } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { CHART_DATA } from "@/lib/data";
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
  "Today",
  "7 Days",
  "30 Days",
  "3 Months",
  "6 Months",
  "1 Year",
  "Custom",
];

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

      {payload.map((p, index) => {
        const value = p.value;

        return (
          <p
            key={`${String(p.name)}-${index}`}
            style={{ color: p.color }}
            className="font-mono"
          >
            {p.name}:{" "}
            {p.name === "revenue"
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
  const [dateFilter, setDateFilter] = useState("30 Days");

  const CATEGORY_DATA = [
    { name: "Graphics Cards", revenue: 1240000, orders: 29 },
    { name: "Storage", revenue: 830000, orders: 55 },
    { name: "Monitors", revenue: 720000, orders: 23 },
    { name: "Keyboards", revenue: 390000, orders: 30 },
    { name: "Headphones", revenue: 524800, orders: 21 },
    { name: "Mice", revenue: 290000, orders: 36 },
    { name: "Memory", revenue: 198000, orders: 22 },
  ];

  const OPS_DATA = [
    {
      metric: "Avg Processing Time",
      value: "2.4h",
      trend: -8,
      color: "#22d3ee",
    },
    { metric: "Avg Packing Time", value: "1.1h", trend: -12, color: "#8b5cf6" },
    { metric: "Avg Shipping Time", value: "3.2d", trend: 4, color: "#3b82f6" },
    { metric: "Cancellation Rate", value: "1.9%", trend: -2, color: "#f59e0b" },
    { metric: "Return Rate", value: "1.3%", trend: -1, color: "#ef4444" },
    { metric: "On-time Delivery", value: "94.2%", trend: 3, color: "#10b981" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* Date filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {DATE_FILTERS.map((f) => (
          <button
            key={f}
            className={`h-7 px-3 rounded-lg text-xs font-medium transition-colors ${dateFilter === f ? "bg-brand text-surface" : "bg-surface-elevated border border-border text-text-secondary hover:text-text"}`}
            onClick={() => setDateFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Total Revenue"
          value="₹28,45,230"
          change={16.5}
          changeLabel=" vs prev period"
          icon={<DollarSign className="w-5 h-5 text-brand" />}
          iconBg="bg-brand-muted border border-brand/20"
        />
        <KPICard
          label="Total Orders"
          value="1,248"
          change={18.6}
          changeLabel=""
          icon={<ShoppingCart className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/10 border border-purple-500/20"
        />
        <KPICard
          label="Avg Order Value"
          value="₹2,280"
          change={6.3}
          changeLabel=""
          icon={<Package className="w-5 h-5 text-sky-400" />}
          iconBg="bg-sky-500/10 border border-sky-500/20"
        />
        <KPICard
          label="Growth Rate"
          value="↑18.6%"
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          iconBg="bg-success-muted border border-success/20"
        />
      </div>

      {/* Revenue + Orders chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-text mb-4">
            Revenue Over Time
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={CHART_DATA.revenueOrders}
              margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<TooltipBox />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={{ fill: "#22d3ee", r: 3 }}
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
              data={CHART_DATA.revenueOrders}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#64748b", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#64748b", fontSize: 11 }}
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
          <h3 className="text-sm font-semibold text-text mb-4">Top Products</h3>
          <div className="space-y-3">
            {CHART_DATA.topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded bg-surface-elevated text-text-muted flex items-center justify-center text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="text-text truncate max-w-40">
                      {p.name}
                    </span>
                  </div>
                  <span className="font-mono text-text-secondary">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{
                      width: `${(p.revenue / CHART_DATA.topProducts[0].revenue) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold text-text mb-4">
            Category Performance
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={CATEGORY_DATA}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 60, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#64748b", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fill: "#94a3b8", fontSize: 10 }}
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
        </Card>
      </div>

      {/* Operational metrics */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-text mb-4">
          Operational Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {OPS_DATA.map((m) => (
            <div
              key={m.metric}
              className="p-3 rounded-xl border border-border bg-surface-elevated/30"
            >
              <p className="text-[10px] text-text-muted mb-1">{m.metric}</p>
              <p
                className="text-lg font-bold font-mono"
                style={{ color: m.color }}
              >
                {m.value}
              </p>
              <p
                className={`text-[11px] font-medium mt-0.5 ${m.trend < 0 ? "text-success" : "text-danger"}`}
              >
                {m.trend > 0 ? "↑" : "↓"} {Math.abs(m.trend)}%
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
