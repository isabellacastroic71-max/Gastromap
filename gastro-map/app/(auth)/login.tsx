// ============================================================
// PANTALLA DE LOGIN — Gastro Map
// Requerimiento 1: Login con email y contraseña usando Supabase Auth.
// Estilos: Nativewind con paleta de colores de Domino's Pizza.
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
import { Link, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
} from "react-native-reanimated";
import { supabase } from "../../src/lib/supabase";

// Esquema de validación con Zod para el formulario de login
const loginSchema = z.object({
  email: z.string().email("Ingresa un email válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Valor compartido para la animación de escala del botón (Reanimated)
  // Requerimiento 4: botón de registro con efecto de escala withSpring
  const buttonScale = useSharedValue(1);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  /**
   * Inicio de sesión con Supabase Auth.
   * Requerimiento 1: "El usuario puede iniciar sesión".
   */
  const onLogin = async (data: LoginForm) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        Alert.alert("Error de acceso", error.message);
      }
      // Si no hay error, el AuthGate en _layout.tsx redirige automáticamente al Home
    } catch {
      Alert.alert("Error", "Ocurrió un error inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-dominos-offwhite"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header con marca Domino's */}
        <Animated.View
          entering={FadeInDown.duration(600).springify()}
          className="bg-dominos-blue pt-16 pb-12 px-6 items-center"
        >
          {/* Logo / branding */}
          <View className="w-20 h-20 bg-dominos-red rounded-full items-center justify-center mb-4 shadow-lg">
            <Text className="text-white text-4xl font-bold">🍕</Text>
          </View>
          <Text className="text-white text-3xl font-bold tracking-wide">
            Gastro Map
          </Text>
          <Text className="text-blue-200 text-sm mt-1">
            Registra tus momentos gastronómicos
          </Text>
        </Animated.View>

        {/* Formulario de login */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(600).springify()}
          className="flex-1 px-6 pt-8"
        >
          <Text className="text-dominos-darkgray text-2xl font-bold mb-6">
            Iniciar Sesión
          </Text>

          {/* Campo Email */}
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
                    errors.email
                      ? "border-dominos-red"
                      : "border-dominos-lightgray"
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

          {/* Campo Contraseña */}
          <View className="mb-6">
            <Text className="text-dominos-gray text-sm font-medium mb-1">
              Contraseña
            </Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  className={`bg-white border rounded-xl px-4 py-3 text-dominos-darkgray text-base ${
                    errors.password
                      ? "border-dominos-red"
                      : "border-dominos-lightgray"
                  }`}
                  placeholder="••••••••"
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

          {/* Botón de ingreso con animación withSpring */}
          {/* Requerimiento 4: efecto de escala con withSpring al presionar */}
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              onPress={handleSubmit(onLogin)}
              disabled={loading}
              className="bg-dominos-red rounded-xl py-4 items-center shadow-md"
              activeOpacity={1}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Ingresar
                </Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Link a registro */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-dominos-gray">¿No tienes cuenta? </Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text className="text-dominos-blue font-bold">
                  Regístrate
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
