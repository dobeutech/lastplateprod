import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Location } from '@/lib/waste-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, TrendingDown, TrendingUp } from 'lucide-react';

interface LocationMetrics {
  location: Location;
  totalWaste: number;
  totalCost: number;
  wasteCount: number;
  avgWastePerDay: number;
}

export default function MultiLocationDashboard() {
  const [locations, setLocations] = useState<LocationMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = useCallback(async () => {
    setLoading(true);

    // Get all locations
    const { data: locationsData, error: locError } = await supabase
      .from('locations')
      .select('*')
      .order('location_name');

    if (locError || !locationsData) {
      setLoading(false);
      return;
    }

    // Get waste logs for last 30 days for each location
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: wasteLogs, error: wasteError } = await supabase
      .from('waste_logs')
      .select('*')
      .gte('timestamp', thirtyDaysAgo.toISOString());

    if (wasteError) {
      setLoading(false);
      return;
    }

    // Calculate metrics for each location
    const metricsData: LocationMetrics[] = locationsData.map((loc) => {
      const locationLogs = wasteLogs?.filter((log) => log.location_id === loc.id) || [];
      const totalCost = locationLogs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0);
      const totalWaste = locationLogs.reduce((sum, log) => {
        const lbs = log.unit === 'kg' ? log.quantity * 2.20462 : log.quantity;
        return sum + lbs;
      }, 0);

      return {
        location: loc,
        totalWaste,
        totalCost,
        wasteCount: locationLogs.length,
        avgWastePerDay: totalCost / 30,
      };
    });

    setLocations(metricsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  // Calculate averages for benchmarking
  const avgCost = locations.reduce((sum, loc) => sum + loc.totalCost, 0) / (locations.length || 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading locations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Multi-Location Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Compare performance across {locations.length} location{locations.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{locations.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Combined Waste Cost (30d)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${locations.reduce((sum, loc) => sum + loc.totalCost, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Average Cost per Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${avgCost.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Locations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Location Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Location</th>
                    <th className="text-left py-3 px-4">Address</th>
                    <th className="text-left py-3 px-4">Waste Logs</th>
                    <th className="text-left py-3 px-4">Total Weight</th>
                    <th className="text-left py-3 px-4">Total Cost</th>
                    <th className="text-left py-3 px-4">vs Average</th>
                    <th className="text-left py-3 px-4">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {locations
                    .sort((a, b) => a.totalCost - b.totalCost)
                    .map((locMetrics) => {
                      const vsAvg = ((locMetrics.totalCost - avgCost) / avgCost) * 100;
                      const isBetter = locMetrics.totalCost < avgCost;

                      return (
                        <tr key={locMetrics.location.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                              {locMetrics.location.location_name}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {locMetrics.location.address || 'N/A'}
                          </td>
                          <td className="py-3 px-4">{locMetrics.wasteCount}</td>
                          <td className="py-3 px-4">{locMetrics.totalWaste.toFixed(1)} lbs</td>
                          <td className="py-3 px-4 font-semibold">
                            ${locMetrics.totalCost.toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            {isBetter ? (
                              <span className="text-primary flex items-center">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                {Math.abs(vsAvg).toFixed(1)}% better
                              </span>
                            ) : (
                              <span className="text-destructive flex items-center">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                {Math.abs(vsAvg).toFixed(1)}% worse
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-full bg-muted rounded-full h-2 mr-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    isBetter ? 'bg-primary' : 'bg-destructive'
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (locMetrics.totalCost / Math.max(...locations.map((l) => l.totalCost))) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Best Performer</CardTitle>
            </CardHeader>
            <CardContent>
              {locations.length > 0 && (
                <div>
                  <p className="text-2xl font-bold mb-2">
                    {locations.sort((a, b) => a.totalCost - b.totalCost)[0]?.location.location_name}
                  </p>
                  <p className="text-muted-foreground">
                    Lowest waste cost at ${locations[0]?.totalCost.toFixed(2)} in the last 30 days
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Needs Attention</CardTitle>
            </CardHeader>
            <CardContent>
              {locations.length > 0 && (
                <div>
                  <p className="text-2xl font-bold mb-2">
                    {locations.sort((a, b) => b.totalCost - a.totalCost)[0]?.location.location_name}
                  </p>
                  <p className="text-muted-foreground">
                    Highest waste cost at ${locations.sort((a, b) => b.totalCost - a.totalCost)[0]?.totalCost.toFixed(2)} - consider reviewing processes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
