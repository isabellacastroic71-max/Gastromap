// ============================================================
// PANTALLA DE REGISTRO — Gastro Map
// Requerimiento 1: Registro con email, contraseña y confirmación.
// Validación de contraseñas antes de enviar con Zod + React Hook Form.
// ============================================================

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { supabase } from "../../src/lib/supabase";

// Esquema con validación de contraseñas coincidentes
// Requerimiento 1: "Validación de que las contraseñas coinciden"
const registerSchema = z
  .object({
    email: z.string().email("Ingresa un email válido"),
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Animación de escala para el botón de registro
  // Requerimiento 4: efecto de escala con withSpring
  const buttonScale = useSharedValue(1);
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  /**
   * Registro de usuario con Supabase Auth.
   * Requerimiento 1: "El usuario puede registrarse con email y contraseña".
   */
  const onRegister = async (data: RegisterForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) {
        Alert.alert("Error de registro", error.message);
      } else {
        setSuccess(true);
      }
    } catch {
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito post-registro
  if (success) {
    return (
      <View className="flex-1 bg-dominos-offwhite items-center justify-center px-6">
        <Animated.View
          entering={FadeInDown.springify()}
          className="items-center"
        >
          <View className="w-24 h-24 bg-dominos-blue rounded-full items-center justify-center mb-6">
            <Text className="text-5xl">✅</Text>
          </View>
          <Text className="text-dominos-darkgray text-2xl font-bold text-center mb-2">
            ¡Cuenta creada!
          </Text>
          <Text className="text-dominos-gray text-center mb-8">
            Revisa tu email para confirmar tu cuenta y luego inicia sesión.
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity className="bg-dominos-red px-8 py-4 rounded-xl">
              <Text className="text-white font-bold text-base">
                Ir al Login
              </Text>
            </TouchableOpacity>
          </Link>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dominos-offwhite"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          className="bg-dominos-blue pt-16 pb-12 px-6 items-center"
        >
          <View className="w-20 h-20 bg-dominos-red rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">🍕</Text>
          </View>
          <Text className="text-white text-3xl font-bold">Gastro Map</Text>
          <Text className="text-blue-200 text-sm mt-1">
            Crea tu cuenta gratis
          </Text>
        </Animated.View>

        {/* Formulario */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="flex-1 px-6 pt-8"
        >
          <Text className="text-dominos-darkgray text-2xl font-bold mb-6">
            Crear Cuenta
          </Text>

          {/* Email */}
          <View className="mb-4">
            <Text className="text-dominos-gray text-sm font-medium mb-1">
              Correo electrónico
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`bg-white border rounded-xl px-4 py-3 text-dominos-darkgray text-base ${
                    errors.email ? "border-dominos-red" : "border-dominos-lightgray"
                  }`}
                  placeholder="tu@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && (
              <Text className="text-dominos-red text-xs mt-1">
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Contraseña */}
          <View className="mb-4">
            <Text className="text-dominos-gray text-sm font-medium mb-1">
              Contraseña
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`bg-white border rounded-xl px-4 py-3 text-dominos-darkgray text-base ${
                    errors.password ? "border-dominos-red" : "border-dominos-lightgray"
                  }`}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.password && (
              <Text className="text-dominos-red text-xs mt-1">
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Confirmar contraseña */}
          <View className="mb-6">
            <Text className="text-dominos-gray text-sm font-medium mb-1">
              Confirmar contraseña
            </Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`bg-white border rounded-xl px-4 py-3 text-dominos-darkgray text-base ${
                    errors.confirmPassword
                      ? "border-dominos-red"
                      : "border-dominos-lightgray"
                  }`}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.confirmPassword && (
              <Text className="text-dominos-red text-xs mt-1">
                {errors.confirmPassword.message}
              </Text>
            )}
          </View>

          {/* Botón Registrar con withSpring */}
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={handleSubmit(onRegister)}
              disabled={loading}
              className="bg-dominos-red rounded-xl py-4 items-center shadow-md"
              activeOpacity={1}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Crear Cuenta
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View className="flex-row justify-center mt-6 mb-8">
            <Text className="text-dominos-gray">¿Ya tienes cuenta? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-dominos-blue font-bold">Inicia sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
