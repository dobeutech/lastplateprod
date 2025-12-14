import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PurchaseOrder, PurchaseOrderItem } from '@/lib/vendor-types';

export function usePurchaseOrders(locationId?: string) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [locationId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('purchase_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setOrders(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (order: Partial<PurchaseOrder>, items: Partial<PurchaseOrderItem>[]) => {
    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('purchase_orders')
      .insert([order])
      .select()
      .single();

    if (orderError) throw orderError;

    // Insert order items
    const itemsWithOrderId = items.map(item => ({
      ...item,
      purchase_order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase
      .from('purchase_order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

    await fetchOrders();
    return orderData;
  };

  const updateOrderStatus = async (id: string, status: PurchaseOrder['status']) => {
    const { data, error: updateError } = await supabase
      .from('purchase_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    await fetchOrders();
    return data;
  };

  const receiveOrder = async (orderId: string, items: { id: string; quantity_received: number }[]) => {
    // Update order items
    for (const item of items) {
      const { error: itemError } = await supabase
        .from('purchase_order_items')
        .update({ 
          quantity_received: item.quantity_received,
          received_date: new Date().toISOString(),
        })
        .eq('id', item.id);

      if (itemError) throw itemError;
    }

    // Update order status
    await updateOrderStatus(orderId, 'received');
  };

  return {
    orders,
    loading,
    error,
    refetch: fetchOrders,
    createOrder,
    updateOrderStatus,
    receiveOrder,
  };
}

export function usePurchaseOrderItems(orderId: string) {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchItems();
  }, [orderId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('purchase_order_id', orderId);

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { items, loading, error, refetch: fetchItems };
}
