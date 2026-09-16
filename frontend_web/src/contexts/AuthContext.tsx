import React, { createContext, useState, useEffect, useContext } from 'react';
import { Usuario, UserRole } from '../types';
import { UserService, OrganizationService } from '../services/db';

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (correo: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (userData: Omit<Usuario, 'id' | 'estado'>) => Promise<{ success: boolean; error?: string }>;
  registerOrg: (
    nombre: string,
    direccion: string,
    correo: string,
    password: string,
    latitud?: number | null,
    longitud?: number | null,
    barrio?: string,
    localidad?: string,
    ciudad?: string,
    departamento?: string,
    pais?: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updatedData: Partial<Usuario>) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restaurar sesión desde sessionStorage
    const storedSession = sessionStorage.getItem('gg_session');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        setUser(parsed);
      } catch (e) {
        console.error('Error restaurando sesión', e);
        sessionStorage.removeItem('gg_session');
        sessionStorage.removeItem('gg_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (correo: string, password: string) => {
    try {
      setLoading(true);
      const res = await UserService.login(correo, password);

      if (res.user.estado === 'inactivo') {
        return { success: false, error: 'Su cuenta está inactiva. Contacte al administrador.' };
      }

      // Guardar sesión en sessionStorage
      sessionStorage.setItem('gg_session', JSON.stringify(res.user));
      sessionStorage.setItem('gg_token', res.token);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('gg_session');
    sessionStorage.removeItem('gg_token');
    setUser(null);
  };

  const register = async (userData: Omit<Usuario, 'id' | 'estado'>) => {
    try {
      setLoading(true);
      const existing = await UserService.getByEmail(userData.correo);
      if (existing) {
        return { success: false, error: 'El correo ya está registrado por otro usuario.' };
      }

      const res = await UserService.register(userData);

      // Iniciar sesión automáticamente con el token y el usuario devuelto
      sessionStorage.setItem('gg_session', JSON.stringify(res.user));
      sessionStorage.setItem('gg_token', res.token);
      setUser(res.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrarse' };
    } finally {
      setLoading(false);
    }
  };

  const registerOrg = async (
    nombre: string,
    direccion: string,
    correo: string,
    password: string,
    latitud?: number | null,
    longitud?: number | null,
    barrio?: string,
    localidad?: string,
    ciudad?: string,
    departamento?: string,
    pais?: string
  ) => {
    try {
      setLoading(true);
      const existing = await UserService.getByEmail(correo);
      if (existing) {
        return { success: false, error: 'El correo ya está registrado por otra cuenta.' };
      }

      // Crear organización y usuario asociado
      const newOrg = await OrganizationService.create({
        nombre,
        direccion,
        correo,
        password,
        latitud,
        longitud,
        barrio,
        localidad,
        ciudad,
        departamento,
        pais
      } as any);

      // Iniciar sesión automáticamente
      const loginRes = await login(correo, password);
      if (!loginRes.success) {
        return { success: false, error: 'Organización creada, pero falló el inicio de sesión automático: ' + loginRes.error };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrar organización' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData: Partial<Usuario>) => {
    if (!user) return { success: false, error: 'No hay sesión activa.' };
    try {
      setLoading(true);
      
      // Si cambia de correo, validar que no exista duplicado
      if (updatedData.correo && updatedData.correo.toLowerCase() !== user.correo.toLowerCase()) {
        const existing = await UserService.getByEmail(updatedData.correo);
        if (existing) {
          return { success: false, error: 'El correo ya está registrado por otra cuenta.' };
        }
      }

      const updated = await UserService.update(user.id, updatedData);
      
      // Actualizar también la sesión activa
      sessionStorage.setItem('gg_session', JSON.stringify(updated));
      setUser(updated);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar perfil' };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return { success: false, error: 'No hay sesión activa.' };
    try {
      setLoading(true);
      await UserService.delete(user.id);
      sessionStorage.removeItem('gg_session');
      sessionStorage.removeItem('gg_token');
      setUser(null);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar la cuenta' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, registerOrg, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
