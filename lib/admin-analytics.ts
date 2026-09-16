import { apiFetch } from "@/lib/api";

export type AnalyticsPeriod = "today" | "7d" | "30d" | "3m" | "6m" | "1y";

export type AnalyticsGranularity = "day" | "week" | "month";

export type AdminAnalyticsOverview = {
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

export type AdminAnalyticsRevenueOrder = {
  date: string;
  revenue: number;
  orders: number;
};

export type AdminAnalyticsProduct = {
  name: string;
  revenue: number;
  orders: number;
  quantity: number;
};

export type AdminAnalyticsCategory = {
  name: string;
  revenue: number;
  orders: number;
};

export type AdminAnalyticsOperational = {
  averageProcessingTime: number | null;
  averagePackingTime: number | null;
  averageShippingTime: number | null;
  cancellationRate: number | null;
  returnRate: number | null;
  onTimeDelivery: number | null;
};

export type AdminAnalytics = {
  period: AnalyticsPeriod;

  overview: AdminAnalyticsOverview;

  revenueOrders: AdminAnalyticsRevenueOrder[];

  topProducts: AdminAnalyticsProduct[];

  categories: AdminAnalyticsCategory[];

  operational: AdminAnalyticsOperational;
};

export type AdminAnalyticsCustomRange = Omit<AdminAnalytics, "period"> & {
  period: "custom";

  range: {
    from: string;
    to: string;
    granularity: AnalyticsGranularity;
  };
};

export async function getAdminAnalytics(
  period: AnalyticsPeriod = "30d",
): Promise<AdminAnalytics> {
  return apiFetch<AdminAnalytics>(`/admin/analytics?period=${period}`);
}

export async function getAdminAnalyticsByRange(
  from: string,
  to: string,
): Promise<AdminAnalyticsCustomRange> {
  const params = new URLSearchParams({
    from,
    to,
  });

  return apiFetch<AdminAnalyticsCustomRange>(
    `/admin/analytics/range?${params.toString()}`,
  );
}
