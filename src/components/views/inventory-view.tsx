import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { InventoryItem } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Warning, Package, MagnifyingGlass } from '@phosphor-icons/react';
import { formatCurrency, formatDate, getDaysUntilExpiration } from '@/lib/permissions';
import { useAuth } from '@/lib/auth-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateId } from '@/lib/permissions';
import { toast } from 'sonner';

interface InventoryViewProps {
  locationId: string;
}

export function InventoryView({ locationId }: InventoryViewProps) {
  const { user, permissions } = useAuth();
  const [inventory, setInventory] = useKV<InventoryItem[]>('inventory', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const locationInventory = inventory?.filter(item => item.locationId === locationId) || [];

  const categories = [...new Set(locationInventory.map(item => item.category))];

  const filteredInventory = locationInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { label: 'Out of Stock', variant: 'destructive' as const };
    if (item.currentStock <= item.reorderPoint) return { label: 'Low Stock', variant: 'secondary' as const };
    return { label: 'In Stock', variant: 'default' as const };
  };

  const handleUpdateStock = (item: InventoryItem, newStock: number) => {
    if (!permissions?.canEditInventory) {
      toast.error('You do not have permission to edit inventory');
      return;
    }

    setInventory((current) => 
      (current || []).map(i =>
        i.id === item.id
          ? { ...i, currentStock: newStock, lastUpdated: new Date().toISOString(), updatedBy: user?.id || '' }
          : i
      )
    );
    toast.success('Stock updated successfully');
  };

  const handleAddItem = (formData: Partial<InventoryItem>) => {
    if (!permissions?.canEditInventory) {
      toast.error('You do not have permission to add inventory');
      return;
    }

    const newItem: InventoryItem = {
      id: generateId(),
      name: formData.name || '',
      category: formData.category || '',
      currentStock: formData.currentStock || 0,
      unit: formData.unit || 'units',
      reorderPoint: formData.reorderPoint || 10,
      reorderQuantity: formData.reorderQuantity || 50,
      costPerUnit: formData.costPerUnit || 0,
      locationId,
      expirationDate: formData.expirationDate,
      lastUpdated: new Date().toISOString(),
      updatedBy: user?.id || '',
      barcode: formData.barcode,
    };

    setInventory((current) => [...(current || []), newItem]);
    toast.success('Item added successfully');
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Inventory Management</h2>
          <p className="text-muted-foreground">Track and manage stock levels</p>
        </div>
        {permissions?.canEditInventory && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Inventory Item</DialogTitle>
              </DialogHeader>
              <AddItemForm onSubmit={handleAddItem} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reorder Point</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiration</TableHead>
                <TableHead className="text-right">Value</TableHead>
                {permissions?.canEditInventory && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map(item => {
                const status = getStockStatus(item);
                const daysToExpiry = item.expirationDate ? getDaysUntilExpiration(item.expirationDate) : null;
                const isExpiringSoon = daysToExpiry !== null && daysToExpiry <= 7;

                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      {item.currentStock} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">{item.reorderPoint}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      {item.expirationDate ? (
                        <div className="flex items-center gap-2">
                          {isExpiringSoon && <Warning className="w-4 h-4 text-amber-500" />}
                          <span className={isExpiringSoon ? 'text-amber-600 font-medium' : ''}>
                            {formatDate(item.expirationDate)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.currentStock * item.costPerUnit)}
                    </TableCell>
                    {permissions?.canEditInventory && (
                      <TableCell>
                        <StockUpdateDialog item={item} onUpdate={handleUpdateStock} />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No items found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AddItemForm({ onSubmit }: { onSubmit: (data: Partial<InventoryItem>) => void }) {
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name</Label>
          <Input
            id="name"
            required
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            required
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentStock">Current Stock</Label>
          <Input
            id="currentStock"
            type="number"
            required
            value={formData.currentStock || ''}
            onChange={(e) => setFormData({ ...formData, currentStock: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input
            id="unit"
            required
            value={formData.unit || ''}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reorderPoint">Reorder Point</Label>
          <Input
            id="reorderPoint"
            type="number"
            required
            value={formData.reorderPoint || ''}
            onChange={(e) => setFormData({ ...formData, reorderPoint: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
          <Input
            id="reorderQuantity"
            type="number"
            required
            value={formData.reorderQuantity || ''}
            onChange={(e) => setFormData({ ...formData, reorderQuantity: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="costPerUnit">Cost Per Unit ($)</Label>
          <Input
            id="costPerUnit"
            type="number"
            step="0.01"
            required
            value={formData.costPerUnit || ''}
            onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
          <Input
            id="expirationDate"
            type="date"
            value={formData.expirationDate || ''}
            onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
          />
        </div>
      </div>
      <Button type="submit" className="w-full">Add Item</Button>
    </form>
  );
}

function StockUpdateDialog({ item, onUpdate }: { item: InventoryItem; onUpdate: (item: InventoryItem, newStock: number) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newStock, setNewStock] = useState(item.currentStock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(item, newStock);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Update Stock</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock: {item.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newStock">New Stock Level</Label>
            <Input
              id="newStock"
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(parseFloat(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Current: {item.currentStock} {item.unit}
            </p>
          </div>
          <Button type="submit" className="w-full">Update Stock</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
