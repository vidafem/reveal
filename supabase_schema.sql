-- ==============================================================
-- SCRIPT SQL PARA CREACIÓN DE TABLAS EN SUPABASE
-- Ejecuta este script en el editor de SQL (SQL Editor) de tu dashboard de Supabase
-- ==============================================================

-- 1. Crear la tabla de invitaciones y predicciones
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    prediction VARCHAR(10) CHECK (prediction IN ('boy', 'girl')),
    confirmed_attendance BOOLEAN DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar seguridad de filas (RLS)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para permitir operaciones públicas basadas en la Anon Key
-- Esto permite lectura y escritura desde la aplicación web directamente sin necesidad de backend privado

-- Política: Permitir a cualquiera ver el conteo de predicciones y confirmaciones
CREATE POLICY "Permitir lectura pública" 
ON public.invitations 
FOR SELECT 
USING (true);

-- Política: Permitir a los invitados votar y registrarse
CREATE POLICY "Permitir inserción pública" 
ON public.invitations 
FOR INSERT 
WITH CHECK (true);

-- Política: Permitir a los invitados actualizar su voto o confirmación de asistencia
CREATE POLICY "Permitir actualización pública" 
ON public.invitations 
FOR UPDATE 
USING (true);
