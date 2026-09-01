"use client";

import { useState } from "react";
import {
  Users,
  Eye,
  UserCheck,
  ArrowLeft,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import { Card, KPICard } from "@/components/ui/Card";
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
import { StatusDot } from "@/components/ui/Badge";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { MOCK_CUSTOMERS, MOCK_ORDERS } from "@/lib/data";
import type { Page } from "@/lib/types";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";

interface CustomersProps {
  onNavigate: (page: Page) => void;
  customerId?: string | null;
}

export function Customers({ onNavigate, customerId }: CustomersProps) {
  const initialCustomer = customerId
    ? (MOCK_CUSTOMERS.find((c) => c.id === customerId) ?? MOCK_CUSTOMERS[0])
    : MOCK_CUSTOMERS[0];
  const [view, setView] = useState<"list" | "detail">(
    customerId ? "detail" : "list",
  );
  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const filtered = MOCK_CUSTOMERS.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(search);
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (view === "detail") {
    const cOrders = MOCK_ORDERS.filter(
      (o) => o.customerId === selectedCustomer.id,
    );
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-3 mb-5">
          <button
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            onClick={() => setView("list")}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base font-bold text-text">
              {selectedCustomer.name}
            </h1>
            <p className="text-xs text-text-muted">
              {selectedCustomer.email} · {selectedCustomer.phone}
            </p>
          </div>
          <div className="ml-2">
            <StatusDot active={selectedCustomer.status === "active"} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            {/* Order history */}
            <Card>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">
                  Order History
                </h3>
                <span className="text-xs text-text-muted font-mono">
                  {selectedCustomer.orders} orders ·{" "}
                  {formatCurrency(selectedCustomer.totalSpending)}
                </span>
              </div>
              {cOrders.length > 0 ? (
                <Table>
                  <Thead>
                    <tr>
                      <Th>Order ID</Th>
                      <Th>Amount</Th>
                      <Th>Payment</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </tr>
                  </Thead>
                  <Tbody>
                    {cOrders.map((o) => (
                      <Tr key={o.id} onClick={() => onNavigate("order-detail")}>
                        <Td>
                          <span className="font-mono text-xs text-brand">
                            {o.id}
                          </span>
                        </Td>
                        <Td>
                          <span className="font-mono text-xs font-medium text-text">
                            {formatCurrency(o.total)}
                          </span>
                        </Td>
                        <Td>
                          <PaymentStatusBadge status={o.paymentStatus} />
                        </Td>
                        <Td>
                          <OrderStatusBadge status={o.orderStatus} />
                        </Td>
                        <Td>
                          <span className="text-xs text-text-muted">
                            {formatShortDate(o.date)}
                          </span>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <p className="px-4 py-6 text-xs text-text-muted text-center">
                  No orders from this customer.
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Customer Stats
              </h3>
              {[
                {
                  label: "Total Orders",
                  value: selectedCustomer.orders,
                  mono: true,
                },
                {
                  label: "Total Spending",
                  value: formatCurrency(selectedCustomer.totalSpending),
                  mono: true,
                },
                {
                  label: "Avg Order Value",
                  value: formatCurrency(
                    selectedCustomer.totalSpending /
                      (selectedCustomer.orders || 1),
                  ),
                  mono: true,
                },
                {
                  label: "Member Since",
                  value: formatShortDate(selectedCustomer.joinedDate),
                  mono: false,
                },
                {
                  label: "Last Order",
                  value: selectedCustomer.lastOrderDate
                    ? formatShortDate(selectedCustomer.lastOrderDate)
                    : "Never",
                  mono: false,
                },
                {
                  label: "Status",
                  value: (
                    <StatusDot active={selectedCustomer.status === "active"} />
                  ),
                  mono: false,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                >
                  <span className="text-[11px] text-text-muted">
                    {row.label}
                  </span>
                  <span
                    className={`text-xs text-text ${row.mono ? "font-mono" : ""}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </Card>
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Edit Customer
                </Button>
                <Button variant="danger" size="sm" className="w-full">
                  Disable Account
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <KPICard
          label="Total Customers"
          value={MOCK_CUSTOMERS.length}
          icon={<Users className="w-5 h-5 text-brand" />}
          iconBg="bg-brand-muted border border-brand/20"
        />
        <KPICard
          label="Active"
          value={MOCK_CUSTOMERS.filter((c) => c.status === "active").length}
          icon={<UserCheck className="w-5 h-5 text-success" />}
          iconBg="bg-success-muted border border-success/20"
        />
        <KPICard
          label="Total Orders"
          value={MOCK_CUSTOMERS.reduce((s, c) => s + c.orders, 0)}
          icon={<ShoppingCart className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/10 border border-purple-500/20"
        />
        <KPICard
          label="Total Revenue"
          value={formatCurrency(
            MOCK_CUSTOMERS.reduce((s, c) => s + c.totalSpending, 0),
          )}
          icon={<CreditCard className="w-5 h-5 text-sky-400" />}
          iconBg="bg-sky-500/10 border border-sky-500/20"
        />
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Customers</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              className="w-56"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Customer</Th>
              <Th>Phone</Th>
              <Th sortable>Orders</Th>
              <Th sortable>Total Spending</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th className="w-12" />
            </tr>
          </Thead>
          <Tbody>
            {paged.map((c) => (
              <Tr
                key={c.id}
                onClick={() => {
                  setSelectedCustomer(c);
                  setView("detail");
                }}
              >
                <Td>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-brand-muted border border-brand/20 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                      {c.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-text">{c.name}</p>
                      <p className="text-[11px] text-text-muted">{c.email}</p>
                    </div>
                  </div>
                </Td>
                <Td>
                  <span className="text-xs font-mono">{c.phone}</span>
                </Td>
                <Td>
                  <span className="font-mono text-xs font-medium text-text">
                    {c.orders}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-xs font-medium text-text">
                    {formatCurrency(c.totalSpending)}
                  </span>
                </Td>
                <Td>
                  <StatusDot active={c.status === "active"} />
                </Td>
                <Td>
                  <span className="text-xs text-text-muted">
                    {formatShortDate(c.joinedDate)}
                  </span>
                </Td>
                <Td>
                  <button
                    className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCustomer(c);
                      setView("detail");
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
        <Pagination
          page={page}
          total={filtered.length}
          perPage={perPage}
          onChange={setPage}
        />
      </Card>
    </div>
  );
}
