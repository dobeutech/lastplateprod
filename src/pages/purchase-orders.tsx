import { useState } from 'react';
import { usePurchaseOrders, usePurchaseOrderItems } from '@/hooks/usePurchaseOrders';
import { useVendors } from '@/hooks/useVendors';
import { useInventoryItems } from '@/hooks/useInventory';
import { useWasteAuth } from '@/lib/waste-auth';
import { PurchaseOrder, PurchaseOrderItem } from '@/lib/vendor-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FileText, Package, Truck, X } from 'lucide-react';
import { toast } from 'sonner';

interface PurchaseOrdersPageProps {
  locationId: string;
  restaurantId: string;
}

export default function PurchaseOrdersPage({ locationId, restaurantId }: PurchaseOrdersPageProps) {
  const { userProfile } = useWasteAuth();
  const { orders, loading, createOrder, updateOrderStatus, receiveOrder } = usePurchaseOrders(locationId);
  const { vendors } = useVendors();
  const { items: inventoryItems } = useInventoryItems(restaurantId);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders.filter(o =>
    filterStatus === 'all' || o.status === filterStatus
  );

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const receivedOrders = orders.filter(o => o.status === 'received');

  const handleCreateOrder = async (orderData: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
    try {
      const totalAmount = items.reduce((sum, item) => 
        sum + ((item.quantity_ordered || 0) * (item.unit_price || 0)), 0
      );

      await createOrder({
        ...orderData,
        location_id: locationId,
        created_by: userProfile?.id || '',
        total_amount: totalAmount,
        status: 'pending',
      }, items);

      setIsCreateDialogOpen(false);
      toast.success('Purchase order created successfully');
    } catch {
      toast.error('Failed to create purchase order');
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      await updateOrderStatus(orderId, 'approved');
      toast.success('Order approved');
    } catch {
      toast.error('Failed to approve order');
    }
  };

  const handleReceiveOrder = async (orderId: string, items: { id: string; quantity_received: number }[]) => {
    try {
      await receiveOrder(orderId, items);
      toast.success('Order received and inventory updated');
    } catch {
      toast.error('Failed to receive order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
            <p className="text-muted-foreground mt-1">Create and manage purchase orders</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create PO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <CreatePOForm
                vendors={vendors}
                inventoryItems={inventoryItems}
                onSubmit={handleCreateOrder}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingOrders.length}</p>
                </div>
                <Package className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Received</p>
                  <p className="text-2xl font-bold">{receivedOrders.length}</p>
                </div>
                <Truck className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="all">
            <OrdersTable
              orders={filteredOrders}
              onApprove={handleApproveOrder}
              onReceive={handleReceiveOrder}
            />
          </TabsContent>
          <TabsContent value="pending">
            <OrdersTable
              orders={pendingOrders}
              onApprove={handleApproveOrder}
              onReceive={handleReceiveOrder}
            />
          </TabsContent>
          <TabsContent value="received">
            <OrdersTable
              orders={receivedOrders}
              onApprove={handleApproveOrder}
              onReceive={handleReceiveOrder}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OrdersTable({ orders, onApprove, onReceive }: {
  orders: PurchaseOrder[];
  onApprove: (id: string) => void;
  onReceive: (id: string, items: { id: string; quantity_received: number }[]) => void;
}) {
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      received: 'default',
      cancelled: 'destructive',
    } as const;

    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Date</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Expected Delivery</TableHead>
                <TableHead className="text-right">Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>{new Date(order.order_date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">
                    {order.vendor_id}
                  </TableCell>
                  <TableCell>
                    {order.expected_delivery_date
                      ? new Date(order.expected_delivery_date).toLocaleDateString()
                      : 'TBD'}
                  </TableCell>
                  <TableCell className="text-right">
                    ${order.total_amount?.toFixed(2) || '0.00'}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onApprove(order.id)}
                        >
                          Approve
                        </Button>
                      )}
                      {order.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsReceiveDialogOpen(true);
                          }}
                        >
                          Receive
                        </Button>
                      )}
                      <OrderDetailsDialog order={order} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No orders found
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <ReceiveOrderDialog
          order={selectedOrder}
          isOpen={isReceiveDialogOpen}
          onClose={() => {
            setIsReceiveDialogOpen(false);
            setSelectedOrder(null);
          }}
          onReceive={(items) => {
            onReceive(selectedOrder.id, items);
            setIsReceiveDialogOpen(false);
            setSelectedOrder(null);
          }}
        />
      )}
    </>
  );
}

