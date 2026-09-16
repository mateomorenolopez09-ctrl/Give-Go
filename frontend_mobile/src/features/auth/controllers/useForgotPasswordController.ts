import { useState } from 'react';
import { authFeatureService } from '../services/auth.service';

export const useForgotPasswordController = (navigation: any) => {
  const [correo, setCorreo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleResetPassword = async () => {
    if (!correo.trim()) {
      setErrorMessage('Por favor ingresa tu correo registrado.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const res = await authFeatureService.forgotPassword({ correo: correo.trim() });
      if (res.success) {
        setSuccessMessage(res.message || 'Se ha restablecido tu contraseña provisional a GiveAndGo2026*.');
      } else {
        setErrorMessage(res.message || 'No se encontró una cuenta con ese correo.');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return {
    correo,
    setCorreo,
    isLoading,
    successMessage,
    errorMessage,
    handleResetPassword,
    navigateToLogin,
  };
};

export default useForgotPasswordController;
