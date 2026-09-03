import { apiFetch } from "@/lib/api";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod =
  | "UPI"
  | "CARD"
  | "COD";

export type DeliveryMethod =
  | "STANDARD"
  | "EXPRESS";

/* -------------------------------------------------------------------------- */
/* Order                                                                      */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Order Detail                                                               */
/* -------------------------------------------------------------------------- */

export type AdminOrderReturnRequest = {
  id: string;
  reason: string;
  status: string;
  refundAmount: number | string | null;
  refundStatus: string;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminOrderDetail = AdminOrder & {
  shippingDetails: unknown;
  returnRequests: AdminOrderReturnRequest[];
};

/* -------------------------------------------------------------------------- */
/* Filters                                                                    */
/* -------------------------------------------------------------------------- */

export type AdminOrderFilters = {
  search?: string;
  status?: OrderStatus | "";
  paymentStatus?: PaymentStatus | "";
};

/* -------------------------------------------------------------------------- */
/* API Responses                                                              */
/* -------------------------------------------------------------------------- */

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

export type AdminOrderDetailResponse = {
  success: boolean;
  order: AdminOrderDetail;
};

export type UpdateOrderStatusResponse = {
  success: boolean;
  message: string;
  order: AdminOrderDetail;
};

export type UpdatePaymentStatusResponse = {
  success: boolean;
  message: string;
  order: AdminOrderDetail;
};

/* -------------------------------------------------------------------------- */
/* Orders List                                                                */
/* -------------------------------------------------------------------------- */

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
    params.set(
      "search",
      filters.search.trim(),
    );
  }

  if (filters.status) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (filters.paymentStatus) {
    params.set(
      "paymentStatus",
      filters.paymentStatus,
    );
  }

  return apiFetch<AdminOrdersResponse>(
    `/admin/orders?${params.toString()}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Order Detail                                                               */
/* -------------------------------------------------------------------------- */

export function getAdminOrderDetails(
  orderId: string,
) {
  return apiFetch<AdminOrderDetailResponse>(
    `/admin/orders/${orderId}`,
  );
}

/* -------------------------------------------------------------------------- */
/* Order Status                                                               */
/* -------------------------------------------------------------------------- */

export function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
) {
  return apiFetch<UpdateOrderStatusResponse>(
    `/admin/orders/${orderId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Payment Status                                                             */
/* -------------------------------------------------------------------------- */

export function updateAdminPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
) {
  return apiFetch<UpdatePaymentStatusResponse>(
    `/admin/orders/${orderId}/payment-status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        paymentStatus,
      }),
    },
  );
}

