import { apiFetch } from "@/lib/api";

export type AdminSettingsSection =
  | "store"
  | "orders"
  | "inventory"
  | "shipping"
  | "payments"
  | "notifications"
  | "security";

export type AdminSetting = {
  id: string;
  key: string;
  value: unknown;
  section: AdminSettingsSection;
  description: string | null;
  isSecret: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminSettingsResponse = {
  success: boolean;
  settings: AdminSetting[];
};

export type AdminSettingResponse = {
  success: boolean;
  setting: AdminSetting;
};

export type UpdateAdminSettingInput = {
  key: string;
  value: unknown;
};

export type UpdateAdminSettingsInput = {
  settings: UpdateAdminSettingInput[];
};

export type UpdateAdminSettingsResponse = {
  success: boolean;
  message: string;
  settings: AdminSetting[];
};

/**
 * Get all admin settings.
 */
export async function getAdminSettings(
  section?: AdminSettingsSection,
): Promise<AdminSettingsResponse> {
  const params = new URLSearchParams();

  if (section) {
    params.set("section", section);
  }

  const query = params.toString();

  return apiFetch<AdminSettingsResponse>(
    `/admin/settings${query ? `?${query}` : ""}`,
  );
}

/**
 * Get a single setting by key.
 */
export async function getAdminSetting(
  key: string,
): Promise<AdminSettingResponse> {
  return apiFetch<AdminSettingResponse>(
    `/admin/settings/${encodeURIComponent(key)}`,
  );
}

/**
 * Update one or more settings.
 */
export async function updateAdminSettings(
  settings: UpdateAdminSettingInput[],
): Promise<UpdateAdminSettingsResponse> {
  return apiFetch<UpdateAdminSettingsResponse>("/admin/settings", {
    method: "PATCH",
    body: JSON.stringify({
      settings,
    }),
  });
}
