import { apiFetch } from "@/lib/api";

export type AdminActivityUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | "CUSTOMER";
};

export type AdminActivity = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
  user: AdminActivityUser;
};

export type AdminActivityPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminActivityResponse = {
  success: boolean;
  activities: AdminActivity[];
  pagination: AdminActivityPagination;
};

export type AdminActivityFilters = {
  search?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  userId?: string;
  from?: string;
  to?: string;
};

export async function getAdminActivities(
  page = 1,
  limit = 10,
  filters: AdminActivityFilters = {},
): Promise<AdminActivityResponse> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.entityType) {
    params.set("entityType", filters.entityType);
  }

  if (filters.entityId) {
    params.set("entityId", filters.entityId);
  }

  if (filters.userId) {
    params.set("userId", filters.userId);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  return apiFetch<AdminActivityResponse>(
    `/admin/activity?${params.toString()}`,
  );
}
