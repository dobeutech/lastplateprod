import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { PurchaseOrder, Vendor, InventoryItem, OrderStatus } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, CheckCircle, XCircle, Clock } from '@phosphor-icons/react';
import { formatCurrency, formatDateTime, canApproveOrder, getNextOrderStatus, generateOrderNumber, generateId } from '@/lib/permissions';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface OrdersViewProps {
  locationId: string;
}

export function OrdersView({ locationId }: OrdersViewProps) {
  const { user, permissions } = useAuth();
  const [orders, setOrders] = useKV<PurchaseOrder[]>('orders', []);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const locationOrders = orders?.filter(order => order.locationId === locationId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) || [];

  const getStatusBadge = (status: OrderStatus) => {
    const badges: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
      draft: { label: 'Draft', variant: 'secondary' },
      pending_manager: { label: 'Pending Manager', variant: 'secondary' },
      pending_admin: { label: 'Pending Admin', variant: 'secondary' },
      approved: { label: 'Approved', variant: 'default' },
      rejected: { label: 'Rejected', variant: 'destructive' },
      ordered: { label: 'Ordered', variant: 'default' },
      delivered: { label: 'Delivered', variant: 'default' },
      cancelled: { label: 'Cancelled', variant: 'destructive' },
    };
    return badges[status];
  };

  const handleApprove = (order: PurchaseOrder) => {
    if (!user) return;
    
    const newStatus = getNextOrderStatus(order.status, user.role);
    
    setOrders((current) =>
      (current || []).map(o =>
        o.id === order.id
          ? {
              ...o,
              status: newStatus as OrderStatus,
              approvedBy: user.id,
              approvedByName: user.name,
              approvedAt: new Date().toISOString(),
            }
          : o
      )
    );
    
    toast.success('Order approved successfully');
  };

  const handleReject = (order: PurchaseOrder, reason: string) => {
    if (!user) return;
    
    setOrders((current) =>
      (current || []).map(o =>
        o.id === order.id
          ? {
              ...o,
              status: 'rejected',
              rejectedBy: user.id,
              rejectedByName: user.name,
              rejectedAt: new Date().toISOString(),
              rejectedReason: reason,
            }
          : o
      )
    );
    
    toast.success('Order rejected');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Purchase Orders</h2>
          <p className="text-muted-foreground">Manage orders and approvals</p>
        </div>
        {permissions?.canCreateOrders && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <CreateOrderForm 
                locationId={locationId} 
                onSubmit={(order) => {
                  setOrders((current) => [...(current || []), order]);
                  setIsCreateDialogOpen(false);
                  toast.success('Order created successfully');
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locationOrders.map(order => {
                const statusBadge = getStatusBadge(order.status);
                const canApprove = user && canApproveOrder(user.role, order.status);

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{order.vendorName}</TableCell>
                    <TableCell>{order.createdByName}</TableCell>
                    <TableCell>{formatDateTime(order.createdAt)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <OrderDetailsDialog order={order} />
                        {canApprove && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApprove(order)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <RejectDialog order={order} onReject={handleReject} />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {locationOrders.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CreateOrderForm({ locationId, onSubmit }: { locationId: string; onSubmit: (order: PurchaseOrder) => void }) {
  const { user } = useAuth();
  const [vendors] = useKV<Vendor[]>('vendors', []);
  const [inventory] = useKV<InventoryItem[]>('inventory', []);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [items, setItems] = useState<Array<{ itemId: string; quantity: number; price: number }>>([]);

  const locationInventory = inventory?.filter(item => item.locationId === locationId) || [];
  const selectedVendor = vendors?.find(v => v.id === selectedVendorId);

  const handleAddItem = () => {
    setItems([...items, { itemId: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedVendor) return;

    const orderItems = items.map(item => {
      const inventoryItem = locationInventory.find(inv => inv.id === item.itemId);
      return {
        inventoryItemId: item.itemId,
        itemName: inventoryItem?.name || '',
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.quantity * item.price,
      };
    });

    const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const order: PurchaseOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      vendorId: selectedVendorId,
      vendorName: selectedVendor.name,
      locationId,
      items: orderItems,
      subtotal,
      tax,
      total,
      status: 'pending_manager',
      createdBy: user.id,
      createdByName: user.name,
      createdAt: new Date().toISOString(),
    };

    onSubmit(order);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Select Vendor</Label>
        <Select value={selectedVendorId} onValueChange={setSelectedVendorId} required>
          <SelectTrigger>
            <SelectValue placeholder="Choose a vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors?.map(vendor => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Order Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <Select
              value={item.itemId}
              onValueChange={(value) => handleItemChange(index, 'itemId', value)}
              required
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select item" />
              </SelectTrigger>
              <SelectContent>
                {locationInventory.map(invItem => (
                  <SelectItem key={invItem.id} value={invItem.id}>
                    {invItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Qty"
              className="w-24"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
              required
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Price"
              className="w-32"
              value={item.price}
              onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
              required
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={!selectedVendorId || items.length === 0}>
        Create Order
      </Button>
    </form>
  );
}

function OrderDetailsDialog({ order }: { order: PurchaseOrder }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">View Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order {order.orderNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Vendor</p>
              <p className="font-medium">{order.vendorName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created By</p>
              <p className="font-medium">{order.createdByName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{order.status.replace('_', ' ')}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Items</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell>{item.itemName}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {order.rejectedReason && (
            <div className="bg-destructive/10 p-4 rounded-lg">
              <p className="text-sm font-medium text-destructive">Rejection Reason</p>
              <p className="text-sm mt-1">{order.rejectedReason}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function RejectDialog({ order, onReject }: { order: PurchaseOrder; onReject: (order: PurchaseOrder, reason: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onReject(order, reason);
    setIsOpen(false);
    setReason('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <XCircle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Rejection</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason..."
              required
            />
          </div>
          <Button type="submit" variant="destructive" className="w-full">
            Reject Order
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
