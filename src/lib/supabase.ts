import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://6dcbe7d4-9bd.db-pool-europe-west1.altan.ai';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjIwNzcwMzUyOTgsImlhdCI6MTc2MTY3NTI5OCwiaXNzIjoic3VwYWJhc2UiLCJyb2xlIjoiYW5vbiJ9.hG2EfspU7ZWZUr40JhSZHyB6n2c0jHhEktrwUyjVzg4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
