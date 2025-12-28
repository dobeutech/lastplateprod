import { describe, it, expect } from 'vitest';
import {
  getRolePermissions,
  canApproveOrder,
  getNextOrderStatus,
  formatCurrency,
  formatDate,
  getDaysUntilExpiration,
  calculateReorderRecommendation,
  generateOrderNumber,
} from '../permissions';

describe('getRolePermissions', () => {
  it('should grant staff basic permissions only', () => {
    const permissions = getRolePermissions('staff');

    expect(permissions.canViewInventory).toBe(true);
    expect(permissions.canEditInventory).toBe(true);
    expect(permissions.canViewOrders).toBe(true);
    expect(permissions.canCreateOrders).toBe(true);
    expect(permissions.canApproveOrders).toBe(false);
    expect(permissions.canViewVendors).toBe(true);
    expect(permissions.canEditVendors).toBe(false);
    expect(permissions.canViewAnalytics).toBe(false);
    expect(permissions.canViewAllLocations).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
  });

  it('should grant manager approval permissions', () => {
    const permissions = getRolePermissions('manager');

    expect(permissions.canApproveOrders).toBe(true);
    expect(permissions.canEditVendors).toBe(true);
    expect(permissions.canViewAnalytics).toBe(true);
    expect(permissions.canViewAllLocations).toBe(false);
    expect(permissions.canManageUsers).toBe(false);
  });

  it('should grant regional_manager multi-location access', () => {
    const permissions = getRolePermissions('regional_manager');

    expect(permissions.canApproveOrders).toBe(true);
    expect(permissions.canViewAllLocations).toBe(true);
    expect(permissions.canManageUsers).toBe(false);
  });

  it('should grant admin user management permissions', () => {
    const permissions = getRolePermissions('admin');

    expect(permissions.canViewAllLocations).toBe(true);
    expect(permissions.canManageUsers).toBe(true);
  });

  it('should grant owner all permissions', () => {
    const permissions = getRolePermissions('owner');

    expect(permissions.canViewInventory).toBe(true);
    expect(permissions.canEditInventory).toBe(true);
    expect(permissions.canViewOrders).toBe(true);
    expect(permissions.canCreateOrders).toBe(true);
    expect(permissions.canApproveOrders).toBe(true);
    expect(permissions.canViewVendors).toBe(true);
    expect(permissions.canEditVendors).toBe(true);
    expect(permissions.canViewAnalytics).toBe(true);
    expect(permissions.canViewAllLocations).toBe(true);
    expect(permissions.canManageUsers).toBe(true);
  });
});

describe('canApproveOrder', () => {
  it('should not allow staff to approve any orders', () => {
    expect(canApproveOrder('staff', 'pending_manager')).toBe(false);
    expect(canApproveOrder('staff', 'pending_admin')).toBe(false);
  });

  it('should allow manager to approve pending_manager orders', () => {
    expect(canApproveOrder('manager', 'pending_manager')).toBe(true);
    expect(canApproveOrder('manager', 'pending_admin')).toBe(false);
  });

  it('should allow regional_manager to approve pending_manager orders', () => {
    expect(canApproveOrder('regional_manager', 'pending_manager')).toBe(true);
    expect(canApproveOrder('regional_manager', 'pending_admin')).toBe(false);
  });

  it('should allow admin to approve both pending types', () => {
    expect(canApproveOrder('admin', 'pending_manager')).toBe(true);
    expect(canApproveOrder('admin', 'pending_admin')).toBe(true);
  });

  it('should allow owner to approve both pending types', () => {
    expect(canApproveOrder('owner', 'pending_manager')).toBe(true);
    expect(canApproveOrder('owner', 'pending_admin')).toBe(true);
  });

  it('should return false for unknown status', () => {
    expect(canApproveOrder('admin', 'unknown_status')).toBe(false);
  });
});

