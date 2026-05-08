// ============================================================
// COMPONENTE DISHCARD — Gastro Map
// Requerimiento 4: animaciones con Reanimated:
//   - FadeInDown: animación de entrada al agregarse
//   - FadeOutLeft: animación de salida al eliminarse
//   - Swipe horizontal con GestureHandler + useAnimatedStyle
// ============================================================

import { View, Text, Image, TouchableOpacity, Dimensions } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import type { Dish } from "../types/dish";

const SCREEN_WIDTH = Dimensions.get("window").width;
// Umbral de swipe: si pasa el 35% del ancho, se elimina
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

interface DishCardProps {
  dish: Dish;
  onDelete: (id: string) => void;
  index: number;
}

/**
 * Card de plato con:
 * - Animación de entrada FadeInDown (escalonada por índice)
 * - Animación de salida FadeOutLeft al eliminar
 * - Swipe horizontal izquierda para borrar
 * Requerimiento 4: todos los estilos con Nativewind (sin StyleSheet)
 */
export function DishCard({ dish, onDelete, index }: DishCardProps) {
  // Valor compartido para el desplazamiento horizontal del swipe
  const translateX = useSharedValue(0);
  // Valor compartido para la opacidad durante el swipe
  const opacity = useSharedValue(1);

  /**
   * Función que ejecuta la eliminación en el thread JS.
   * runOnJS es necesario porque onDelete es una función JS
   * llamada desde el thread de UI de Reanimated.
   */
  const handleDelete = (id: string) => {
    onDelete(id);
  };

  // Gesto de deslizamiento horizontal
  // Requerimiento 4: "swipe con react-native-gesture-handler y useAnimatedStyle"
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((event) => {
      // Solo permitir swipe hacia la izquierda
      if (event.translationX < 0) {
        translateX.value = event.translationX;
        // Reducir opacidad progresivamente al deslizar
        opacity.value = 1 + event.translationX / (SCREEN_WIDTH * 0.5);
      }
    })
    .onEnd((event) => {
      if (event.translationX < -SWIPE_THRESHOLD) {
        // Supera el umbral → animar fuera de pantalla y eliminar
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 250 }, () => {
          runOnJS(handleDelete)(dish.id);
        });
        opacity.value = withTiming(0, { duration: 250 });
      } else {
        // No supera el umbral → volver a posición original
        translateX.value = withSpring(0);
        opacity.value = withSpring(1);
      }
    });

  // Estilo animado para el desplazamiento y opacidad
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  // Estilo del indicador rojo de "eliminar" que aparece detrás de la card
  const deleteIndicatorStyle = useAnimatedStyle(() => ({
    opacity: Math.min(1, Math.abs(translateX.value) / SWIPE_THRESHOLD),
  }));

  return (
    // Animación de entrada escalonada por índice
    // Requerimiento 4: "animación de entrada FadeInDown o similar"
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      exiting={FadeOutLeft.duration(300)}
      className="mb-3 mx-4"
    >
      {/* Indicador de eliminar (visible al deslizar) */}
      <Animated.View
        style={deleteIndicatorStyle}
        className="absolute inset-0 bg-dominos-red rounded-2xl items-center justify-end flex-row pr-6"
      >
        <Text className="text-white font-bold text-sm">🗑️ Eliminar</Text>
      </Animated.View>

      {/* Card principal con swipe gesture */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={animatedStyle}
          className="bg-white rounded-2xl overflow-hidden shadow-sm border border-dominos-lightgray"
        >
          <View className="flex-row">
            {/* Imagen del plato */}
            {dish.photo_uri ? (
              <Image
                source={{ uri: dish.photo_uri }}
                className="w-28 h-28"
                resizeMode="cover"
              />
            ) : (
              <View className="w-28 h-28 bg-dominos-offwhite items-center justify-center">
                <Text className="text-4xl">🍽️</Text>
              </View>
            )}

            {/* Info del plato */}
            <View className="flex-1 p-4 justify-between">
              <View>
                <Text
                  className="text-dominos-darkgray font-bold text-base"
                  numberOfLines={2}
                >
                  {dish.name}
                </Text>

                {/* Ubicación GPS */}
                {(dish.city || dish.country) && (
                  <View className="flex-row items-center mt-1">
                    <Text className="text-xs mr-1">📍</Text>
                    <Text
                      className="text-dominos-gray text-xs flex-1"
                      numberOfLines={1}
                    >
                      {[dish.city, dish.country].filter(Boolean).join(", ")}
                    </Text>
                  </View>
                )}

                {/* Coordenadas GPS */}
                {dish.latitude && dish.longitude && (
                  <Text className="text-dominos-lightgray text-xs mt-1">
                    {dish.latitude.toFixed(4)}, {dish.longitude.toFixed(4)}
                  </Text>
                )}
              </View>

              {/* Fecha */}
              <Text className="text-dominos-gray text-xs">
                {new Date(dish.created_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            </View>

            {/* Indicador de swipe */}
            <View className="w-8 items-center justify-center bg-dominos-offwhite">
              <Text className="text-dominos-lightgray text-xs">←</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
}
