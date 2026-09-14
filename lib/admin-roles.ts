import { apiFetch } from "@/lib/api";

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

export type AdminRolePermission = {
  id: string;
  name: string;
  description: string | null;
  section: string;
  isSuperAdminOnly: boolean;
  enabled: boolean;
};

export type AdminRolePermissionsResponse = {
  success: boolean;
  role: AdminRole;
  isEditable: boolean;
  permissions: AdminRolePermission[];
};

export type UpdateAdminRolePermissionsResponse =
  AdminRolePermissionsResponse & {
    message: string;
  };

export async function getAdminRolePermissions(
  role: AdminRole,
): Promise<AdminRolePermissionsResponse> {
  return apiFetch<AdminRolePermissionsResponse>(
    `/admin/roles/${role}/permissions`,
  );
}

export async function updateAdminRolePermissions(
  permissionIds: string[],
): Promise<UpdateAdminRolePermissionsResponse> {
  return apiFetch<UpdateAdminRolePermissionsResponse>(
    "/admin/roles/ADMIN/permissions",
    {
      method: "PATCH",
      body: JSON.stringify({
        permissionIds,
      }),
    },
  );
}
