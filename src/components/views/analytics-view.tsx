import { useKV } from '@github/spark/hooks';
import { InventoryItem, SalesData, WasteData, PurchaseOrder } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/kpi-card';
import { Package, TrendUp, Warning, CurrencyDollar } from '@phosphor-icons/react';
import { 
  calculateInventoryValue, 
  forecastDemand, 
  identifyWastePatterns,
  calculateTrendPercentage 
} from '@/lib/analytics';
import { formatCurrency, getDaysUntilExpiration } from '@/lib/permissions';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AnalyticsViewProps {
  locationId: string;
}

export function AnalyticsView({ locationId }: AnalyticsViewProps) {
  const [inventory] = useKV<InventoryItem[]>('inventory', []);
  const [salesData] = useKV<SalesData[]>('salesData', []);
  const [wasteData] = useKV<WasteData[]>('wasteData', []);
  const [orders] = useKV<PurchaseOrder[]>('orders', []);

  const locationInventory = inventory?.filter(item => item.locationId === locationId) || [];
  const locationSales = salesData?.filter(sale => sale.locationId === locationId) || [];
  const locationWaste = wasteData?.filter(waste => waste.locationId === locationId) || [];
  const locationOrders = orders?.filter(order => order.locationId === locationId) || [];

  const inventoryValue = calculateInventoryValue(locationInventory);
  
  const last30DaysSales = locationSales.filter(sale => {
    const saleDate = new Date(sale.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= thirtyDaysAgo;
  });

  const totalRevenue = last30DaysSales.reduce((sum, sale) => sum + sale.revenue, 0);
  
  const prev30DaysSales = locationSales.filter(sale => {
    const saleDate = new Date(sale.date);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return saleDate >= sixtyDaysAgo && saleDate < thirtyDaysAgo;
  });

  const prevRevenue = prev30DaysSales.reduce((sum, sale) => sum + sale.revenue, 0);
  const revenueTrend = {
    value: calculateTrendPercentage(totalRevenue, prevRevenue).percentage,
    direction: calculateTrendPercentage(totalRevenue, prevRevenue).direction,
  };

  const lowStockItems = locationInventory.filter(
    item => item.currentStock <= item.reorderPoint
  ).length;

  const expiringItems = locationInventory.filter(item => {
    if (!item.expirationDate) return false;
    const days = getDaysUntilExpiration(item.expirationDate);
    return days <= 7 && days >= 0;
  });

  const monthlySpending = locationOrders
    .filter(order => {
      const orderDate = new Date(order.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate >= thirtyDaysAgo && order.status !== 'rejected' && order.status !== 'cancelled';
    })
    .reduce((sum, order) => sum + order.total, 0);

  const topSellingItems = [...last30DaysSales
    .reduce((acc, sale) => {
      const existing = acc.get(sale.itemName);
      if (existing) {
        existing.quantity += sale.quantitySold;
        existing.revenue += sale.revenue;
      } else {
        acc.set(sale.itemName, { 
          itemName: sale.itemName, 
          quantity: sale.quantitySold, 
          revenue: sale.revenue 
        });
      }
      return acc;
    }, new Map())
    .values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const wastePatterns = identifyWastePatterns(locationWaste);

  const salesTrendData = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    const daySales = locationSales
      .filter(sale => sale.date.startsWith(dateStr))
      .reduce((sum, sale) => sum + sale.revenue, 0);
    
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: daySales,
    };
  });

  const categoryDistribution = locationInventory.reduce((acc, item) => {
    const value = item.currentStock * item.costPerUnit;
    if (acc[item.category]) {
      acc[item.category] += value;
    } else {
      acc[item.category] = value;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({
    name,
    value: Math.round(value),
  }));

  const COLORS = ['oklch(0.45 0.12 210)', 'oklch(0.65 0.15 25)', 'oklch(0.50 0.13 290)', 'oklch(0.70 0.15 75)', 'oklch(0.60 0.10 150)'];

  const forecasts = locationInventory
    .map(item => forecastDemand(locationSales, item.id, 7))
    .filter(Boolean)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Analytics & Insights</h2>
        <p className="text-muted-foreground">Data-driven decision making</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Inventory Value"
          value={formatCurrency(inventoryValue)}
          icon={<Package className="w-6 h-6" />}
        />
        <KPICard
          title="Monthly Revenue"
          value={formatCurrency(totalRevenue)}
          trend={revenueTrend}
          icon={<CurrencyDollar className="w-6 h-6" />}
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockItems}
          icon={<Warning className="w-6 h-6" />}
        />
        <KPICard
          title="Monthly Spending"
          value={formatCurrency(monthlySpending)}
          icon={<TrendUp className="w-6 h-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 210)" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="oklch(0.45 0.12 210)" 
                  strokeWidth={2}
                  dot={{ fill: 'oklch(0.45 0.12 210)', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSellingItems.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Waste Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {wastePatterns.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={wastePatterns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.88 0.01 210)" />
                  <XAxis dataKey="reason" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="cost" fill="oklch(0.65 0.15 25)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No waste data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Demand Forecast (Next 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Predicted Demand</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts.map((forecast, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{forecast!.itemName}</TableCell>
                  <TableCell className="text-right">{forecast!.predicted} units</TableCell>
                  <TableCell>
                    <Badge 
                      variant={forecast!.trend === 'increasing' ? 'default' : forecast!.trend === 'decreasing' ? 'secondary' : 'outline'}
                    >
                      {forecast!.trend}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{forecast!.confidence}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {forecasts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Insufficient sales data for forecasting
            </div>
          )}
        </CardContent>
      </Card>

      {expiringItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warning className="w-5 h-5 text-amber-500" />
              Items Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Expiration Date</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead>Days Remaining</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{new Date(item.expirationDate!).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{item.currentStock} {item.unit}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getDaysUntilExpiration(item.expirationDate!)} days
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
