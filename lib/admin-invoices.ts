import { apiFetch } from "@/lib/api";

export type AdminInvoice = {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  amount: number | string;
  status: "PAID" | string;
  createdAt: string;
};

export type AdminInvoicePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetAdminInvoicesResponse = {
  success: boolean;
  invoices: AdminInvoice[];
  pagination: AdminInvoicePagination;
};

export async function getAdminInvoices(page = 1, limit = 8, search?: string) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (search?.trim()) {
    params.set("search", search.trim());
  }

  return apiFetch<GetAdminInvoicesResponse>(
    `/admin/invoices?${params.toString()}`,
  );
}
