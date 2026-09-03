import { apiFetch } from "@/lib/api";

export type AdminCustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
    returnRequests: number;
  };
};

export type AdminCustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number | string;
  createdAt: string;
};

export type AdminCustomerReview = {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
};

export type AdminCustomerReturnRequest = {
  id: string;
  orderId: string;
  status: string;
  refundAmount: number | string | null;
  refundStatus: string;
  createdAt: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  addresses: unknown[];
  orders: AdminCustomerOrder[];
  reviews: AdminCustomerReview[];
  returnRequests: AdminCustomerReturnRequest[];
};

export type AdminCustomerStats = {
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  totalRevenue: number | string;
};

export type AdminCustomerPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type GetAdminCustomersResponse = {
  success: boolean;
  customers: AdminCustomerListItem[];
  stats: AdminCustomerStats;
  pagination: AdminCustomerPagination;
};

export type GetAdminCustomerResponse = {
  success: boolean;
  customer: AdminCustomer;
};

export type UpdateAdminCustomerStatusResponse = {
  success: boolean;
  message: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    updatedAt: string;
  };
};

export type AdminCustomerListFilters = {
  search?: string;
  isActive?: boolean;
};

export async function getAdminCustomers(
  page = 1,
  limit = 8,
  filters: AdminCustomerListFilters = {},
) {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.isActive !== undefined) {
    params.set("isActive", String(filters.isActive));
  }

  return apiFetch<GetAdminCustomersResponse>(
    `/admin/customers?${params.toString()}`,
  );
}

export async function getAdminCustomer(id: string) {
  return apiFetch<GetAdminCustomerResponse>(`/admin/customers/${id}`);
}

export async function updateAdminCustomerStatus(id: string, isActive: boolean) {
  return apiFetch<UpdateAdminCustomerStatusResponse>(
    `/admin/customers/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    },
  );
}
