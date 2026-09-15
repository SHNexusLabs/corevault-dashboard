import { apiFetch } from "@/lib/api";

export type AdminNotificationUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "SUPER_ADMIN" | "CUSTOMER";
};

export type AdminNotification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  user: AdminNotificationUser;
};

export type AdminNotificationPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AdminNotificationResponse = {
  success: boolean;
  notifications: AdminNotification[];
  unreadCount: number;
  pagination: AdminNotificationPagination;
};

export type AdminNotificationFilters = {
  search?: string;
  type?: string;
  isRead?: boolean;
};

export async function getAdminNotifications(
  page = 1,
  limit = 20,
  filters: AdminNotificationFilters = {},
): Promise<AdminNotificationResponse> {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("limit", String(limit));

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.type) {
    params.set("type", filters.type);
  }

  if (typeof filters.isRead === "boolean") {
    params.set("isRead", String(filters.isRead));
  }

  return apiFetch<AdminNotificationResponse>(
    `/admin/notifications?${params.toString()}`,
  );
}

export async function markAdminNotificationAsRead(notificationId: string) {
  return apiFetch<{
    success: boolean;
    message: string;
    notification: AdminNotification;
  }>(`/admin/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function markAllAdminNotificationsAsRead() {
  return apiFetch<{
    success: boolean;
    message: string;
  }>("/admin/notifications/read-all", {
    method: "PATCH",
  });
}

export async function deleteAdminNotification(notificationId: string) {
  return apiFetch<{
    success: boolean;
    message: string;
  }>(`/admin/notifications/${notificationId}`, {
    method: "DELETE",
  });
}
