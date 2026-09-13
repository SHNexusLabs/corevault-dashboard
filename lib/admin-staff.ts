import { apiFetch } from "@/lib/api";

export type AdminStaffRole = "ADMIN" | "SUPER_ADMIN";

export type AdminStaff = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: AdminStaffRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminStaffStats = {
  total: number;
  active: number;
  admins: number;
  superAdmins: number;
};

export type AdminStaffPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminStaffListResponse = {
  success: boolean;
  staff: AdminStaff[];
  stats: AdminStaffStats;
  pagination: AdminStaffPagination;
};

export type AdminStaffListFilters = {
  search?: string;
};

export type CreateAdminStaffInput = {
  name: string;
  email: string;
  role: AdminStaffRole;
};

export type UpdateAdminStaffInput = {
  name?: string;
  email?: string;
  role?: AdminStaffRole;
};

export type UpdateAdminStaffStatusInput = {
  isActive: boolean;
};

export type CreateAdminStaffResponse = {
  success: boolean;
  staff: AdminStaff;
  temporaryPassword: string;
};

export type AdminStaffMutationResponse = {
  success: boolean;
  staff: AdminStaff;
};

export async function getAdminStaff(
  page = 1,
  limit = 8,
  filters: AdminStaffListFilters = {},
): Promise<AdminStaffListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  return apiFetch<AdminStaffListResponse>(`/admin/staff?${params.toString()}`);
}

export async function createAdminStaff(
  input: CreateAdminStaffInput,
): Promise<CreateAdminStaffResponse> {
  return apiFetch<CreateAdminStaffResponse>("/admin/staff", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAdminStaff(
  id: string,
  input: UpdateAdminStaffInput,
): Promise<AdminStaffMutationResponse> {
  return apiFetch<AdminStaffMutationResponse>(`/admin/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function updateAdminStaffStatus(
  id: string,
  isActive: boolean,
): Promise<AdminStaffMutationResponse> {
  return apiFetch<AdminStaffMutationResponse>(`/admin/staff/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}
