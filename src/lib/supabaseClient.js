import { createClient } from '@supabase/supabase-js';

// Read from Vite environment or user-configured localStorage override
const envUrl = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_URL) || (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_URL) || '';
const envAnonKey = (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_SUPABASE_ANON_KEY) || (typeof process !== 'undefined' && process?.env?.VITE_SUPABASE_ANON_KEY) || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('CAMPUSBITE_SUPABASE_URL') : null;
const localAnonKey = typeof window !== 'undefined' ? localStorage.getItem('CAMPUSBITE_SUPABASE_ANON_KEY') : null;

export const supabaseUrl = (localUrl && localUrl.trim() !== '') ? localUrl.trim() : (envUrl && envUrl.trim() !== '' ? envUrl.trim() : '');
export const supabaseAnonKey = (localAnonKey && localAnonKey.trim() !== '') ? localAnonKey.trim() : (envAnonKey && envAnonKey.trim() !== '' ? envAnonKey.trim() : '');

// Check if credentials look like a valid real Supabase setup
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.includes('.supabase.co') &&
  supabaseAnonKey &&
  supabaseAnonKey.length > 20 &&
  !supabaseUrl.includes('your-project-ref')
);

export let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    console.log('[CampusBite Supabase] Initialized with live project:', supabaseUrl);
  } catch (err) {
    console.error('[CampusBite Supabase] Initialization failed:', err);
    supabase = null;
  }
} else {
  console.info('[CampusBite Supabase] Running in local resilient mode. Live Supabase credentials not set or using placeholder.');
}

/**
 * Test live connection to Supabase database
 */
export async function testSupabaseConnection() {
  if (!supabase) {
    return { ok: false, error: 'Supabase client not initialized. Check URL and Anon Key.' };
  }
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) throw error;
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message || 'Unable to connect to Supabase.' };
  }
}

/**
 * Save user credentials to localStorage and reload client
 */
export function saveCustomSupabaseConfig(url, key) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('CAMPUSBITE_SUPABASE_URL', url.trim());
    localStorage.setItem('CAMPUSBITE_SUPABASE_ANON_KEY', key.trim());
    window.location.reload();
  }
}

/**
 * Clear custom credentials from localStorage
 */
export function clearCustomSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('CAMPUSBITE_SUPABASE_URL');
    localStorage.removeItem('CAMPUSBITE_SUPABASE_ANON_KEY');
    window.location.reload();
  }
}
