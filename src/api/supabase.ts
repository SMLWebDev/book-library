import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// For production

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)


// For development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL_DEV
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY_DEV

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)