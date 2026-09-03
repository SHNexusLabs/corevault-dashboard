"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Warehouse,
  TrendingUp,
  TrendingDown,
  Plus,
  History,
  AlertTriangle,
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
import { StockBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

import { formatCurrency, formatDate } from "@/lib/utils";

import {
  getAdminProducts,
  type AdminProduct,
  type AdminProductStats,
  type ProductStockStatus,
} from "@/lib/admin-products";

import {
  adjustAdminProductStock,
  getAdminProductInventoryHistory,
  type InventoryHistoryItem,
} from "@/lib/admin-inventory";

import type { StockStatus } from "@/lib/types";

const ADJUST_REASONS = [
  "Restock",
  "Damaged",
  "Lost",
  "Manual Correction",
  "Return Received",
  "Count Adjustment",
];

const PER_PAGE = 8;

type HistoryMetadata = {
  quantity?: number;
  previousStock?: number;
  newStock?: number;
  reason?: string;
};

function getStockStatus(product: AdminProduct): StockStatus {
  if (product.stock === 0) {
    return "out_of_stock";
  }

  if (product.stock <= product.lowStockAt) {
    return "low_stock";
  }

  return "in_stock";
}

function getHistoryMetadata(value: unknown): HistoryMetadata {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  const data = value as Record<string, unknown>;

  return {
    quantity: typeof data.quantity === "number" ? data.quantity : undefined,

    previousStock:
      typeof data.previousStock === "number" ? data.previousStock : undefined,

    newStock: typeof data.newStock === "number" ? data.newStock : undefined,

    reason: typeof data.reason === "string" ? data.reason : undefined,
  };
}

export default function InventoryPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stats, setStats] = useState<AdminProductStats | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [inventoryValue, setInventoryValue] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adjustModal, setAdjustModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(
    null,
  );

  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("Restock");
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);

  const [history, setHistory] = useState<InventoryHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  /*
   * Debounce product search so we do not hit the API
   * on every keyboard event.
   */
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 350);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search]);

  /*
   * Load the current inventory table page.
   *
   * Search/filter/pagination are handled by the existing
   * admin products endpoint.
   */
  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAdminProducts(page, PER_PAGE, {
        search: debouncedSearch || undefined,

        stockStatus:
          stockFilter !== "" ? (stockFilter as ProductStockStatus) : undefined,
      });

      setProducts(response.products);
      setStats(response.stats);
      setTotalProducts(response.pagination.total);

      /*
       * Keep a useful selected product for the toolbar buttons.
       */
      if (response.products.length > 0) {
        setSelectedProduct((current) => {
          if (!current) {
            return response.products[0];
          }

          const refreshedProduct = response.products.find(
            (product) => product.id === current.id,
          );

          return refreshedProduct ?? current;
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load inventory.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, stockFilter]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;
      await loadInventory();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadInventory]);

  /*
   * Products API already provides accurate total, low-stock,
   * and out-of-stock counts.
   *
   * Inventory value is not currently part of that stats object,
   * so fetch the product catalogue in batches and calculate:
   *
   * stock × price
   */
  const loadInventoryValue = useCallback(async () => {
    try {
      const batchSize = 100;

      const firstResponse = await getAdminProducts(1, batchSize, {});

      let allProducts = [...firstResponse.products];

      const totalPages = firstResponse.pagination.totalPages;

      if (totalPages > 1) {
        const requests = [];

        for (let currentPage = 2; currentPage <= totalPages; currentPage++) {
          requests.push(getAdminProducts(currentPage, batchSize, {}));
        }

        const responses = await Promise.all(requests);

        for (const response of responses) {
          allProducts = [...allProducts, ...response.products];
        }
      }

      const totalValue = allProducts.reduce((sum, product) => {
        const price = Number(product.price);

        if (!Number.isFinite(price)) {
          return sum;
        }

        return sum + product.stock * price;
      }, 0);

      setInventoryValue(totalValue);
    } catch {
      setInventoryValue(0);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (cancelled) return;
      await loadInventoryValue();
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [loadInventoryValue]);

  function openAdjustModal(product: AdminProduct) {
    setSelectedProduct(product);
    setAdjustQty("");
    setAdjustReason("Restock");
    setAdjustError(null);
    setAdjustModal(true);
  }

  async function handleAdjustment() {
    if (!selectedProduct) {
      return;
    }

    const quantity = Number(adjustQty);

    if (!Number.isInteger(quantity) || quantity === 0) {
      setAdjustError("Enter a non-zero whole number.");
      return;
    }

    try {
      setAdjusting(true);
      setAdjustError(null);

      await adjustAdminProductStock(selectedProduct.id, quantity, adjustReason);

      setAdjustModal(false);
      setAdjustQty("");

      await Promise.all([loadInventory(), loadInventoryValue()]);
    } catch (err) {
      setAdjustError(
        err instanceof Error ? err.message : "Failed to adjust stock.",
      );
    } finally {
      setAdjusting(false);
    }
  }

  async function openHistoryModal(product: AdminProduct) {
    setSelectedProduct(product);

    setHistoryModal(true);
    setHistory([]);
    setHistoryError(null);
    setHistoryLoading(true);

    try {
      const response = await getAdminProductInventoryHistory(product.id);

      setHistory(response.history);
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : "Failed to load stock history.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  const totalSKUs = stats?.total ?? 0;
  const lowStock = stats?.lowStock ?? 0;
  const outOfStock = stats?.outOfStock ?? 0;

  const selectedStockStatus = useMemo(() => {
    if (!selectedProduct) {
      return null;
    }

    return getStockStatus(selectedProduct);
  }, [selectedProduct]);

  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard
          label="Total SKUs"
          value={totalSKUs}
          icon={<Warehouse className="w-5 h-5 text-brand" />}
          iconBg="bg-brand-muted border border-brand/20"
        />

        <KPICard
          label="Inventory Value"
          value={formatCurrency(inventoryValue)}
          icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
          iconBg="bg-purple-500/10 border border-purple-500/20"
        />

        <KPICard
          label="Low Stock SKUs"
          value={lowStock}
          change={lowStock > 0 ? -5 : 0}
          icon={<AlertTriangle className="w-5 h-5 text-warning" />}
          iconBg="bg-warning-muted border border-warning/20"
        />

        <KPICard
          label="Out of Stock"
          value={outOfStock}
          change={outOfStock > 0 ? -2 : 0}
          icon={<TrendingDown className="w-5 h-5 text-danger" />}
          iconBg="bg-danger-muted border border-danger/20"
        />
      </div>

      <Card>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Inventory</h2>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<History className="w-3.5 h-3.5" />}
              disabled={!selectedProduct}
              onClick={() => {
                if (selectedProduct) {
                  void openHistoryModal(selectedProduct);
                }
              }}
            >
              Stock History
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              disabled={!selectedProduct}
              onClick={() => {
                if (selectedProduct) {
                  openAdjustModal(selectedProduct);
                }
              }}
            >
              Adjust Stock
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-b border-border">
          <SearchInput
            className="w-56"
            placeholder="Search products, SKUs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <Select
            value={stockFilter}
            onChange={(e) => {
              setStockFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stock</option>

            <option value="in_stock">In Stock</option>

            <option value="low_stock">Low Stock</option>

            <option value="out_of_stock">Out of Stock</option>
          </Select>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 border-b border-border bg-danger-muted">
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-xs text-text-muted">Loading inventory...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center">
            <Warehouse className="w-8 h-8 mx-auto text-text-muted mb-2" />

            <p className="text-sm text-text-secondary">No products found.</p>

            <p className="text-xs text-text-muted mt-1">
              Try changing your search or stock filter.
            </p>
          </div>
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Product</Th>
                  <Th>SKU</Th>
                  <Th sortable>Physical</Th>
                  <Th sortable>Reserved</Th>
                  <Th sortable>Available</Th>
                  <Th>Threshold</Th>
                  <Th>Status</Th>
                  <Th className="w-20" />
                </tr>
              </Thead>

              <Tbody>
                {products.map((product) => {
                  const status = getStockStatus(product);

                  /*
                   * Reservation tracking does not
                   * currently exist in the backend.
                   */
                  const reserved = 0;
                  const available = product.stock;

                  return (
                    <Tr
                      key={product.id}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Td>
                        <div>
                          <p className="text-xs font-medium text-text max-w-50 truncate">
                            {product.name}
                          </p>

                          <p className="text-[11px] text-text-muted">
                            {product.brand.name}
                            {" · "}
                            {product.category.name}
                          </p>
                        </div>
                      </Td>

                      <Td>
                        <span className="font-mono text-xs text-brand">
                          {product.sku}
                        </span>
                      </Td>

                      <Td>
                        <span className="font-mono text-xs text-text">
                          {product.stock}
                        </span>
                      </Td>

                      <Td>
                        <span className="font-mono text-xs text-text-muted">
                          {reserved}
                        </span>
                      </Td>

                      <Td>
                        <span
                          className={`font-mono text-xs font-semibold ${
                            status === "out_of_stock"
                              ? "text-danger"
                              : status === "low_stock"
                                ? "text-warning"
                                : "text-success"
                          }`}
                        >
                          {available}
                        </span>
                      </Td>

                      <Td>
                        <span className="font-mono text-xs text-text-muted">
                          {product.lowStockAt}
                        </span>
                      </Td>

                      <Td>
                        <StockBadge status={status} />
                      </Td>

                      <Td>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand-muted transition-colors"
                            title="Adjust stock"
                            onClick={() => openAdjustModal(product)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                            title="Stock history"
                            onClick={() => void openHistoryModal(product)}
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>

            <Pagination
              page={page}
              total={totalProducts}
              perPage={PER_PAGE}
              onChange={setPage}
            />
          </>
        )}
      </Card>

      {/* Inventory state explanation */}
      <div className="bg-brand-muted border border-brand/20 rounded-xl p-3 flex items-start gap-2.5">
        <div className="w-4 h-4 text-brand mt-0.5 shrink-0">ℹ️</div>

        <div className="text-xs text-text-secondary">
          <strong className="text-text">Inventory states:</strong> Physical
          stock represents the current on-hand quantity. Reserved stock tracking
          is not currently implemented, so Available equals Physical.
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        open={adjustModal}
        onClose={() => {
          if (!adjusting) {
            setAdjustModal(false);
          }
        }}
        title="Adjust Stock"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              disabled={adjusting}
              onClick={() => setAdjustModal(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="sm"
              disabled={adjusting || !selectedProduct}
              onClick={() => void handleAdjustment()}
            >
              {adjusting ? "Applying..." : "Apply Adjustment"}
            </Button>
          </>
        }
      >
        {selectedProduct && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface-elevated border border-border">
              <p className="text-xs font-medium text-text">
                {selectedProduct.name}
              </p>

              <p className="text-[11px] font-mono text-brand">
                {selectedProduct.sku}
              </p>

              <p className="text-[11px] text-text-muted mt-0.5">
                Current stock:{" "}
                <span className="font-mono text-text">
                  {selectedProduct.stock}
                </span>
              </p>

              {selectedStockStatus && (
                <div className="mt-2">
                  <StockBadge status={selectedStockStatus} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">
                Quantity Change
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="w-8 h-8 rounded-lg border border-border bg-surface-elevated text-text-secondary hover:text-text transition-colors flex items-center justify-center font-bold"
                  onClick={() => {
                    const current = Number(adjustQty) || 0;

                    setAdjustQty(String(current - 1));
                  }}
                >
                  −
                </button>

                <input
                  type="number"
                  step="1"
                  value={adjustQty}
                  onChange={(e) => {
                    setAdjustQty(e.target.value);

                    setAdjustError(null);
                  }}
                  placeholder="0"
                  className="flex-1 h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text text-center px-3 focus:outline-none focus:ring-1 focus:ring-brand/40"
                />

                <button
                  type="button"
                  className="w-8 h-8 rounded-lg border border-border bg-surface-elevated text-text-secondary hover:text-text transition-colors flex items-center justify-center font-bold"
                  onClick={() => {
                    const current = Number(adjustQty) || 0;

                    setAdjustQty(String(current + 1));
                  }}
                >
                  +
                </button>
              </div>

              <p className="text-[11px] text-text-muted">
                Positive = add stock. Negative = remove stock.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">
                Reason
              </label>

              <select
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-2.5 focus:outline-none focus:ring-1 focus:ring-brand/40"
              >
                {ADJUST_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {adjustError && (
              <div className="rounded-lg border border-danger/20 bg-danger-muted px-3 py-2">
                <p className="text-xs text-danger">{adjustError}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* History Modal */}
      <Modal
        open={historyModal}
        onClose={() => setHistoryModal(false)}
        title="Stock Movement History"
        size="lg"
      >
        {selectedProduct && (
          <div className="mb-4 p-3 rounded-lg bg-surface-elevated border border-border">
            <p className="text-xs font-medium text-text">
              {selectedProduct.name}
            </p>

            <p className="text-[11px] font-mono text-brand">
              {selectedProduct.sku}
            </p>
          </div>
        )}

        {historyLoading ? (
          <div className="py-10 text-center">
            <p className="text-xs text-text-muted">Loading stock history...</p>
          </div>
        ) : historyError ? (
          <div className="py-8 text-center">
            <p className="text-xs text-danger">{historyError}</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center">
            <History className="w-7 h-7 mx-auto text-text-muted mb-2" />

            <p className="text-xs text-text-secondary">
              No stock movements recorded yet.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50 -mx-5">
            {history.map((movement) => {
              const metadata = getHistoryMetadata(movement.metadata);

              const quantity = metadata.quantity ?? 0;

              return (
                <div
                  key={movement.id}
                  className="px-5 py-3 flex items-center gap-3"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                      quantity > 0
                        ? "bg-success-muted text-success"
                        : "bg-danger-muted text-danger"
                    }`}
                  >
                    {quantity > 0 ? `+${quantity}` : quantity}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-text">
                      {metadata.reason ??
                        (movement.action === "STOCK_ADDED"
                          ? "Stock added"
                          : "Stock removed")}
                    </p>

                    <p className="text-[11px] text-text-muted">
                      Stock:{" "}
                      <span className="font-mono">
                        {metadata.previousStock ?? "—"}
                      </span>
                      {" → "}
                      <span className="font-mono text-text">
                        {metadata.newStock ?? "—"}
                      </span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-text-secondary">
                      {movement.user.name}
                    </p>

                    <p className="text-[10px] text-text-muted">
                      {movement.user.role}
                    </p>
                  </div>

                  <div className="text-right text-[11px] text-text-muted shrink-0">
                    {formatDate(new Date(movement.createdAt))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
