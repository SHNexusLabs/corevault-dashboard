"use client";

import { Eye, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { PaymentStatusBadge, Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { MOCK_PAYMENTS } from "@/lib/data";
import type { Page } from "@/lib/types";

interface NavProps {
  onNavigate: (page: Page, entityId?: string) => void;
}

export function Payments({ onNavigate }: NavProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Transactions",
            value: MOCK_PAYMENTS.length,
            color: "text-brand",
          },
          {
            label: "Paid",
            value: MOCK_PAYMENTS.filter((p) => p.status === "paid").length,
            color: "text-success",
          },
          {
            label: "Pending",
            value: MOCK_PAYMENTS.filter((p) => p.status === "pending").length,
            color: "text-warning",
          },
          {
            label: "Failed",
            value: MOCK_PAYMENTS.filter((p) => p.status === "failed").length,
            color: "text-danger",
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
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text">Payments</h2>
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Transaction ID</Th>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Method</Th>
              <Th sortable>Amount</Th>
              <Th>Status</Th>
              <Th sortable>Date</Th>
            </tr>
          </Thead>

          <Tbody>
            {MOCK_PAYMENTS.map((p) => (
              <Tr
                key={p.id}
                onClick={() => onNavigate("order-detail", p.orderId)}
              >
                <Td>
                  <span className="font-mono text-xs text-brand">{p.id}</span>
                </Td>

                <Td>
                  <span className="font-mono text-xs text-text-secondary">
                    {p.orderId}
                  </span>
                </Td>

                <Td>
                  <span className="text-xs text-text">{p.customerName}</span>
                </Td>

                <Td>
                  <span className="text-xs text-text-secondary">
                    {p.method}
                  </span>
                </Td>

                <Td>
                  <span className="font-mono text-xs font-medium text-text">
                    {formatCurrency(p.amount)}
                  </span>
                </Td>

                <Td>
                  <PaymentStatusBadge status={p.status} />
                </Td>

                <Td>
                  <span className="text-xs text-text-muted">
                    {formatDate(p.date)}
                  </span>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}

export function Invoices() {
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Invoices</h2>

          <Button
            variant="ghost"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export All
          </Button>
        </div>

        <Table>
          <Thead>
            <tr>
              <Th>Invoice #</Th>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Date</Th>
              <Th />
            </tr>
          </Thead>

          <Tbody>
            {MOCK_PAYMENTS.filter((p) => p.status === "paid").map((p, i) => (
              <Tr key={p.id}>
                <Td>
                  <span className="font-mono text-xs text-brand">
                    INV-{String(i + 1001).padStart(5, "0")}
                  </span>
                </Td>

                <Td>
                  <span className="font-mono text-xs text-text-secondary">
                    {p.orderId}
                  </span>
                </Td>

                <Td>
                  <span className="text-xs text-text">{p.customerName}</span>
                </Td>

                <Td>
                  <span className="font-mono text-xs font-medium text-text">
                    {formatCurrency(p.amount)}
                  </span>
                </Td>

                <Td>
                  <Badge className="bg-success-muted text-success border border-success/25">
                    Paid
                  </Badge>
                </Td>

                <Td>
                  <span className="text-xs text-text-muted">
                    {formatDate(p.date)}
                  </span>
                </Td>

                <Td>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="View invoice"
                      className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      aria-label="Download invoice"
                      className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
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
