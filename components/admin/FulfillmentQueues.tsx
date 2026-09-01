"use client";

import { useState } from "react";
import { Printer, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  PriorityBadge,
  Badge,
} from "@/components/ui/Badge";
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils";
import { MOCK_ORDERS, MOCK_RETURNS } from "@/lib/data";
import type { Page } from "@/lib/types";

interface NavProps {
  onNavigate: (page: Page, entityId?: string) => void;
}

export function Processing({ onNavigate }: NavProps) {
  const orders = MOCK_ORDERS.filter(
    (o) => o.orderStatus === "processing" || o.orderStatus === "confirmed",
  );
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Processing Queue</h2>
          <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
            {orders.length}
          </span>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Amount</Th>
              <Th>Payment</Th>
              <Th>Priority</Th>
              <Th>Status</Th>
              <Th>Waiting</Th>
              <Th />
            </tr>
          </Thead>
          <Tbody>
            {orders.map((o) => (
              <Tr key={o.id} onClick={() => onNavigate("order-detail", o.id)}>
                <Td>
                  <span className="font-mono text-xs text-brand">{o.id}</span>
                </Td>
                <Td>
                  <div>
                    <p className="text-xs font-medium text-text">
                      {o.customerName}
                    </p>
                    <p className="text-[11px] text-text-muted">
                      {o.customerEmail}
                    </p>
                  </div>
                </Td>
                <Td>
                  <span className="font-mono text-xs">{o.items.length}</span>
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
                  <PriorityBadge priority={o.priority} />
                </Td>
                <Td>
                  <OrderStatusBadge status={o.orderStatus} />
                </Td>
                <Td>
                  <span className="text-xs text-text-muted">
                    {timeAgo(o.date)}
                  </span>
                </Td>
                <Td>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("packing");
                    }}
                  >
                    → Pack
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}

export function ReadyToShip({ onNavigate }: NavProps) {
  const orders = MOCK_ORDERS.filter((o) => o.orderStatus === "packed");
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Ready to Ship</h2>
          <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
            {orders.length}
          </span>
        </div>
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
            {orders.map((o) => (
              <Tr key={o.id} onClick={() => onNavigate("order-detail")}>
                <Td>
                  <span className="font-mono text-xs text-brand">{o.id}</span>
                </Td>
                <Td>
                  <p className="text-xs font-medium text-text">
                    {o.customerName}
                  </p>
                </Td>
                <Td>
                  <span className="font-mono text-xs">{o.items.length}</span>
                </Td>
                <Td>
                  <span className="font-mono text-xs font-medium text-text">
                    {formatCurrency(o.total)}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-text-secondary">
                    {o.shippingMethod}
                  </span>
                </Td>
                <Td>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate("shipping");
                    }}
                  >
                    Ship
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}

export function Shipping({ onNavigate }: NavProps) {
  const [tab, setTab] = useState<"shipped" | "delivered">("shipped");
  const orders = MOCK_ORDERS.filter((o) => o.orderStatus === tab);
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      <div className="flex items-center gap-2">
        {(["shipped", "delivered"] as const).map((t) => (
          <button
            key={t}
            className={`h-7 px-3 rounded-lg text-xs font-medium capitalize transition-colors ${tab === t ? "bg-brand text-surface" : "bg-surface-elevated border border-border text-text-secondary hover:text-text"}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <Card>
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">
            Shipping Management
          </h2>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Courier</Th>
              <Th>Tracking</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th />
            </tr>
          </Thead>
          <Tbody>
            {orders.map((o) => (
              <Tr key={o.id} onClick={() => onNavigate("order-detail")}>
                <Td>
                  <span className="font-mono text-xs text-brand">{o.id}</span>
                </Td>
                <Td>
                  <p className="text-xs font-medium text-text">
                    {o.customerName}
                  </p>
                </Td>
                <Td>
                  <span className="text-xs text-text-secondary">
                    {o.courier || "—"}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-text-secondary">
                    {o.trackingNumber || "—"}
                  </span>
                </Td>
                <Td>
                  <OrderStatusBadge status={o.orderStatus} />
                </Td>
                <Td>
                  <span className="text-xs text-text-muted">
                    {formatDate(o.date)}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="xs"
                      icon={<Printer className="w-3 h-3" />}
                    />
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onNavigate("order-detail")}
                    >
                      View
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}

export function Returns() {
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Returns & Refunds</h2>
          <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
            {MOCK_RETURNS.length}
          </span>
        </div>
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
            {MOCK_RETURNS.map((r) => (
              <Tr key={r.id}>
                <Td>
                  <span className="font-mono text-xs text-brand">{r.id}</span>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-text-secondary">
                    {r.orderId}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-text">{r.customerName}</span>
                </Td>
                <Td>
                  <span className="text-xs text-text-secondary max-w-35 truncate block">
                    {r.productName}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-text-secondary max-w-30 truncate block">
                    {r.reason}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-xs font-medium text-text">
                    {formatCurrency(r.refundAmount)}
                  </span>
                </Td>
                <Td>
                  <Badge
                    className={
                      r.status === "requested"
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/25"
                        : r.status === "approved"
                          ? "bg-blue-500/15 text-blue-300 border border-blue-500/25"
                          : r.status === "received"
                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                            : "bg-green-500/15 text-green-300 border border-green-500/25"
                    }
                  >
                    {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                  </Badge>
                </Td>
                <Td>
                  <span className="text-xs text-text-muted">
                    {formatDate(r.date)}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    {r.status === "requested" && (
                      <>
                        <Button
                          variant="success"
                          size="xs"
                          icon={<Check className="w-3 h-3" />}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          icon={<X className="w-3 h-3" />}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {r.status === "approved" && (
                      <Button variant="secondary" size="xs">
                        Receive
                      </Button>
                    )}
                    {r.status === "received" && (
                      <Button variant="primary" size="xs">
                        Refund
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}
