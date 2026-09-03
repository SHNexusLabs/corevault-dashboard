"use client";

import { useEffect, useState } from "react";
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
import type { NavigateFn } from "@/lib/navigation";

import {
  getAdminProducts,
  deleteAdminProduct,
  type AdminProduct,
  type ProductStockStatus,
} from "@/lib/admin-products";

interface ProductsProps {
  onNavigate: NavigateFn;
}

const PER_PAGE = 8;

export function Products({ onNavigate }: ProductsProps) {
  const [products, setProducts] = useState<AdminProduct[]>([]);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStockStatus | "">("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAdminProducts(page, PER_PAGE, {
          search: search.trim() || undefined,
          categoryId: categoryFilter || undefined,
          stockStatus: statusFilter || undefined,
        });

        setProducts(data.products);
        setStats(data.stats);
        setTotal(data.pagination.total);
      } catch (error) {
        console.error("Load products error:", error);

        setError(
          error instanceof Error ? error.message : "Unable to load products",
        );
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [page, search, categoryFilter, statusFilter, refreshKey]);

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as ProductStockStatus | "");
    setPage(1);
  }

  async function handleArchive(product: AdminProduct) {
    const confirmed = window.confirm(`Archive "${product.name}"?`);

    if (!confirmed) return;

    try {
      await deleteAdminProduct(product.id);

      setRefreshKey((value) => value + 1);
    } catch (error) {
      console.error("Archive product error:", error);

      window.alert(
        error instanceof Error ? error.message : "Unable to archive product",
      );
    }
  }

  const categories = Array.from(
    new Map(
      products.map((product) => [product.category.id, product.category]),
    ).values(),
  );

  const statsCards = [
    {
      label: "Total Products",
      value: stats.total,
      color: "text-brand",
    },
    {
      label: "Active",
      value: stats.active,
      color: "text-success",
    },
    {
      label: "Low Stock",
      value: stats.lowStock,
      color: "text-warning",
    },
    {
      label: "Out of Stock",
      value: stats.outOfStock,
      color: "text-danger",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {statsCards.map((stat) => (
          <Card key={stat.label} className="p-3">
            <p className="text-[11px] text-text-muted mb-0.5">{stat.label}</p>

            <p className={`text-xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text">Products</h2>

            <span className="text-xs text-text-muted bg-surface-elevated px-2 py-0.5 rounded-full font-mono">
              {total}
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

        {/* Filters */}
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
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">All Categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">All Stock Status</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </Select>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 border-b border-border">
            <p className="text-xs text-danger">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <p className="text-sm text-text-muted">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
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
                {products.map((product) => {
                  const stockStatus: ProductStockStatus =
                    product.stock === 0
                      ? "out_of_stock"
                      : product.stock <= product.lowStockAt
                        ? "low_stock"
                        : "in_stock";

                  return (
                    <Tr
                      key={product.id}
                      onClick={() => onNavigate("product-detail", product.id)}
                    >
                      {/* Product */}
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
                              {product.brand.name}
                            </p>
                          </div>
                        </div>
                      </Td>

                      {/* SKU */}
                      <Td>
                        <span className="font-mono text-xs text-brand">
                          {product.sku}
                        </span>
                      </Td>

                      {/* Category */}
                      <Td>
                        <span className="text-xs text-text-secondary">
                          {product.category.name}
                        </span>
                      </Td>

                      {/* Price */}
                      <Td>
                        <div>
                          <p className="font-mono text-xs font-medium text-text">
                            {formatCurrency(Number(product.price))}
                          </p>

                          {product.comparePrice !== null && (
                            <p className="font-mono text-[11px] text-text-muted line-through">
                              {formatCurrency(Number(product.comparePrice))}
                            </p>
                          )}
                        </div>
                      </Td>

                      {/* Stock */}
                      <Td>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono text-xs font-semibold ${
                              product.stock === 0
                                ? "text-danger"
                                : product.stock <= product.lowStockAt
                                  ? "text-warning"
                                  : "text-text"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </div>
                      </Td>

                      {/* Status */}
                      <Td>
                        <StockBadge status={stockStatus} />
                      </Td>

                      {/* Updated */}
                      <Td>
                        <span className="text-xs text-text-muted">
                          {formatShortDate(new Date(product.updatedAt))}
                        </span>
                      </Td>

                      {/* Actions */}
                      <Td>
                        <div
                          className="flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* View */}
                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                            onClick={() =>
                              onNavigate("product-detail", product.id)
                            }
                            title="View product"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
                            onClick={() =>
                              onNavigate("product-detail", product.id)
                            }
                            title="Edit product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive */}
                          <button
                            type="button"
                            className="w-6 h-6 rounded flex items-center justify-center text-text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                            onClick={() => handleArchive(product)}
                            title="Archive product"
                          >
                            <Archive className="w-3.5 h-3.5" />
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
              total={total}
              perPage={PER_PAGE}
              onChange={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
