import { describe, it, expect } from 'vitest';
import {
  calculateLinearRegression,
  forecastDemand,
  identifyWastePatterns,
  calculateInventoryValue,
  calculateTrendPercentage,
  optimizePurchaseQuantity,
} from '../analytics';
import { SalesData, WasteData, InventoryItem } from '../types';

describe('calculateLinearRegression', () => {
  it('should return zeros for empty arrays', () => {
    const result = calculateLinearRegression([], []);
    expect(result.slope).toBe(0);
    expect(result.intercept).toBe(0);
    expect(result.r2).toBe(0);
  });

  it('should calculate correct slope and intercept for perfect linear data', () => {
    const xValues = [1, 2, 3, 4, 5];
    const yValues = [2, 4, 6, 8, 10];
    const result = calculateLinearRegression(xValues, yValues);

    expect(result.slope).toBeCloseTo(2, 2);
    expect(result.intercept).toBeCloseTo(0, 2);
    expect(result.r2).toBeCloseTo(1, 2);
  });

  it('should calculate correct values for increasing trend', () => {
    const xValues = [0, 1, 2, 3, 4];
    const yValues = [10, 15, 18, 25, 30];
    const result = calculateLinearRegression(xValues, yValues);

    expect(result.slope).toBeGreaterThan(0);
    expect(result.r2).toBeGreaterThan(0.9);
  });

  it('should calculate correct values for decreasing trend', () => {
    const xValues = [0, 1, 2, 3, 4];
    const yValues = [50, 40, 35, 25, 10];
    const result = calculateLinearRegression(xValues, yValues);

    expect(result.slope).toBeLessThan(0);
    expect(result.r2).toBeGreaterThan(0.9);
  });

  it('should handle single value arrays', () => {
    const result = calculateLinearRegression([1], [10]);
    // Single point has no variance
    expect(result).toBeDefined();
  });

  it('should clamp r2 between 0 and 1', () => {
    const xValues = [1, 2, 3, 4, 5];
    const yValues = [5, 3, 8, 2, 9];
    const result = calculateLinearRegression(xValues, yValues);

    expect(result.r2).toBeGreaterThanOrEqual(0);
    expect(result.r2).toBeLessThanOrEqual(1);
  });
});

describe('forecastDemand', () => {
  const mockSalesData: SalesData[] = [
    { id: '1', date: '2025-01-01', locationId: 'loc1', inventoryItemId: 'item1', itemName: 'Test Item', quantitySold: 10, revenue: 100, createdAt: '2025-01-01' },
    { id: '2', date: '2025-01-02', locationId: 'loc1', inventoryItemId: 'item1', itemName: 'Test Item', quantitySold: 12, revenue: 120, createdAt: '2025-01-02' },
    { id: '3', date: '2025-01-03', locationId: 'loc1', inventoryItemId: 'item1', itemName: 'Test Item', quantitySold: 14, revenue: 140, createdAt: '2025-01-03' },
    { id: '4', date: '2025-01-04', locationId: 'loc1', inventoryItemId: 'item1', itemName: 'Test Item', quantitySold: 16, revenue: 160, createdAt: '2025-01-04' },
    { id: '5', date: '2025-01-05', locationId: 'loc1', inventoryItemId: 'item1', itemName: 'Test Item', quantitySold: 18, revenue: 180, createdAt: '2025-01-05' },
  ];

  it('should return null for items with less than 3 sales records', () => {
    const result = forecastDemand(mockSalesData.slice(0, 2), 'item1');
    expect(result).toBeNull();
  });

  it('should return forecast for items with sufficient data', () => {
    const result = forecastDemand(mockSalesData, 'item1');
    expect(result).not.toBeNull();
    expect(result?.itemId).toBe('item1');
    expect(result?.itemName).toBe('Test Item');
    expect(result?.predicted).toBeGreaterThan(0);
    expect(result?.trend).toBe('increasing');
  });

  it('should return null for non-existent items', () => {
    const result = forecastDemand(mockSalesData, 'non-existent-item');
    expect(result).toBeNull();
  });

  it('should detect increasing trend', () => {
    const result = forecastDemand(mockSalesData, 'item1');
    expect(result?.trend).toBe('increasing');
  });

  it('should calculate confidence based on r2', () => {
    const result = forecastDemand(mockSalesData, 'item1');
    expect(result?.confidence).toBeGreaterThanOrEqual(0);
    expect(result?.confidence).toBeLessThanOrEqual(100);
  });
});

