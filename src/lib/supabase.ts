import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Center {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  google_apps_script_url: string;
  n8n_webhook_url: string;
  created_at: string;
  updated_at: string;
}
