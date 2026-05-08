// ============================================================
// PANTALLA HOME — Gastro Map
// Requerimiento 2: Lista de platos cargada desde Supabase via TanStack Query.
// Requerimiento 4: animaciones de entrada/salida en las cards.
// Incluye botón de cierre de sesión.
// ============================================================

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useDishes, useDeleteDish } from "../../src/hooks/useDishes";
import { useAuth } from "../../src/hooks/useAuth";
import { DishCard } from "../../src/components/DishCard";
import type { Dish } from "../../src/types/dish";

export default function HomeScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  // TanStack Query: obtener platos del usuario autenticado
  // Adicional: TanStack Query maneja caché, loading y refetch
  const { data: dishes, isLoading, isError, refetch, isRefetching } = useDishes();

  // TanStack Query: mutación para eliminar plato con actualización optimista
  const { mutate: deleteDish } = useDeleteDish();

  /**
   * Cierra sesión y limpia la sesión de Supabase.
   * Requerimiento 1: "Cerrar sesión → redirigir al Login".
   * El AuthGate en _layout.tsx se encarga de la redirección automática.
   */
  const handleSignOut = () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que quieres salir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar sesión",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  /**
   * Elimina un plato por ID usando TanStack Query mutation.
   * Requerimiento 4: eliminación con swipe → animación FadeOutLeft.
   */
  const handleDelete = (id: string) => {
    deleteDish(id);
  };

  // Estado de carga inicial
  if (isLoading) {
    return (
      <View className="flex-1 bg-dominos-offwhite items-center justify-center">
        <ActivityIndicator size="large" color="#006491" />
        <Text className="text-dominos-gray mt-3">Cargando tus platos...</Text>
      </View>
    );
  }

  // Estado de error
  if (isError) {
    return (
      <View className="flex-1 bg-dominos-offwhite items-center justify-center px-8">
        <Text className="text-5xl mb-4">😕</Text>
        <Text className="text-dominos-darkgray font-bold text-lg text-center mb-2">
          Error al cargar
        </Text>
        <Text className="text-dominos-gray text-center mb-6">
          No pudimos obtener tus platos. Verifica tu conexión.
        </Text>
        <TouchableOpacity
          onPress={() => refetch()}
          className="bg-dominos-blue px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dominos-offwhite">
      {/* Header con paleta Domino's */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-dominos-blue pt-14 pb-4 px-5"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-blue-200 text-xs">Bienvenido</Text>
            <Text
              className="text-white font-bold text-lg"
              numberOfLines={1}
            >
              {user?.email?.split("@")[0] ?? "Chef"}
            </Text>
          </View>

          {/* Logo */}
          <View className="w-10 h-10 bg-dominos-red rounded-full items-center justify-center">
            <Text className="text-xl">🍕</Text>
          </View>

          {/* Botón cerrar sesión */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="ml-3 bg-dominos-darkblue px-3 py-2 rounded-lg"
          >
            <Text className="text-white text-xs font-medium">Salir</Text>
          </TouchableOpacity>
        </View>

        {/* Título y contador */}
        <View className="mt-3 flex-row items-baseline">
          <Text className="text-white text-2xl font-bold">Mis Platos</Text>
          {dishes && dishes.length > 0 && (
            <View className="ml-2 bg-dominos-red px-2 py-0.5 rounded-full">
              <Text className="text-white text-xs font-bold">
                {dishes.length}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Lista de platos */}
      <FlatList<Dish>
        data={dishes ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          // DishCard con animaciones Reanimated (FadeInDown + FadeOutLeft + swipe)
          <DishCard
            dish={item}
            onDelete={handleDelete}
            index={index}
          />
        )}
        contentContainerStyle={
          (!dishes || dishes.length === 0)
            ? { flex: 1, justifyContent: "center" }
            : { paddingTop: 16, paddingBottom: 100 }
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={["#006491"]}
            tintColor="#006491"
          />
        }
        ListEmptyComponent={
          // Estado vacío
          <View className="items-center justify-center px-8">
            <Text className="text-7xl mb-4">🍽️</Text>
            <Text className="text-dominos-darkgray font-bold text-xl text-center mb-2">
              ¡Registra tu primer plato!
            </Text>
            <Text className="text-dominos-gray text-center mb-8">
              Toca el botón rojo para agregar un plato con foto y ubicación GPS.
            </Text>
          </View>
        }
      />

      {/* FAB — Botón flotante para agregar plato */}
      {/* Requerimiento 3: acceder a la pantalla de registro de plato */}
      <Animated.View
        entering={FadeInDown.delay(400).springify()}
        className="absolute bottom-8 right-6"
      >
        <TouchableOpacity
          onPress={() => router.push("/(app)/add-dish")}
          className="w-16 h-16 bg-dominos-red rounded-full items-center justify-center shadow-lg"
          activeOpacity={0.85}
        >
          <Text className="text-white text-3xl font-light">+</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
