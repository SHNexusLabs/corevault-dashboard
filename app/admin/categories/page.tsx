"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  type AdminCategory,
} from "@/lib/admin-categories";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        setError("");

        const response = await getAdminCategories();

        setCategories(response.categories);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load categories",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadCategories();
  }, [refreshKey]);

  const filteredCategories = categories.filter((category) => {
    const query = search.toLowerCase().trim();

    if (!query) return true;

    return (
      category.name.toLowerCase().includes(query) ||
      category.slug.toLowerCase().includes(query)
    );
  });

  const parentCategories = categories.filter(
    (category) => category.parentId === null,
  );

  const totalProducts = categories.reduce(
    (total, category) => total + (category._count?.products ?? 0),
    0,
  );

  function handleAdd() {
    setEditingCategory(null);
    setShowForm(true);
  }

  function handleEdit(category: AdminCategory) {
    setEditingCategory(category);
    setShowForm(true);
  }

  async function handleArchive(category: AdminCategory) {
    const confirmed = window.confirm(`Archive "${category.name}"?`);

    if (!confirmed) return;

    try {
      setError("");

      await deleteAdminCategory(category.id);

      setRefreshKey((value) => value + 1);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to archive category",
      );
    }
  }

  function handleSaved() {
    setShowForm(false);
    setEditingCategory(null);
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text">Categories</h1>

            <p className="mt-1 text-xs text-text-muted">
              Organize products into categories and manage your catalog
              structure.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={handleAdd}>
            + Add Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Total Categories" value={categories.length} />

          <StatCard
            label="Active"
            value={categories.filter((category) => category.isActive).length}
          />

          <StatCard label="Parent Categories" value={parentCategories.length} />

          <StatCard label="Products" value={totalProducts} />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Category table */}
        <Card>
          <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-text">
                All Categories
              </h2>

              <p className="mt-0.5 text-xs text-text-muted">
                {filteredCategories.length} categories
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="h-8 w-full rounded-lg border border-border bg-surface-elevated px-3 text-xs text-text outline-none placeholder:text-text-muted focus:ring-1 focus:ring-brand/40 sm:w-64"
            />
          </div>

          {loading ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm text-text-secondary">
                Loading categories...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-text">
                No categories found
              </p>

              <p className="mt-1 text-xs text-text-muted">
                Try changing your search or create a new category.
              </p>
            </div>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Category</Th>
                  <Th>Slug</Th>
                  <Th>Parent</Th>
                  <Th>Products</Th>
                  <Th>Status</Th>
                  <Th />
                </tr>
              </Thead>

              <Tbody>
                {filteredCategories.map((category) => {
                  const parent = category.parentId
                    ? categories.find((item) => item.id === category.parentId)
                    : null;

                  return (
                    <Tr key={category.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-xs font-semibold text-brand">
                            {category.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <p className="text-xs font-medium text-text">
                              {category.name}
                            </p>

                            <p className="mt-0.5 text-[11px] text-text-muted">
                              Category
                            </p>
                          </div>
                        </div>
                      </Td>

                      <Td>
                        <span className="font-mono text-xs text-text-muted">
                          {category.slug}
                        </span>
                      </Td>

                      <Td>
                        <span className="text-xs text-text-secondary">
                          {parent?.name ?? "—"}
                        </span>
                      </Td>

                      <Td>
                        <span className="font-mono text-xs text-text">
                          {category._count?.products ?? 0}
                        </span>
                      </Td>

                      <Td>
                        <StatusBadge isActive={category.isActive} />
                      </Td>

                      <Td>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleEdit(category)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => void handleArchive(category)}
                          >
                            Archive
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          )}

          {!loading && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-xs text-text-muted">
                Showing{" "}
                <span className="font-medium text-text">
                  {filteredCategories.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-text">
                  {categories.length}
                </span>
              </span>
            </div>
          )}
        </Card>

        {/* Add / Edit form */}
        {showForm && (
          <CategoryForm
            category={editingCategory}
            categories={categories}
            onClose={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
            onSaved={handleSaved}
          />
        )}
      </div>
    </div>
  );
}

function CategoryForm({
  category,
  categories,
  onClose,
  onSaved,
}: {
  category: AdminCategory | null;
  categories: AdminCategory[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditMode = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");

  const [slug, setSlug] = useState(category?.slug ?? "");

  const [parentId, setParentId] = useState(category?.parentId ?? "");

  const [isActive, setIsActive] = useState(category?.isActive ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function handleNameChange(value: string) {
    setName(value);

    if (!isEditMode) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      if (!name.trim()) {
        throw new Error("Category name is required");
      }

      if (!slug.trim()) {
        throw new Error("Category slug is required");
      }

      if (category && parentId === category.id) {
        throw new Error("A category cannot be its own parent");
      }

      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId || null,
        isActive,
      };

      if (category) {
        await updateAdminCategory(category.id, payload);
      } else {
        await createAdminCategory(payload);
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  const parentOptions = categories.filter((item) => item.id !== category?.id);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-text">
            {isEditMode ? "Edit Category" : "Add Category"}
          </h2>

          <p className="mt-1 text-xs text-text-muted">
            {isEditMode
              ? "Update category information."
              : "Create a new product category."}
          </p>
        </div>

        <Button type="button" variant="ghost" size="xs" onClick={onClose}>
          Close
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              Category Name
            </label>

            <input
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              placeholder="e.g. Graphics Cards"
              required
              className="h-8 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text outline-none placeholder:text-text-muted focus:ring-1 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              Slug
            </label>

            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="e.g. graphics-cards"
              required
              className="h-8 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text outline-none placeholder:text-text-muted focus:ring-1 focus:ring-brand/40"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-secondary">
              Parent Category
            </label>

            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="h-8 w-full rounded-lg border border-border bg-surface-elevated px-3 text-sm text-text outline-none focus:ring-1 focus:ring-brand/40"
            >
              <option value="">No parent category</option>

              {parentOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex cursor-pointer items-center gap-3 sm:pt-5">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4 rounded border-border accent-brand"
            />

            <span>
              <span className="block text-xs font-medium text-text">
                Active
              </span>

              <span className="mt-0.5 block text-xs text-text-muted">
                Category is available for products.
              </span>
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving
              ? "Saving..."
              : isEditMode
                ? "Update Category"
                : "Save Category"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-text">{value}</p>
    </Card>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-medium ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-zinc-500/10 text-zinc-400"
      }`}
    >
      {isActive ? "Active" : "Archived"}
    </span>
  );
}
