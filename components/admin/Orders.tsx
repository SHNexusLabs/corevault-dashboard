"use client";

import { useState } from "react";
import { Filter, Download, Plus, Eye } from "lucide-react";
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
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PriorityBadge,
} from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MOCK_ORDERS } from "@/lib/data";
import type { NavigateFn } from "@/lib/navigation";
import { ShoppingCart } from "lucide-react";

interface OrdersProps {
  onNavigate: NavigateFn;
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Placed", value: "placed" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Processing", value: "processing" },
  { label: "Packed", value: "packed" },
  { label: "Ready to Ship", value: "ready_to_ship" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export function Orders({ onNavigate }: OrdersProps) {
  const goToOrder = (id: string) => onNavigate("order-detail", id);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = MOCK_ORDERS.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.transactionId.toLowerCase().includes(q);
    const matchStatus = !statusTab || o.orderStatus === statusTab;
    const matchPayment = !paymentFilter || o.paymentStatus === paymentFilter;
    const matchPriority = !priorityFilter || o.priority === priorityFilter;
    return matchSearch && matchStatus && matchPayment && matchPriority;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);

    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }

    setSelected(next);
  };

  const allSelected =
    paged.length > 0 && paged.every((o) => selected.has(o.id));
  const toggleAll = () => {
    if (allSelected)
      setSelected((s) => {
        const n = new Set(s);
        paged.forEach((o) => n.delete(o.id));
        return n;
      });
    else
      setSelected((s) => {
        const n = new Set(s);
        paged.forEach((o) => n.add(o.id));
        return n;
      });
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">All Orders</h2>
            <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
              {MOCK_ORDERS.length}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {selected.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-secondary">
                  {selected.size} selected
                </span>
                <Button variant="outline" size="sm">
                  Bulk Status
                </Button>
                <Button variant="outline" size="sm">
                  Print Labels
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Order
            </Button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="px-4 pt-3 flex items-center gap-0.5 overflow-x-auto border-b border-border pb-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${statusTab === tab.value ? "text-brand border-brand" : "text-text-muted border-transparent hover:text-text-secondary"}`}
              onClick={() => {
                setStatusTab(tab.value);
                setPage(1);
              }}
            >
              {tab.label}
              {tab.value === "" && (
                <span className="ml-1.5 text-[10px] bg-surface-elevated px-1.5 py-0.5 rounded-full font-mono">
                  {MOCK_ORDERS.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-b border-border">
          <SearchInput
            className="w-56"
            placeholder="Search orders, customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select
            value={paymentFilter}
            onChange={(e) => {
              setPaymentFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>
          <Select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
          </Select>
          <Button
            variant="ghost"
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
          >
            More Filters
          </Button>
        </div>

        {/* Table / Card list */}
        {paged.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders found"
            message="Try adjusting your filters or search query."
            className="py-20"
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <Thead>
                  <tr>
                    <Th className="w-8">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="rounded border-border bg-surface-elevated accent-brand"
                      />
                    </Th>
                    <Th sortable>Order ID</Th>
                    <Th sortable>Customer</Th>
                    <Th>Items</Th>
                    <Th sortable>Amount</Th>
                    <Th>Payment</Th>
                    <Th>Order Status</Th>
                    <Th>Priority</Th>
                    <Th sortable>Date</Th>
                    <Th className="w-8" />
                  </tr>
                </Thead>
                <Tbody>
                  {paged.map((order) => (
                    <Tr
                      key={order.id}
                      onClick={() => goToOrder(order.id)}
                      selected={selected.has(order.id)}
                    >
                      <Td>
                        <input
                          type="checkbox"
                          checked={selected.has(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-border bg-surface-elevated accent-brand"
                        />
                      </Td>
                      <Td>
                        <span className="font-mono text-xs font-semibold text-brand">
                          {order.id}
                        </span>
                      </Td>
                      <Td>
                        <div>
                          <p className="text-xs font-medium text-text">
                            {order.customerName}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {order.customerEmail}
                          </p>
                        </div>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs text-text">
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </span>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs font-medium text-text">
                          {formatCurrency(order.total)}
                        </span>
                      </Td>
                      <Td>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </Td>
                      <Td>
                        <OrderStatusBadge status={order.orderStatus} />
                      </Td>
                      <Td>
                        <PriorityBadge priority={order.priority} />
                      </Td>
                      <Td>
                        <span className="text-xs text-text-secondary">
                          {formatDate(order.date)}
                        </span>
                      </Td>
                      <Td>
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            goToOrder(order.id);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-border/50">
              {paged.map((order) => (
                <button
                  key={order.id}
                  className="w-full text-left px-4 py-3 hover:bg-surface-elevated/50 transition-colors"
                  onClick={() => goToOrder(order.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-brand">
                      {order.id}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      <OrderStatusBadge status={order.orderStatus} />
                      <PriorityBadge priority={order.priority} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-text">
                        {order.customerName}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""} ·{" "}
                        {formatDate(order.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold text-text">
                        {formatCurrency(order.total)}
                      </p>
                      <div className="mt-0.5">
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <Pagination
              page={page}
              total={filtered.length}
              perPage={perPage}
              onChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