function CreatePOForm({ vendors, inventoryItems, onSubmit }: {
  vendors: any[];
  inventoryItems: any[];
  onSubmit: (order: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => void;
}) {
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [items, setItems] = useState<Array<Partial<PurchaseOrderItem>>>([
    { quantity_ordered: 1, unit_price: 0 }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorId || items.length === 0) return;

    onSubmit(
      {
        vendor_id: selectedVendorId,
        expected_delivery_date: expectedDelivery || null,
      },
      items.filter(item => item.inventory_item_id)
    );
  };

  const addItem = () => {
    setItems([...items, { quantity_ordered: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vendor">Vendor *</Label>
          <Select value={selectedVendorId} onValueChange={setSelectedVendorId} required>
            <SelectTrigger>
              <SelectValue placeholder="Select vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map(vendor => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="delivery">Expected Delivery</Label>
          <Input
            type="date"
            value={expectedDelivery}
            onChange={(e) => setExpectedDelivery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Order Items *</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Item</Label>
              <Select
                value={item.inventory_item_id || ''}
                onValueChange={(val) => updateItem(index, 'inventory_item_id', val)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select item" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map(invItem => (
                    <SelectItem key={invItem.id} value={invItem.id}>
                      {invItem.item_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity_ordered}
                onChange={(e) => updateItem(index, 'quantity_ordered', parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="w-32">
              <Label>Unit Price</Label>
              <Input
                type="number"
                step="0.01"
                value={item.unit_price}
                onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value))}
                required
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeItem(index)}
              disabled={items.length === 1}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>
            ${items.reduce((sum, item) => 
              sum + ((item.quantity_ordered || 0) * (item.unit_price || 0)), 0
            ).toFixed(2)}
          </span>
        </div>
      </div>

      <Button type="submit" className="w-full">Create Purchase Order</Button>
    </form>
  );
}

function OrderDetailsDialog({ order }: { order: PurchaseOrder }) {
  const { items } = usePurchaseOrderItems(order.id);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Order Date</p>
              <p className="font-medium">{new Date(order.order_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Ordered</TableHead>
                <TableHead className="text-right">Received</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.inventory_item_id}</TableCell>
                  <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                  <TableCell className="text-right">{item.quantity_received}</TableCell>
                  <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${(item.total_price || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="border-t pt-4 text-right text-lg font-semibold">
            Total: ${order.total_amount?.toFixed(2) || '0.00'}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReceiveOrderDialog({ order, isOpen, onClose, onReceive }: {
  order: PurchaseOrder;
  isOpen: boolean;
  onClose: () => void;
  onReceive: (items: { id: string; quantity_received: number }[]) => void;
}) {
  const { items } = usePurchaseOrderItems(order.id);
  const [receivedQuantities, setReceivedQuantities] = useState<Record<string, number>>({});

  const handleReceive = () => {
    const receivedItems = items.map(item => ({
      id: item.id,
      quantity_received: receivedQuantities[item.id] || item.quantity_ordered,
    }));
    onReceive(receivedItems);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Receive Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-right">Ordered</TableHead>
                <TableHead className="text-right">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.inventory_item_id}</TableCell>
                  <TableCell className="text-right">{item.quantity_ordered}</TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-24 ml-auto"
                      defaultValue={item.quantity_ordered}
                      onChange={(e) => setReceivedQuantities({
                        ...receivedQuantities,
                        [item.id]: parseFloat(e.target.value)
                      })}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button onClick={handleReceive} className="w-full">
            Mark as Received
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
