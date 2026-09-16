import { useState } from 'react';
import { profileFeatureService } from '../services/profile.service';
import { useAuth } from '../../../store/auth/AuthContext';

export const useEditProfileController = (navigation: any, initialProfile: any) => {
  const { updateUser } = useAuth();
  const [nombre1, setNombre1] = useState(initialProfile?.nombre1 || '');
  const [nombre2, setNombre2] = useState(initialProfile?.nombre2 || '');
  const [apellido1, setApellido1] = useState(initialProfile?.apellido1 || '');
  const [apellido2, setApellido2] = useState(initialProfile?.apellido2 || '');
  const [telefono, setTelefono] = useState(initialProfile?.telefono || '');
  const [barrio, setBarrio] = useState(initialProfile?.barrio || '');
  const [localidad, setLocalidad] = useState(initialProfile?.localidad || 'Kennedy');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updated = await profileFeatureService.updateProfile({
        nombre1,
        nombre2,
        apellido1,
        apellido2,
        telefono,
        barrio,
        localidad,
      });
      updateUser(updated);
      navigation.goBack();
    } catch (e) {
      console.warn('Error al actualizar perfil:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nombre1,
    setNombre1,
    nombre2,
    setNombre2,
    apellido1,
    setApellido1,
    apellido2,
    setApellido2,
    telefono,
    setTelefono,
    barrio,
    setBarrio,
    localidad,
    setLocalidad,
    isLoading,
    handleSave,
    goBack: () => navigation.goBack(),
  };
};

export default useEditProfileController;
