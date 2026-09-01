"use client";
import { useState } from "react";
import {
  Plus,
  Eye,
  Edit,
  Archive,
  Download,
  Box,
  Image as ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
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
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { MOCK_PRODUCTS } from "@/lib/data";
import type { StockStatus } from "@/lib/types";
import type { NavigateFn } from "@/lib/navigation";

interface ProductsProps {
  onNavigate: NavigateFn;
}

function getStockStatus(p: (typeof MOCK_PRODUCTS)[0]): StockStatus {
  if (p.available === 0) return "out_of_stock";
  if (p.available <= p.lowStockThreshold) return "low_stock";
  return "in_stock";
}

export function Products({ onNavigate }: ProductsProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const categories = [...new Set(MOCK_PRODUCTS.map((p) => p.category))];

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    const matchCat = !categoryFilter || p.category === categoryFilter;
    const matchStatus = !statusFilter || getStockStatus(p) === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          {
            label: "Total Products",
            value: MOCK_PRODUCTS.length,
            color: "text-brand",
          },
          {
            label: "Active",
            value: MOCK_PRODUCTS.filter((p) => p.status === "active").length,
            color: "text-success",
          },
          {
            label: "Low Stock",
            value: MOCK_PRODUCTS.filter(
              (p) => getStockStatus(p) === "low_stock",
            ).length,
            color: "text-warning",
          },
          {
            label: "Out of Stock",
            value: MOCK_PRODUCTS.filter(
              (p) => getStockStatus(p) === "out_of_stock",
            ).length,
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
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">Products</h2>
            <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
              {MOCK_PRODUCTS.length}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="ghost"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Export
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => onNavigate("product-detail")}
            >
              Add Product
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
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </Select>
        </div>

        {paged.length === 0 ? (
          <EmptyState
            icon={Box}
            title="No products found"
            message="Try adjusting your search or filters."
            className="py-20"
          />
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Product</Th>
                  <Th>SKU</Th>
                  <Th>Category</Th>
                  <Th sortable>Price</Th>
                  <Th>Stock</Th>
                  <Th>Status</Th>
                  <Th>Updated</Th>
                  <Th className="w-20" />
                </tr>
              </Thead>
              <Tbody>
                {paged.map((product) => (
                  <Tr
                    key={product.id}
                    onClick={() => onNavigate("product-detail", product.id)}
                  >
                    <Td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-surface-elevated border border-border flex items-center justify-center shrink-0">
                          <ImageIcon
                            className="w-4 h-4 text-text-muted"
                            aria-hidden="true"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-text max-w-45 truncate">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-text-muted">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <span className="font-mono text-xs text-brand">
                        {product.sku}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-xs text-text-secondary">
                        {product.category}
                      </span>
                    </Td>
                    <Td>
                      <div>
                        <p className="font-mono text-xs font-medium text-text">
                          {formatCurrency(product.price)}
                        </p>
                        {product.salePrice && (
                          <p className="font-mono text-[11px] text-success">
                            {formatCurrency(product.salePrice)}
                          </p>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono text-xs font-semibold ${product.available === 0 ? "text-danger" : product.available <= product.lowStockThreshold ? "text-warning" : "text-text"}`}
                        >
                          {product.available}
                        </span>
                        {product.variants && (
                          <span className="text-[10px] text-text-muted bg-surface-elevated px-1 rounded">
                            {product.variants.length}v
                          </span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <StockBadge status={getStockStatus(product)} />
                    </Td>
                    <Td>
                      <span className="text-xs text-text-muted">
                        {formatShortDate(product.updatedAt)}
                      </span>
                    </Td>
                    <Td>
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                          onClick={() =>
                            onNavigate("product-detail", product.id)
                          }
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Pagination
              page={page}
              total={filtered.length}
              perPage={perPage}
              onChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
