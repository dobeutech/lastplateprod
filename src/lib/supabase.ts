import { createClient } from '@supabase/supabase-js';
import { config } from './config';

const url = config.supabaseUrl || 'https://placeholder.supabase.co';
const key = config.supabaseAnonKey || 'placeholder';

export const supabase = createClient(url, key);
