import { supabase } from '../supabase';
import { logger } from '../logger';
import { handleSupabaseError } from '../api-client';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_point: number;
  reorder_quantity: number;
  cost_per_unit: number;
  location_id: string;
  expiration_date?: string;
  barcode?: string;
  sku?: string;
  supplier_id?: string;
  notes?: string;
  last_updated: string;
  updated_by?: string;
  created_at: string;
}

export interface CreateInventoryItemInput {
  name: string;
  category: string;
  current_stock: number;
  unit: string;
  reorder_point: number;
  reorder_quantity: number;
  cost_per_unit: number;
  location_id: string;
  expiration_date?: string;
  barcode?: string;
  sku?: string;
  supplier_id?: string;
  notes?: string;
}

export interface UpdateInventoryItemInput extends Partial<CreateInventoryItemInput> {
  id: string;
}

export class InventoryAPI {
  /**
   * Get all inventory items for the user's location
   */
  static async getAll(): Promise<InventoryItem[]> {
    try {
      logger.debug('Fetching all inventory items', { component: 'InventoryAPI' });

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');

      if (error) handleSupabaseError(error);

      logger.info(`Fetched ${data?.length || 0} inventory items`, { component: 'InventoryAPI' });
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch inventory items', error as Error, { component: 'InventoryAPI' });
      throw error;
    }
  }

  /**
   * Get a single inventory item by ID
   */
  static async getById(id: string): Promise<InventoryItem | null> {
    try {
      logger.debug('Fetching inventory item', { component: 'InventoryAPI', itemId: id });

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleSupabaseError(error);

      return data;
    } catch (error) {
      logger.error('Failed to fetch inventory item', error as Error, { 
        component: 'InventoryAPI',
        itemId: id 
      });
      throw error;
    }
  }

  /**
   * Get inventory items by category
   */
  static async getByCategory(category: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('category', category)
        .order('name');

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch inventory by category', error as Error, { 
        component: 'InventoryAPI',
        category 
      });
      throw error;
    }
  }

  /**
   * Get low stock items (below reorder point)
   */
  static async getLowStock(): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .filter('current_stock', 'lt', 'reorder_point')
        .order('current_stock');

      if (error) handleSupabaseError(error);

      logger.info(`Found ${data?.length || 0} low stock items`, { component: 'InventoryAPI' });
      return data || [];
    } catch (error) {
      logger.error('Failed to fetch low stock items', error as Error, { 
        component: 'InventoryAPI' 
      });
      throw error;
    }
  }

  /**
   * Create a new inventory item
   */
  static async create(input: CreateInventoryItemInput): Promise<InventoryItem> {
    try {
      logger.debug('Creating inventory item', { component: 'InventoryAPI', name: input.name });

      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('inventory_items')
        .insert([{
          ...input,
          updated_by: user?.id,
        }])
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('Inventory item created', {
        userId: user?.id,
        itemId: data.id,
        itemName: data.name,
      });

      return data;
    } catch (error) {
      logger.error('Failed to create inventory item', error as Error, { 
        component: 'InventoryAPI',
        name: input.name 
      });
      throw error;
    }
  }

  /**
   * Update an inventory item
   */
  static async update(input: UpdateInventoryItemInput): Promise<InventoryItem> {
    try {
      const { id, ...updates } = input;
      logger.debug('Updating inventory item', { component: 'InventoryAPI', itemId: id });

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          ...updates,
          updated_by: user?.id,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('Inventory item updated', {
        userId: user?.id,
        itemId: id,
        updates: Object.keys(updates),
      });

      return data;
    } catch (error) {
      logger.error('Failed to update inventory item', error as Error, { 
        component: 'InventoryAPI',
        itemId: input.id 
      });
      throw error;
    }
  }

  /**
   * Delete an inventory item
   */
  static async delete(id: string): Promise<void> {
    try {
      logger.debug('Deleting inventory item', { component: 'InventoryAPI', itemId: id });

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);

      logger.audit('Inventory item deleted', {
        userId: user?.id,
        itemId: id,
      });
    } catch (error) {
      logger.error('Failed to delete inventory item', error as Error, { 
        component: 'InventoryAPI',
        itemId: id 
      });
      throw error;
    }
  }

  /**
   * Update stock quantity
   */
  static async updateStock(id: string, quantity: number): Promise<InventoryItem> {
    try {
      logger.debug('Updating stock quantity', { 
        component: 'InventoryAPI',
        itemId: id,
        quantity 
      });

      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          current_stock: quantity,
          updated_by: user?.id,
          last_updated: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('Stock quantity updated', {
        userId: user?.id,
        itemId: id,
        newQuantity: quantity,
      });

      return data;
    } catch (error) {
      logger.error('Failed to update stock quantity', error as Error, { 
        component: 'InventoryAPI',
        itemId: id 
      });
      throw error;
    }
  }

  /**
   * Search inventory items
   */
  static async search(query: string): Promise<InventoryItem[]> {
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
        .order('name');

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to search inventory', error as Error, { 
        component: 'InventoryAPI',
        query 
      });
      throw error;
    }
  }
}
