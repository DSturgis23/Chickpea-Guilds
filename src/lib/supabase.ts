import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Supabase is optional during the scaffold phase. When these env vars are absent
// the app runs entirely on seed data (see src/data/seed.ts). Once the real
// project keys are in .env, `isSupabaseConfigured` flips to true and the data
// layer can start issuing real queries.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
