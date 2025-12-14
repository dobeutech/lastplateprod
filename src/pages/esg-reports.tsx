import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { ESGReport } from '@/lib/waste-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Leaf, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function ESGReportsPage() {
  const [reports, setReports] = useState<ESGReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('esg_reports')
      .select('*')
      .order('generated_at', { ascending: false });

    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownloadReport = (reportId: string) => {
    toast.success(`Downloading report ${reportId}...`);
    // Placeholder for actual PDF generation
  };

  const handleGenerateReport = async () => {
    toast.success('Generating new ESG report...');
    // Placeholder for report generation
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ESG Reports</h1>
            <p className="text-muted-foreground mt-1">
              Environmental, Social, and Governance compliance reporting
            </p>
          </div>
          <Button onClick={handleGenerateReport} className="bg-primary">
            <FileText className="mr-2 h-4 w-4" />
            Generate New Report
          </Button>
        </div>

        {/* Summary Cards */}
        {reports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Latest Waste Reduction</CardTitle>
                <TrendingDown className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {reports[0]?.total_waste_reduction_percentage?.toFixed(1) || '0.0'}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {reports[0]?.report_period}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Carbon Impact Saved</CardTitle>
                <Leaf className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reports[0]?.carbon_impact_kg?.toFixed(0) || '0'} kg
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  CO₂ equivalent reduced
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reports.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Generated to date</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reports List */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                <p className="text-muted-foreground mb-4">
                  Generate your first ESG report to track environmental impact
                </p>
                <Button onClick={handleGenerateReport}>Generate Report</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{report.report_period}</h3>
                        <p className="text-sm text-muted-foreground">
                          Generated on {new Date(report.generated_at).toLocaleDateString()}
                        </p>
                        <div className="mt-2 flex gap-4 text-sm">
                          <span className="flex items-center text-primary">
                            <TrendingDown className="h-4 w-4 mr-1" />
                            {report.total_waste_reduction_percentage?.toFixed(1)}% reduction
                          </span>
                          <span className="flex items-center text-muted-foreground">
                            <Leaf className="h-4 w-4 mr-1" />
                            {report.carbon_impact_kg?.toFixed(0)} kg CO₂
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => handleDownloadReport(report.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Environmental Impact Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Waste Reduction Goals</h4>
                <p className="text-muted-foreground text-sm">
                  Track progress toward sustainability targets and corporate ESG commitments.
                  Regular reporting demonstrates accountability and drives continuous improvement.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Compliance Documentation</h4>
                <p className="text-muted-foreground text-sm">
                  Generate professional reports suitable for corporate stakeholders, investors,
                  and regulatory bodies. All data is audit-ready and verifiable.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
