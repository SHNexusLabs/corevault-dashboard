import { apiFetch } from "@/lib/api";

export type AdminPayment = {
  id: string;
  orderNumber: string;
  paymentMethod: "UPI" | "CARD" | "COD" | string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  total: number | string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export type AdminPaymentStats = {
  transactions: number;
  paid: number;
  pending: number;
  failed: number;
  refunded: number;
};

export type AdminPaymentPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminPaymentFilters = {
  search?: string;
  status?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  method?: "UPI" | "CARD" | "COD";
};

export type GetAdminPaymentsResponse = {
  success: boolean;
  payments: AdminPayment[];
  stats: AdminPaymentStats;
  pagination: AdminPaymentPagination;
};

export type UpdateAdminPaymentStatusResponse = {
  success: boolean;
  message: string;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    total: number | string;
    updatedAt: string;
  };
};

export async function getAdminPayments(
  page = 1,
  limit = 8,
  filters: AdminPaymentFilters = {},
) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.method) {
    params.set("method", filters.method);
  }

  return apiFetch<GetAdminPaymentsResponse>(
    `/admin/payments?${params.toString()}`,
  );
}

export async function updateAdminPaymentStatus(
  orderId: string,
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED",
) {
  return apiFetch<UpdateAdminPaymentStatusResponse>(
    `/admin/payments/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  );
}
