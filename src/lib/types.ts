export type UserRole = 'staff' | 'manager' | 'regional_manager' | 'admin' | 'owner';

export type PermissionLevel = 'view' | 'edit' | 'approve' | 'admin';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  locationId: string;
  email: string;
  avatarUrl?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  managerId: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  unit: string;
  reorderPoint: number;
  reorderQuantity: number;
  costPerUnit: number;
  locationId: string;
  expirationDate?: string;
  lastUpdated: string;
  updatedBy: string;
  barcode?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  deliveryTimeAvg: number;
  categories: string[];
  paymentTerms: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  inventoryItemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type OrderStatus = 'draft' | 'pending_manager' | 'pending_admin' | 'approved' | 'rejected' | 'ordered' | 'delivered' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  locationId: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedByName?: string;
  rejectedAt?: string;
  rejectedReason?: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiration' | 'approval_request' | 'delivery' | 'system';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  locationId: string;
  relatedId?: string;
  relatedType?: 'inventory' | 'order' | 'vendor';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface SalesData {
  id: string;
  date: string;
  locationId: string;
  inventoryItemId: string;
  itemName: string;
  quantitySold: number;
  revenue: number;
}

export interface WasteData {
  id: string;
  date: string;
  locationId: string;
  inventoryItemId: string;
  itemName: string;
  quantityWasted: number;
  reason: 'expiration' | 'spoilage' | 'damage' | 'overproduction';
  costImpact: number;
}

export interface Analytics {
  topSellingItems: Array<{ itemName: string; quantity: number; revenue: number }>;
  lowStockItems: Array<{ itemName: string; currentStock: number; reorderPoint: number }>;
  expiringItems: Array<{ itemName: string; expirationDate: string; daysUntilExpiry: number }>;
  wasteByReason: Array<{ reason: string; quantity: number; cost: number }>;
  inventoryValue: number;
  monthlySpending: number;
  forecastedDemand: Array<{ itemName: string; predicted: number; confidence: number }>;
}

export interface RolePermissions {
  canViewInventory: boolean;
  canEditInventory: boolean;
  canViewOrders: boolean;
  canCreateOrders: boolean;
  canApproveOrders: boolean;
  canViewVendors: boolean;
  canEditVendors: boolean;
  canViewAnalytics: boolean;
  canViewAllLocations: boolean;
  canManageUsers: boolean;
}
