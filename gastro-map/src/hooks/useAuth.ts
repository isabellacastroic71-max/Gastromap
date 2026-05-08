// ============================================================
// HOOK DE AUTENTICACIÓN — Gastro Map
// Requerimiento 1: Autenticación con Supabase.
// Escucha los cambios de sesión en tiempo real y expone
// el estado del usuario para toda la app.
// ============================================================

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener la sesión actual al montar el hook
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Suscribirse a cambios de autenticación (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Limpiar suscripción al desmontar
    return () => subscription.unsubscribe();
  }, []);

  /**
   * Cierra sesión en Supabase y limpia el estado local.
   * Requerimiento 1: "Cerrar sesión → redirigir al Login".
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signOut };
}
