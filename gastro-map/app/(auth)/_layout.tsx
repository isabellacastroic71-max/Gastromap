// ============================================================
// AUTH GROUP LAYOUT — Gastro Map
// Agrupa las pantallas de autenticación (Login y Registro).
// Requerimiento 1: pantallas de Login y Registro con Supabase Auth.
// ============================================================

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Ocultamos el header nativo, usamos el propio
        contentStyle: { backgroundColor: "#F5F5F5" },
        animation: "slide_from_right",
      }}
    />
  );
}
