import { apiFetch } from "@/lib/api";

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type PaymentMethod = "UPI" | "CARD" | "COD";

export type DeliveryMethod = "STANDARD" | "EXPRESS";

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

  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;

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

export type AdminOrderDetail = AdminOrder & {
  shippingDetails: unknown;

  returnRequests: Array<{
    id: string;
    status: string;
    reason: string | null;
    createdAt: string;
    updatedAt: string;

    items: Array<{
      id: string;
      quantity: number;

      orderItem: {
        id: string;
        productName: string;
        sku: string;
      };
    }>;
  }>;
};

export type AdminOrdersFilters = {
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  from?: string;
  to?: string;
};

export async function getAdminOrders(
  page = 1,
  limit = 20,
  filters: AdminOrdersFilters = {},
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

  if (filters.paymentStatus) {
    params.set("paymentStatus", filters.paymentStatus);
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  return apiFetch<{
    orders: AdminOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>(`/admin/orders?${params.toString()}`);
}

export async function getAdminOrderDetails(orderId: string) {
  return apiFetch<{
    order: AdminOrderDetail;
  }>(`/admin/orders/${orderId}`);
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
) {
  return apiFetch<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    updatedAt: string;
  }>(`/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function updateAdminPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
) {
  return apiFetch<{
    id: string;
    orderNumber: string;
    paymentStatus: PaymentStatus;
    updatedAt: string;
  }>(`/admin/orders/${orderId}/payment-status`, {
    method: "PATCH",
    body: JSON.stringify({ paymentStatus }),
  });
}
