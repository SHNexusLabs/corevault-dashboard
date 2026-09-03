import { apiFetch } from "@/lib/api";

export type StockAdjustmentProduct = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  lowStockAt: number;
  isActive: boolean;
};

export type StockAdjustmentResponse = {
  success: boolean;
  message: string;
  product: StockAdjustmentProduct;
};

export type InventoryHistoryItem = {
  id: string;
  action: "STOCK_ADDED" | "STOCK_REMOVED" | string;
  metadata: unknown;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export type InventoryHistoryResponse = {
  success: boolean;
  history: InventoryHistoryItem[];
};

export async function adjustAdminProductStock(
  productId: string,
  quantity: number,
  reason: string,
) {
  return apiFetch<StockAdjustmentResponse>(`/admin/inventory/${productId}`, {
    method: "PATCH",
    body: JSON.stringify({
      quantity,
      reason,
    }),
  });
}

export async function getAdminProductInventoryHistory(productId: string) {
  return apiFetch<InventoryHistoryResponse>(
    `/admin/inventory/${productId}/history`,
  );
}
