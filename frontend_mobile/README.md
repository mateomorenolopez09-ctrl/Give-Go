# Give&Go — Frontend Mobile (React Native + Expo)

Aplicación móvil oficial de **Give&Go** desarrollada con **React Native** y **Expo**, estructurada estrictamente bajo la arquitectura modular por features con separación completa de vistas, controladores, estilos, modelos y servicios.

## Estructura del Proyecto

```text
frontend_mobile/
│
├── assets/
│   ├── fonts/
│   ├── icons/
│   └── images/
│
├── src/
│   ├── config/
│   │   ├── api.ts              # Configuración de Axios con interceptor de JWT
│   │   ├── env.ts              # Constantes de entorno y claves de AsyncStorage
│   │   └── theme.ts            # Tokens de diseño (colores, tipografía, spacing)
│   │
│   ├── navigation/
│   │   ├── AppNavigator.tsx    # Enrutador principal autenticado/no autenticado
│   │   ├── AuthNavigator.tsx   # Pila de autenticación
│   │   ├── BottomTabNavigator.tsx # Pestañas inferiores dinámicas según rol
│   │   ├── DrawerNavigator.tsx # Enrutador de cajón lateral
│   │   └── types.ts            # Tipado de navegación React Navigation
│   │
│   ├── features/
│   │   ├── auth/               # Registro e inicio de sesión
│   │   │   ├── views/          # Pantallas de presentación visual
│   │   │   ├── controllers/    # Custom hooks con la lógica y validación
│   │   │   ├── services/       # Clientes HTTP hacia endpoints de usuario
│   │   │   ├── models/         # Tipos TypeScript del dominio
│   │   │   ├── styles/         # Estilos aislados con StyleSheet.create
│   │   │   └── components/     # Encabezados y logos
│   │   ├── events/             # Jornadas y convocatorias
│   │   ├── donations/          # Donaciones monetarias y en especie
│   │   ├── profile/            # Perfil de usuario y edición
│   │   ├── notifications/      # Alertas y notificaciones del sistema
│   │   └── beneficiary/        # Solicitudes de asistencia para beneficiarios
│   │
│   ├── shared/
│   │   ├── components/         # Botones, tarjetas, inputs, modales y loaders
│   │   ├── hooks/              # useDebounce y utilidades reactivas
│   │   ├── utils/              # Formateadores de moneda COP y fechas
│   │   └── constants/          # Constantes compartidas
│   │
│   ├── services/
│   │   ├── api/                # Cliente HTTP unificado
│   │   ├── storage/            # Envoltorio seguro para AsyncStorage
│   │   └── logger/             # Servicio de depuración y registro
│   │
│   └── store/
│       ├── auth/               # Contexto global de sesión y persistencia
│       ├── user/               # Estado de perfil
│       └── app/                # Estado global de la aplicación
│
├── App.tsx                     # Componente raíz con AuthProvider
├── app.json                    # Manifiesto de Expo
├── package.json                # Dependencias móviles
├── tsconfig.json               # Configuración TypeScript
└── README.md
```

## 🚀 Cómo Ejecutar en Expo Go y Conectar con XAMPP

### 1. Iniciar el Backend con MySQL / XAMPP
Asegúrate de que Apache y MySQL estén iniciados en el panel de control de **XAMPP**, y luego inicia el backend del proyecto:
```bash
npm run dev
```

### 2. Iniciar Expo para la Aplicación Móvil
Abre una terminal en la carpeta `frontend_mobile` (o desde la raíz con `cd frontend_mobile`) y ejecuta:
```bash
npx expo start
```
*(O ejecuta `npm run start` dentro de `frontend_mobile`)*.

### 3. Abrir en tu Teléfono con Expo Go
1. Descarga la aplicación **Expo Go** desde Google Play Store (Android) o App Store (iOS).
2. Conecta tu teléfono móvil a la **misma red Wi-Fi** que tu computador.
3. Abre la app **Expo Go** y escanea el código QR que aparece en tu terminal.

### 🌐 Detección Inteligente de Conexión (XAMPP / Backend)
El cliente HTTP (`src/config/api.ts`) detecta automáticamente el entorno de ejecución:
- **Dispositivo Físico con Expo Go (Wi-Fi)**: Extrae automáticamente la dirección IP local de tu computador desde `Constants.expoConfig.hostUri` (ej: `http://192.168.1.X:3000/api`), conectándose directamente a tu servidor local y base de datos XAMPP sin necesidad de configuración manual.
- **Emulador Android Studio**: Se conecta automáticamente a `http://10.0.2.2:3000/api`.
- **Simulador iOS**: Se conecta automáticamente a `http://localhost:3000/api`.
- **Modo Web / Preview**: Se conecta a `${window.location.origin}/api`.
- **Personalización Manual**: Si deseas especificar una URL personalizada, puedes definir `EXPO_PUBLIC_API_URL=http://TU_IP:3000/api` en tu archivo `.env`.

