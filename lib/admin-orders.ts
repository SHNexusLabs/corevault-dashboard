import { apiFetch } from "@/lib/api";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type AdminOrderItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unitPrice: number | string;
  quantity: number;
  subtotal: number | string;
};

export type AdminOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: "UPI" | "CARD" | "COD";
  deliveryMethod: "STANDARD" | "EXPRESS";

  subtotal: number | string;
  shippingCost: number | string;
  discount: number | string;
  tax: number | string;
  total: number | string;

  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };

  items: AdminOrderItem[];
};

export type AdminOrderFilters = {
  search?: string;
  status?: OrderStatus | "";
  paymentStatus?: PaymentStatus | "";
};

export type AdminOrdersResponse = {
  success: boolean;
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function getAdminOrders(
  page = 1,
  limit = 10,
  filters: AdminOrderFilters = {},
) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.paymentStatus) {
    params.set("paymentStatus", filters.paymentStatus);
  }

  return apiFetch<AdminOrdersResponse>(`/admin/orders?${params.toString()}`);
}
