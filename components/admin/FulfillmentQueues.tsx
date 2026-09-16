"use client";

import { useEffect, useState } from "react";
import { Printer, Check, X, RefreshCw } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";

import {
  OrderStatusBadge,
  PaymentStatusBadge,
  Badge,
} from "@/components/ui/Badge";

import { getAdminOrders, type AdminOrder } from "@/lib/admin-orders";

import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";

import {
  getAdminReturns,
  updateAdminReturnStatus,
  receiveAdminReturn,
  refundAdminReturn,
  type AdminReturn,
} from "@/lib/admin-returns";

import type {
  Page,
  OrderStatus as UIOrderStatus,
  PaymentStatus as UIPaymentStatus,
} from "@/lib/types";

interface NavProps {
  onNavigate: (page: Page, entityId?: string) => void;
}

function getUIOrderStatus(status: AdminOrder["status"]): UIOrderStatus {
  return status.toLowerCase() as UIOrderStatus;
}

function getUIPaymentStatus(
  status: AdminOrder["paymentStatus"],
): UIPaymentStatus {
  return status.toLowerCase() as UIPaymentStatus;
}

/* =========================================================
   PROCESSING
========================================================= */

export function Processing({ onNavigate }: NavProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminOrders(1, 100, {
        status: "PROCESSING",
      });

      setOrders(response.orders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load processing orders",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      try {
        const response = await getAdminOrders(1, 100, {
          status: "PROCESSING",
        });

        if (cancelled) return;

        setOrders(response.orders);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load processing orders",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">Processing Queue</h2>

          <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-xs text-text-muted">
            {orders.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-text-muted">
              Loading processing orders...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <p className="text-xs text-danger">{error}</p>

            <Button
              variant="secondary"
              size="xs"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium text-text">
              No orders in processing
            </p>

            <p className="mt-1 text-xs text-text-muted">
              New processing orders will appear here.
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
                <Th>Status</Th>
                <Th>Waiting</Th>
                <Th />
              </tr>
            </Thead>

            <Tbody>
              {orders.map((order) => (
                <Tr
                  key={order.id}
                  onClick={() => onNavigate("order-detail", order.id)}
                >
                  <Td>
                    <span className="font-mono text-xs text-brand">
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
                      status={getUIPaymentStatus(order.paymentStatus)}
                    />
                  </Td>

                  <Td>
                    <OrderStatusBadge status={getUIOrderStatus(order.status)} />
                  </Td>

                  <Td>
                    <span className="text-xs text-text-muted">
                      {timeAgo(new Date(order.createdAt))}
                    </span>
                  </Td>

                  <Td>
                    <Button
                      variant="secondary"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        onNavigate("packing", order.id);
                      }}
                    >
                      → Pack
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

/* =========================================================
   READY TO SHIP
========================================================= */

export function ReadyToShip({ onNavigate }: NavProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminOrders(1, 100, {
        status: "PACKED",
      });

      setOrders(response.orders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load ready-to-ship orders",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      try {
        const response = await getAdminOrders(1, 100, {
          status: "PACKED",
        });

        if (cancelled) return;

        setOrders(response.orders);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load ready-to-ship orders",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">Ready to Ship</h2>

          <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-xs text-text-muted">
            {orders.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-text-muted">
              Loading ready-to-ship orders...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <p className="text-xs text-danger">{error}</p>

            <Button
              variant="secondary"
              size="xs"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium text-text">
              No orders ready to ship
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Packed orders will appear here.
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
                <Th>Shipping Method</Th>
                <Th />
              </tr>
            </Thead>

            <Tbody>
              {orders.map((order) => (
                <Tr
                  key={order.id}
                  onClick={() => onNavigate("order-detail", order.id)}
                >
                  <Td>
                    <span className="font-mono text-xs text-brand">
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
                    <span className="text-xs text-text-secondary">
                      {order.deliveryMethod}
                    </span>
                  </Td>

                  <Td>
                    <Button
                      variant="primary"
                      size="xs"
                      onClick={(event) => {
                        event.stopPropagation();
                        onNavigate("shipping", order.id);
                      }}
                    >
                      Ship
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

/* =========================================================
   SHIPPING
========================================================= */

export function Shipping({ onNavigate }: NavProps) {
  const [tab, setTab] = useState<"SHIPPED" | "DELIVERED">("SHIPPED");

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminOrders(1, 100, {
        status: tab,
      });

      setOrders(response.orders);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load shipping orders",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      try {
        const response = await getAdminOrders(1, 100, {
          status: tab,
        });

        if (cancelled) return;

        setOrders(response.orders);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Unable to load shipping orders",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-5">
      <div className="flex items-center gap-2">
        {(["SHIPPED", "DELIVERED"] as const).map((status) => (
          <button
            key={status}
            className={`h-7 rounded-lg px-3 text-xs font-medium capitalize transition-colors ${
              tab === status
                ? "bg-brand text-surface"
                : "border border-border bg-surface-elevated text-text-secondary hover:text-text"
            }`}
            onClick={() => setTab(status)}
          >
            {status.toLowerCase()}
          </button>
        ))}
      </div>

      <Card>
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">
            Shipping Management
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-text-muted">
              Loading shipping orders...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
            <p className="text-xs text-danger">{error}</p>

            <Button
              variant="secondary"
              size="xs"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-3 w-3 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium text-text">
              No {tab.toLowerCase()} orders
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
                <Th>Status</Th>
                <Th>Date</Th>
                <Th />
              </tr>
            </Thead>

            <Tbody>
              {orders.map((order) => (
                <Tr
                  key={order.id}
                  onClick={() => onNavigate("order-detail", order.id)}
                >
                  <Td>
                    <span className="font-mono text-xs text-brand">
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
                    <OrderStatusBadge status={getUIOrderStatus(order.status)} />
                  </Td>

                  <Td>
                    <span className="text-xs text-text-muted">
                      {formatDate(new Date(order.createdAt))}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={<Printer className="h-3 w-3" />}
                        onClick={(event) => {
                          event.stopPropagation();
                          window.print();
                        }}
                      />

                      <Button
                        variant="ghost"
                        size="xs"
                        onClick={(event) => {
                          event.stopPropagation();
                          onNavigate("order-detail", order.id);
                        }}
                      >
                        View
                      </Button>
                    </div>
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

/* =========================================================
   RETURNS
========================================================= */

export function Returns() {
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminReturns();

      setReturns(response.returns);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load returns.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialLoad = async () => {
      try {
        const response = await getAdminReturns();

        if (cancelled) return;

        setReturns(response.returns);
        setError(null);
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error ? err.message : "Failed to load returns.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, []);

  const runAction = async (id: string, action: () => Promise<unknown>) => {
    try {
      setActionId(id);
      setError(null);

      await action();
      await handleRetry();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update return.");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-text">Returns & Refunds</h2>

          <span className="rounded-full bg-surface-elevated px-2 py-0.5 font-mono text-xs text-text-muted">
            {returns.length}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs text-text-muted">Loading returns...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <p className="text-xs text-danger">{error}</p>

            <Button
              variant="outline"
              onClick={() => void handleRetry()}
              disabled={loading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          </div>
        ) : returns.length === 0 ? (
          <div className="px-4 py-16 text-center">
            <p className="text-sm font-medium text-text">No return requests</p>

            <p className="mt-1 text-xs text-text-muted">
              Return requests will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Return ID</Th>
                <Th>Order</Th>
                <Th>Customer</Th>
                <Th>Product</Th>
                <Th>Reason</Th>
                <Th>Refund</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th />
              </tr>
            </Thead>

            <Tbody>
              {returns.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <span className="font-mono text-xs text-brand">{r.id}</span>
                  </Td>

                  <Td>
                    <span className="font-mono text-xs text-text-secondary">
                      {r.orderNumber}
                    </span>
                  </Td>

                  <Td>
                    <div>
                      <p className="text-xs text-text">{r.customerName}</p>

                      <p className="text-[11px] text-text-muted">
                        {r.customerEmail}
                      </p>
                    </div>
                  </Td>

                  <Td>
                    <span className="block max-w-35 truncate text-xs text-text-secondary">
                      {r.productName}
                    </span>
                  </Td>

                  <Td>
                    <span className="block max-w-30 truncate text-xs text-text-secondary">
                      {r.reason}
                    </span>
                  </Td>

                  <Td>
                    <span className="font-mono text-xs font-medium text-text">
                      {formatCurrency(Number(r.refundAmount))}
                    </span>
                  </Td>

                  <Td>
                    <Badge
                      className={
                        r.status === "REQUESTED"
                          ? "border border-amber-500/25 bg-amber-500/15 text-amber-300"
                          : r.status === "APPROVED"
                            ? "border border-blue-500/25 bg-blue-500/15 text-blue-300"
                            : r.status === "COMPLETED"
                              ? "border border-green-500/25 bg-green-500/15 text-green-300"
                              : "border border-red-500/25 bg-red-500/15 text-red-300"
                      }
                    >
                      {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                    </Badge>
                  </Td>

                  <Td>
                    <span className="text-xs text-text-muted">
                      {formatDate(new Date(r.createdAt))}
                    </span>
                  </Td>

                  <Td>
                    <div className="flex items-center gap-1">
                      {r.status === "REQUESTED" && (
                        <>
                          <Button
                            variant="success"
                            size="xs"
                            icon={<Check className="h-3 w-3" />}
                            disabled={actionId === r.id}
                            onClick={() =>
                              void runAction(r.id, () =>
                                updateAdminReturnStatus(r.id, "APPROVED"),
                              )
                            }
                          >
                            Approve
                          </Button>

                          <Button
                            variant="danger"
                            size="xs"
                            icon={<X className="h-3 w-3" />}
                            disabled={actionId === r.id}
                            onClick={() =>
                              void runAction(r.id, () =>
                                updateAdminReturnStatus(r.id, "REJECTED"),
                              )
                            }
                          >
                            Reject
                          </Button>
                        </>
                      )}

                      {r.status === "APPROVED" && (
                        <Button
                          variant="secondary"
                          size="xs"
                          disabled={actionId === r.id}
                          onClick={() =>
                            void runAction(r.id, () => receiveAdminReturn(r.id))
                          }
                        >
                          Receive
                        </Button>
                      )}

                      {r.status === "COMPLETED" &&
                        r.refundStatus === "APPROVED" && (
                          <Button
                            variant="primary"
                            size="xs"
                            disabled={actionId === r.id}
                            onClick={() =>
                              void runAction(r.id, () =>
                                refundAdminReturn(r.id),
                              )
                            }
                          >
                            Refund
                          </Button>
                        )}
                    </div>
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
