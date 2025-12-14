import { useState, useEffect } from 'react';
import { useVendors, useVendorPerformance } from '@/hooks/useVendors';
import { Vendor } from '@/lib/vendor-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Phone, MapPin, TrendingUp, TrendingDown, Minus, Star, Building, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useIntercomMessaging } from '@/lib/intercom';

interface VendorsPageProps {
  locationId?: string;
}

export default function VendorsPage({ locationId }: VendorsPageProps) {
  const { trackPageVisit, trackVendorAction } = useIntercomMessaging();
  const { vendors, loading, error, createVendor, updateVendor, deleteVendor } = useVendors(locationId);
  const { performance } = useVendorPerformance(locationId);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'directory' | 'performance' | 'comparison'>('directory');

  useEffect(() => {
    trackPageVisit('Vendors');
  }, [trackPageVisit]);

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || v.vendor_type === filterType;
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && v.is_active) ||
      (filterStatus === 'inactive' && !v.is_active);
    return matchesSearch && matchesType && matchesStatus;
  });

  const vendorTypes = [...new Set(vendors.map(v => v.vendor_type))];

  const handleCreateVendor = async (data: Partial<Vendor>) => {
    try {
      await createVendor(data);
      trackVendorAction('create');
      setIsAddDialogOpen(false);
      toast.success('Vendor created successfully');
    } catch (error) {
      console.error('Failed to create vendor:', error);
      toast.error('Failed to create vendor');
    }
  };

  const handleUpdateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      await updateVendor(id, updates);
      trackVendorAction('update', id);
      toast.success('Vendor updated successfully');
    } catch (error) {
      console.error('Failed to update vendor:', error);
      toast.error('Failed to update vendor');
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await deleteVendor(id);
      trackVendorAction('delete', id);
      toast.success('Vendor deleted successfully');
    } catch (error) {
      console.error('Failed to delete vendor:', error);
      toast.error('Failed to delete vendor');
    }
  };

  const toggleVendorStatus = async (vendor: Vendor) => {
    await handleUpdateVendor(vendor.id, { is_active: !vendor.is_active });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading vendors...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
            <p className="text-muted-foreground mt-1">Manage supplier relationships and performance</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Vendor</DialogTitle>
              </DialogHeader>
              <VendorForm onSubmit={handleCreateVendor} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Search Vendors</Label>
                <Input
                  id="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">Vendor Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {vendorTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList>
            <TabsTrigger value="directory">Vendor Directory</TabsTrigger>
            <TabsTrigger value="performance">Performance Dashboard</TabsTrigger>
            <TabsTrigger value="comparison">Vendor Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="directory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVendors.map(vendor => (
                <Card key={vendor.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        <CardTitle className="text-lg">{vendor.name}</CardTitle>
                      </div>
                      <Badge variant={vendor.is_active ? 'default' : 'secondary'}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-sm">{vendor.vendor_type}</p>
                    </div>

                    {vendor.contact_info && (
                      <>
                        {vendor.contact_info.phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{vendor.contact_info.phone}</span>
                          </div>
                        )}
                        {vendor.contact_info.address && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs">{vendor.contact_info.address}</span>
                          </div>
                        )}
                      </>
                    )}

                    {vendor.payment_terms && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Payment Terms</p>
                        <p className="text-sm">{vendor.payment_terms}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleVendorStatus(vendor)}
                      >
                        {vendor.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredVendors.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No vendors found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Total Orders</TableHead>
                      <TableHead className="text-right">Total Spend</TableHead>
                      <TableHead className="text-right">Avg Order</TableHead>
                      <TableHead className="text-right">On-Time %</TableHead>
                      <TableHead>Last Order</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performance.map(perf => {
                      const isGoodDelivery = perf.on_time_percentage >= 95;
                      return (
                        <TableRow key={`${perf.vendor_id}-${perf.location_id}`}>
                          <TableCell className="font-medium">{perf.vendor_name}</TableCell>
                          <TableCell>{perf.vendor_type}</TableCell>
                          <TableCell className="text-right">{perf.total_orders}</TableCell>
                          <TableCell className="text-right">${perf.total_spend.toLocaleString()}</TableCell>
                          <TableCell className="text-right">${perf.avg_order_value.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {isGoodDelivery ? (
                                <TrendingUp className="w-4 h-4 text-primary" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-destructive" />
                              )}
                              <span className={isGoodDelivery ? 'text-primary' : 'text-destructive'}>
                                {perf.on_time_percentage.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(perf.last_order_date).toLocaleDateString()}
                            <span className="text-xs text-muted-foreground ml-2">
                              ({Math.round(perf.days_since_last_order)}d ago)
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {performance.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No performance data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle>Side-by-Side Vendor Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {performance.slice(0, 3).map(perf => (
                    <Card key={`${perf.vendor_id}-${perf.location_id}`}>
                      <CardHeader>
                        <CardTitle className="text-base">{perf.vendor_name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Spend</span>
                          <span className="text-sm font-semibold">${perf.total_spend.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Orders</span>
                          <span className="text-sm font-semibold">{perf.total_orders}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Avg Order</span>
                          <span className="text-sm font-semibold">${perf.avg_order_value.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">On-Time</span>
                          <div className="flex items-center gap-1">
                            {perf.on_time_percentage >= 90 ? (
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            ) : (
                              <Minus className="w-4 h-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-semibold">{perf.on_time_percentage.toFixed(0)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {performance.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No comparison data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function VendorForm({ onSubmit }: { onSubmit: (data: Partial<Vendor>) => void }) {
  const [formData, setFormData] = useState<Partial<Vendor>>({
    is_active: true,
    contact_info: {},
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateContactInfo = (field: string, value: string) => {
    setFormData({
      ...formData,
      contact_info: {
        ...formData.contact_info,
        [field]: value,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Vendor Name *</Label>
          <Input
            id="name"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Sysco, US Foods"
          />
        </div>

        <div>
          <Label htmlFor="vendor_type">Vendor Type *</Label>
          <Input
            id="vendor_type"
            required
            value={formData.vendor_type || ''}
            onChange={(e) => setFormData({ ...formData, vendor_type: e.target.value })}
            placeholder="e.g., Produce, Meat, Dairy"
          />
        </div>

        <div>
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Input
            id="payment_terms"
            value={formData.payment_terms || ''}
            onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
            placeholder="e.g., Net 30"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="contact_name">Contact Name</Label>
          <Input
            id="contact_name"
            value={formData.contact_info?.name || ''}
            onChange={(e) => updateContactInfo('name', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.contact_info?.email || ''}
            onChange={(e) => updateContactInfo('email', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.contact_info?.phone || ''}
            onChange={(e) => updateContactInfo('phone', e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.contact_info?.address || ''}
            onChange={(e) => updateContactInfo('address', e.target.value)}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Input
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full">Add Vendor</Button>
    </form>
  );
}