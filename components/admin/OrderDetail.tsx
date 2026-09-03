"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Printer,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  CreditCard,
  User,
  StickyNote,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { NavigateFn } from "@/lib/navigation";
import { apiFetch } from "@/lib/api";

import {
  getAdminOrderDetails,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
  type AdminOrderDetail,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin-orders";

import type {
  OrderStatus as UiOrderStatus,
  PaymentStatus as UiPaymentStatus,
} from "@/lib/types";

interface OrderDetailProps {
  onNavigate: NavigateFn;
  orderId: string | null;
}

type TimelineEvent = {
  id: string;
  action: string;
  createdAt: string;
  user?: {
    name?: string;
  } | null;
  metadata?: Record<string, unknown> | null;
};

type TimelineResponse = {
  success: boolean;
  timeline: TimelineEvent[];
};

type ActionKey = "processing" | "shipped" | "delivered" | "cancel";

type ActionMeta = {
  title: string;
  message: string;
  consequence: string;
  reversible: boolean;
  severity: "info" | "warning" | "danger";
  nextStatus: OrderStatus;
};

const ACTIONS: {
  label: string;
  color: string;
  action: ActionKey;
}[] = [
  {
    label: "Start Processing",
    color:
      "bg-purple-500/15 text-purple-300 border border-purple-500/25 hover:bg-purple-500/25",
    action: "processing",
  },
  {
    label: "Mark Shipped",
    color:
      "bg-sky-500/15 text-sky-300 border border-sky-500/25 hover:bg-sky-500/25",
    action: "shipped",
  },
  {
    label: "Mark Delivered",
    color:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/25",
    action: "delivered",
  },
  {
    label: "Cancel Order",
    color:
      "bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25",
    action: "cancel",
  },
];

const ACTION_META: Record<ActionKey, ActionMeta> = {
  processing: {
    title: "Start Processing",
    message: "Begin processing this order?",
    consequence: "The order status will change to Processing.",
    reversible: true,
    severity: "info",
    nextStatus: "PROCESSING",
  },

  shipped: {
    title: "Mark as Shipped",
    message: "Mark this order as shipped?",
    consequence: "The order status will change to Shipped.",
    reversible: false,
    severity: "warning",
    nextStatus: "SHIPPED",
  },

  delivered: {
    title: "Mark as Delivered",
    message: "Confirm that this order has been delivered?",
    consequence: "The order status will change to Delivered.",
    reversible: false,
    severity: "warning",
    nextStatus: "DELIVERED",
  },

  cancel: {
    title: "Cancel Order",
    message: "Are you sure you want to cancel this order?",
    consequence:
      "The order will be cancelled. Any refund must be handled separately.",
    reversible: false,
    severity: "danger",
    nextStatus: "CANCELLED",
  },
};

const timelineIcons: Record<string, React.ReactNode> = {
  ORDER_STATUS_UPDATED: <Clock className="w-3.5 h-3.5" />,

  PAYMENT_STATUS_UPDATED: <CreditCard className="w-3.5 h-3.5" />,

  ORDER_CREATED: <Package className="w-3.5 h-3.5" />,

  system: <CheckCircle2 className="w-3.5 h-3.5" />,
};

const timelineColors: Record<string, string> = {
  ORDER_STATUS_UPDATED: "bg-blue-500/15 text-blue-400",

  PAYMENT_STATUS_UPDATED: "bg-emerald-500/15 text-emerald-400",

  ORDER_CREATED: "bg-purple-500/15 text-purple-400",

  system: "bg-cyan-500/15 text-cyan-400",
};

function getTimelineIcon(action: string) {
  return timelineIcons[action] ?? timelineIcons.system;
}

function getTimelineColor(action: string) {
  return timelineColors[action] ?? "bg-surface-elevated text-text-muted";
}

function getShippingValue(
  shippingDetails: unknown,
  key: string,
): string | null {
  if (
    !shippingDetails ||
    typeof shippingDetails !== "object" ||
    !(key in shippingDetails)
  ) {
    return null;
  }

  const value = (shippingDetails as Record<string, unknown>)[key];

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return null;
}

function toOrderBadgeStatus(status: OrderStatus): UiOrderStatus {
  return status.toLowerCase() as UiOrderStatus;
}

function toPaymentBadgeStatus(status: PaymentStatus): UiPaymentStatus {
  return status.toLowerCase() as UiPaymentStatus;
}


function formatTimelineAction(action: string) {
  return action
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatTimelineDate(value: string | null | undefined): string {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return formatDate(date);
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export function OrderDetail({ onNavigate, orderId }: OrderDetailProps) {
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [confirmAction, setConfirmAction] = useState<ActionKey | null>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [paymentUpdating, setPaymentUpdating] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const toast = useToast();

  /* ------------------------------------------------------------------------ */
  /* Load order                                                               */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;

    async function loadOrder(id: string) {
      try {
        setLoading(true);
        setError(null);

        const [orderResponse, timelineResponse] = await Promise.all([
          getAdminOrderDetails(id),

          apiFetch<TimelineResponse>(`/admin/orders/${id}/timeline`),
        ]);

        if (cancelled) {
          return;
        }

        setOrder(orderResponse.order);

        setTimeline(timelineResponse.timeline ?? []);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(err instanceof Error ? err.message : "Failed to load order.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrder(orderId);

    return () => {
      cancelled = true;
    };
  }, [orderId, refreshKey]);

  const handleStatusUpdate = async () => {
    if (!confirmAction || !order) {
      return;
    }

    const meta = ACTION_META[confirmAction];

    try {
      setActionLoading(true);

      await updateAdminOrderStatus(order.id, meta.nextStatus);

      toast.success(
        "Order updated",
        `Order #${order.orderNumber} is now ${meta.nextStatus.toLowerCase()}.`,
      );

      setConfirmAction(null);

      setRefreshKey((value) => value + 1);
    } catch (err) {
      toast.error(
        "Update failed",
        err instanceof Error ? err.message : "Failed to update order status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Payment status update                                                    */
  /* ------------------------------------------------------------------------ */

  const handlePaymentStatusChange = async (status: PaymentStatus) => {
    if (!order) {
      return;
    }

    try {
      setPaymentUpdating(true);

      await updateAdminPaymentStatus(order.id, status);

      toast.success(
        "Payment updated",
        `Payment status changed to ${status.toLowerCase()}.`,
      );

      setRefreshKey((value) => value + 1);
    } catch (err) {
      toast.error(
        "Payment update failed",
        err instanceof Error ? err.message : "Failed to update payment status.",
      );
    } finally {
      setPaymentUpdating(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                   */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center justify-center min-h-100">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading order...
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                     */
  /* ------------------------------------------------------------------------ */

  if (error || !order) {
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            onClick={() => onNavigate("orders")}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-base font-bold text-text">Order</h1>

            <p className="text-xs text-text-muted">
              Unable to load order details
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="flex flex-col items-center justify-center text-center gap-3">
            <Package className="w-8 h-8 text-text-muted" />

            <div>
              <p className="text-sm font-semibold text-text">
                Failed to load order
              </p>

              <p className="text-xs text-text-muted mt-1">
                {error ?? "Order not found."}
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Shipping                                                                  */
  /* ------------------------------------------------------------------------ */

  const shippingDetails = order.shippingDetails;

  const shippingName =
    getShippingValue(shippingDetails, "fullName") ??
    getShippingValue(shippingDetails, "name") ??
    order.user.name;

  const shippingPhone =
    getShippingValue(shippingDetails, "phone") ?? order.user.phone;

  const shippingAddress = getShippingValue(shippingDetails, "address");

  const shippingCity = getShippingValue(shippingDetails, "city");

  const shippingState = getShippingValue(shippingDetails, "state");

  const shippingCountry =
    getShippingValue(shippingDetails, "country") ?? "India";

  const shippingPin =
    getShippingValue(shippingDetails, "pinCode") ??
    getShippingValue(shippingDetails, "pincode");

  const meta = confirmAction ? ACTION_META[confirmAction] : null;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            onClick={() => onNavigate("orders")}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base font-bold text-text font-mono">
                Order #{order.orderNumber}
              </h1>

              <OrderStatusBadge status={toOrderBadgeStatus(order.status)} />

              <PaymentStatusBadge
                status={toPaymentBadgeStatus(order.paymentStatus)}
              />
            </div>

            <p className="text-xs text-text-muted mt-0.5">
              {formatDate(new Date(order.createdAt))} · {order.user.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Slip
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => onNavigate("invoices")}
          >
            Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Order Items */}
          <Card>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Order Items</h3>

              <span className="text-xs text-text-muted font-mono">
                {order.items.length} item
                {order.items.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="divide-y divide-border/50">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-text-muted" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text truncate">
                      {item.productName}
                    </p>

                    <p className="text-[11px] font-mono text-text-muted">
                      {item.sku}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-text">
                      × {item.quantity}
                    </p>

                    <p className="text-xs font-mono text-text-secondary">
                      {formatCurrency(Number(item.unitPrice))}
                    </p>
                  </div>

                  <div className="text-right shrink-0 w-20">
                    <p className="text-xs font-mono font-semibold text-text">
                      {formatCurrency(Number(item.subtotal))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="px-4 py-3 border-t border-border space-y-1.5 bg-surface-elevated/30">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Subtotal</span>

                <span className="font-mono text-text-secondary">
                  {formatCurrency(Number(order.subtotal))}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Discount</span>

                <span className="font-mono text-success">
                  -{formatCurrency(Number(order.discount))}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Shipping</span>

                <span className="font-mono text-text-secondary">
                  {formatCurrency(Number(order.shippingCost))}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Tax (GST)</span>

                <span className="font-mono text-text-secondary">
                  {formatCurrency(Number(order.tax))}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
                <span className="text-text">Total</span>

                <span className="font-mono text-text">
                  {formatCurrency(Number(order.total))}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-text-muted" />

              <h3 className="text-sm font-semibold text-text">Payment</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[11px] text-text-muted mb-0.5">Method</p>

                <p className="text-xs text-text">{order.paymentMethod}</p>
              </div>

              <div>
                <p className="text-[11px] text-text-muted mb-0.5">Status</p>

                <PaymentStatusBadge
                  status={toPaymentBadgeStatus(order.paymentStatus)}
                />
              </div>

              <div>
                <p className="text-[11px] text-text-muted mb-0.5">Amount</p>

                <p className="text-xs font-mono font-semibold text-text">
                  {formatCurrency(Number(order.total))}
                </p>
              </div>

              <div>
                <p className="text-[11px] text-text-muted mb-0.5">Delivery</p>

                <p className="text-xs text-text">{order.deliveryMethod}</p>
              </div>
            </div>

            {/* Payment controls */}
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-[11px] text-text-muted mb-2">
                Update payment status
              </p>

              <div className="flex flex-wrap gap-2">
                {(
                  ["PENDING", "PAID", "FAILED", "REFUNDED"] as PaymentStatus[]
                ).map((status) => (
                  <button
                    type="button"
                    key={status}
                    disabled={paymentUpdating || order.paymentStatus === status}
                    onClick={() => handlePaymentStatusChange(status)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      order.paymentStatus === status
                        ? "bg-brand/15 text-brand border-brand/25"
                        : "border-border text-text-secondary hover:text-text hover:bg-surface-elevated"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-text-muted" />

              <h3 className="text-sm font-semibold text-text">Notes</h3>
            </div>

            <div className="p-3 rounded-lg bg-surface-elevated/50 border border-border">
              <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide mb-1.5">
                Order Notes
              </p>

              <p className="text-xs text-text-secondary">
                No order notes available.
              </p>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text mb-4">
              Order Timeline
            </h3>

            {timeline.length === 0 ? (
              <div className="py-8 text-center">
                <Clock className="w-6 h-6 mx-auto text-text-muted mb-2" />

                <p className="text-xs text-text-muted">
                  No timeline activity yet.
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-3 bottom-0 w-px bg-border" />

                <div className="space-y-4">
                  {timeline.map((event) => (
                    <div
                      key={event.id}
                      className="relative flex items-start gap-3 pl-8"
                    >
                      <div
                        className={`absolute left-0 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getTimelineColor(
                          event.action,
                        )}`}
                      >
                        {getTimelineIcon(event.action)}
                      </div>

                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-xs font-medium text-text">
                          {formatTimelineAction(event.action)}
                        </p>

                        <p className="text-[11px] text-text-muted">
                          {event.user?.name ?? "System"} ·{" "}
                          {formatTimelineDate(event.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text mb-3">Actions</h3>

            <div className="space-y-2">
              {ACTIONS.map((action) => {
                const isCurrent =
                  (action.action === "processing" &&
                    order.status === "PROCESSING") ||
                  (action.action === "shipped" && order.status === "SHIPPED") ||
                  (action.action === "delivered" &&
                    order.status === "DELIVERED") ||
                  (action.action === "cancel" && order.status === "CANCELLED");

                return (
                  <button
                    type="button"
                    key={action.action}
                    disabled={isCurrent}
                    className={`w-full h-8 px-3 text-xs font-medium rounded-lg transition-colors ${action.color} disabled:opacity-40 disabled:cursor-not-allowed`}
                    onClick={() => setConfirmAction(action.action)}
                  >
                    {action.label}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Customer */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-text-muted" />

              <h3 className="text-sm font-semibold text-text">Customer</h3>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-text">{order.user.name}</p>

              <p className="text-xs text-text-secondary">{order.user.email}</p>

              {order.user.phone && (
                <p className="text-xs text-text-secondary">
                  {order.user.phone}
                </p>
              )}

              <button
                type="button"
                className="text-[11px] text-brand hover:text-cyan-300 flex items-center gap-1 mt-1 transition-colors"
                onClick={() => onNavigate("customer-detail", order.user.id)}
              >
                View profile
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </Card>

          {/* Shipping */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-text-muted" />

              <h3 className="text-sm font-semibold text-text">
                Shipping Address
              </h3>
            </div>

            <div className="text-xs text-text-secondary space-y-0.5">
              <p className="font-medium text-text">{shippingName}</p>

              {shippingPhone && <p>{shippingPhone}</p>}

              {shippingAddress && <p>{shippingAddress}</p>}

              {(shippingCity || shippingState) && (
                <p>
                  {shippingCity}
                  {shippingCity && shippingState ? ", " : ""}
                  {shippingState}
                </p>
              )}

              {(shippingCountry || shippingPin) && (
                <p>
                  {shippingCountry}
                  {shippingCountry && shippingPin ? " – " : ""}
                  {shippingPin}
                </p>
              )}

              <p className="pt-2 text-brand">{order.deliveryMethod}</p>
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-text-muted" />

              <h3 className="text-sm font-semibold text-text">Documents</h3>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text hover:bg-surface-elevated rounded-lg border border-border transition-colors"
                onClick={() => onNavigate("invoices")}
              >
                <FileText className="w-3.5 h-3.5 text-text-muted" />
                View Invoice
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text hover:bg-surface-elevated rounded-lg border border-border transition-colors"
              >
                <Printer className="w-3.5 h-3.5 text-text-muted" />
                Print Packing Slip
              </button>

              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text hover:bg-surface-elevated rounded-lg border border-border transition-colors"
              >
                <Truck className="w-3.5 h-3.5 text-text-muted" />
                Print Shipping Label
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation dialog */}
      {meta && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleStatusUpdate}
          title={meta.title}
          message={meta.message}
          entity={`Order #${order.orderNumber} · ${order.user.name}`}
          consequence={meta.consequence}
          reversible={meta.reversible}
          confirmLabel={confirmAction === "cancel" ? "Cancel Order" : "Confirm"}
          cancelLabel="Go Back"
          severity={meta.severity}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
