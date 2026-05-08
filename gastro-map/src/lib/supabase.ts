// ============================================================
// CLIENTE SUPABASE — Gastro Map
// Las credenciales se leen desde .env (NUNCA hardcodeadas)
// Requerimiento: credenciales en .env + .gitignore
// ============================================================

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Variables de entorno cargadas por Expo (prefijo EXPO_PUBLIC_)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase. Revisa tu archivo .env"
  );
}

/**
 * Cliente Supabase configurado con AsyncStorage para
 * persistir la sesión del usuario entre reinicios de la app.
 * Requerimiento 1: Autenticación con Supabase
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
