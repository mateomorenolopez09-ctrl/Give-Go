
//  Controlador de logica del perfil

import { useState, useEffect } from 'react';


//  Conecta con AuthContext.tsx
import { useAuth } from '../../../store/auth/AuthContext';


// Conecta con profile.service.ts
import { profileFeatureService } from '../services/profile.service';

import { UserProfile } from '../models/profile.models';

export const useProfileController = (navigation: any) => {
  
  // Esta linea obtiene user y logout desde AuthContext.tsx
  const { user, logout, updateUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(user as UserProfile);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      
      
      // Esta linea pasa el flujo a profile.service.ts
      const data = await profileFeatureService.getProfile();
      
      if (data) {
        setProfile(data);
        updateUser(data);
      }
    } catch (e) {
      console.warn('Error al cargar perfil:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Navegacion a pantalla de edicion
  // Esta linea pasa profile a EditProfileScreen
  const navigateToEdit = () => {
    navigation.navigate('EditProfile', { profile });
  };

  const handleLogout = async () => {
    await logout();
  };

  return {
    user: profile || (user as UserProfile),
    isLoading,
    fetchProfile,
    navigateToEdit,
    handleLogout,
  };
};

export default useProfileController;