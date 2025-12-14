import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Vendor } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Star, Phone, Envelope } from '@phosphor-icons/react';
import { generateId } from '@/lib/permissions';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export function VendorsView() {
  const { permissions } = useAuth();
  const [vendors, setVendors] = useKV<Vendor[]>('vendors', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddVendor = (vendorData: Partial<Vendor>) => {
    if (!permissions?.canEditVendors) {
      toast.error('You do not have permission to add vendors');
      return;
    }

    const newVendor: Vendor = {
      id: generateId(),
      name: vendorData.name || '',
      contactName: vendorData.contactName || '',
      email: vendorData.email || '',
      phone: vendorData.phone || '',
      address: vendorData.address || '',
      rating: vendorData.rating || 0,
      deliveryTimeAvg: vendorData.deliveryTimeAvg || 0,
      categories: vendorData.categories || [],
      paymentTerms: vendorData.paymentTerms || '',
      notes: vendorData.notes,
    };

    setVendors((current) => [...(current || []), newVendor]);
    toast.success('Vendor added successfully');
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Vendor Management</h2>
          <p className="text-muted-foreground">Manage supplier relationships</p>
        </div>
        {permissions?.canEditVendors && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Vendor</DialogTitle>
              </DialogHeader>
              <VendorForm onSubmit={handleAddVendor} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors?.map(vendor => (
          <Card key={vendor.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{vendor.name}</span>
                <div className="flex items-center gap-1">
                  <Star weight="fill" className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{vendor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Envelope className="w-4 h-4" />
                  <span>{vendor.email}</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-1">Contact</p>
                <p className="text-sm text-muted-foreground">{vendor.contactName}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Delivery Time</p>
                <p className="text-sm text-muted-foreground">{vendor.deliveryTimeAvg} days avg</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Categories</p>
                <div className="flex flex-wrap gap-1">
                  {vendor.categories.map((cat, i) => (
                    <Badge key={i} variant="secondary">{cat}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Payment Terms</p>
                <p className="text-sm text-muted-foreground">{vendor.paymentTerms}</p>
              </div>

              {vendor.notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Notes</p>
                  <p className="text-sm text-muted-foreground">{vendor.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(!vendors || vendors.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No vendors yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function VendorForm({ onSubmit }: { onSubmit: (data: Partial<Vendor>) => void }) {
  const [formData, setFormData] = useState<Partial<Vendor>>({ categories: [] });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleCategoriesChange = (value: string) => {
    const categories = value.split(',').map(c => c.trim()).filter(Boolean);
    setFormData({ ...formData, categories });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Vendor Name</Label>
          <Input
            id="name"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            required
            value={formData.contactName || ''}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            required
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            required
            value={formData.address || ''}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryTimeAvg">Avg Delivery Time (days)</Label>
          <Input
            id="deliveryTimeAvg"
            type="number"
            required
            value={formData.deliveryTimeAvg || ''}
            onChange={(e) => setFormData({ ...formData, deliveryTimeAvg: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rating">Rating (0-5)</Label>
          <Input
            id="rating"
            type="number"
            step="0.1"
            min="0"
            max="5"
            required
            value={formData.rating || ''}
            onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="categories">Categories (comma-separated)</Label>
          <Input
            id="categories"
            placeholder="e.g., Produce, Dairy, Meat"
            value={formData.categories?.join(', ') || ''}
            onChange={(e) => handleCategoriesChange(e.target.value)}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="paymentTerms">Payment Terms</Label>
          <Input
            id="paymentTerms"
            required
            placeholder="e.g., Net 30"
            value={formData.paymentTerms || ''}
            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
          />
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
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
