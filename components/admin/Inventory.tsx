"use client";
import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import { MOCK_PRODUCTS, MOCK_STOCK_MOVEMENTS } from "@/lib/data";
import type { StockStatus } from "@/lib/types";

function getStockStatus(p: (typeof MOCK_PRODUCTS)[0]): StockStatus {
  if (p.available === 0) return "out_of_stock";
  if (p.available <= p.lowStockThreshold) return "low_stock";
  return "in_stock";
}

const ADJUST_REASONS = [
  "Restock",
  "Damaged",
  "Lost",
  "Manual Correction",
  "Return Received",
  "Count Adjustment",
];

export function Inventory() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);
  const [adjustModal, setAdjustModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("Restock");
  const [selectedProduct, setSelectedProduct] = useState(MOCK_PRODUCTS[0]);
  const perPage = 8;

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    const matchStock = !stockFilter || getStockStatus(p) === stockFilter;
    return matchSearch && matchStock;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalValue = MOCK_PRODUCTS.reduce(
    (sum, p) => sum + p.stock * p.price,
    0,
  );
  const totalSKUs = MOCK_PRODUCTS.length;
  const lowStock = MOCK_PRODUCTS.filter(
    (p) => getStockStatus(p) === "low_stock",
  ).length;
  const outOfStock = MOCK_PRODUCTS.filter(
    (p) => getStockStatus(p) === "out_of_stock",
  ).length;

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
          value={formatCurrency(totalValue)}
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
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-text">Inventory</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<History className="w-3.5 h-3.5" />}
              onClick={() => setHistoryModal(true)}
            >
              Stock History
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setAdjustModal(true)}
            >
              Adjust Stock
            </Button>
          </div>
        </div>

        <div className="px-4 py-3 flex items-center gap-2 flex-wrap border-b border-border">
          <SearchInput
            className="w-56"
            placeholder="Search products, SKUs..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
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
            {paged.map((product) => {
              const status = getStockStatus(product);
              return (
                <Tr key={product.id}>
                  <Td>
                    <div>
                      <p className="text-xs font-medium text-text max-w-50 truncate">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-text-muted">
                        {product.brand} · {product.category}
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
                    <span
                      className={`font-mono text-xs ${product.reserved > 0 ? "text-warning" : "text-text-muted"}`}
                    >
                      {product.reserved}
                    </span>
                  </Td>
                  <Td>
                    <span
                      className={`font-mono text-xs font-semibold ${status === "out_of_stock" ? "text-danger" : status === "low_stock" ? "text-warning" : "text-success"}`}
                    >
                      {product.available}
                    </span>
                  </Td>
                  <Td>
                    <span className="font-mono text-xs text-text-muted">
                      {product.lowStockThreshold}
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
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand-muted transition-colors"
                        title="Adjust stock"
                        onClick={() => {
                          setSelectedProduct(product);
                          setAdjustModal(true);
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                        title="Stock history"
                        onClick={() => {
                          setSelectedProduct(product);
                          setHistoryModal(true);
                        }}
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
          total={filtered.length}
          perPage={perPage}
          onChange={setPage}
        />
      </Card>

      {/* Stock note */}
      <div className="bg-brand-muted border border-brand/20 rounded-xl p-3 flex items-start gap-2.5">
        <div className="w-4 h-4 text-brand mt-0.5 shrink-0">ℹ️</div>
        <div className="text-xs text-text-secondary">
          <strong className="text-text">Inventory states:</strong> Physical
          stock is the total on-hand. Reserved is held for confirmed orders.
          Available = Physical − Reserved.
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        open={adjustModal}
        onClose={() => setAdjustModal(false)}
        title="Adjust Stock"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAdjustModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAdjustModal(false)}
            >
              Apply Adjustment
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-surface-elevated border border-border">
            <p className="text-xs font-medium text-text">
              {selectedProduct.name}
            </p>
            <p className="text-[11px] font-mono text-brand">
              {selectedProduct.sku}
            </p>
            <p className="text-[11px] text-text-muted mt-0.5">
              Current available:{" "}
              <span className="font-mono text-text">
                {selectedProduct.available}
              </span>
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">
              Quantity Change
            </label>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg border border-border bg-surface-elevated text-text-secondary hover:text-text transition-colors flex items-center justify-center font-bold">
                −
              </button>
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                placeholder="0"
                className="flex-1 h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text text-center px-3 focus:outline-none focus:ring-1 focus:ring-brand/40"
              />
              <button className="w-8 h-8 rounded-lg border border-border bg-surface-elevated text-text-secondary hover:text-text transition-colors flex items-center justify-center font-bold">
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
              {ADJUST_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-text-secondary">
              Reference (PO / Note)
            </label>
            <input
              className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
              placeholder="e.g. PO-1045"
            />
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        open={historyModal}
        onClose={() => setHistoryModal(false)}
        title="Stock Movement History"
        size="lg"
      >
        <div className="divide-y divide-border/50 -mx-5 -mt-5">
          {MOCK_STOCK_MOVEMENTS.map((mv) => (
            <div key={mv.id} className="px-5 py-3 flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${mv.change > 0 ? "bg-success-muted text-success" : "bg-danger-muted text-danger"}`}
              >
                {mv.change > 0 ? `+${mv.change}` : mv.change}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text truncate">
                  {mv.productName}
                </p>
                <p className="text-[11px] font-mono text-brand">{mv.sku}</p>
              </div>
              <div className="text-right text-xs text-text-secondary">
                <p>{mv.reason}</p>
                <p className="text-[11px] text-text-muted font-mono">
                  {mv.reference}
                </p>
              </div>
              <div className="text-right text-[11px] text-text-muted shrink-0 w-20">
                <p>{mv.user}</p>
                <p>{mv.date.toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
