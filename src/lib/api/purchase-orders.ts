import { supabase } from '../supabase';
import { logger } from '../logger';
import { handleSupabaseError } from '../api-client';

export interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: string;
  location_id: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  notes?: string;
  created_by: string;
  approved_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  po_id: string;
  inventory_item_id?: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  received_quantity: number;
  notes?: string;
  created_at: string;
}

export interface CreatePurchaseOrderInput {
  vendor_id: string;
  location_id: string;
  order_date: string;
  expected_delivery_date?: string;
  notes?: string;
  items: Array<{
    inventory_item_id?: string;
    item_name: string;
    quantity: number;
    unit: string;
    unit_price: number;
  }>;
}

export interface UpdatePurchaseOrderInput {
  id: string;
  status?: PurchaseOrder['status'];
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  notes?: string;
}

export class PurchaseOrdersAPI {
  static async getAll(): Promise<PurchaseOrder[]> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch purchase orders', error as Error, { 
        component: 'PurchaseOrdersAPI' 
      });
      throw error;
    }
  }

  static async getById(id: string): Promise<PurchaseOrder | null> {
    try {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleSupabaseError(error);

      return data;
    } catch (error) {
      logger.error('Failed to fetch purchase order', error as Error, { 
        component: 'PurchaseOrdersAPI',
        poId: id 
      });
      throw error;
    }
  }

  static async getItems(poId: string): Promise<PurchaseOrderItem[]> {
    try {
      const { data, error } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('po_id', poId);

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch PO items', error as Error, { 
        component: 'PurchaseOrdersAPI',
        poId 
      });
      throw error;
    }
  }

  static async create(input: CreatePurchaseOrderInput): Promise<PurchaseOrder> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate PO number
      const poNumber = await this.generatePONumber();

      // Calculate totals
      const subtotal = input.items.reduce((sum, item) => 
        sum + (item.quantity * item.unit_price), 0
      );
      const tax = subtotal * 0.08; // 8% tax rate
      const shipping = 0; // Can be calculated based on vendor
      const total = subtotal + tax + shipping;

      // Create PO
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert([{
          po_number: poNumber,
          vendor_id: input.vendor_id,
          location_id: input.location_id,
          status: 'draft',
          order_date: input.order_date,
          expected_delivery_date: input.expected_delivery_date,
          subtotal,
          tax,
          shipping,
          total,
          notes: input.notes,
          created_by: user.id,
        }])
        .select()
        .single();

      if (poError) handleSupabaseError(poError);

      // Create PO items
      const items = input.items.map(item => ({
        po_id: po.id,
        inventory_item_id: item.inventory_item_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        received_quantity: 0,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_items')
        .insert(items);

      if (itemsError) handleSupabaseError(itemsError);

      logger.audit('Purchase order created', {
        userId: user.id,
        poId: po.id,
        poNumber: po.po_number,
        total: po.total,
      });

      return po;
    } catch (error) {
      logger.error('Failed to create purchase order', error as Error, { 
        component: 'PurchaseOrdersAPI' 
      });
      throw error;
    }
  }

  static async update(input: UpdatePurchaseOrderInput): Promise<PurchaseOrder> {
    try {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('purchase_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('Purchase order updated', {
        poId: id,
        updates: Object.keys(updates),
      });

      return data;
    } catch (error) {
      logger.error('Failed to update purchase order', error as Error, { 
        component: 'PurchaseOrdersAPI',
        poId: input.id 
      });
      throw error;
    }
  }

  static async approve(id: string): Promise<PurchaseOrder> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('purchase_orders')
        .update({
          status: 'approved',
          approved_by: user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('Purchase order approved', {
        userId: user.id,
        poId: id,
      });

      return data;
    } catch (error) {
      logger.error('Failed to approve purchase order', error as Error, { 
        component: 'PurchaseOrdersAPI',
        poId: id 
      });
      throw error;
    }
  }

  static async receive(id: string, items: Array<{ id: string; received_quantity: number }>): Promise<void> {
    try {
      // Update received quantities
      for (const item of items) {
        await supabase
          .from('purchase_order_items')
          .update({ received_quantity: item.received_quantity })
          .eq('id', item.id);
      }

      // Update PO status
      await supabase
        .from('purchase_orders')
        .update({
          status: 'received',
          actual_delivery_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', id);

      logger.audit('Purchase order received', { poId: id });
    } catch (error) {
      logger.error('Failed to receive purchase order', error as Error, { 
        component: 'PurchaseOrdersAPI',
        poId: id 
      });
      throw error;
    }
  }

  private static async generatePONumber(): Promise<string> {
    const { data } = await supabase
      .from('purchase_orders')
      .select('po_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data?.po_number) {
      const lastNumber = parseInt(data.po_number.replace('PO-', ''));
      return `PO-${String(lastNumber + 1).padStart(6, '0')}`;
    }

    return 'PO-000001';
  }
}
