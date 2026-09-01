"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  FulfillmentStatusBadge,
  PriorityBadge,
} from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MOCK_ORDERS } from "@/lib/data";
import type { NavigateFn } from "@/lib/navigation";

interface OrderDetailProps {
  onNavigate: NavigateFn;
  orderId: string | null;
}

type ActionKey =
  | "confirm"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancel";

const ACTIONS: { label: string; color: string; action: ActionKey }[] = [
  {
    label: "Confirm Order",
    color:
      "bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25",
    action: "confirm",
  },
  {
    label: "Start Processing",
    color:
      "bg-purple-500/15 text-purple-300 border border-purple-500/25 hover:bg-purple-500/25",
    action: "processing",
  },
  {
    label: "Mark Packed",
    color:
      "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/25",
    action: "packed",
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

const ACTION_META: Record<
  ActionKey,
  {
    title: string;
    message: string;
    consequence: string;
    reversible: boolean;
    severity: "info" | "warning" | "danger";
  }
> = {
  confirm: {
    title: "Confirm Order",
    message: "Mark this order as confirmed and ready for processing?",
    consequence: "Order moves to Confirmed status. Customer will be notified.",
    reversible: true,
    severity: "info",
  },
  processing: {
    title: "Start Processing",
    message: "Begin fulfillment processing for this order?",
    consequence:
      "Order status changes to Processing. Items will be reserved in inventory.",
    reversible: true,
    severity: "info",
  },
  packed: {
    title: "Mark as Packed",
    message: "Confirm that all items have been packed for this order?",
    consequence:
      "Order moves to Packed. You can then generate a shipping label.",
    reversible: true,
    severity: "info",
  },
  shipped: {
    title: "Mark as Shipped",
    message: "Mark this order as shipped and in transit?",
    consequence:
      "Customer will receive a shipping notification. Tracking becomes active.",
    reversible: false,
    severity: "warning",
  },
  delivered: {
    title: "Mark as Delivered",
    message: "Confirm delivery of this order?",
    consequence:
      "Order is closed as delivered. Payment settlement will be triggered.",
    reversible: false,
    severity: "warning",
  },
  cancel: {
    title: "Cancel Order",
    message: "Are you sure you want to cancel this order?",
    consequence:
      "All reserved inventory is released. If paid, a refund will need to be processed separately.",
    reversible: false,
    severity: "danger",
  },
};

const timelineIcons: Record<string, React.ReactNode> = {
  order: <Clock className="w-3.5 h-3.5" />,
  payment: <CreditCard className="w-3.5 h-3.5" />,
  fulfillment: <Package className="w-3.5 h-3.5" />,
  system: <CheckCircle2 className="w-3.5 h-3.5" />,
};
const timelineColors: Record<string, string> = {
  order: "bg-blue-500/15 text-blue-400",
  payment: "bg-emerald-500/15 text-emerald-400",
  fulfillment: "bg-purple-500/15 text-purple-400",
  system: "bg-cyan-500/15 text-cyan-400",
};

export function OrderDetail({ onNavigate, orderId }: OrderDetailProps) {
  const order =
    (orderId ? MOCK_ORDERS.find((o) => o.id === orderId) : null) ??
    MOCK_ORDERS[0];
  const [confirmAction, setConfirmAction] = useState<ActionKey | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const handleConfirm = () => {
    if (!confirmAction) return;
    setActionLoading(true);
    setTimeout(() => {
      setActionLoading(false);
      setConfirmAction(null);
      const labels: Record<ActionKey, string> = {
        confirm: "Order confirmed",
        processing: "Processing started",
        packed: "Order marked as packed",
        shipped: "Order marked as shipped",
        delivered: "Order marked as delivered",
        cancel: "Order cancelled",
      };
      const isCritical = confirmAction === "cancel";
      if (isCritical)
        toast.warning(labels[confirmAction], `${order.id} has been cancelled.`);
      else
        toast.success(
          labels[confirmAction],
          `${order.id} status updated successfully.`,
        );
    }, 800);
  };

  const meta = confirmAction ? ACTION_META[confirmAction] : null;

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            onClick={() => onNavigate("orders")}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-base font-bold text-text font-mono">
                Order #{order.id}
              </h1>
              <OrderStatusBadge status={order.orderStatus} />
              <PaymentStatusBadge status={order.paymentStatus} />
              <FulfillmentStatusBadge status={order.fulfillmentStatus} />
              <PriorityBadge priority={order.priority} />
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              {formatDate(order.date)} · {order.customerName}
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
          >
            Invoice
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Package className="w-3.5 h-3.5" />}
            onClick={() => onNavigate("packing-detail")}
          >
            Go to Packing
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Main column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Order items */}
          <Card>
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Order Items</h3>
              <span className="text-xs text-text-muted font-mono">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
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
                    {item.variantName && (
                      <p className="text-[11px] text-text-secondary truncate">
                        {item.variantName}
                      </p>
                    )}
                    <p className="text-[11px] font-mono text-text-muted">
                      {item.sku}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono text-text">
                      × {item.quantity}
                    </p>
                    <p className="text-xs font-mono text-text-secondary">
                      {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <div className="text-right shrink-0 w-20">
                    <p className="text-xs font-mono font-semibold text-text">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                    {item.discount > 0 && (
                      <p className="text-[11px] text-success">
                        -{formatCurrency(item.discount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Financial summary */}
            <div className="px-4 py-3 border-t border-border space-y-1.5 bg-surface-elevated/30">
              {[
                { label: "Subtotal", value: formatCurrency(order.subtotal) },
                {
                  label: "Discount",
                  value: `-${formatCurrency(order.discount)}`,
                  color: "text-success",
                },
                { label: "Shipping", value: formatCurrency(order.shipping) },
                { label: "Tax (GST)", value: formatCurrency(order.tax) },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-text-muted">{row.label}</span>
                  <span
                    className={`font-mono ${row.color || "text-text-secondary"}`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
                <span className="text-text">Total</span>
                <span className="font-mono text-text">
                  {formatCurrency(order.total)}
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
              {[
                { label: "Method", value: order.paymentMethod },
                {
                  label: "Status",
                  value: <PaymentStatusBadge status={order.paymentStatus} />,
                },
                {
                  label: "Transaction ID",
                  value: (
                    <span className="font-mono text-xs text-brand">
                      {order.transactionId}
                    </span>
                  ),
                },
                {
                  label: "Amount",
                  value: (
                    <span className="font-mono font-semibold">
                      {formatCurrency(order.total)}
                    </span>
                  ),
                },
              ].map((row) => (
                <div key={row.label}>
                  <p className="text-[11px] text-text-muted mb-0.5">
                    {row.label}
                  </p>
                  <div className="text-xs text-text">{row.value}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-text">Notes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-1.5">
                  Customer Note
                </p>
                <p className="text-xs text-text-secondary">
                  {order.customerNote || "No customer note."}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wide mb-1.5">
                  Staff Note
                </p>
                <p className="text-xs text-text-secondary">
                  {order.staffNote || "No staff note."}
                </p>
                <button className="mt-2 text-[11px] text-brand hover:text-cyan-300 transition-colors">
                  + Add note
                </button>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text mb-4">
              Order Timeline
            </h3>
            <div className="relative">
              <div className="absolute left-4 top-3 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {order.timeline.map((event) => (
                  <div
                    key={event.id}
                    className="relative flex items-start gap-3 pl-8"
                  >
                    <div
                      className={`absolute left-0 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${timelineColors[event.type] ?? "bg-surface-elevated text-text-muted"}`}
                    >
                      {timelineIcons[event.type]}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-xs font-medium text-text">
                        {event.action}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {event.user} · {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-4">
          {/* Actions */}
          <Card className="p-4">
            <h3 className="text-sm font-semibold text-text mb-3">Actions</h3>
            <div className="space-y-2">
              {ACTIONS.map((a) => (
                <button
                  key={a.action}
                  className={`w-full h-8 px-3 text-xs font-medium rounded-lg transition-colors ${a.color}`}
                  onClick={() => setConfirmAction(a.action)}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Customer */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-text">Customer</h3>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-text">
                {order.customerName}
              </p>
              <p className="text-xs text-text-secondary">
                {order.customerEmail}
              </p>
              <p className="text-xs text-text-secondary">
                {order.customerPhone}
              </p>
              <button
                className="text-[11px] text-brand hover:text-cyan-300 flex items-center gap-1 mt-1 transition-colors"
                onClick={() => onNavigate("customer-detail", order.customerId)}
              >
                View profile <ChevronRight className="w-3 h-3" />
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
              <p className="font-medium text-text">{order.customerName}</p>
              <p>{order.shippingAddress.line1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
              <p>
                {order.shippingAddress.country} –{" "}
                {order.shippingAddress.pincode}
              </p>
              <p className="pt-1 text-brand">{order.shippingMethod}</p>
              {order.trackingNumber && (
                <div className="mt-2 p-2 rounded-lg bg-surface-elevated border border-border">
                  <p className="text-[10px] text-text-muted">Tracking</p>
                  <p className="font-mono text-xs text-brand">
                    {order.trackingNumber}
                  </p>
                  <p className="text-[11px] text-text-muted">{order.courier}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-text-muted" />
              <h3 className="text-sm font-semibold text-text">Documents</h3>
            </div>
            <div className="space-y-2">
              {[
                {
                  label: "View Invoice",
                  icon: <FileText className="w-3.5 h-3.5" />,
                  action: () => onNavigate("invoices"),
                },
                {
                  label: "Print Packing Slip",
                  icon: <Printer className="w-3.5 h-3.5" />,
                  action: () => {},
                },
                {
                  label: "Print Shipping Label",
                  icon: <Truck className="w-3.5 h-3.5" />,
                  action: () => {},
                },
              ].map((doc) => (
                <button
                  key={doc.label}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text hover:bg-surface-elevated rounded-lg border border-border transition-colors"
                  onClick={doc.action}
                >
                  <span className="text-text-muted">{doc.icon}</span>
                  {doc.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {meta && (
        <ConfirmDialog
          open={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirm}
          title={meta.title}
          message={meta.message}
          entity={`Order #${order.id} · ${order.customerName}`}
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
