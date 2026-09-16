
// Interfaz grafica del perfil

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { profileStyles } from '../styles/profile.styles';
import { ProfileHeader } from '../components/ProfileHeader';
import { AppButton } from '../../../shared/components/buttons/AppButton';

// Conecta con useProfileController
import { useProfileController } from '../controllers/useProfileController';

interface ProfileViewProps {
  navigation: any;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ navigation }) => {
  
  
  // Obtiene navigateToEdit desde useProfileController.ts
  const { user, navigateToEdit, handleLogout } = useProfileController(navigation);

  return (
    <SafeAreaView style={profileStyles.container}>
      <ScrollView contentContainerStyle={profileStyles.scrollContent}>
        <ProfileHeader user={user} />

        <View style={profileStyles.card}>
          <Text style={profileStyles.cardTitle}>Información Personal</Text>

          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Nombre Completo</Text>
            <Text style={profileStyles.infoValue}>
              {user?.nombre1} {user?.nombre2 || ''} {user?.apellido1} {user?.apellido2 || ''}
            </Text>
          </View>

          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Correo Electrónico</Text>
            <Text style={profileStyles.infoValue}>{user?.correo}</Text>
          </View>

          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Teléfono</Text>
            <Text style={profileStyles.infoValue}>{user?.telefono || 'No registrado'}</Text>
          </View>

          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Localidad</Text>
            <Text style={profileStyles.infoValue}>{user?.localidad || 'Bogotá'}</Text>
          </View>

          <View style={profileStyles.infoRow}>
            <Text style={profileStyles.infoLabel}>Barrio</Text>
            <Text style={profileStyles.infoValue}>{user?.barrio || 'No especificado'}</Text>
          </View>
        </View>

        <View style={profileStyles.card}>
          <Text style={profileStyles.cardTitle}>Acciones de Cuenta</Text>
         
          {/* Dispara navigateToEdit hacia useProfileController.ts */}
          <AppButton
            title="Editar Información de Perfil"
            variant="outline"
            onPress={navigateToEdit}
          />
        </View>

        <AppButton
          title="Cerrar Sesión"
          variant="ghost"
          onPress={handleLogout}
          style={profileStyles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileView;