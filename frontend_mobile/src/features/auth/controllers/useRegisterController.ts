import { useState } from 'react';
import { useAuth } from '../../../store/auth/AuthContext';

export const useRegisterController = (navigation: any, role: 'Voluntario' | 'Beneficiario') => {
  const { register } = useAuth();
  const [nombre1, setNombre1] = useState('');
  const [nombre2, setNombre2] = useState('');
  const [apellido1, setApellido1] = useState('');
  const [apellido2, setApellido2] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [barrio, setBarrio] = useState('');
  const [localidad, setLocalidad] = useState('Kennedy');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!nombre1.trim() || !apellido1.trim() || !correo.trim() || !password) {
      setErrorMessage('Por favor completa todos los campos obligatorios (*).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      const payload = {
        nombre1: nombre1.trim(),
        nombre2: nombre2.trim() || undefined,
        apellido1: apellido1.trim(),
        apellido2: apellido2.trim() || undefined,
        correo: correo.trim().toLowerCase(),
        telefono: telefono.trim() || undefined,
        barrio: barrio.trim() || undefined,
        localidad: localidad.trim() || 'Kennedy',
        ciudad: 'Bogotá',
        rol: role.toLowerCase(),
      };

      const result = await register(payload, password);
      if (!result.success) {
        setErrorMessage(result.message || 'Error al completar el registro.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error inesperado en el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
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
    correo,
    setCorreo,
    password,
    setPassword,
    telefono,
    setTelefono,
    barrio,
    setBarrio,
    localidad,
    setLocalidad,
    isLoading,
    errorMessage,
    handleRegister,
    navigateToLogin,
  };
};

export default useRegisterController;
