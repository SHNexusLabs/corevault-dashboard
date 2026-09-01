export type UserRole = "admin" | "super_admin";
export type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "packed"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type FulfillmentStatus =
  | "unfulfilled"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "returned";
export type Priority = "urgent" | "high" | "normal" | "low";
export type ProductStatus = "active" | "inactive" | "archived";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type StaffStatus = "active" | "inactive";
export type ReturnStatus =
  | "requested"
  | "approved"
  | "rejected"
  | "received"
  | "refunded";

export interface Address {
  line1: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantName?: string;
  sku: string;
  image?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
}

export interface TimelineEvent {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  type: "order" | "payment" | "fulfillment" | "system";
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  transactionId: string;
  orderStatus: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  priority: Priority;
  date: Date;
  shippingAddress: Address;
  shippingMethod: string;
  trackingNumber?: string;
  courier?: string;
  customerNote?: string;
  staffNote?: string;
  timeline: TimelineEvent[];
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  barcode?: string;
  status: ProductStatus;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  salePrice?: number;
  stock: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  status: ProductStatus;
  variants?: ProductVariant[];
  image?: string;
  description: string;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  totalSpending: number;
  status: "active" | "inactive";
  joinedDate: Date;
  lastOrderDate?: Date;
  address?: Address;
}

export interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  date: Date;
  refundAmount?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: StaffStatus;
  lastActive: Date;
  createdDate: Date;
  avatar?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  target: string;
  previousValue?: string;
  newValue?: string;
  timestamp: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  change: number;
  reason: string;
  reference: string;
  user: string;
  date: Date;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  quantity: number;
  reason: string;
  status: ReturnStatus;
  refundAmount: number;
  date: Date;
  notes?: string;
}

export type Page =
  | "login"
  | "dashboard"
  | "orders"
  | "order-detail"
  | "processing"
  | "packing"
  | "packing-detail"
  | "ready-to-ship"
  | "shipping"
  | "returns"
  | "return-detail"
  | "products"
  | "product-detail"
  | "categories"
  | "inventory"
  | "customers"
  | "customer-detail"
  | "analytics"
  | "payments"
  | "invoices"
  | "notifications"
  | "staff"
  | "roles-permissions"
  | "activity-log"
  | "settings-store"
  | "settings-orders"
  | "settings-inventory"
  | "settings-shipping"
  | "settings-payments"
  | "settings-notifications"
  | "settings-security"
  | "profile"
  | "404"
  | "permission-denied";
