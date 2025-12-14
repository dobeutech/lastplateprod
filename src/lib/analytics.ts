import { SalesData, WasteData, InventoryItem } from './types';

export interface ForecastResult {
  itemName: string;
  itemId: string;
  predicted: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export function calculateLinearRegression(
  xValues: number[],
  yValues: number[]
): { slope: number; intercept: number; r2: number } {
  const n = xValues.length;
  if (n === 0) return { slope: 0, intercept: 0, r2: 0 };

  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = yValues.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const meanY = sumY / n;
  const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0);
  const ssResidual = yValues.reduce(
    (sum, y, i) => sum + Math.pow(y - (slope * xValues[i] + intercept), 2),
    0
  );
  const r2 = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

  return { slope, intercept, r2: Math.max(0, Math.min(1, r2)) };
}

export function forecastDemand(
  salesData: SalesData[],
  itemId: string,
  daysToForecast: number = 7
): ForecastResult | null {
  const itemSales = salesData
    .filter((s) => s.inventoryItemId === itemId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (itemSales.length < 3) return null;

  const xValues = itemSales.map((_, i) => i);
  const yValues = itemSales.map((s) => s.quantitySold);

  const { slope, intercept, r2 } = calculateLinearRegression(xValues, yValues);

  const nextX = itemSales.length + daysToForecast - 1;
  const predicted = Math.max(0, slope * nextX + intercept);

  const avgSales = yValues.reduce((a, b) => a + b, 0) / yValues.length;
  const trend =
    Math.abs(slope) < avgSales * 0.05
      ? 'stable'
      : slope > 0
      ? 'increasing'
      : 'decreasing';

  return {
    itemName: itemSales[0].itemName,
    itemId,
    predicted: Math.round(predicted),
    confidence: Math.round(r2 * 100),
    trend,
  };
}

export function identifyWastePatterns(
  wasteData: WasteData[]
): Array<{ reason: string; quantity: number; cost: number; percentage: number }> {
  const wasteByReason = wasteData.reduce((acc, waste) => {
    if (!acc[waste.reason]) {
      acc[waste.reason] = { quantity: 0, cost: 0 };
    }
    acc[waste.reason].quantity += waste.quantityWasted;
    acc[waste.reason].cost += waste.costImpact;
    return acc;
  }, {} as Record<string, { quantity: number; cost: number }>);

  const totalCost = Object.values(wasteByReason).reduce(
    (sum, { cost }) => sum + cost,
    0
  );

  return Object.entries(wasteByReason)
    .map(([reason, { quantity, cost }]) => ({
      reason,
      quantity,
      cost,
      percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0,
    }))
    .sort((a, b) => b.cost - a.cost);
}

export function calculateInventoryValue(items: InventoryItem[]): number {
  return items.reduce((sum, item) => sum + item.currentStock * item.costPerUnit, 0);
}

export function identifySlowMovingItems(
  inventoryItems: InventoryItem[],
  salesData: SalesData[],
  days: number = 30
): Array<{ item: InventoryItem; avgDailySales: number; daysOfStock: number }> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return inventoryItems
    .map((item) => {
      const itemSales = salesData.filter(
        (s) =>
          s.inventoryItemId === item.id &&
          new Date(s.date) >= cutoffDate
      );

      const totalSold = itemSales.reduce((sum, s) => sum + s.quantitySold, 0);
      const avgDailySales = totalSold / days;
      const daysOfStock = avgDailySales > 0 ? item.currentStock / avgDailySales : Infinity;

      return { item, avgDailySales, daysOfStock };
    })
    .filter((data) => data.daysOfStock > 60 && data.item.currentStock > 0)
    .sort((a, b) => b.daysOfStock - a.daysOfStock);
}

export function optimizePurchaseQuantity(
  avgDailySales: number,
  costPerUnit: number,
  orderCost: number = 50,
  holdingCostRate: number = 0.2
): number {
  const annualDemand = avgDailySales * 365;
  const holdingCostPerUnit = costPerUnit * holdingCostRate;
  
  const eoq = Math.sqrt((2 * annualDemand * orderCost) / holdingCostPerUnit);
  
  return Math.max(1, Math.ceil(eoq));
}

export function calculateTrendPercentage(
  currentValue: number,
  previousValue: number
): { percentage: number; direction: 'up' | 'down' | 'neutral' } {
  if (previousValue === 0) {
    return { percentage: 0, direction: 'neutral' };
  }

  const percentage = ((currentValue - previousValue) / previousValue) * 100;

  return {
    percentage: Math.abs(percentage),
    direction: percentage > 0.5 ? 'up' : percentage < -0.5 ? 'down' : 'neutral',
  };
}
