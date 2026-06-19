import { createClient } from '@supabase/supabase-js'

// TODO: Reemplazar con tus credenciales reales de Supabase
const supabaseUrl = 'https://tudominio.supabase.co'
const supabaseAnonKey = 'TU_CLAVE_ANONIMA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
