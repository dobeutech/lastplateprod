import { useState, useEffect, useCallback } from 'react';
import { InventoryAPI, InventoryItem as APIInventoryItem, CreateInventoryItemInput } from '@/lib/api/inventory';
import { logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

// Re-export for compatibility
export type InventoryItem = APIInventoryItem;

export function useInventoryItems(locationId?: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchItems();
  }, [locationId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await InventoryAPI.getAll();
      setItems(data);
    } catch (err) {
      logger.error('Failed to fetch inventory items', err as Error, { 
        component: 'useInventoryItems' 
      });
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item: CreateInventoryItemInput) => {
    try {
      const data = await InventoryAPI.create(item);
      await fetchItems();
      return data;
    } catch (err) {
      logger.error('Failed to create inventory item', err as Error, { 
        component: 'useInventoryItems' 
      });
      throw err;
    }
  };

  const updateItem = async (id: string, updates: Partial<CreateInventoryItemInput>) => {
    try {
      const data = await InventoryAPI.update({ id, ...updates });
      await fetchItems();
      return data;
    } catch (err) {
      logger.error('Failed to update inventory item', err as Error, { 
        component: 'useInventoryItems',
        itemId: id 
      });
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await InventoryAPI.delete(id);
      await fetchItems();
    } catch (err) {
      logger.error('Failed to delete inventory item', err as Error, { 
        component: 'useInventoryItems',
        itemId: id 
      });
      throw err;
    }
  };

  const updateStock = async (id: string, quantity: number) => {
    try {
      const data = await InventoryAPI.updateStock(id, quantity);
      await fetchItems();
      return data;
    } catch (err) {
      logger.error('Failed to update stock', err as Error, { 
        component: 'useInventoryItems',
        itemId: id 
      });
      throw err;
    }
  };

  const getLowStock = async () => {
    try {
      return await InventoryAPI.getLowStock();
    } catch (err) {
      logger.error('Failed to get low stock items', err as Error, { 
        component: 'useInventoryItems' 
      });
      throw err;
    }
  };

  const searchItems = async (query: string) => {
    try {
      return await InventoryAPI.search(query);
    } catch (err) {
      logger.error('Failed to search inventory', err as Error, { 
        component: 'useInventoryItems',
        query 
      });
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    updateStock,
    getLowStock,
    searchItems,
  };
}

// Type definitions for additional hooks
interface InventoryLevel {
  id: string;
  item_name: string;
  current_level: number;
  min_level: number;
  max_level: number;
  unit: string;
  restaurant_id: string;
}

interface InventoryTransaction {
  id: string;
  location_id: string;
  item_id: string;
  quantity: number;
  transaction_type: string;
  transaction_date: string;
  notes?: string;
}

// Inventory levels hook with supabase integration
export function useInventoryLevels(restaurantId: string) {
  const [levels, setLevels] = useState<InventoryLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLevels = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('inventory_levels_current')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('item_name');

      if (fetchError) throw fetchError;
      setLevels(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  return { levels, loading, error, refetch: fetchLevels };
}

export function useInventoryTransactions(locationId: string, limit = 50) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('inventory_transactions')
        .select('*')
        .eq('location_id', locationId)
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;
      setTransactions(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [locationId, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (transaction: Partial<InventoryTransaction>) => {
    const { data, error: createError } = await supabase
      .from('inventory_transactions')
      .insert([{ ...transaction, location_id: locationId }])
      .select()
      .single();

    if (createError) throw createError;
    await fetchTransactions();
    return data;
  };

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
  };
}