describe('identifyWastePatterns', () => {
  const mockWasteData: WasteData[] = [
    { id: '1', date: '2025-01-01', locationId: 'loc1', inventoryItemId: 'item1', itemName: 'Item 1', quantityWasted: 5, reason: 'expiration', costImpact: 50, createdAt: '2025-01-01' },
    { id: '2', date: '2025-01-02', locationId: 'loc1', inventoryItemId: 'item2', itemName: 'Item 2', quantityWasted: 3, reason: 'spoilage', costImpact: 30, createdAt: '2025-01-02' },
    { id: '3', date: '2025-01-03', locationId: 'loc1', inventoryItemId: 'item1', itemName: 'Item 1', quantityWasted: 2, reason: 'expiration', costImpact: 20, createdAt: '2025-01-03' },
    { id: '4', date: '2025-01-04', locationId: 'loc1', inventoryItemId: 'item3', itemName: 'Item 3', quantityWasted: 1, reason: 'damage', costImpact: 10, createdAt: '2025-01-04' },
  ];

  it('should group waste by reason', () => {
    const result = identifyWastePatterns(mockWasteData);
    expect(result.length).toBe(3); // expiration, spoilage, damage
  });

  it('should calculate correct totals per reason', () => {
    const result = identifyWastePatterns(mockWasteData);
    const expiration = result.find((r) => r.reason === 'expiration');
    expect(expiration?.quantity).toBe(7); // 5 + 2
    expect(expiration?.cost).toBe(70); // 50 + 20
  });

  it('should sort by cost descending', () => {
    const result = identifyWastePatterns(mockWasteData);
    expect(result[0].reason).toBe('expiration');
    expect(result[0].cost).toBeGreaterThan(result[1].cost);
  });

  it('should calculate correct percentages', () => {
    const result = identifyWastePatterns(mockWasteData);
    const totalPercentage = result.reduce((sum, r) => sum + r.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 0);
  });

  it('should handle empty array', () => {
    const result = identifyWastePatterns([]);
    expect(result).toEqual([]);
  });
});

describe('calculateInventoryValue', () => {
  const mockInventory: InventoryItem[] = [
    { id: '1', name: 'Item 1', category: 'Cat 1', currentStock: 10, unit: 'kg', reorderPoint: 5, reorderQuantity: 20, costPerUnit: 10, locationId: 'loc1', lastUpdated: '2025-01-01' },
    { id: '2', name: 'Item 2', category: 'Cat 1', currentStock: 20, unit: 'kg', reorderPoint: 10, reorderQuantity: 40, costPerUnit: 5, locationId: 'loc1', lastUpdated: '2025-01-01' },
    { id: '3', name: 'Item 3', category: 'Cat 2', currentStock: 5, unit: 'L', reorderPoint: 2, reorderQuantity: 10, costPerUnit: 20, locationId: 'loc1', lastUpdated: '2025-01-01' },
  ];

  it('should calculate total inventory value', () => {
    const result = calculateInventoryValue(mockInventory);
    // (10 * 10) + (20 * 5) + (5 * 20) = 100 + 100 + 100 = 300
    expect(result).toBe(300);
  });

  it('should return 0 for empty inventory', () => {
    const result = calculateInventoryValue([]);
    expect(result).toBe(0);
  });

  it('should handle zero stock items', () => {
    const inventoryWithZero = [
      { id: '1', name: 'Item 1', category: 'Cat 1', currentStock: 0, unit: 'kg', reorderPoint: 5, reorderQuantity: 20, costPerUnit: 10, locationId: 'loc1', lastUpdated: '2025-01-01' },
    ];
    const result = calculateInventoryValue(inventoryWithZero);
    expect(result).toBe(0);
  });
});

describe('calculateTrendPercentage', () => {
  it('should calculate positive trend correctly', () => {
    const result = calculateTrendPercentage(150, 100);
    expect(result.percentage).toBe(50);
    expect(result.direction).toBe('up');
  });

  it('should calculate negative trend correctly', () => {
    const result = calculateTrendPercentage(50, 100);
    expect(result.percentage).toBe(50);
    expect(result.direction).toBe('down');
  });

  it('should return neutral for small changes', () => {
    const result = calculateTrendPercentage(100.4, 100);
    expect(result.direction).toBe('neutral');
  });

  it('should handle zero previous value', () => {
    const result = calculateTrendPercentage(100, 0);
    expect(result.percentage).toBe(0);
    expect(result.direction).toBe('neutral');
  });

  it('should handle equal values', () => {
    const result = calculateTrendPercentage(100, 100);
    expect(result.percentage).toBe(0);
    expect(result.direction).toBe('neutral');
  });
});

describe('optimizePurchaseQuantity', () => {
  it('should calculate positive EOQ', () => {
    const result = optimizePurchaseQuantity(10, 5);
    expect(result).toBeGreaterThan(0);
  });

  it('should return at least 1', () => {
    const result = optimizePurchaseQuantity(0.01, 100);
    expect(result).toBeGreaterThanOrEqual(1);
  });

  it('should return integer value', () => {
    const result = optimizePurchaseQuantity(10, 5.5);
    expect(Number.isInteger(result)).toBe(true);
  });

  it('should increase with higher demand', () => {
    const lowDemand = optimizePurchaseQuantity(5, 10);
    const highDemand = optimizePurchaseQuantity(50, 10);
    expect(highDemand).toBeGreaterThan(lowDemand);
  });
});
