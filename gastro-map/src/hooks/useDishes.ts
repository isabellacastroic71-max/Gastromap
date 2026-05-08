// ============================================================
// HOOKS TANSTACK QUERY — Gastro Map
// Adicional (10 pts): TanStack Query para gestión de datos.
// useDishes: obtiene la lista de platos con caché automático.
// useAddDish: mutación para agregar un plato.
// useDeleteDish: mutación para eliminar un plato.
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDishes, insertDish, deleteDish, uploadDishPhoto } from "../lib/dishesApi";
import type { Dish } from "../types/dish";

// Clave de caché para TanStack Query — identifica la lista de platos
export const DISHES_KEY = ["dishes"] as const;

/**
 * Hook para obtener la lista de platos del usuario.
 * TanStack Query maneja el caché, loading y error states automáticamente.
 * Requerimiento 2: cargar platos al abrir la pantalla Home.
 */
export function useDishes() {
  return useQuery({
    queryKey: DISHES_KEY,
    queryFn: fetchDishes,
  });
}

/**
 * Hook de mutación para agregar un plato.
 * Al tener éxito, invalida el caché de 'dishes' para forzar
 * un re-fetch y mostrar el nuevo plato en la lista.
 * Requerimiento 2: "Al agregar un plato, debe aparecer al inicio de la lista".
 */
export function useAddDish() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      name: string;
      photoUri: string | null;
      city: string | null;
      country: string | null;
      latitude: number | null;
      longitude: number | null;
      userId: string;
    }) => {
      // Si hay foto, subirla primero al Storage de Supabase
      let finalPhotoUri: string | null = null;
      if (params.photoUri) {
        finalPhotoUri = await uploadDishPhoto(params.photoUri, params.userId);
      }

      return insertDish({
        name: params.name,
        photo_uri: finalPhotoUri,
        city: params.city,
        country: params.country,
        latitude: params.latitude,
        longitude: params.longitude,
      });
    },
    onSuccess: (newDish: Dish) => {
      // Actualización optimista: insertar al inicio del caché local
      // antes de que llegue el re-fetch del servidor
      qc.setQueryData<Dish[]>(DISHES_KEY, (old) =>
        old ? [newDish, ...old] : [newDish]
      );
    },
    onError: () => {
      // En caso de error, invalidar el caché para sincronizar con la BD
      qc.invalidateQueries({ queryKey: DISHES_KEY });
    },
  });
}

/**
 * Hook de mutación para eliminar un plato.
 * Usa actualización optimista: elimina del caché local antes
 * de confirmar con Supabase para una UX más fluida.
 * Requerimiento 4: eliminar con swipe gesture.
 */
export function useDeleteDish() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteDish,
    onMutate: async (id: string) => {
      // Cancelar queries en curso para evitar sobrescribir el optimistic update
      await qc.cancelQueries({ queryKey: DISHES_KEY });

      // Guardar snapshot del estado anterior para revertir en caso de error
      const previous = qc.getQueryData<Dish[]>(DISHES_KEY);

      // Actualización optimista: quitar el plato del caché inmediatamente
      qc.setQueryData<Dish[]>(DISHES_KEY, (old) =>
        old ? old.filter((d) => d.id !== id) : []
      );

      return { previous };
    },
    onError: (_err, _id, context) => {
      // Revertir al estado anterior si la eliminación falla
      if (context?.previous) {
        qc.setQueryData(DISHES_KEY, context.previous);
      }
    },
    onSettled: () => {
      // Sincronizar con Supabase una vez que la mutación termine
      qc.invalidateQueries({ queryKey: DISHES_KEY });
    },
  });
}
