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

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

type InventoryProduct = {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  stock: number;
  reserved: number;
  lowStockAt: number;
  price: number;
};

const products: InventoryProduct[] = [
  {
    id: "1",
    name: "AMD Ryzen 7 9700X",
    sku: "CPU-R7-9700X",
    brand: "AMD",
    category: "Processors",
    stock: 24,
    reserved: 4,
    lowStockAt: 5,
    price: 34999,
  },
  {
    id: "2",
    name: "NVIDIA RTX 4070 Super",
    sku: "GPU-RTX4070S",
    brand: "NVIDIA",
    category: "Graphics Cards",
    stock: 8,
    reserved: 2,
    lowStockAt: 5,
    price: 59999,
  },
  {
    id: "3",
    name: "Intel Core i7-14700K",
    sku: "CPU-I7-14700K",
    brand: "Intel",
    category: "Processors",
    stock: 3,
    reserved: 1,
    lowStockAt: 5,
    price: 38999,
  },
  {
    id: "4",
    name: "Samsung 990 Pro 2TB",
    sku: "SSD-990PRO-2T",
    brand: "Samsung",
    category: "Storage",
    stock: 15,
    reserved: 3,
    lowStockAt: 5,
    price: 16999,
  },
  {
    id: "5",
    name: "Kingston Fury 32GB",
    sku: "RAM-FURY-32",
    brand: "Kingston",
    category: "Memory",
    stock: 0,
    reserved: 0,
    lowStockAt: 5,
    price: 8999,
  },
  {
    id: "6",
    name: "Logitech G Pro X Keyboard",
    sku: "KEY-GPRO-X",
    brand: "Logitech",
    category: "Keyboards",
    stock: 11,
    reserved: 2,
    lowStockAt: 5,
    price: 12999,
  },
  {
    id: "7",
    name: "LG UltraGear 27GR",
    sku: "MON-LG-27GR",
    brand: "LG",
    category: "Monitors",
    stock: 6,
    reserved: 1,
    lowStockAt: 3,
    price: 29999,
  },
  {
    id: "8",
    name: "Logitech G502 X",
    sku: "MSE-G502X",
    brand: "Logitech",
    category: "Mice",
    stock: 19,
    reserved: 3,
    lowStockAt: 5,
    price: 7499,
  },
  {
    id: "9",
    name: "Corsair RM850e",
    sku: "PSU-RM850E",
    brand: "Corsair",
    category: "Power Supplies",
    stock: 4,
    reserved: 1,
    lowStockAt: 5,
    price: 10999,
  },
];

const movements = [
  {
    id: "1",
    productName: "AMD Ryzen 7 9700X",
    sku: "CPU-R7-9700X",
    change: 10,
    reason: "Restock",
    reference: "PO-1045",
    user: "Admin",
    date: "Today, 10:32 AM",
  },
  {
    id: "2",
    productName: "NVIDIA RTX 4070 Super",
    sku: "GPU-RTX4070S",
    change: -2,
    reason: "Damaged",
    reference: "ADJ-204",
    user: "Admin",
    date: "Yesterday, 04:15 PM",
  },
  {
    id: "3",
    productName: "Samsung 990 Pro 2TB",
    sku: "SSD-990PRO-2T",
    change: 5,
    reason: "Return Received",
    reference: "RET-118",
    user: "Manager",
    date: "Yesterday, 01:42 PM",
  },
];

const ADJUST_REASONS = [
  "Restock",
  "Damaged",
  "Lost",
  "Manual Correction",
  "Return Received",
  "Count Adjustment",
];

