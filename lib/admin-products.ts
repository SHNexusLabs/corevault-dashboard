import { apiFetch } from "@/lib/api";

export type ProductStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type AdminProductBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
};

export type AdminProductCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProduct = {
  id: string;

  name: string;
  slug: string;
  sku: string;

  description: string | null;

  price: number | string;
  comparePrice: number | string | null;

  brandId: string;
  categoryId: string;

  stock: number;
  lowStockAt: number;

  images: unknown;
  specifications: unknown;

  isActive: boolean;
  isOnDeal: boolean;

  dealStart: string | null;
  dealEnd: string | null;

  createdAt: string;
  updatedAt: string;

  brand: AdminProductBrand;
  category: AdminProductCategory;
};

export type AdminProductStats = {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
};

export type AdminProductPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminProductsResponse = {
  success: boolean;
  products: AdminProduct[];
  stats: AdminProductStats;
  pagination: AdminProductPagination;
};

export type AdminProductFilters = {
  search?: string;
  categoryId?: string;
  brandId?: string;
  stockStatus?: ProductStockStatus;
  isActive?: boolean;
};

export type CreateAdminProductInput = {
  name: string;
  slug: string;
  sku: string;

  description?: string;

  price: number;
  comparePrice?: number;

  brandId: string;
  categoryId: string;

  stock?: number;
  lowStockAt?: number;

  images?: string[];

  specifications?: Record<string, string | number | boolean>;

  isActive?: boolean;
  isOnDeal?: boolean;

  dealStart?: string;
  dealEnd?: string;
};

export type UpdateAdminProductInput = Partial<CreateAdminProductInput>;

export type AdminProductMutationResponse = {
  success: boolean;
  message: string;
  product: AdminProduct;
};

export type DeleteAdminProductResponse = {
  success: boolean;
  message: string;
};

export type AdminProductResponse = {
  success: boolean;
  product: AdminProduct;
};

export async function getAdminProduct(id: string) {
  return apiFetch<AdminProductResponse>(`/admin/products/${id}`);
}

export async function getAdminProducts(
  page = 1,
  limit = 8,
  filters: AdminProductFilters = {},
) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.categoryId) {
    params.set("categoryId", filters.categoryId);
  }

  if (filters.brandId) {
    params.set("brandId", filters.brandId);
  }

  if (filters.stockStatus) {
    params.set("stockStatus", filters.stockStatus);
  }

  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }

  return apiFetch<AdminProductsResponse>(
    `/admin/products?${params.toString()}`,
  );
}

export async function createAdminProduct(input: CreateAdminProductInput) {
  return apiFetch<AdminProductMutationResponse>("/admin/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminProduct(
  id: string,
  input: UpdateAdminProductInput,
) {
  return apiFetch<AdminProductMutationResponse>(`/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAdminProduct(id: string) {
  return apiFetch<DeleteAdminProductResponse>(`/admin/products/${id}`, {
    method: "DELETE",
  });
}
