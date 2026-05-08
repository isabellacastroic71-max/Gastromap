// ============================================================
// PANTALLA AGREGAR PLATO — Gastro Map
// Requerimiento 3: registro de plato con:
//   - Nombre del plato (React Hook Form + Zod)
//   - Foto (cámara o galería, expo-image-picker)
//   - GPS automático en el momento de registrar (expo-location)
// Requerimiento 4: botón con efecto withSpring + estilos Nativewind
// ============================================================

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeIn,
} from "react-native-reanimated";
import { useAddDish } from "../../src/hooks/useDishes";
import { useAuth } from "../../src/hooks/useAuth";

// Esquema de validación del formulario
// Requerimiento 3: "ningún campo puede estar vacío"
const dishSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del plato es obligatorio")
    .max(100, "El nombre no puede exceder 100 caracteres"),
});

type DishFormData = z.infer<typeof dishSchema>;

export default function AddDishScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Estado local para la foto seleccionada
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  // Estado local para indicar si está capturando GPS
  const [loadingGps, setLoadingGps] = useState(false);

  // Mutación de TanStack Query para insertar el plato
  const { mutate: addDish, isPending } = useAddDish();

  // Animación de escala para el botón de registrar
  // Requerimiento 4: "botón de registro con efecto de escala withSpring"
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: { name: "" },
  });

  /**
   * Toma una foto con la cámara del dispositivo.
   * Requerimiento 3: "el usuario puede elegir entre cámara o galería".
   */
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a la cámara para fotografiar tus platos."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  /**
   * Selecciona una foto desde la galería del dispositivo.
   * Requerimiento 3: "el usuario puede elegir entre cámara o galería".
   */
  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos acceso a tu galería para seleccionar fotos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  /**
   * Muestra opciones de foto: cámara o galería.
   */
  const handlePhotoSelection = () => {
    Alert.alert("Seleccionar foto", "¿De dónde quieres tomar la foto?", [
      { text: "📷 Cámara", onPress: takePhoto },
      { text: "🖼️ Galería", onPress: pickFromGallery },
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  /**
   * Registra el plato: captura GPS en el momento, luego guarda.
   * Requerimiento 3: "el GPS debe capturar la ubicación en el momento de presionar Registrar".
   * Requerimiento 3: "ninguno de los campos puede estar vacío".
   */
  const onSubmit = async (data: DishFormData) => {
    // Validar que haya foto seleccionada
    if (!photoUri) {
      Alert.alert("Foto requerida", "Por favor, agrega una foto del plato.");
      return;
    }

    if (!user) {
      Alert.alert("Error", "No hay sesión activa.");
      return;
    }

    setLoadingGps(true);

    try {
      // Solicitar permiso de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permiso de ubicación denegado",
          "Necesitamos tu ubicación para registrar dónde disfrutaste este plato."
        );
        setLoadingGps(false);
        return;
      }

      // Obtener coordenadas GPS actuales
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Obtener nombre de ciudad con geocodificación inversa
      let city: string | null = null;
      let country: string | null = null;
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        city = geocode?.city ?? geocode?.subregion ?? null;
        country = geocode?.country ?? null;
      } catch {
        // Si la geocodificación falla, continuamos sin ciudad
      }

      setLoadingGps(false);

      // Llamar a la mutación de TanStack Query para guardar el plato
      addDish(
        {
          name: data.name,
          photoUri,
          city,
          country,
          latitude,
          longitude,
          userId: user.id,
        },
        {
          onSuccess: () => {
            // Requerimiento 3: "el formulario se limpia después de registrar"
            reset();
            setPhotoUri(null);
            // Volver a la pantalla Home con el nuevo plato en la lista
            router.back();
          },
          onError: (error) => {
            Alert.alert(
              "Error al guardar",
              error instanceof Error ? error.message : "Error desconocido"
            );
          },
        }
      );
    } catch (error) {
      setLoadingGps(false);
      Alert.alert("Error de GPS", "No se pudo obtener tu ubicación.");
    }
  };

  const isSubmitting = isPending || loadingGps;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dominos-offwhite"
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        className="bg-dominos-blue pt-14 pb-5 px-5 flex-row items-center"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 bg-dominos-darkblue rounded-full items-center justify-center mr-3"
        >
          <Text className="text-white font-bold">←</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-white text-xl font-bold">Nuevo Plato</Text>
          <Text className="text-blue-200 text-xs">
            Registra lo que estás comiendo
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de foto */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          className="mx-4 mt-5"
        >
          <Text className="text-dominos-gray text-sm font-medium mb-2">
            📸 Foto del plato *
          </Text>

          <TouchableOpacity
            onPress={handlePhotoSelection}
            className="bg-white border-2 border-dashed border-dominos-lightgray rounded-2xl overflow-hidden"
            activeOpacity={0.8}
          >
            {photoUri ? (
              // Preview de la foto seleccionada
              <Animated.View entering={FadeIn.duration(300)}>
                <Image
                  source={{ uri: photoUri }}
                  className="w-full h-52"
                  resizeMode="cover"
                />
                <View className="absolute bottom-0 left-0 right-0 bg-black/40 py-2 items-center">
                  <Text className="text-white text-xs font-medium">
                    Toca para cambiar la foto
                  </Text>
                </View>
              </Animated.View>
            ) : (
              // Placeholder sin foto
              <View className="h-52 items-center justify-center">
                <Text className="text-5xl mb-3">🍽️</Text>
                <Text className="text-dominos-blue font-bold text-base">
                  Agregar foto
                </Text>
                <Text className="text-dominos-gray text-xs mt-1">
                  Cámara o galería
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Botones de cámara y galería */}
          <View className="flex-row mt-2 gap-2">
            <TouchableOpacity
              onPress={takePhoto}
              className="flex-1 bg-dominos-blue py-3 rounded-xl items-center flex-row justify-center"
            >
              <Text className="text-white mr-1">📷</Text>
              <Text className="text-white text-sm font-medium">Cámara</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={pickFromGallery}
              className="flex-1 bg-dominos-lightgray py-3 rounded-xl items-center flex-row justify-center"
            >
              <Text className="text-dominos-darkgray mr-1">🖼️</Text>
              <Text className="text-dominos-darkgray text-sm font-medium">
                Galería
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Campo nombre del plato */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          className="mx-4 mt-5"
        >
          <Text className="text-dominos-gray text-sm font-medium mb-2">
            🍴 Nombre del plato *
          </Text>
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, value } }) => (
              <TextInput
                className={`bg-white border rounded-xl px-4 py-4 text-dominos-darkgray text-base ${
                  errors.name
                    ? "border-dominos-red"
                    : "border-dominos-lightgray"
                }`}
                placeholder="Ej: Bandeja paisa, Ceviche, Tacos..."
                placeholderTextColor="#9CA3AF"
                value={value}
                onChangeText={onChange}
                returnKeyType="done"
              />
            )}
          />
          {errors.name && (
            <Text className="text-dominos-red text-xs mt-1">
              {errors.name.message}
            </Text>
          )}
        </Animated.View>

        {/* Info de GPS */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <View className="flex-row items-center">
            <Text className="text-xl mr-3">📍</Text>
            <View className="flex-1">
              <Text className="text-dominos-blue font-bold text-sm">
                Ubicación automática
              </Text>
              <Text className="text-dominos-gray text-xs mt-0.5">
                Las coordenadas GPS y ciudad se capturarán automáticamente al
                registrar el plato.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Botón registrar con withSpring */}
        {/* Requerimiento 4: "botón de registro con efecto de escala withSpring" */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="mx-4 mt-8"
        >
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              onPressIn={() => {
                buttonScale.value = withSpring(0.96);
              }}
              onPressOut={() => {
                buttonScale.value = withSpring(1);
              }}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="bg-dominos-red rounded-2xl py-5 items-center shadow-md"
              activeOpacity={1}
            >
              {isSubmitting ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white font-bold ml-2">
                    {loadingGps ? "Capturando GPS..." : "Guardando..."}
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-white text-xl mr-2">🍕</Text>
                  <Text className="text-white font-bold text-lg">
                    Registrar Plato
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text className="text-dominos-gray text-xs text-center mt-3">
            * Todos los campos son obligatorios
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
