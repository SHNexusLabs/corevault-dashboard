"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Package,
  CheckSquare,
  Square,
  Printer,
  AlertTriangle,
  Clock,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";

import { PaymentStatusBadge } from "@/components/ui/Badge";

import {
  getAdminOrderDetails,
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrder,
} from "@/lib/admin-orders";

import { formatCurrency, timeAgo } from "@/lib/utils";

import { cn } from "@/lib/utils";

type PackingView = "queue" | "detail";

export function Packing() {
  const [view, setView] = useState<PackingView>("queue");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  const [packing, setPacking] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  /* ========================================================
     LOAD PROCESSING ORDERS
  ======================================================== */

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getAdminOrders(1, 100, {
          status: "PROCESSING",
        });

        if (cancelled) return;

        setOrders(response.orders);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Unable to load packing orders",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ========================================================
     FILTER
  ======================================================== */

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.orderNumber.toLowerCase().includes(query) ||
        order.user.name.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query)
      );
    });
  }, [orders, search]);

  /* ========================================================
     OPEN ORDER DETAIL
  ======================================================== */

  const openOrder = async (orderId: string) => {
    try {
      setDetailLoading(true);
      setError(null);

      const response = await getAdminOrderDetails(orderId);

      setSelectedOrder(response.order);
      setCheckedItems(new Set());
      setView("detail");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load order details",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* ========================================================
     BACK TO QUEUE
  ======================================================== */

  const backToQueue = () => {
    setView("queue");
    setSelectedOrder(null);
    setCheckedItems(new Set());
    setDetailError(null);
  };

  /* ========================================================
     TOGGLE ITEM
  ======================================================== */

  const toggleItem = (itemId: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);

      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }

      return next;
    });
  };

  /* ========================================================
     MARK AS PACKED
  ======================================================== */

  const markAsPacked = async () => {
    if (!selectedOrder) return;

    const allChecked = selectedOrder.items.every((item) =>
      checkedItems.has(item.id),
    );

    if (!allChecked) {
      return;
    }

    try {
      setPacking(true);
      setDetailError(null);

      await updateAdminOrderStatus(selectedOrder.id, "PACKED");

      /*
       * Remove the packed order from the local processing
       * queue immediately.
       */
      setOrders((current) =>
        current.filter((order) => order.id !== selectedOrder.id),
      );

      backToQueue();
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Unable to mark order as packed",
      );
    } finally {
      setPacking(false);
    }
  };

  /* ========================================================
     DETAIL VIEW
  ======================================================== */

  if (view === "detail") {
    if (detailLoading || !selectedOrder) {
      return (
        <div className="flex flex-1 items-center justify-center p-5">
          <p className="text-xs text-text-muted">Loading order...</p>
        </div>
      );
    }

    const allChecked =
      selectedOrder.items.length > 0 &&
      selectedOrder.items.every((item) => checkedItems.has(item.id));

    const progress =
      selectedOrder.items.length === 0
        ? 0
        : Math.round((checkedItems.size / selectedOrder.items.length) * 100);

    return (
      <div className="flex-1 overflow-y-auto p-5">
        {/* Header */}
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-muted transition-colors hover:bg-surface-elevated hover:text-text"
              onClick={backToQueue}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div>
              <h1 className="text-base font-bold text-text">
                Pack{" "}
                <span className="font-mono text-brand">
                  {selectedOrder.orderNumber}
                </span>
              </h1>

              <p className="text-xs text-text-muted">
                {selectedOrder.user.name} · {selectedOrder.items.length} item
                {selectedOrder.items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="h-3.5 w-3.5" />}
              onClick={() => window.print()}
            >
              Print Slip
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<Printer className="h-3.5 w-3.5" />}
              onClick={() => window.print()}
            >
              Print Label
            </Button>

            <Button
              variant={allChecked ? "primary" : "secondary"}
              size="sm"
              icon={
                allChecked ? (
                  <Package className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )
              }
              disabled={!allChecked || packing}
              onClick={() => void markAsPacked()}
            >
              {packing
                ? "Marking..."
                : allChecked
                  ? "Mark as Packed"
                  : `Verify all items (${checkedItems.size}/${selectedOrder.items.length})`}
            </Button>
          </div>
        </div>

        {detailError && (
          <Card className="mb-4 border-danger/30 bg-danger-muted/20 p-3">
            <p className="text-xs text-danger">{detailError}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          {/* Item verification */}
          <Card className="xl:col-span-2">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-text">
                Item Verification Checklist
              </h3>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-text-muted">
                  {checkedItems.size}/{selectedOrder.items.length} verified
                </span>

                {!allChecked && (
                  <span className="flex items-center gap-1 text-xs text-warning">
                    <AlertTriangle className="h-3 w-3" />
                    Items pending
                  </span>
                )}
              </div>
            </div>

            <div className="divide-y divide-border/50">
              {selectedOrder.items.map((item) => {
                const isChecked = checkedItems.has(item.id);

                return (
                  <button
                    type="button"
                    key={item.id}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                      isChecked
                        ? "bg-success-muted/30"
                        : "hover:bg-surface-elevated",
                    )}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors",
                        isChecked ? "text-success" : "text-text-muted",
                      )}
                    >
                      {isChecked ? (
                        <CheckSquare className="h-5 w-5" />
                      ) : (
                        <Square className="h-5 w-5" />
                      )}
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-elevated">
                      <Package className="h-4 w-4 text-text-muted" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-xs font-medium transition-colors",
                          isChecked
                            ? "text-text line-through opacity-60"
                            : "text-text",
                        )}
                      >
                        {item.productName}
                      </p>

                      <p className="text-[11px] font-mono text-brand">
                        SKU: {item.sku}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-mono text-xs font-semibold text-text">
                        × {item.quantity}
                      </p>

                      <p className="text-[11px] text-text-muted">
                        {formatCurrency(Number(item.unitPrice))}
                      </p>
                    </div>

                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isChecked
                          ? "bg-success text-white"
                          : "border border-border bg-surface-elevated text-text-muted",
                      )}
                    >
                      {isChecked ? "✓" : "?"}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Progress */}
            <div className="border-t border-border px-4 py-3">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-text-muted">Packing progress</span>

                <span className="font-mono text-text-secondary">
                  {progress}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    allChecked ? "bg-success" : "bg-brand",
                  )}
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              {!allChecked && (
                <p className="mt-2 flex items-center gap-1 text-[11px] text-warning">
                  <AlertTriangle className="h-3 w-3" />
                  All items must be verified before marking as packed.
                </p>
              )}
            </div>
          </Card>

          {/* Order info */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Order Info
              </h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-muted">Order ID</span>

                  <span className="font-mono text-xs text-brand">
                    {selectedOrder.orderNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-muted">Customer</span>

                  <span className="text-right text-xs text-text-secondary">
                    {selectedOrder.user.name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-muted">Items</span>

                  <span className="text-xs text-text-secondary">
                    {selectedOrder.items.length} items
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-muted">Total</span>

                  <span className="font-mono text-xs font-medium text-text">
                    {formatCurrency(Number(selectedOrder.total))}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-muted">Payment</span>

                  <PaymentStatusBadge
                    status={
                      selectedOrder.paymentStatus.toLowerCase() as
                        | "pending"
                        | "paid"
                        | "failed"
                        | "refunded"
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-text-muted">Delivery</span>

                  <span className="text-xs text-text-secondary">
                    {selectedOrder.deliveryMethod}
                  </span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
                Customer
              </h3>

              <div className="space-y-1">
                <p className="text-xs font-medium text-text">
                  {selectedOrder.user.name}
                </p>

                <p className="text-[11px] text-text-secondary">
                  {selectedOrder.user.email}
                </p>

                {selectedOrder.user.phone && (
                  <p className="text-[11px] text-text-secondary">
                    {selectedOrder.user.phone}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  /* ========================================================
     QUEUE VIEW
  ======================================================== */

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Stats */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-3">
          <p className="mb-0.5 text-[11px] text-text-muted">Awaiting Packing</p>

          <p className="font-mono text-xl font-bold text-brand">
            {orders.length}
          </p>
        </Card>

        <Card className="p-3">
          <p className="mb-0.5 text-[11px] text-text-muted">Verified Orders</p>

          <p className="font-mono text-xl font-bold text-success">0</p>
        </Card>

        <Card className="p-3">
          <p className="mb-0.5 text-[11px] text-text-muted">Queue Status</p>

          <p className="font-mono text-xl font-bold text-text">
            {loading ? "Loading" : "Live"}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">Packing Queue</h2>

          <SearchInput
            className="w-56"
            placeholder="Search orders..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-text-muted">Loading packing queue...</p>
          </div>
        ) : error ? (
          <div className="px-4 py-12 text-center">
            <p className="text-xs text-danger">{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium text-text">
              No orders awaiting packing
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Orders in processing will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Customer</Th>
                <Th>Items</Th>
                <Th>Amount</Th>
                <Th>Payment</Th>
                <Th>Waiting</Th>
                <Th />
              </tr>
            </Thead>

            <Tbody>
              {filteredOrders.map((order) => (
                <Tr key={order.id} onClick={() => void openOrder(order.id)}>
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
                    <span className="font-mono text-xs">
                      {order.items.length}
                    </span>
                  </Td>

                  <Td>
                    <span className="font-mono text-xs font-medium text-text">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </Td>

                  <Td>
                    <PaymentStatusBadge
                      status={
                        order.paymentStatus.toLowerCase() as
                          | "pending"
                          | "paid"
                          | "failed"
                          | "refunded"
                      }
                    />
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1 text-xs text-text-muted">
                      <Clock className="h-3 w-3" />

                      {timeAgo(new Date(order.createdAt))}
                    </div>
                  </Td>

                  <Td>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();

                        void openOrder(order.id);
                      }}
                    >
                      Pack
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