function getStockStatus(product: InventoryProduct): StockStatus {
  if (product.stock === 0) {
    return "out_of_stock";
  }

  if (product.stock <= product.lowStockAt) {
    return "low_stock";
  }

  return "in_stock";
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [page, setPage] = useState(1);

  const [adjustModal, setAdjustModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<InventoryProduct | null>(null);

  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("Restock");

  const perPage = 8;

  const filtered = products.filter((product) => {
    const query = search.toLowerCase().trim();

    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query);

    const matchesStock =
      !stockFilter || getStockStatus(product) === stockFilter;

    return matchesSearch && matchesStock;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const totalValue = products.reduce(
    (sum, product) => sum + product.stock * product.price,
    0,
  );

  const totalSKUs = products.length;

  const lowStock = products.filter(
    (product) => getStockStatus(product) === "low_stock",
  ).length;

  const outOfStock = products.filter(
    (product) => getStockStatus(product) === "out_of_stock",
  ).length;

  function openAdjust(product?: InventoryProduct) {
    setSelectedProduct(product ?? products[0]);
    setAdjustQty("");
    setAdjustReason("Restock");
    setAdjustModal(true);
  }

  function openHistory(product?: InventoryProduct) {
    setSelectedProduct(product ?? products[0]);
    setHistoryModal(true);
  }

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
          icon={<AlertTriangle className="w-5 h-5 text-warning" />}
          iconBg="bg-warning-muted border border-warning/20"
        />

        <KPICard
          label="Out of Stock"
          value={outOfStock}
          icon={<TrendingDown className="w-5 h-5 text-danger" />}
          iconBg="bg-danger-muted border border-danger/20"
        />
      </div>

      {/* Inventory */}
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-text">Inventory</h2>

            <p className="text-xs text-text-muted mt-0.5">
              Monitor stock levels across your catalog.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<History className="w-3.5 h-3.5" />}
              onClick={() => openHistory()}
            >
              Stock History
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openAdjust()}
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
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />

          <Select
            value={stockFilter}
            onChange={(event) => {
              setStockFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </Select>
        </div>

        {/* Table */}
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

              const available = product.stock - product.reserved;

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
                      className={`font-mono text-xs ${
                        product.reserved > 0
                          ? "text-warning"
                          : "text-text-muted"
                      }`}
                    >
                      {product.reserved}
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
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Adjust stock"
                        onClick={() => openAdjust(product)}
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-brand hover:bg-brand-muted transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        title="Stock history"
                        onClick={() => openHistory(product)}
                        className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
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

      {/* Inventory note */}
      <div className="bg-brand-muted border border-brand/20 rounded-xl p-3 flex items-start gap-2.5">
        <div className="w-4 h-4 text-brand mt-0.5 shrink-0">ℹ️</div>

        <div className="text-xs text-text-secondary">
          <strong className="text-text">Inventory states:</strong> Physical
          stock is the total on-hand. Reserved is held for confirmed orders.
          Available = Physical − Reserved.
        </div>
      </div>

      {/* Adjust Stock */}
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
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-text-secondary">
                Quantity Change
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAdjustQty((value) => String((Number(value) || 0) - 1))
                  }
                  className="w-8 h-8 rounded-lg border border-border bg-surface-elevated text-text-secondary hover:text-text transition-colors flex items-center justify-center font-bold"
                >
                  −
                </button>

                <input
                  type="number"
                  value={adjustQty}
                  onChange={(event) => setAdjustQty(event.target.value)}
                  placeholder="0"
                  className="flex-1 h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text text-center px-3 focus:outline-none focus:ring-1 focus:ring-brand/40"
                />

                <button
                  type="button"
                  onClick={() =>
                    setAdjustQty((value) => String((Number(value) || 0) + 1))
                  }
                  className="w-8 h-8 rounded-lg border border-border bg-surface-elevated text-text-secondary hover:text-text transition-colors flex items-center justify-center font-bold"
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
                onChange={(event) => setAdjustReason(event.target.value)}
                className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-2.5 focus:outline-none focus:ring-1 focus:ring-brand/40"
              >
                {ADJUST_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-text-secondary">
                Reference (PO / Note)
              </label>

              <input
                placeholder="e.g. PO-1045"
                className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* History */}
      <Modal
        open={historyModal}
        onClose={() => setHistoryModal(false)}
        title="Stock Movement History"
        size="lg"
      >
        <div className="divide-y divide-border/50 -mx-5 -mt-5">
          {movements.map((movement) => (
            <div
              key={movement.id}
              className="px-5 py-3 flex items-center gap-3"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                  movement.change > 0
                    ? "bg-success-muted text-success"
                    : "bg-danger-muted text-danger"
                }`}
              >
                {movement.change > 0 ? `+${movement.change}` : movement.change}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text truncate">
                  {movement.productName}
                </p>

                <p className="text-[11px] font-mono text-brand">
                  {movement.sku}
                </p>
              </div>

              <div className="text-right text-xs text-text-secondary">
                <p>{movement.reason}</p>

                <p className="text-[11px] text-text-muted font-mono">
                  {movement.reference}
                </p>
              </div>

              <div className="text-right text-[11px] text-text-muted shrink-0 w-20">
                <p>{movement.user}</p>
                <p>{movement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
