"use client";

import { useEffect, useState } from "react";
import { Filter, Download, Plus, Eye, ShoppingCart } from "lucide-react";

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
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { NavigateFn } from "@/lib/navigation";
import {
  getAdminOrders,
  type AdminOrder,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin-orders";

interface OrdersProps {
  onNavigate: NavigateFn;
}

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

const normalizeOrderStatus = (status: OrderStatus) => {
  return status.toLowerCase() as import("@/lib/types").OrderStatus;
};

const normalizePaymentStatus = (status: PaymentStatus) => {
  return status.toLowerCase() as import("@/lib/types").PaymentStatus;
};

export function Orders({ onNavigate }: OrdersProps) {
  const goToOrder = (id: string) => {
    onNavigate("order-detail", id);
  };

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [page, setPage] = useState(1);
  const perPage = 10;

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminOrders(page, perPage, {
          search,
          status: statusTab as OrderStatus | "",
          paymentStatus: paymentFilter as PaymentStatus | "",
        });

        if (cancelled) {
          return;
        }

        setOrders(response.orders);
        setTotal(response.pagination.total);
        setTotalPages(response.pagination.totalPages);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to fetch orders:", err);

        setOrders([]);
        setTotal(0);
        setTotalPages(1);

        setError(err instanceof Error ? err.message : "Failed to load orders");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrders();

    return () => {
      cancelled = true;
    };
  }, [page, search, statusTab, paymentFilter]);

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
    orders.length > 0 && orders.every((order) => selected.has(order.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected((current) => {
        const next = new Set(current);

        orders.forEach((order) => {
          next.delete(order.id);
        });

        return next;
      });
    } else {
      setSelected((current) => {
        const next = new Set(current);

        orders.forEach((order) => {
          next.add(order.id);
        });

        return next;
      });
    }
  };

  const changeStatusTab = (value: string) => {
    setStatusTab(value);
    setPage(1);
    setSelected(new Set());
  };

  const changePaymentFilter = (value: string) => {
    setPaymentFilter(value);
    setPage(1);
    setSelected(new Set());
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">All Orders</h2>

            <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
              {total}
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
              type="button"
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                statusTab === tab.value
                  ? "text-brand border-brand"
                  : "text-text-muted border-transparent hover:text-text-secondary"
              }`}
              onClick={() => changeStatusTab(tab.value)}
            >
              {tab.label}
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
            onChange={(e) => changePaymentFilter(e.target.value)}
          >
            <option value="">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            icon={<Filter className="w-3.5 h-3.5" />}
          >
            More Filters
          </Button>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-20 text-center">
            <p className="text-sm text-text-muted">Loading orders...</p>
          </div>
        ) : error ? (
          /* Error */
          <div className="py-20 text-center px-4">
            <p className="text-sm font-medium text-text">
              Failed to load orders
            </p>

            <p className="text-xs text-text-muted mt-1">{error}</p>

            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setError(null);
                setPage((current) => current);
              }}
            >
              Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          /* Empty */
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
                    <Th sortable>Date</Th>
                    <Th className="w-8" />
                  </tr>
                </Thead>

                <Tbody>
                  {orders.map((order) => (
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
                          {order.orderNumber}
                        </span>
                      </Td>

                      <Td>
                        <div>
                          <p className="text-xs font-medium text-text">
                            {order.user.name}
                          </p>

                          <p className="text-[11px] text-text-muted">
                            {order.user.email}
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
                          {formatCurrency(Number(order.total))}
                        </span>
                      </Td>

                      <Td>
                        <PaymentStatusBadge
                          status={normalizePaymentStatus(order.paymentStatus)}
                        />
                      </Td>

                      <Td>
                        <OrderStatusBadge
                          status={normalizeOrderStatus(order.status)}
                        />
                      </Td>

                      <Td>
                        <span className="text-xs text-text-secondary">
                          {formatDate(new Date(order.createdAt))}
                        </span>
                      </Td>

                      <Td>
                        <button
                          type="button"
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
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-surface-elevated/50 transition-colors"
                  onClick={() => goToOrder(order.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-brand">
                      {order.orderNumber}
                    </span>

                    <OrderStatusBadge
                      status={normalizeOrderStatus(order.status)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-text">
                        {order.user.name}
                      </p>

                      <p className="text-[11px] text-text-muted mt-0.5">
                        {order.items.length} item
                        {order.items.length > 1 ? "s" : ""} ·{" "}
                        {formatDate(new Date(order.createdAt))}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-mono font-semibold text-text">
                        {formatCurrency(Number(order.total))}
                      </p>

                      <div className="mt-0.5">
                        <PaymentStatusBadge
                          status={normalizePaymentStatus(order.paymentStatus)}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              total={total}
              perPage={perPage}
              onChange={(nextPage) => {
                if (nextPage >= 1 && nextPage <= totalPages) {
                  setPage(nextPage);
                  setSelected(new Set());
                }
              }}
            />
          </>
        )}
      </Card>
    </div>
  );
}
