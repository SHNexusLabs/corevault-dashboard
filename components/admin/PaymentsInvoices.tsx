"use client";

import { Eye, Download } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { PaymentStatusBadge, Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Page } from "@/lib/types";
import { getAdminInvoices, type AdminInvoice } from "@/lib/admin-invoices";
import { useCallback, useEffect, useState } from "react";
import { SearchInput, Select } from "@/components/ui/Input";
import { getAdminPayments } from "@/lib/admin-payments";
import type { AdminPayment } from "@/lib/admin-payments";
import { Pagination } from "@/components/ui/Pagination";

interface NavProps {
  onNavigate: (page: Page, entityId?: string) => void;
}

function formatApiDate(value: string | null | undefined): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return formatDate(date);
}

function toPaymentBadgeStatus(status: AdminPayment["paymentStatus"]) {
  return status.toLowerCase() as Parameters<
    typeof PaymentStatusBadge
  >[0]["status"];
}

export function Payments({ onNavigate }: NavProps) {
  const [payments, setPayments] = useState<AdminPayment[]>([]);

  const [stats, setStats] = useState({
    transactions: 0,
    paid: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 8;

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminPayments(page, perPage, {
        search: search.trim() || undefined,

        status:
          statusFilter === ""
            ? undefined
            : (statusFilter as "PENDING" | "PAID" | "FAILED" | "REFUNDED"),

        method:
          methodFilter === ""
            ? undefined
            : (methodFilter as "UPI" | "CARD" | "COD"),
      });

      setPayments(response.payments);

      setStats({
        transactions: response.stats.transactions,
        paid: response.stats.paid,
        pending: response.stats.pending,
        failed: response.stats.failed,
        refunded: response.stats.refunded,
      });

      setTotal(response.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve payments",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, methodFilter]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;

      await loadPayments();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadPayments]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-4 py-3">
          <p className="text-xs text-danger">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Transactions",
            value: stats.transactions,
            color: "text-brand",
          },
          {
            label: "Paid",
            value: stats.paid,
            color: "text-success",
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "text-warning",
          },
          {
            label: "Failed",
            value: stats.failed,
            color: "text-danger",
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-3">
            <p className="text-[11px] text-text-muted mb-0.5">{stat.label}</p>

            <p className={`text-xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Payments</h2>

          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              className="w-56"
              placeholder="Search order or customer..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <Select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
            </Select>

            <Select
              value={methodFilter}
              onChange={(event) => {
                setMethodFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
              <option value="COD">COD</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center">
            <p className="text-xs text-text-muted">Loading payments...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-xs text-text-muted">No payments found.</p>
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Payment / Order</Th>
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Method</Th>
                  <Th sortable>Amount</Th>
                  <Th>Status</Th>
                  <Th sortable>Date</Th>
                </tr>
              </Thead>

              <Tbody>
                {payments.map((payment) => (
                  <Tr
                    key={payment.id}
                    onClick={() => onNavigate("order-detail", payment.id)}
                  >
                    <Td>
                      <span className="font-mono text-xs text-brand">
                        {payment.orderNumber}
                      </span>
                    </Td>

                    <Td>
                      <span className="font-mono text-xs text-text-secondary">
                        {payment.orderNumber}
                      </span>
                    </Td>

                    <Td>
                      <div>
                        <p className="text-xs text-text">{payment.user.name}</p>

                        <p className="text-[11px] text-text-muted">
                          {payment.user.email}
                        </p>
                      </div>
                    </Td>

                    <Td>
                      <span className="text-xs text-text-secondary">
                        {payment.paymentMethod}
                      </span>
                    </Td>

                    <Td>
                      <span className="font-mono text-xs font-medium text-text">
                        {formatCurrency(Number(payment.total))}
                      </span>
                    </Td>

                    <Td>
                      <PaymentStatusBadge
                        status={toPaymentBadgeStatus(payment.paymentStatus)}
                      />
                    </Td>

                    <Td>
                      <span className="text-xs text-text-muted">
                        {formatApiDate(payment.createdAt)}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Pagination
              page={page}
              total={total}
              perPage={perPage}
              onChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}

export function Invoices({ onNavigate }: NavProps) {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 8;

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminInvoices(
        page,
        perPage,
        search.trim() || undefined,
      );

      setInvoices(response.invoices);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve invoices",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;

      await loadInvoices();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadInvoices]);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-4 py-3">
          <p className="text-xs text-danger">{error}</p>
        </div>
      )}

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Invoices</h2>

          <div className="flex items-center gap-2">
            <SearchInput
              className="w-56"
              placeholder="Search invoice, order or customer..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />

            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              disabled
              title="Invoice export will be added with PDF generation"
            >
              Export All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center">
            <p className="text-xs text-text-muted">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-xs text-text-muted">No invoices found.</p>
          </div>
        ) : (
          <>
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
                {invoices.map((invoice) => (
                  <Tr key={invoice.id}>
                    <Td>
                      <span className="font-mono text-xs text-brand">
                        {invoice.invoiceNumber}
                      </span>
                    </Td>

                    <Td>
                      <span className="font-mono text-xs text-text-secondary">
                        {invoice.orderNumber}
                      </span>
                    </Td>

                    <Td>
                      <div>
                        <p className="text-xs text-text">
                          {invoice.customer.name}
                        </p>

                        <p className="text-[11px] text-text-muted">
                          {invoice.customer.email}
                        </p>
                      </div>
                    </Td>

                    <Td>
                      <span className="font-mono text-xs font-medium text-text">
                        {formatCurrency(Number(invoice.amount))}
                      </span>
                    </Td>

                    <Td>
                      <Badge className="bg-success-muted text-success border border-success/25">
                        Paid
                      </Badge>
                    </Td>

                    <Td>
                      <span className="text-xs text-text-muted">
                        {formatApiDate(invoice.createdAt)}
                      </span>
                    </Td>

                    <Td>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label="View invoice"
                          onClick={(event) => {
                            event.stopPropagation();
                            onNavigate("order-detail", invoice.id);
                          }}
                          className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          aria-label="Download invoice"
                          disabled
                          title="PDF generation will be added later"
                          className="w-6 h-6 rounded flex items-center justify-center text-text-muted opacity-50 cursor-not-allowed"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <Pagination
              page={page}
              total={total}
              perPage={perPage}
              onChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
