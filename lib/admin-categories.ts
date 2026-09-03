import { apiFetch } from "@/lib/api";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  _count?: {
    products: number;
  };
};

export type AdminCategoriesResponse = {
  success: boolean;
  categories: AdminCategory[];
};

export type CreateAdminCategoryInput = {
  name: string;
  slug: string;
  parentId?: string | null;
  isActive?: boolean;
};

export type UpdateAdminCategoryInput = Partial<CreateAdminCategoryInput>;

export type AdminCategoryMutationResponse = {
  success: boolean;
  message: string;
  category: AdminCategory;
};

export type DeleteAdminCategoryResponse = {
  success: boolean;
  message: string;
};

export async function getAdminCategories() {
  return apiFetch<AdminCategoriesResponse>("/admin/categories");
}

export async function createAdminCategory(input: CreateAdminCategoryInput) {
  return apiFetch<AdminCategoryMutationResponse>("/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminCategory(
  id: string,
  input: UpdateAdminCategoryInput,
) {
  return apiFetch<AdminCategoryMutationResponse>(`/admin/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteAdminCategory(id: string) {
  return apiFetch<DeleteAdminCategoryResponse>(`/admin/categories/${id}`, {
    method: "DELETE",
  });
}
