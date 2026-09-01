"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import type { Page } from "@/lib/types";

export function Categories() {
  const cats = [
    {
      name: "Graphics Cards",
      slug: "graphics-cards",
      products: 2,
      parent: null,
    },
    { name: "Storage", slug: "storage", products: 1, parent: null },
    {
      name: "Keyboards",
      slug: "keyboards",
      products: 1,
      parent: "Peripherals",
    },
    { name: "Monitors", slug: "monitors", products: 1, parent: null },
    { name: "Mice", slug: "mice", products: 1, parent: "Peripherals" },
    { name: "Headphones", slug: "headphones", products: 1, parent: "Audio" },
    { name: "Memory", slug: "memory", products: 1, parent: null },
    { name: "Accessories", slug: "accessories", products: 3, parent: null },
    { name: "Chairs", slug: "chairs", products: 1, parent: null },
    {
      name: "Power Supplies",
      slug: "power-supplies",
      products: 1,
      parent: null,
    },
  ];
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text">Categories</h2>
          <Button variant="primary" size="sm">
            + Add Category
          </Button>
        </div>
        <Table>
          <Thead>
            <tr>
              <Th>Category</Th>
              <Th>Slug</Th>
              <Th>Parent</Th>
              <Th>Products</Th>
              <Th />
            </tr>
          </Thead>
          <Tbody>
            {cats.map((c) => (
              <Tr key={c.slug}>
                <Td>
                  <span className="text-xs font-medium text-text">
                    {c.name}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-text-muted">
                    {c.slug}
                  </span>
                </Td>
                <Td>
                  <span className="text-xs text-text-secondary">
                    {c.parent || "—"}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-text">
                    {c.products}
                  </span>
                </Td>
                <Td>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="xs">
                      Edit
                    </Button>
                    <Button variant="ghost" size="xs">
                      Archive
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

export function ProductDetail({
  productId,
  onNavigate,
}: {
  productId?: string | null;
  onNavigate?: (page: Page, entityId?: string) => void;
}) {
  void productId;
  void onNavigate;
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-3xl space-y-4">
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text mb-4">
            Product Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Product Name", placeholder: "e.g. RTX 4070 Super" },
              { label: "Brand", placeholder: "e.g. NVIDIA" },
              { label: "SKU", placeholder: "e.g. RTX-4070S-12G" },
              { label: "Category", placeholder: "e.g. Graphics Cards" },
              { label: "Price (₹)", placeholder: "42999" },
              { label: "Sale Price (₹)", placeholder: "Optional" },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-text-secondary block mb-1">
                  {f.label}
                </label>
                <input
                  placeholder={f.placeholder}
                  className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="text-xs text-text-secondary block mb-1">
                Description
              </label>
              <textarea
                rows={3}
                className="w-full rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 py-2 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40 resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary" size="sm">
              Save Product
            </Button>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text mb-4">
            Product Variants
          </h2>
          <div className="space-y-3">
            {[
              {
                name: "Space Grey / Brown Switch",
                sku: "KEY-Q1P-SG-BR",
                price: 12999,
                stock: 5,
              },
              {
                name: "Space Grey / Red Switch",
                sku: "KEY-Q1P-SG-RD",
                price: 12999,
                stock: 4,
              },
              {
                name: "Carbon Black / Brown Switch",
                sku: "KEY-Q1P-CB-BR",
                price: 12999,
                stock: 3,
              },
            ].map((v, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg border border-border bg-surface-elevated/30"
              >
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <input
                    defaultValue={v.name}
                    className="col-span-2 h-7 rounded-lg border border-border bg-surface-elevated text-xs text-text px-2 focus:outline-none focus:ring-1 focus:ring-brand/40"
                  />
                  <input
                    defaultValue={v.sku}
                    className="h-7 rounded-lg border border-border bg-surface-elevated text-xs font-mono text-brand px-2 focus:outline-none focus:ring-1 focus:ring-brand/40"
                  />
                  <input
                    defaultValue={v.stock}
                    type="number"
                    className="h-7 rounded-lg border border-border bg-surface-elevated text-xs text-text px-2 text-center focus:outline-none focus:ring-1 focus:ring-brand/40"
                  />
                </div>
                <Button variant="danger" size="xs">
                  Remove
                </Button>
              </div>
            ))}
            <Button variant="secondary" size="sm">
              + Add Variant
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
