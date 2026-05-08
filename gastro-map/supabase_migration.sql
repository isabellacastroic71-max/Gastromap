-- ============================================================
-- MIGRACIÓN SUPABASE — Gastro Map
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla principal de platos (Dish)
-- Requerimiento 2: almacenamiento de platos por usuario
CREATE TABLE IF NOT EXISTS dishes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  photo_uri   TEXT,
  city        TEXT,
  country     TEXT,
  latitude    DOUBLE PRECISION,
  longitude   DOUBLE PRECISION,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para consultas rápidas por usuario
CREATE INDEX IF NOT EXISTS dishes_user_id_idx ON dishes(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- Garantiza que cada usuario solo accede a SUS propios platos
-- Requerimiento 2: "cada usuario solo acceda a sus propios datos"
-- ============================================================
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;

-- Política: solo el dueño puede ver sus platos
CREATE POLICY "Usuario ve solo sus platos"
  ON dishes FOR SELECT
  USING (auth.uid() = user_id);

-- Política: solo el dueño puede insertar platos
CREATE POLICY "Usuario inserta sus platos"
  ON dishes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: solo el dueño puede eliminar sus platos
CREATE POLICY "Usuario elimina sus platos"
  ON dishes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Storage bucket para imágenes de platos
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-photos', 'dish-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Política de storage: usuarios autenticados pueden subir fotos
CREATE POLICY "Usuarios autenticados suben fotos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'dish-photos');

-- Política de storage: fotos son públicas para lectura
CREATE POLICY "Fotos son públicas"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'dish-photos');

-- Política de storage: el dueño puede eliminar sus fotos
CREATE POLICY "Dueño elimina sus fotos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'dish-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
