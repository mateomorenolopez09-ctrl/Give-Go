import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../../shared/components/inputs/AppInput';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { AuthHeader } from '../components/AuthHeader';
import { loginStyles } from '../styles/login.styles';
import { useLoginController } from '../controllers/useLoginController';
// Conecta con el controlador, sirven como puenta de entrada
interface LoginViewProps {
  navigation: any;
}

export const LoginView: React.FC<LoginViewProps> = ({ navigation }) => {
  const {
    correo,
    setCorreo,
    password,
    setPassword,
    isLoading,
    errorMessage,
    handleLogin,  
    navigateToRegisterVolunteer,
    navigateToRegisterBeneficiary,
    navigateToForgotPassword,
  } = useLoginController(navigation);
  //   Esta linea ejecuta el controlador y obtiene sus funciones

  return (
    <SafeAreaView style={loginStyles.container}>
      <ScrollView contentContainerStyle={loginStyles.scrollContent} keyboardShouldPersistTaps="handled">
        <AuthHeader />

        <View style={loginStyles.card}>
          <Text style={loginStyles.title}>Iniciar Sesión</Text>
          <Text style={loginStyles.subtitle}>Ingresa tus credenciales para continuar</Text>

          {errorMessage ? (
            <View style={loginStyles.errorBanner}>
              <Text style={loginStyles.errorText}>{errorMessage}</Text>
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

          <AppInput
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity activeOpacity={0.7} onPress={navigateToForgotPassword}>
            <Text style={loginStyles.forgotText}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>

          <AppButton
            title="Ingresar a la Plataforma"
            onPress={handleLogin} //  Al presionar, ejecuta handleLogin del controlador
            isLoading={isLoading}
            style={loginStyles.submitButton}
          />

          <View style={loginStyles.dividerContainer}>
            <View style={loginStyles.dividerLine} />
            <Text style={loginStyles.dividerText}>¿No tienes una cuenta?</Text>
            <View style={loginStyles.dividerLine} />
          </View>

          <View style={loginStyles.registerRow}>
            <AppButton
              title="Ser Voluntario"
              variant="outline"
              onPress={navigateToRegisterVolunteer}
              style={loginStyles.registerButton}
            />
            <AppButton
              title="Soy Beneficiario"
              variant="secondary"
              onPress={navigateToRegisterBeneficiary}
              style={loginStyles.registerButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginView;
