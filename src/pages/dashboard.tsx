import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { WasteLog } from '@/lib/waste-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingDown, TrendingUp, AlertCircle, DollarSign, Weight } from 'lucide-react';

interface DashboardProps {
  locationId: string;
}

export default function LocationDashboard({ locationId }: DashboardProps) {
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>([]);
  const [period, setPeriod] = useState<30 | 60 | 90>(30);
  const [loading, setLoading] = useState(true);

  const fetchWasteLogs = useCallback(async () => {
    setLoading(true);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const { data, error } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('location_id', locationId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (!error && data) {
      setWasteLogs(data);
    }
    setLoading(false);
  }, [locationId, period]);

  useEffect(() => {
    fetchWasteLogs();
  }, [fetchWasteLogs]);

  // Calculate metrics
  const totalWasteLbs = wasteLogs.reduce((sum, log) => {
    const lbs = log.unit === 'kg' ? log.quantity * 2.20462 : log.quantity;
    return sum + lbs;
  }, 0);

  const totalCost = wasteLogs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0);

  // Waste by category
  const wasteByCategory = wasteLogs.reduce((acc, log) => {
    acc[log.waste_category] = (acc[log.waste_category] || 0) + (log.estimated_cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(wasteByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Top 5 wasted items
  const itemCosts = wasteLogs.reduce((acc, log) => {
    acc[log.food_item] = (acc[log.food_item] || 0) + (log.estimated_cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const topItems = Object.entries(itemCosts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, cost]) => ({ name, cost }));

  // Trend data (by week)
  const trendData = wasteLogs.reduce((acc, log) => {
    const week = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    acc[week] = (acc[week] || 0) + (log.estimated_cost || 0);
    return acc;
  }, {} as Record<string, number>);

  const trendChartData = Object.entries(trendData)
    .slice(-10)
    .map(([date, cost]) => ({ date, cost }));

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  // Calculate insight - compare to previous period
  const previousPeriodLogs = wasteLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    const compareDate = new Date();
    compareDate.setDate(compareDate.getDate() - period * 2);
    return logDate < new Date(Date.now() - period * 24 * 60 * 60 * 1000);
  });

  const previousCost = previousPeriodLogs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0);
  const percentChange = previousCost > 0 ? ((totalCost - previousCost) / previousCost) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Location Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track and analyze food waste performance</p>
        </div>

        {/* Period Selector */}
        <Tabs value={period.toString()} onValueChange={(val) => setPeriod(Number(val) as 30 | 60 | 90)} className="mb-6">
          <TabsList>
            <TabsTrigger value="30">Last 30 Days</TabsTrigger>
            <TabsTrigger value="60">Last 60 Days</TabsTrigger>
            <TabsTrigger value="90">Last 90 Days</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Waste Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {percentChange > 0 ? (
                  <span className="text-destructive flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {percentChange.toFixed(1)}% vs previous period
                  </span>
                ) : (
                  <span className="text-primary flex items-center">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {Math.abs(percentChange).toFixed(1)}% vs previous period
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Weight</CardTitle>
              <Weight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWasteLbs.toFixed(1)} lbs</div>
              <p className="text-xs text-muted-foreground mt-1">{wasteLogs.length} waste logs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Quick Insight</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {categoryData.length > 0 && (
                  <p>
                    <span className="font-semibold">{categoryData[0].name}</span> is your top waste
                    category at ${categoryData[0].value.toFixed(2)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Waste by Category Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Waste by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top 5 Wasted Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Wasted Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topItems} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="cost" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Trend Over Time */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Waste Trend Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" name="Waste Cost" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Waste Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Waste Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Date</th>
                    <th className="text-left py-2 px-4">Category</th>
                    <th className="text-left py-2 px-4">Item</th>
                    <th className="text-left py-2 px-4">Quantity</th>
                    <th className="text-left py-2 px-4">Cost</th>
                    <th className="text-left py-2 px-4">Photo</th>
                  </tr>
                </thead>
                <tbody>
                  {wasteLogs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="py-2 px-4">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">{log.waste_category}</td>
                      <td className="py-2 px-4 font-medium">{log.food_item}</td>
                      <td className="py-2 px-4">
                        {log.quantity} {log.unit}
                      </td>
                      <td className="py-2 px-4">${log.estimated_cost?.toFixed(2) || '0.00'}</td>
                      <td className="py-2 px-4">
                        {log.photo_url ? (
                          <span className="text-primary">📷</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}