"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  createAdminProduct,
  getAdminProduct,
  updateAdminProduct,
  type AdminProduct,
} from "@/lib/admin-products";
import { apiFetch } from "@/lib/api";
import type { Page } from "@/lib/types";

type BrandOption = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  isActive: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
};

type ProductForm = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: string;
  comparePrice: string;
  brandId: string;
  categoryId: string;
  stock: string;
  lowStockAt: string;
  images: string;
  specifications: string;
  isActive: boolean;
  isOnDeal: boolean;
  dealStart: string;
  dealEnd: string;
};

function emptyForm(): ProductForm {
  return {
    name: "",
    slug: "",
    sku: "",
    description: "",
    price: "",
    comparePrice: "",
    brandId: "",
    categoryId: "",
    stock: "0",
    lowStockAt: "5",
    images: "",
    specifications: "",
    isActive: true,
    isOnDeal: false,
    dealStart: "",
    dealEnd: "",
  };
}

function imagesToText(value: unknown): string {
  if (!Array.isArray(value)) return "";

  return value
    .filter((item): item is string => typeof item === "string")
    .join("\n");
}

function specificationsToText(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "";
  }
}

function toDateTimeLocal(value: string | null): string {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (number: number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function productToForm(product: AdminProduct): ProductForm {
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description ?? "",
    price: String(product.price),
    comparePrice:
      product.comparePrice !== null ? String(product.comparePrice) : "",
    brandId: product.brandId,
    categoryId: product.categoryId,
    stock: String(product.stock),
    lowStockAt: String(product.lowStockAt),
    images: imagesToText(product.images),
    specifications: specificationsToText(product.specifications),
    isActive: product.isActive,
    isOnDeal: product.isOnDeal,
    dealStart: toDateTimeLocal(product.dealStart),
    dealEnd: toDateTimeLocal(product.dealEnd),
  };
}

export function ProductDetail({
  productId,
  onNavigate,
}: {
  productId?: string | null;
  onNavigate?: (page: Page, entityId?: string) => void;
}) {
  const isEditMode = Boolean(productId) && productId !== "new";

  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [brandResponse, categoryResponse] = await Promise.all([
          apiFetch<{ success: boolean; brands: BrandOption[] }>(
            "/admin/brands",
          ),
          apiFetch<{
            success: boolean;
            categories: CategoryOption[];
          }>("/admin/categories"),
        ]);

        setBrands(brandResponse.brands);
        setCategories(categoryResponse.categories);

        if (isEditMode && productId) {
          const productResponse = await getAdminProduct(productId);

          setForm(productToForm(productResponse.product));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [isEditMode, productId]);

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSlugFromName() {
    if (isEditMode || form.slug.trim()) return;

    const slug = form.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    updateField("slug", slug);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!form.name.trim()) {
        throw new Error("Product name is required");
      }

      if (!form.slug.trim()) {
        throw new Error("Slug is required");
      }

      if (!form.sku.trim()) {
        throw new Error("SKU is required");
      }

      if (!form.brandId) {
        throw new Error("Please select a brand");
      }

      if (!form.categoryId) {
        throw new Error("Please select a category");
      }

      const price = Number(form.price);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error("Enter a valid price");
      }

      const stock = Number(form.stock);

      if (!Number.isInteger(stock) || stock < 0) {
        throw new Error("Enter a valid stock quantity");
      }

      const lowStockAt = Number(form.lowStockAt);

      if (!Number.isInteger(lowStockAt) || lowStockAt < 0) {
        throw new Error("Enter a valid low-stock threshold");
      }

      let specifications: Record<string, string | number | boolean> | undefined;

      if (form.specifications.trim()) {
        let parsed: unknown;

        try {
          parsed = JSON.parse(form.specifications);
        } catch {
          throw new Error("Specifications must contain valid JSON");
        }

        if (
          typeof parsed !== "object" ||
          parsed === null ||
          Array.isArray(parsed)
        ) {
          throw new Error("Specifications must be a JSON object");
        }

        specifications = parsed as Record<string, string | number | boolean>;
      }

      const images = form.images
        .split(/\r?\n/)
        .map((image) => image.trim())
        .filter(Boolean);

      const comparePrice = form.comparePrice.trim()
        ? Number(form.comparePrice)
        : undefined;

      if (
        comparePrice !== undefined &&
        (!Number.isFinite(comparePrice) || comparePrice < 0)
      ) {
        throw new Error("Enter a valid compare price");
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        sku: form.sku.trim(),
        description: form.description.trim() || undefined,
        price,
        comparePrice,
        brandId: form.brandId,
        categoryId: form.categoryId,
        stock,
        lowStockAt,
        images,
        specifications,
        isActive: form.isActive,
        isOnDeal: form.isOnDeal,
        dealStart: form.dealStart
          ? new Date(form.dealStart).toISOString()
          : undefined,
        dealEnd: form.dealEnd
          ? new Date(form.dealEnd).toISOString()
          : undefined,
      };

      if (isEditMode && productId) {
        await updateAdminProduct(productId, payload);
      } else {
        await createAdminProduct(payload);
      }

      onNavigate?.("products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-5">
        <Card className="p-5">
          <p className="text-sm text-text-secondary">Loading product...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-text">
                {isEditMode ? "Edit Product" : "Add Product"}
              </h2>

              <p className="text-xs text-text-muted mt-1">
                {isEditMode
                  ? "Update product information"
                  : "Create a new product"}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Product Name"
              value={form.name}
              placeholder="e.g. RTX 4070 Super"
              onChange={(value) => updateField("name", value)}
              onBlur={handleSlugFromName}
              required
            />

            <Field
              label="SKU"
              value={form.sku}
              placeholder="e.g. RTX-4070S-12G"
              onChange={(value) => updateField("sku", value)}
              required
            />

            <Field
              label="Slug"
              value={form.slug}
              placeholder="e.g. rtx-4070-super"
              onChange={(value) => updateField("slug", value)}
              required
            />

            <SelectField
              label="Brand"
              value={form.brandId}
              onChange={(value) => updateField("brandId", value)}
              options={brands.map((brand) => ({
                value: brand.id,
                label: brand.name,
              }))}
              placeholder="Select brand"
              required
            />

            <SelectField
              label="Category"
              value={form.categoryId}
              onChange={(value) => updateField("categoryId", value)}
              options={categories.map((category) => ({
                value: category.id,
                label: category.name,
              }))}
              placeholder="Select category"
              required
            />

            <Field
              label="Price (₹)"
              type="number"
              value={form.price}
              placeholder="42999"
              onChange={(value) => updateField("price", value)}
              required
            />

            <Field
              label="Compare Price (₹)"
              type="number"
              value={form.comparePrice}
              placeholder="Optional"
              onChange={(value) => updateField("comparePrice", value)}
            />

            <Field
              label="Stock"
              type="number"
              value={form.stock}
              placeholder="0"
              onChange={(value) => updateField("stock", value)}
              required
            />

            <Field
              label="Low Stock At"
              type="number"
              value={form.lowStockAt}
              placeholder="5"
              onChange={(value) => updateField("lowStockAt", value)}
              required
            />

            <div className="sm:col-span-2">
              <label className="text-xs text-text-secondary block mb-1">
                Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                className="w-full rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 py-2 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40 resize-none"
                placeholder="Describe the product..."
              />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text mb-1">
            Product Images
          </h2>

          <p className="text-xs text-text-muted mb-3">
            Enter one image URL per line.
          </p>

          <textarea
            rows={4}
            value={form.images}
            onChange={(event) => updateField("images", event.target.value)}
            placeholder="https://example.com/product-1.jpg&#10;https://example.com/product-2.jpg"
            className="w-full rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 py-2 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40 resize-none"
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text mb-1">
            Specifications
          </h2>

          <p className="text-xs text-text-muted mb-3">
            Enter specifications as a JSON object.
          </p>

          <textarea
            rows={8}
            value={form.specifications}
            onChange={(event) =>
              updateField("specifications", event.target.value)
            }
            placeholder={`{
  "vram": "12GB",
  "memoryType": "GDDR6X",
  "interface": "PCIe 4.0"
}`}
            className="w-full rounded-lg border border-border bg-surface-elevated text-sm font-mono text-text px-3 py-2 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40 resize-y"
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-text mb-4">
            Product Settings
          </h2>

          <div className="space-y-4">
            <CheckboxField
              label="Active Product"
              description="Product is visible and available in the store."
              checked={form.isActive}
              onChange={(checked) => updateField("isActive", checked)}
            />

            <CheckboxField
              label="Deal Product"
              description="Mark this product as being on deal."
              checked={form.isOnDeal}
              onChange={(checked) => updateField("isOnDeal", checked)}
            />

            {form.isOnDeal && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Field
                  label="Deal Start"
                  type="datetime-local"
                  value={form.dealStart}
                  onChange={(value) => updateField("dealStart", value)}
                />

                <Field
                  label="Deal End"
                  type="datetime-local"
                  value={form.dealEnd}
                  onChange={(value) => updateField("dealEnd", value)}
                />
              </div>
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onNavigate?.("products")}
          >
            Cancel
          </Button>

          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Product"
                : "Save Product"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}) {
  return (
    <div>
      <label className="text-xs text-text-secondary block mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-brand/40"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-xs text-text-secondary block mb-1">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      <select
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-8 rounded-lg border border-border bg-surface-elevated text-sm text-text px-3 focus:outline-none focus:ring-1 focus:ring-brand/40"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border accent-brand"
      />

      <span>
        <span className="block text-xs font-medium text-text">{label}</span>

        <span className="block text-xs text-text-muted mt-0.5">
          {description}
        </span>
      </span>
    </label>
  );
}
