"use client";

import { useState } from "react";
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
import { PaymentStatusBadge, PriorityBadge } from "@/components/ui/Badge";
import { formatCurrency, timeAgo } from "@/lib/utils";
import { MOCK_ORDERS } from "@/lib/data";
import { cn } from "@/lib/utils";

type PackingView = "queue" | "detail";

export function Packing() {
  const [view, setView] = useState<PackingView>("queue");
  const [selectedOrder, setSelectedOrder] = useState(MOCK_ORDERS[0]);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");

  const packingOrders = MOCK_ORDERS.filter(
    (o) => o.orderStatus === "processing" || o.orderStatus === "confirmed",
  );

  if (view === "detail") {
    const allChecked = selectedOrder.items.every((i) => checkedItems.has(i.id));
    const toggleItem = (id: string) => {
      const n = new Set(checkedItems);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      setCheckedItems(n);
    };

    return (
      <div className="flex-1 overflow-y-auto p-5">
        {/* Back + header */}
        <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 rounded-lg hover:bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
              onClick={() => {
                setView("queue");
                setCheckedItems(new Set());
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-base font-bold text-text">
                Pack Order{" "}
                <span className="font-mono text-brand">{selectedOrder.id}</span>
              </h1>
              <p className="text-xs text-text-muted">
                {selectedOrder.customerName} · {selectedOrder.items.length} item
                {selectedOrder.items.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
              icon={<Printer className="w-3.5 h-3.5" />}
            >
              Print Label
            </Button>
            <Button
              variant={allChecked ? "primary" : "secondary"}
              size="sm"
              icon={
                allChecked ? (
                  <Package className="w-3.5 h-3.5" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5" />
                )
              }
              disabled={!allChecked}
              onClick={() => setView("queue")}
            >
              {allChecked
                ? "Mark as Packed"
                : `Verify all items (${checkedItems.size}/${selectedOrder.items.length})`}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Item checklist */}
          <Card className="xl:col-span-2">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">
                Item Verification Checklist
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted font-mono">
                  {checkedItems.size}/{selectedOrder.items.length} verified
                </span>
                {!allChecked && (
                  <span className="flex items-center gap-1 text-xs text-warning">
                    <AlertTriangle className="w-3 h-3" /> Items pending
                  </span>
                )}
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {selectedOrder.items.map((item) => {
                const isChecked = checkedItems.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors",
                      isChecked
                        ? "bg-success-muted/30"
                        : "hover:bg-surface-elevated",
                    )}
                    onClick={() => toggleItem(item.id)}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 shrink-0 flex items-center justify-center rounded transition-colors",
                        isChecked ? "text-success" : "text-text-muted",
                      )}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-text-muted" />
                    </div>
                    <div className="flex-1 min-w-0">
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
                      {item.variantName && (
                        <p className="text-[11px] text-text-secondary">
                          {item.variantName}
                        </p>
                      )}
                      <p className="text-[11px] font-mono text-brand">
                        {item.sku}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-semibold text-text">
                        × {item.quantity}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold",
                        isChecked
                          ? "bg-success text-white"
                          : "bg-surface-elevated border border-border text-text-muted",
                      )}
                    >
                      {isChecked ? "✓" : "?"}
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Progress bar */}
            <div className="px-4 py-3 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-text-muted">Packing progress</span>
                <span className="font-mono text-text-secondary">
                  {Math.round(
                    (checkedItems.size / selectedOrder.items.length) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    allChecked ? "bg-success" : "bg-brand",
                  )}
                  style={{
                    width: `${(checkedItems.size / selectedOrder.items.length) * 100}%`,
                  }}
                />
              </div>
              {!allChecked && (
                <p className="mt-2 text-[11px] text-warning flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  All items must be verified before marking as packed.
                </p>
              )}
            </div>
          </Card>

          {/* Order info */}
          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Order Info
              </h3>
              <div className="space-y-2">
                {[
                  {
                    label: "Order ID",
                    value: (
                      <span className="font-mono text-brand">
                        {selectedOrder.id}
                      </span>
                    ),
                  },
                  { label: "Customer", value: selectedOrder.customerName },
                  {
                    label: "Items",
                    value: `${selectedOrder.items.length} items`,
                  },
                  {
                    label: "Total",
                    value: formatCurrency(selectedOrder.total),
                  },
                  {
                    label: "Payment",
                    value: (
                      <PaymentStatusBadge
                        status={selectedOrder.paymentStatus}
                      />
                    ),
                  },
                  {
                    label: "Priority",
                    value: <PriorityBadge priority={selectedOrder.priority} />,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="text-[11px] text-text-muted">
                      {row.label}
                    </span>
                    <span className="text-xs text-text-secondary">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {selectedOrder.customerNote && (
              <Card className="p-4">
                <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wide mb-1.5">
                  Customer Note
                </p>
                <p className="text-xs text-text-secondary">
                  {selectedOrder.customerNote}
                </p>
              </Card>
            )}

            <Card className="p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Add Packing Note
              </h3>
              <textarea
                className="w-full h-20 bg-surface-elevated border border-border rounded-lg text-xs text-text placeholder:text-text-muted p-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-brand/40 focus:border-brand/50"
                placeholder="Add internal note about this packing..."
              />
              <Button variant="secondary" size="sm" className="mt-2 w-full">
                Save Note
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Queue view
  const filtered = packingOrders.filter(
    (o) =>
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          {
            label: "Awaiting Packing",
            value: packingOrders.length,
            color: "text-brand",
            bg: "bg-brand-muted",
          },
          {
            label: "Urgent",
            value: packingOrders.filter((o) => o.priority === "urgent").length,
            color: "text-danger",
            bg: "bg-danger-muted",
          },
          {
            label: "High Priority",
            value: packingOrders.filter((o) => o.priority === "high").length,
            color: "text-warning",
            bg: "bg-warning-muted",
          },
        ].map((s) => (
          <Card key={s.label} className="p-3">
            <p className="text-[11px] text-text-muted mb-0.5">{s.label}</p>
            <p className={`text-xl font-bold font-mono ${s.color}`}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Packing Queue</h2>
          <SearchInput
            className="w-56"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
              <Th>Waiting</Th>
              <Th />
            </tr>
          </Thead>
          <Tbody>
            {filtered.map((order) => (
              <Tr key={order.id}>
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
                  <span className="font-mono text-xs">
                    {order.items.length}
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
                  <PriorityBadge priority={order.priority} />
                </Td>
                <Td>
                  <div className="flex items-center gap-1 text-xs text-text-muted">
                    <Clock className="w-3 h-3" />
                    {timeAgo(order.date)}
                  </div>
                </Td>
                <Td>
                  <Button
                    variant="primary"
                    size="xs"
                    onClick={() => {
                      setSelectedOrder(order);
                      setCheckedItems(new Set());
                      setView("detail");
                    }}
                  >
                    Pack
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
