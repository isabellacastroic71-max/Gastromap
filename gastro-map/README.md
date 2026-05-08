# 🍕 Gastro Map

Aplicación móvil desarrollada con **React Native + Expo** para registrar platos de comida con foto y ubicación GPS. Proyecto del examen práctico de Desarrollo de Aplicaciones Móviles.

---

## 🛠️ Stack tecnológico

| Herramienta | Uso |
|---|---|
| **React Native + Expo 51** | Framework móvil |
| **Expo Router v3** | Navegación basada en archivos |
| **Supabase** | Autenticación + Base de datos |
| **TanStack Query v5** | Gestión de estado del servidor (caché, mutations) |
| **React Hook Form + Zod** | Formularios con validación tipada |
| **NativeWind v4** | Estilos con clases Tailwind (sin StyleSheet) |
| **React Native Reanimated 3** | Animaciones fluidas |
| **React Native Gesture Handler** | Swipe para eliminar |
| **Expo Location** | Captura de coordenadas GPS |
| **Expo Image Picker** | Cámara y galería |

---

## 🚀 Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone <url-del-repo>
cd gastro-map
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Crea el archivo `.env` en la raíz del proyecto (ya está en `.gitignore`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://lqyccehghqunsoccbmvq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

> ⚠️ **IMPORTANTE**: Nunca subas el `.env` al repositorio. Está incluido en `.gitignore`.

### 4. Configurar Supabase

Ejecuta el archivo `supabase_migration.sql` en el **SQL Editor** de tu proyecto Supabase:

1. Ve a [supabase.com](https://supabase.com) → Tu proyecto → SQL Editor
2. Copia y pega el contenido de `supabase_migration.sql`
3. Ejecuta el script

Esto crea:
- Tabla `dishes` con RLS (Row Level Security)
- Bucket `dish-photos` para almacenamiento de imágenes
- Políticas de acceso por usuario

### 5. Ejecutar en desarrollo
```bash
npx expo start
```

---

## 📱 Generar APK

### Opción 1: EAS Build (recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Autenticarse en Expo
eas login

# Generar APK (perfil preview)
npx eas build -p android --profile preview
```

El APK se descargará desde el dashboard de Expo.

### Opción 2: Expo Go (desarrollo)

Para probar sin generar APK:
1. Instala **Expo Go** en tu dispositivo Android/iOS
2. Ejecuta `npx expo start`
3. Escanea el QR con Expo Go

---

## 📋 Requerimientos implementados

### Requerimiento 1 — Autenticación con Supabase (35 pts)
- ✅ Pantalla de **Login** con email y contraseña
- ✅ Pantalla de **Registro** con confirmación de contraseña
- ✅ Validación de contraseñas coincidentes (Zod)
- ✅ Navegación automática a Home al iniciar sesión
- ✅ Navegación automática a Login al cerrar sesión (AuthGate en `_layout.tsx`)

### Requerimiento 2 — Gestión de platos con Supabase (35 pts)
- ✅ Tipo `Dish` con todos los campos requeridos
- ✅ Platos cargados al abrir Home (TanStack Query `useQuery`)
- ✅ Nuevo plato aparece al inicio de la lista (actualización optimista)
- ✅ Persistencia en Supabase con RLS por usuario

### Requerimiento 3 — Registro de plato (incluido en req. 2)
- ✅ Cámara o galería para la foto
- ✅ GPS capturado al presionar "Registrar"
- ✅ Formulario con validación (React Hook Form + Zod)
- ✅ Formulario se limpia tras registrar

### Requerimiento 4 — Animaciones y estilos (20 pts)
- ✅ **Solo NativeWind** — sin `StyleSheet` en ningún archivo
- ✅ `FadeInDown` al agregar cards (escalonado por índice)
- ✅ `FadeOutLeft` al eliminar con swipe
- ✅ Swipe con `GestureDetector` + `useAnimatedStyle` + `withTiming`
- ✅ Botón de registro con `withSpring` al presionar

### Adicional — TanStack Query (10 pts)
- ✅ `useDishes`: `useQuery` con caché automático
- ✅ `useAddDish`: `useMutation` con actualización optimista
- ✅ `useDeleteDish`: `useMutation` con rollback en error
- ✅ `QueryClient` configurado con `staleTime` y `retry`

### Adicional — Paleta Domino's Pizza (5 pts)
- ✅ Colores oficiales en `tailwind.config.js`:
  - `dominos-red: #E31837`
  - `dominos-blue: #006491`
  - `dominos-darkblue: #004C6D`
- ✅ Aplicados en toda la interfaz via clases NativeWind

---

## 🏗️ Estructura del proyecto

```
gastro-map/
├── app/
│   ├── _layout.tsx          # Root layout: providers + AuthGate
│   ├── (auth)/
│   │   ├── _layout.tsx      # Auth group layout
│   │   ├── login.tsx        # Pantalla de Login
│   │   └── register.tsx     # Pantalla de Registro
│   └── (app)/
│       ├── _layout.tsx      # App group layout (pantallas protegidas)
│       ├── home.tsx         # Lista de platos
│       └── add-dish.tsx     # Formulario de nuevo plato
├── src/
│   ├── components/
│   │   └── DishCard.tsx     # Card con swipe y animaciones
│   ├── hooks/
│   │   ├── useAuth.ts       # Hook de autenticación Supabase
│   │   └── useDishes.ts     # Hooks TanStack Query (dishes)
│   ├── lib/
│   │   ├── supabase.ts      # Cliente Supabase
│   │   ├── queryClient.ts   # TanStack QueryClient
│   │   └── dishesApi.ts     # Funciones CRUD Supabase
│   └── types/
│       └── dish.ts          # Tipo Dish (TypeScript)
├── .env                     # 🔒 Credenciales (en .gitignore)
├── .gitignore               # .env excluido del repo
├── supabase_migration.sql   # Script SQL para Supabase
├── tailwind.config.js       # Paleta Domino's Pizza
├── global.css               # Directivas Tailwind
└── babel.config.js          # Reanimated + NativeWind
```

---

## 🔒 Seguridad

- Las credenciales de Supabase están en `.env` y **no se suben al repositorio** (`.gitignore`)
- Row Level Security (RLS) en Supabase garantiza que cada usuario solo ve sus propios platos
- Los tokens de sesión se persisten de forma segura con AsyncStorage
