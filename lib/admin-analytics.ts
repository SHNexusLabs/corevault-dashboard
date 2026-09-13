import { apiFetch } from "@/lib/api";

export type AnalyticsPeriod = "today" | "7d" | "30d" | "3m" | "6m" | "1y";

export type AdminAnalytics = {
  period: AnalyticsPeriod;

  overview: {
    revenue: number;
    orders: number;
    averageOrderValue: number;
    customers: number;

    growth: {
      revenue: number;
      orders: number;
      averageOrderValue: number;
    };
  };

  revenueOrders: {
    date: string;
    revenue: number;
    orders: number;
  }[];

  topProducts: {
    name: string;
    revenue: number;
    orders: number;
    quantity: number;
  }[];

  categories: {
    name: string;
    revenue: number;
    orders: number;
  }[];

  operational: {
    averageProcessingTime: number | null;
    averagePackingTime: number | null;
    averageShippingTime: number | null;
    cancellationRate: number | null;
    returnRate: number | null;
    onTimeDelivery: number | null;
  };
};

export type GetAdminAnalyticsResponse = {
  success: boolean;
} & AdminAnalytics;

export async function getAdminAnalytics(period: AnalyticsPeriod = "30d") {
  return apiFetch<GetAdminAnalyticsResponse>(
    `/admin/analytics?period=${period}`,
  );
}
