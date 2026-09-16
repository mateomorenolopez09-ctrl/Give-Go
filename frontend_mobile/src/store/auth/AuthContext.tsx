//Gestiona autenticacion, guarda token y usuario

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../config/api';//conecta con la apiClient
import { ENV } from '../../config/env';
import { User, AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStoredSession();
  }, []);

  const loadStoredSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(ENV.STORAGE_KEYS.TOKEN);
      const storedUser = await AsyncStorage.getItem(ENV.STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.warn('Error al recuperar sesión de AsyncStorage:', e);
    } finally {
      setIsLoading(false);
    }
  };
// Aqui llega 
  const login = async (correo: string, password: string) => {
    try {
      //Aqui hace la petecion HTTP bakend
      const res = await apiClient.post('/users/login', { correo, password });
      if (res.data.success && res.data.data?.token) {
        const authToken = res.data.data.token;
        const authUser = res.data.data.usuario || res.data.data.user;

        setToken(authToken);
        setUser(authUser);
      //Guarda en asyncs storage.Guarda en el almacenamiento local del dispositivo
        await AsyncStorage.setItem(ENV.STORAGE_KEYS.TOKEN, authToken);
        await AsyncStorage.setItem(ENV.STORAGE_KEYS.USER, JSON.stringify(authUser));

        return { success: true };
      }
      return { success: false, message: res.data.message || 'Error en credenciales' };
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors[0]?.mensaje) || err.message || 'Error al conectar con el servidor';
      return {
        success: false,
        message: msg,
      };
    }
  };

  const register = async (userData: any, password: string) => {
    try {
      const res = await apiClient.post('/users/register', { ...userData, password });
      if (res.data.success && res.data.data?.token) {
        const authToken = res.data.data.token;
        const authUser = res.data.data.user || res.data.data.usuario;

        setToken(authToken);
        setUser(authUser);

        await AsyncStorage.setItem(ENV.STORAGE_KEYS.TOKEN, authToken);
        await AsyncStorage.setItem(ENV.STORAGE_KEYS.USER, JSON.stringify(authUser));

        return { success: true };
      }
      return { success: false, message: res.data.message || 'Error en registro' };
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors[0]?.mensaje) || err.message || 'Error al conectar con el servidor';
      return {
        success: false,
        message: msg,
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(ENV.STORAGE_KEYS.TOKEN);
      await AsyncStorage.removeItem(ENV.STORAGE_KEYS.USER);
    } catch (e) {
      console.warn('Error al cerrar sesión:', e);
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    AsyncStorage.setItem(ENV.STORAGE_KEYS.USER, JSON.stringify(updatedUser)).catch(console.warn);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
