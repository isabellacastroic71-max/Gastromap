// ============================================================
// ROOT LAYOUT — Gastro Map
// Configura los providers globales:
// - QueryClientProvider: TanStack Query (Adicional +10 pts)
// - GestureHandlerRootView: react-native-gesture-handler (swipe)
// ============================================================

import "../global.css";
import { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/lib/queryClient";
import { useAuth } from "../src/hooks/useAuth";
import { StatusBar } from "expo-status-bar";

/**
 * Componente interno que maneja la navegación según el estado de auth.
 * Requerimiento 1: "Navegación automática al Home / Login según el estado".
 */
function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (user && inAuthGroup) {
      // Usuario autenticado intentando acceder a pantallas de auth → redirigir a Home
      router.replace("/(app)/home");
    } else if (!user && !inAuthGroup) {
      // Usuario no autenticado intentando acceder a pantallas protegidas → Login
      router.replace("/(auth)/login");
    }
  }, [user, loading, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    // GestureHandlerRootView es requerido por react-native-gesture-handler
    // Requerimiento 4: swipe con gesture handler
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* QueryClientProvider habilita TanStack Query en toda la app */}
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="#006491" />
        <AuthGate />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
