import { apiFetch } from "@/lib/api";

export type DashboardStats = {
  products: {
    total: number;
    active: number;
    lowStock: number;
    outOfStock: number;
  };

  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    paid: number;
  };

  customers: {
    total: number;
  };

  reviews: {
    total: number;
    pending: number;
    approved: number;
  };

  revenue: {
    total: number;
    today: number;
  };

  alerts: {
    processingOrders: number;
    paymentVerification: number;
    lowStockProducts: number;
    pendingReturns: number;
    outOfStockProducts: number;
  };
};

type DashboardResponse = {
  success: boolean;
  stats: DashboardStats;
};

export function getDashboardStats() {
  return apiFetch<DashboardResponse>("/admin/dashboard");
}