describe('getNextOrderStatus', () => {
  it('should move draft to pending_manager', () => {
    expect(getNextOrderStatus('draft', 'staff')).toBe('pending_manager');
    expect(getNextOrderStatus('draft', 'manager')).toBe('pending_manager');
  });

  it('should move pending_manager to pending_admin for manager', () => {
    expect(getNextOrderStatus('pending_manager', 'manager')).toBe('pending_admin');
    expect(getNextOrderStatus('pending_manager', 'regional_manager')).toBe('pending_admin');
  });

  it('should move pending_manager to approved for admin/owner', () => {
    expect(getNextOrderStatus('pending_manager', 'admin')).toBe('approved');
    expect(getNextOrderStatus('pending_manager', 'owner')).toBe('approved');
  });

  it('should move pending_admin to approved for admin/owner', () => {
    expect(getNextOrderStatus('pending_admin', 'admin')).toBe('approved');
    expect(getNextOrderStatus('pending_admin', 'owner')).toBe('approved');
  });

  it('should return same status when no transition possible', () => {
    expect(getNextOrderStatus('approved', 'admin')).toBe('approved');
    expect(getNextOrderStatus('rejected', 'admin')).toBe('rejected');
  });
});

describe('formatCurrency', () => {
  it('should format positive numbers correctly', () => {
    const result = formatCurrency(1234.56);
    expect(result).toBe('$1,234.56');
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toBe('$0.00');
  });

  it('should format negative numbers correctly', () => {
    const result = formatCurrency(-100);
    expect(result).toBe('-$100.00');
  });

  it('should round to 2 decimal places', () => {
    const result = formatCurrency(10.999);
    expect(result).toBe('$11.00');
  });
});

describe('formatDate', () => {
  it('should format date string correctly', () => {
    const result = formatDate('2025-12-28');
    expect(result).toContain('Dec');
    expect(result).toContain('28');
    expect(result).toContain('2025');
  });

  it('should handle ISO date strings', () => {
    const result = formatDate('2025-01-15T10:30:00Z');
    expect(result).toContain('Jan');
    expect(result).toContain('15');
  });
});

describe('getDaysUntilExpiration', () => {
  it('should return positive days for future dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    const result = getDaysUntilExpiration(futureDate.toISOString());
    expect(result).toBe(10);
  });

  it('should return negative days for past dates', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    const result = getDaysUntilExpiration(pastDate.toISOString());
    expect(result).toBe(-5);
  });

  it('should return 0 or 1 for today', () => {
    const today = new Date();
    const result = getDaysUntilExpiration(today.toISOString());
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });
});

describe('calculateReorderRecommendation', () => {
  it('should recommend reorder when below reorder point', () => {
    const result = calculateReorderRecommendation(10, 5, 3);
    // reorder point = 5 * (3 + 3) = 30
    expect(result.shouldReorder).toBe(true);
    expect(result.recommendedQuantity).toBeGreaterThan(0);
  });

  it('should not recommend reorder when above reorder point', () => {
    const result = calculateReorderRecommendation(100, 5, 3);
    // reorder point = 5 * (3 + 3) = 30
    expect(result.shouldReorder).toBe(false);
    expect(result.recommendedQuantity).toBe(0);
  });

  it('should calculate correct recommended quantity', () => {
    const result = calculateReorderRecommendation(0, 10, 5, 2);
    // Need: 10 * (5 + 2 + 7) - 0 = 140
    expect(result.recommendedQuantity).toBe(140);
  });

  it('should handle zero daily sales', () => {
    const result = calculateReorderRecommendation(100, 0, 5);
    expect(result.shouldReorder).toBe(false);
  });
});

describe('generateOrderNumber', () => {
  it('should generate valid order number format', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber).toMatch(/^PO-\d{4}-[A-Z0-9]{6}$/);
  });

  it('should generate unique order numbers', () => {
    const orderNumbers = new Set<string>();
    for (let i = 0; i < 100; i++) {
      orderNumbers.add(generateOrderNumber());
    }
    // All 100 should be unique (very high probability)
    expect(orderNumbers.size).toBe(100);
  });

  it('should start with PO- prefix', () => {
    const orderNumber = generateOrderNumber();
    expect(orderNumber.startsWith('PO-')).toBe(true);
  });
});
