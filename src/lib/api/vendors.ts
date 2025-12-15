import { supabase } from '../supabase';
import { logger } from '../logger';
import { handleSupabaseError } from '../api-client';

export interface Vendor {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country: string;
  rating: number;
  delivery_time_avg: number;
  payment_terms?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVendorInput {
  name: string;
  contact_name?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  payment_terms?: string;
  tax_id?: string;
  website?: string;
  notes?: string;
  categories?: string[];
}

export interface UpdateVendorInput extends Partial<CreateVendorInput> {
  id: string;
}

export class VendorsAPI {
  static async getAll(): Promise<Vendor[]> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch vendors', error as Error, { component: 'VendorsAPI' });
      throw error;
    }
  }

  static async getById(id: string): Promise<Vendor | null> {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleSupabaseError(error);

      return data;
    } catch (error) {
      logger.error('Failed to fetch vendor', error as Error, { 
        component: 'VendorsAPI',
        vendorId: id 
      });
      throw error;
    }
  }

  static async create(input: CreateVendorInput): Promise<Vendor> {
    try {
      const { categories, ...vendorData } = input;

      const { data, error } = await supabase
        .from('vendors')
        .insert([vendorData])
        .select()
        .single();

      if (error) handleSupabaseError(error);

      // Add categories if provided
      if (categories && categories.length > 0) {
        await this.updateCategories(data.id, categories);
      }

      logger.audit('Vendor created', {
        vendorId: data.id,
        vendorName: data.name,
      });

      return data;
    } catch (error) {
      logger.error('Failed to create vendor', error as Error, { 
        component: 'VendorsAPI',
        name: input.name 
      });
      throw error;
    }
  }

  static async update(input: UpdateVendorInput): Promise<Vendor> {
    try {
      const { id, categories, ...updates } = input;

      const { data, error } = await supabase
        .from('vendors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      // Update categories if provided
      if (categories) {
        await this.updateCategories(id, categories);
      }

      logger.audit('Vendor updated', {
        vendorId: id,
        updates: Object.keys(updates),
      });

      return data;
    } catch (error) {
      logger.error('Failed to update vendor', error as Error, { 
        component: 'VendorsAPI',
        vendorId: input.id 
      });
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('vendors')
        .update({ is_active: false })
        .eq('id', id);

      if (error) handleSupabaseError(error);

      logger.audit('Vendor deactivated', { vendorId: id });
    } catch (error) {
      logger.error('Failed to delete vendor', error as Error, { 
        component: 'VendorsAPI',
        vendorId: id 
      });
      throw error;
    }
  }

  private static async updateCategories(vendorId: string, categories: string[]): Promise<void> {
    // Delete existing categories
    await supabase
      .from('vendor_categories')
      .delete()
      .eq('vendor_id', vendorId);

    // Insert new categories
    if (categories.length > 0) {
      const categoryRecords = categories.map(category => ({
        vendor_id: vendorId,
        category,
      }));

      await supabase
        .from('vendor_categories')
        .insert(categoryRecords);
    }
  }
}
