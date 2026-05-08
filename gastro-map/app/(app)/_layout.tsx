// ============================================================
// APP GROUP LAYOUT — Gastro Map
// Pantallas protegidas (solo accesibles con sesión activa).
// Requerimiento 1: navegación automática según estado de auth.
// ============================================================

import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#F5F5F5" },
        animation: "slide_from_right",
      }}
    />
  );
}
