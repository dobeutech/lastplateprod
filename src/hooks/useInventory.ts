import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InventoryItem, InventoryLevel, InventoryTransaction } from '@/lib/vendor-types';

export function useInventoryItems(restaurantId: string) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchItems();
  }, [restaurantId]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_active', true)
        .order('item_name');

      if (fetchError) throw fetchError;
      setItems(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item: Partial<InventoryItem>) => {
    const { data, error: createError } = await supabase
      .from('inventory_items')
      .insert([{ ...item, restaurant_id: restaurantId }])
      .select()
      .single();

    if (createError) throw createError;
    await fetchItems();
    return data;
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const { data, error: updateError } = await supabase
      .from('inventory_items')
      .update(updates)
      .eq('id', id)
      .select()
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
