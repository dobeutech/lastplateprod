import { UserRole, RolePermissions } from './types';

export function getRolePermissions(role: UserRole): RolePermissions {
  const permissions: Record<UserRole, RolePermissions> = {
    staff: {
      canViewInventory: true,
      canEditInventory: true,
      canViewOrders: true,
      canCreateOrders: true,
      canApproveOrders: false,
      canViewVendors: true,
      canEditVendors: false,
      canViewAnalytics: false,
      canViewAllLocations: false,
      canManageUsers: false,
    },
    manager: {
      canViewInventory: true,
      canEditInventory: true,
      canViewOrders: true,
      canCreateOrders: true,
      canApproveOrders: true,
      canViewVendors: true,
      canEditVendors: true,
      canViewAnalytics: true,
      canViewAllLocations: false,
      canManageUsers: false,
    },
    regional_manager: {
      canViewInventory: true,
      canEditInventory: true,
      canViewOrders: true,
      canCreateOrders: true,
      canApproveOrders: true,
      canViewVendors: true,
      canEditVendors: true,
      canViewAnalytics: true,
      canViewAllLocations: true,
      canManageUsers: false,
    },
    admin: {
      canViewInventory: true,
      canEditInventory: true,
      canViewOrders: true,
      canCreateOrders: true,
      canApproveOrders: true,
      canViewVendors: true,
      canEditVendors: true,
      canViewAnalytics: true,
      canViewAllLocations: true,
      canManageUsers: true,
    },
    owner: {
      canViewInventory: true,
      canEditInventory: true,
      canViewOrders: true,
      canCreateOrders: true,
      canApproveOrders: true,
      canViewVendors: true,
      canEditVendors: true,
      canViewAnalytics: true,
      canViewAllLocations: true,
      canManageUsers: true,
    },
  };

  return permissions[role];
}

export function canApproveOrder(userRole: UserRole, orderStatus: string): boolean {
  if (orderStatus === 'pending_manager' && (userRole === 'manager' || userRole === 'regional_manager' || userRole === 'admin' || userRole === 'owner')) {
    return true;
  }
  if (orderStatus === 'pending_admin' && (userRole === 'admin' || userRole === 'owner')) {
    return true;
  }
  return false;
}

export function getNextOrderStatus(currentStatus: string, userRole: UserRole): string {
  if (currentStatus === 'draft') return 'pending_manager';
  if (currentStatus === 'pending_manager' && (userRole === 'manager' || userRole === 'regional_manager')) {
    return 'pending_admin';
  }
  if (currentStatus === 'pending_admin' && (userRole === 'admin' || userRole === 'owner')) {
    return 'approved';
  }
  if (currentStatus === 'pending_manager' && (userRole === 'admin' || userRole === 'owner')) {
    return 'approved';
  }
  return currentStatus;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getDaysUntilExpiration(expirationDate: string): number {
  const today = new Date();
  const expiry = new Date(expirationDate);
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateReorderRecommendation(
  currentStock: number,
  avgDailySales: number,
  leadTimeDays: number,
  safetyStockDays: number = 3
): { shouldReorder: boolean; recommendedQuantity: number } {
  const reorderPoint = avgDailySales * (leadTimeDays + safetyStockDays);
  const shouldReorder = currentStock <= reorderPoint;
  const recommendedQuantity = shouldReorder
    ? Math.ceil(avgDailySales * (leadTimeDays + safetyStockDays + 7) - currentStock)
    : 0;

  return { shouldReorder, recommendedQuantity };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().substr(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `PO-${year}${month}-${random}`;
}
