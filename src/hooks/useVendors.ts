import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Vendor, VendorPerformance } from '@/lib/vendor-types';

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;
      setVendors(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createVendor = async (vendor: Partial<Vendor>) => {
    const { data, error: createError } = await supabase
      .from('vendors')
      .insert([vendor])
      .select()
      .single();

    if (createError) throw createError;
    await fetchVendors();
    return data;
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    const { data, error: updateError } = await supabase
      .from('vendors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    await fetchVendors();
    return data;
  };

  const deleteVendor = async (id: string) => {
    const { error: deleteError } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    await fetchVendors();
  };

  return {
    vendors,
    loading,
    error,
    refetch: fetchVendors,
    createVendor,
    updateVendor,
    deleteVendor,
  };
}

export function useVendorPerformance(locationId?: string) {
  const [performance, setPerformance] = useState<VendorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPerformance();
  }, [locationId]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('vendor_performance_dashboard')
        .select('*');

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setPerformance(data || []);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { performance, loading, error, refetch: fetchPerformance };
}
