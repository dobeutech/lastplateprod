import { useState, useEffect } from 'react';
import { InventoryAPI, InventoryItem as APIInventoryItem, CreateInventoryItemInput } from '@/lib/api/inventory';
import { logger } from '@/lib/logger';

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
      .single();

    if (updateError) throw updateError;
    await fetchItems();
    return data;
  };

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    createItem,
    updateItem,
  };
}

export function useInventoryLevels(restaurantId: string) {
  const [levels, setLevels] = useState<InventoryLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchLevels();
  }, [restaurantId]);

  const fetchLevels = async () => {
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
  };

  return { levels, loading, error, refetch: fetchLevels };
}

export function useInventoryTransactions(locationId: string, limit = 50) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, [locationId]);

  const fetchTransactions = async () => {
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
  };

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
