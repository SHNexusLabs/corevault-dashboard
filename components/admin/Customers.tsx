"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Users,
  Eye,
  UserCheck,
  ArrowLeft,
  ShoppingCart,
  CreditCard,
} from "lucide-react";

import { Card, KPICard } from "@/components/ui/Card";
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
  StatusDot,
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/ui/Badge";

import { formatCurrency, formatShortDate } from "@/lib/utils";
import {
  getAdminCustomer,
  getAdminCustomers,
  updateAdminCustomerStatus,
} from "@/lib/admin-customers";

import type {
  AdminCustomer,
  AdminCustomerListItem,
} from "@/lib/admin-customers";

import type { Page } from "@/lib/types";

interface CustomersProps {
  onNavigate: (page: Page) => void;
  customerId?: string | null;
}

export function Customers({ onNavigate, customerId }: CustomersProps) {
  const [view, setView] = useState<"list" | "detail">(
    customerId ? "detail" : "list",
  );

  const [customers, setCustomers] = useState<AdminCustomerListItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const perPage = 8;

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminCustomers(page, perPage, {
        search: search.trim() || undefined,
        isActive: statusFilter === "" ? undefined : statusFilter === "active",
      });

      setCustomers(response.customers);

      setStats({
        totalCustomers: response.stats.totalCustomers,
        activeCustomers: response.stats.activeCustomers,
        totalOrders: response.stats.totalOrders,
        totalRevenue: Number(response.stats.totalRevenue),
      });

      setTotal(response.pagination.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve customers",
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;
      await loadCustomers();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadCustomers]);

  const loadCustomer = useCallback(async (id: string) => {
    try {
      setDetailLoading(true);
      setError(null);

      const response = await getAdminCustomer(id);

      setSelectedCustomer(response.customer);
      setView("detail");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to retrieve customer",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!customerId || cancelled) return;

      await loadCustomer(customerId);
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [customerId, loadCustomer]);

  const handleCustomerStatus = async () => {
    if (!selectedCustomer) return;

    try {
      setError(null);

      const response = await updateAdminCustomerStatus(
        selectedCustomer.id,
        !selectedCustomer.isActive,
      );

      setSelectedCustomer((current) =>
        current
          ? {
              ...current,
              isActive: response.customer.isActive,
              updatedAt: response.customer.updatedAt,
            }
          : current,
      );

      await loadCustomers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update customer status",
      );
    }
  };

  if (view === "detail") {
    if (detailLoading || !selectedCustomer) {
      return (
        <div className="flex-1 overflow-y-auto p-5">
          <Card className="p-6">
            <p className="text-sm text-text-muted">
              {detailLoading ? "Loading customer..." : "Customer not found."}
            </p>
          </Card>
        </div>
      );
    }

    const customerOrders = selectedCustomer.orders;

    const totalSpending = customerOrders.reduce(
      (sum, order) => sum + Number(order.total),
      0,
    );

    const lastOrderDate =
      customerOrders.length > 0 ? customerOrders[0].createdAt : null;

    const averageOrderValue =
      customerOrders.length > 0 ? totalSpending / customerOrders.length : 0;

    return (
      <div className="flex-1 overflow-y-auto p-5">
        {error && (
          <div className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-4 py-3">
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 mb-5">
          <button
            className="w-8 h-8 rounded-lg hover:bg-surface-elevated border border-border flex items-center justify-center text-text-muted hover:text-text transition-colors"
            onClick={() => {
              setView("list");
              setSelectedCustomer(null);
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <h1 className="text-base font-bold text-text">
              {selectedCustomer.name}
            </h1>

            <p className="text-xs text-text-muted">
              {selectedCustomer.email} · {selectedCustomer.phone}
            </p>
          </div>

          <div className="ml-2">
            <StatusDot active={selectedCustomer.isActive} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text">
                  Order History
                </h3>

                <span className="text-xs text-text-muted font-mono">
                  {customerOrders.length} orders ·{" "}
                  {formatCurrency(totalSpending)}
                </span>
              </div>

              {customerOrders.length > 0 ? (
                <Table>
                  <Thead>
                    <tr>
                      <Th>Order ID</Th>
                      <Th>Amount</Th>
                      <Th>Payment</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </tr>
                  </Thead>

                  <Tbody>
                    {customerOrders.map((order) => (
                      <Tr
                        key={order.id}
                        onClick={() => onNavigate("order-detail")}
                      >
                        <Td>
                          <span className="font-mono text-xs text-brand">
                            {order.orderNumber}
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
                              order.paymentStatus.toLowerCase() as Parameters<
                                typeof PaymentStatusBadge
                              >[0]["status"]
                            }
                          />
                        </Td>

                        <Td>
                          <OrderStatusBadge
                            status={
                              order.status.toLowerCase() as Parameters<
                                typeof OrderStatusBadge
                              >[0]["status"]
                            }
                          />
                        </Td>

                        <Td>
                          <span className="text-xs text-text-muted">
                            {formatShortDate(new Date(order.createdAt))}
                          </span>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <p className="px-4 py-6 text-xs text-text-muted text-center">
                  No orders from this customer.
                </p>
              )}
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Customer Stats
              </h3>

              {[
                {
                  label: "Total Orders",
                  value: customerOrders.length,
                  mono: true,
                },
                {
                  label: "Total Spending",
                  value: formatCurrency(totalSpending),
                  mono: true,
                },
                {
                  label: "Avg Order Value",
                  value: formatCurrency(averageOrderValue),
                  mono: true,
                },
                {
                  label: "Member Since",
                  value: formatShortDate(new Date(selectedCustomer.createdAt)),
                  mono: false,
                },
                {
                  label: "Last Order",
                  value: lastOrderDate
                    ? formatShortDate(new Date(lastOrderDate))
                    : "Never",
                  mono: false,
                },
                {
                  label: "Status",
                  value: <StatusDot active={selectedCustomer.isActive} />,
                  mono: false,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1.5 border-b border-border/50 last:border-0"
                >
                  <span className="text-[11px] text-text-muted">
                    {row.label}
                  </span>

                  <span
                    className={`text-xs text-text ${
                      row.mono ? "font-mono" : ""
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </Card>

            <Card className="p-4">
              <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-3">
                Actions
              </h3>

              <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full">
                  Edit Customer
                </Button>

                <Button
                  variant={selectedCustomer.isActive ? "danger" : "secondary"}
                  size="sm"
                  className="w-full"
                  onClick={handleCustomerStatus}
                >
                  {selectedCustomer.isActive
                    ? "Disable Account"
                    : "Enable Account"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {error && (
        <div className="mb-4 rounded-lg border border-danger/20 bg-danger-muted px-4 py-3">
          <p className="text-xs text-danger">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <KPICard
          label="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="w-5 h-5 text-brand" />}
          iconBg="bg-brand-muted border border-brand/20"
        />

        <KPICard
          label="Active"
          value={stats.activeCustomers}
          icon={<UserCheck className="w-5 h-5 text-success" />}
          iconBg="bg-success-muted border border-success/20"
        />

        <KPICard
          label="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/10 border border-purple-500/20"
        />

        <KPICard
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={<CreditCard className="w-5 h-5 text-sky-400" />}
          iconBg="bg-sky-500/10 border border-sky-500/20"
        />
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Customers</h2>

          <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
              className="w-56"
              placeholder="Search name, email, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center">
            <p className="text-xs text-text-muted">Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-xs text-text-muted">No customers found.</p>
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Customer</Th>
                  <Th>Phone</Th>
                  <Th sortable>Orders</Th>
                  <Th sortable>Total Spending</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th className="w-12" />
                </tr>
              </Thead>

              <Tbody>
                {customers.map((customer) => (
                  <Tr
                    key={customer.id}
                    onClick={() => void loadCustomer(customer.id)}
                  >
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-muted border border-brand/20 flex items-center justify-center text-xs font-bold text-brand shrink-0">
                          {customer.name
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <div>
                          <p className="text-xs font-medium text-text">
                            {customer.name}
                          </p>

                          <p className="text-[11px] text-text-muted">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </Td>

                    <Td>
                      <span className="text-xs font-mono">
                        {customer.phone}
                      </span>
                    </Td>

                    <Td>
                      <span className="font-mono text-xs font-medium text-text">
                        {customer._count.orders}
                      </span>
                    </Td>

                    <Td>
                      <span className="font-mono text-xs font-medium text-text">
                        —
                      </span>
                    </Td>

                    <Td>
                      <StatusDot active={customer.isActive} />
                    </Td>

                    <Td>
                      <span className="text-xs text-text-muted">
                        {formatShortDate(new Date(customer.createdAt))}
                      </span>
                    </Td>

                    <Td>
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          void loadCustomer(customer.id);
                        }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
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
