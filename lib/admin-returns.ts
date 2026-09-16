import { apiFetch } from "@/lib/api";

export type ReturnStatus = "REQUESTED" | "APPROVED" | "COMPLETED" | "REJECTED";

export type RefundStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "APPROVED"
  | "COMPLETED"
  | "REJECTED";

export type AdminReturn = {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  reason: string;
  refundAmount: number | string;
  status: ReturnStatus;
  refundStatus: RefundStatus;
  createdAt: string;
};

export async function getAdminReturns() {
  return apiFetch<{
    returns: AdminReturn[];
  }>("/admin/returns");
}

export async function updateAdminReturnStatus(
  returnId: string,
  status: "APPROVED" | "REJECTED",
) {
  return apiFetch<{
    id: string;
    status: ReturnStatus;
  }>(`/admin/returns/${returnId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function receiveAdminReturn(returnId: string) {
  return apiFetch<{
    id: string;
    status: ReturnStatus;
  }>(`/admin/returns/${returnId}/receive`, {
    method: "PATCH",
  });
}

export async function refundAdminReturn(returnId: string) {
  return apiFetch<{
    id: string;
    refundStatus: RefundStatus;
  }>(`/admin/returns/${returnId}/refund`, {
    method: "PATCH",
  });
}
