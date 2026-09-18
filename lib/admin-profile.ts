import { apiFetch } from "@/lib/api";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GetAdminProfileResponse = {
  success: boolean;
  user: AdminProfile;
};

export type UpdateAdminProfileInput = {
  name: string;
  email: string;
  phone: string | null;
};

export type UpdateAdminProfileResponse = {
  success: boolean;
  message: string;
  user: AdminProfile;
};

export type ChangeAdminPasswordInput = {
  currentPassword: string;
  newPassword: string;
};

export type ChangeAdminPasswordResponse = {
  success: boolean;
  message: string;
};

export async function getAdminProfile(): Promise<AdminProfile> {
  const response = await apiFetch<GetAdminProfileResponse>("/admin/profile");

  return response.user;
}

export async function updateAdminProfile(
  data: UpdateAdminProfileInput,
): Promise<AdminProfile> {
  const response = await apiFetch<UpdateAdminProfileResponse>(
    "/admin/profile",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  return response.user;
}

export async function changeAdminPassword(
  data: ChangeAdminPasswordInput,
): Promise<string> {
  const response = await apiFetch<ChangeAdminPasswordResponse>(
    "/admin/profile/password",
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );

  return response.message;
}
