import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { ENV } from './env';

// Detect base URL based on runtime (Expo Go, Physical Device, Emulator, Web)
export const resolveBaseUrl = (): string => {
  // 1. Variable de entorno explícita (Expo SDK 49+)
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Navegador Web / AI Studio Preview
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return `${window.location.origin}/api`;
  }

  // 3. Detección automática de IP en Expo Go (Dispositivo Físico conectado por WiFi a la PC)
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3000/api`;
    }
  }

  // 4. Emuladores nativos
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api'; // Loopback del emulador Android hacia la máquina anfitrión
  }

  // 5. Simulador iOS o por defecto
  return 'http://localhost:3000/api';
};

export const getBaseUrl = (): string => {
  try {
    return resolveBaseUrl();
  } catch {
    return 'http://localhost:3000/api';
  }
};

export const BASE_URL = getBaseUrl();

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer Token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(ENV.STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading auth token in mobile interceptor:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
