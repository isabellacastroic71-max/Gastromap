// ============================================================
// TIPOS TYPESCRIPT — Gastro Map
// Requerimiento: Tipado TypeScript del tipo Dish
// ============================================================

/**
 * Tipo principal de un plato registrado por el usuario.
 * Contiene todos los campos requeridos por el examen.
 */
export type Dish = {
  id: string;
  user_id: string;
  name: string;
  photo_uri: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
};

/**
 * Datos del formulario de registro de plato.
 * Utilizado con React Hook Form + Zod.
 */
export type DishFormData = {
  name: string;
};

/**
 * Payload para insertar un nuevo plato en Supabase.
 * Omite los campos generados automáticamente (id, created_at).
 */
export type DishInsert = Omit<Dish, "id" | "created_at">;
