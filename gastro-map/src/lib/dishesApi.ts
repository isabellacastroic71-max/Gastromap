// ============================================================
// API DE PLATOS — Gastro Map
// Funciones para interactuar con la tabla 'dishes' en Supabase.
// Usadas por los hooks de TanStack Query.
// ============================================================

import { supabase } from "./supabase";
import type { Dish, DishInsert } from "../types/dish";

/**
 * Obtiene todos los platos del usuario autenticado.
 * RLS de Supabase garantiza que solo se devuelven sus platos.
 * Requerimiento 2: cargar platos al abrir la pantalla Home.
 */
export async function fetchDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from("dishes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data as Dish[];
}

/**
 * Inserta un nuevo plato en Supabase.
 * La foto se sube primero al Storage, luego se guarda la URL.
 * Requerimiento 3: registrar plato con nombre, foto y GPS.
 */
export async function insertDish(
  payload: Omit<DishInsert, "user_id">
): Promise<Dish> {
  // Obtener el usuario actual de la sesión activa
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No hay sesión activa");

  const { data, error } = await supabase
    .from("dishes")
    .insert({ ...payload, user_id: user.id })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Dish;
}

/**
 * Elimina un plato por su ID.
 * Requerimiento 4: eliminar con swipe gesture.
 */
export async function deleteDish(id: string): Promise<void> {
  const { error } = await supabase.from("dishes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Sube una foto al Storage de Supabase y retorna la URL pública.
 * Las fotos se organizan por user_id para que las políticas de storage
 * funcionen correctamente.
 * Requerimiento 3: fotografía tomada con cámara o galería.
 */
export async function uploadDishPhoto(
  photoUri: string,
  userId: string
): Promise<string> {
  // Convertir la URI local a Blob para subir a Supabase Storage
  const response = await fetch(photoUri);
  const blob = await response.blob();

  const fileName = `${userId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("dish-photos")
    .upload(fileName, blob, { contentType: "image/jpeg", upsert: false });

  if (error) throw new Error(error.message);

  // Obtener la URL pública del archivo subido
  const { data } = supabase.storage
    .from("dish-photos")
    .getPublicUrl(fileName);

  return data.publicUrl;
}
