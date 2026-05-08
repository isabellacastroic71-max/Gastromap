// ============================================================
// TANSTACK QUERY CLIENT — Gastro Map
// Adicional: TanStack Query para gestión de estado del servidor
// Centraliza el caché y las peticiones a Supabase.
// ============================================================

import { QueryClient } from "@tanstack/react-query";

/**
 * QueryClient de TanStack Query.
 * - staleTime: 1 min — los datos se consideran frescos por 1 minuto
 * - retry: 2 — reintenta las peticiones fallidas 2 veces
 * - refetchOnWindowFocus: false — no re-fetches al volver a la app
 *   (en móvil esto puede ser agresivo, preferimos control manual)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minuto
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
