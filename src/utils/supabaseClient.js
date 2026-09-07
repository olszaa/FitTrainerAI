import { createClient } from '@supabase/supabase-js';

// Helper to retrieve Supabase URL and Anon Key strictly from .env (import.meta.env)
export const getSupabaseConfig = () => {
  const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  return { url, key };
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return Boolean(
    url &&
    key &&
    url.startsWith('http') &&
    !url.includes('your-supabase-project') &&
    !key.includes('your-supabase-anon-key')
  );
};

let supabaseInstance = null;

export const initSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (isSupabaseConfigured()) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        }
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      supabaseInstance = null;
      return null;
    }
  }
  supabaseInstance = null;
  return null;
};

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
};

// Initialize on module load
initSupabaseClient();
