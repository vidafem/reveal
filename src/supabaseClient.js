import { createClient } from '@supabase/supabase-js'

// Lee las credenciales de las variables de entorno de Vite (.env o panel de Vercel)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tudominio.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'TU_CLAVE_ANONIMA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
