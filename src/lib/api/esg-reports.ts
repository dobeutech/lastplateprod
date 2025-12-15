import { supabase } from '../supabase';
import { logger } from '../logger';
import { handleSupabaseError } from '../api-client';

export interface ESGReport {
  id: string;
  location_id: string;
  report_period_start: string;
  report_period_end: string;
  report_type: 'monthly' | 'quarterly' | 'annual';
  food_waste_kg: number;
  food_waste_cost: number;
  energy_consumption_kwh: number;
  water_consumption_gallons: number;
  recycling_rate: number;
  employee_count: number;
  training_hours: number;
  safety_incidents: number;
  compliance_score: number;
  audit_findings: number;
  notes?: string;
  generated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateESGReportInput {
  location_id: string;
  report_period_start: string;
  report_period_end: string;
  report_type: 'monthly' | 'quarterly' | 'annual';
  food_waste_kg?: number;
  food_waste_cost?: number;
  energy_consumption_kwh?: number;
  water_consumption_gallons?: number;
  recycling_rate?: number;
  employee_count?: number;
  training_hours?: number;
  safety_incidents?: number;
  compliance_score?: number;
  audit_findings?: number;
  notes?: string;
}

export interface UpdateESGReportInput extends Partial<CreateESGReportInput> {
  id: string;
}

export class ESGReportsAPI {
  static async getAll(): Promise<ESGReport[]> {
    try {
      const { data, error } = await supabase
        .from('esg_reports')
        .select('*')
        .order('report_period_start', { ascending: false });

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch ESG reports', error as Error, { 
        component: 'ESGReportsAPI' 
      });
      throw error;
    }
  }

  static async getById(id: string): Promise<ESGReport | null> {
    try {
      const { data, error } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleSupabaseError(error);

      return data;
    } catch (error) {
      logger.error('Failed to fetch ESG report', error as Error, { 
        component: 'ESGReportsAPI',
        reportId: id 
      });
      throw error;
    }
  }

  static async getByLocation(locationId: string): Promise<ESGReport[]> {
    try {
      const { data, error } = await supabase
        .from('esg_reports')
        .select('*')
        .eq('location_id', locationId)
        .order('report_period_start', { ascending: false });

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch ESG reports by location', error as Error, { 
        component: 'ESGReportsAPI',
        locationId 
      });
      throw error;
    }
  }

  static async getByPeriod(startDate: string, endDate: string): Promise<ESGReport[]> {
    try {
      const { data, error } = await supabase
        .from('esg_reports')
        .select('*')
        .gte('report_period_start', startDate)
        .lte('report_period_end', endDate)
        .order('report_period_start', { ascending: false });

      if (error) handleSupabaseError(error);

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch ESG reports by period', error as Error, { 
        component: 'ESGReportsAPI',
        startDate,
        endDate 
      });
      throw error;
    }
  }

  static async create(input: CreateESGReportInput): Promise<ESGReport> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('esg_reports')
        .insert([{
          ...input,
          generated_by: user.id,
        }])
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('ESG report created', {
        userId: user.id,
        reportId: data.id,
        reportType: data.report_type,
      });

      return data;
    } catch (error) {
      logger.error('Failed to create ESG report', error as Error, { 
        component: 'ESGReportsAPI' 
      });
      throw error;
    }
  }

  static async update(input: UpdateESGReportInput): Promise<ESGReport> {
    try {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('esg_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) handleSupabaseError(error);

      logger.audit('ESG report updated', {
        reportId: id,
        updates: Object.keys(updates),
      });

      return data;
    } catch (error) {
      logger.error('Failed to update ESG report', error as Error, { 
        component: 'ESGReportsAPI',
        reportId: input.id 
      });
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('esg_reports')
        .delete()
        .eq('id', id);

      if (error) handleSupabaseError(error);

      logger.audit('ESG report deleted', { reportId: id });
    } catch (error) {
      logger.error('Failed to delete ESG report', error as Error, { 
        component: 'ESGReportsAPI',
        reportId: id 
      });
      throw error;
    }
  }

  static async calculateMetrics(locationId: string, startDate: string, endDate: string) {
    // This would calculate metrics from various sources
    // For now, return placeholder data
    return {
      food_waste_kg: 0,
      food_waste_cost: 0,
      energy_consumption_kwh: 0,
      water_consumption_gallons: 0,
      recycling_rate: 0,
      employee_count: 0,
      training_hours: 0,
      safety_incidents: 0,
      compliance_score: 0,
      audit_findings: 0,
    };
  }
}
