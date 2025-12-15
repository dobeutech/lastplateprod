import { supabase } from '../supabase';
import { logger } from '../logger';
import { handleSupabaseError } from '../api-client';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  country: string;
  phone?: string;
  email?: string;
  manager_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateLocationInput {
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  manager_id?: string;
}

export interface UpdateLocationInput extends Partial<CreateLocationInput> {
  id: string;
}

export class LocationsAPI {
  static async getAll(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch locations', error as Error, { 
        component: 'LocationsAPI' 
      });
      throw error;
    }
  }

  static async getById(id: string): Promise<Location | null> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleSupabaseError(error);

      return data;
    } catch (error) {
      logger.error('Failed to fetch location', error as Error, { 
        component: 'LocationsAPI',
        locationId: id 
      });
      throw error;
    }
  }

  static async getUserLocation(): Promise<Location | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: userData } = await supabase
        .from('users')
        .select('location_id')
        .eq('id', user.id)
        .single();

      if (!userData?.location_id) return null;

      return await this.getById(userData.location_id);
    } catch (error) {
      logger.error('Failed to fetch user location', error as Error, { 
        component: 'LocationsAPI' 
      });
      throw error;
    }
  }

  static async create(input: CreateLocationInput): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          ...input,
          country: input.country || 'US',
        }])
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('Location created', {
        locationId: data.id,
        locationName: data.name,
      });

      return data;
    } catch (error) {
      logger.error('Failed to create location', error as Error, { 
        component: 'LocationsAPI',
        name: input.name 
      });
      throw error;
    }
  }

  static async update(input: UpdateLocationInput): Promise<Location> {
    try {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('locations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('Location updated', {
        locationId: id,
        updates: Object.keys(updates),
      });

      return data;
    } catch (error) {
      logger.error('Failed to update location', error as Error, { 
        component: 'LocationsAPI',
        locationId: input.id 
      });
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .update({ is_active: false })
        .eq('id', id);

      if (error) handleSupabaseError(error);

      logger.audit('Location deactivated', { locationId: id });
    } catch (error) {
      logger.error('Failed to delete location', error as Error, { 
        component: 'LocationsAPI',
        locationId: id 
      });
      throw error;
    }
  }
}
