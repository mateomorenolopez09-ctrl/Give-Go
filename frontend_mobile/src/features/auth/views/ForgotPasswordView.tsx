import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../../shared/components/inputs/AppInput';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { forgotPasswordStyles } from '../styles/forgotPassword.styles';
import { useForgotPasswordController } from '../controllers/useForgotPasswordController';

interface ForgotPasswordViewProps {
  navigation: any;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ navigation }) => {
  const {
    correo,
    setCorreo,
    isLoading,
    successMessage,
    errorMessage,
    handleResetPassword,
    navigateToLogin,
  } = useForgotPasswordController(navigation);

  return (
    <SafeAreaView style={forgotPasswordStyles.container}>
      <ScrollView contentContainerStyle={forgotPasswordStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={forgotPasswordStyles.card}>
          <Text style={forgotPasswordStyles.title}>Recuperar Contraseña</Text>
          <Text style={forgotPasswordStyles.subtitle}>
            Ingresa el correo electrónico asociado a tu cuenta para restablecer el acceso.
          </Text>

          {successMessage ? (
            <View style={forgotPasswordStyles.successBanner}>
              <Text style={forgotPasswordStyles.successText}>{successMessage}</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={forgotPasswordStyles.errorBanner}>
              <Text style={forgotPasswordStyles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <AppInput
            label="Correo Electrónico"
            placeholder="ejemplo@correo.com"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <AppButton
            title="Enviar Solicitud"
            onPress={handleResetPassword}
            isLoading={isLoading}
            style={forgotPasswordStyles.submitButton}
          />

          <TouchableOpacity activeOpacity={0.7} onPress={navigateToLogin} style={forgotPasswordStyles.backButton}>
            <Text style={forgotPasswordStyles.backText}>Volver al Inicio de Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPasswordView;
