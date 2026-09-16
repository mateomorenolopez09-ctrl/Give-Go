import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { editProfileStyles } from '../styles/editProfile.styles';
import { AppInput } from '../../../shared/components/inputs/AppInput';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { useEditProfileController } from '../controllers/useEditProfileController';

interface EditProfileViewProps {
  route: any;
  navigation: any;
}

export const EditProfileView: React.FC<EditProfileViewProps> = ({ route, navigation }) => {
  const { profile } = route.params || {};
  const {
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
    goBack,
  } = useEditProfileController(navigation, profile);

  return (
    <SafeAreaView style={editProfileStyles.container}>
      <ScrollView contentContainerStyle={editProfileStyles.scrollContent}>
        <View style={editProfileStyles.card}>
          <Text style={editProfileStyles.title}>Editar Perfil</Text>
          <Text style={editProfileStyles.subtitle}>Actualiza tus datos de contacto y residencia</Text>

          <View style={editProfileStyles.row}>
            <View style={editProfileStyles.halfInput}>
              <AppInput
                label="Primer Nombre"
                value={nombre1}
                onChangeText={setNombre1}
              />
            </View>
            <View style={editProfileStyles.halfInput}>
              <AppInput
                label="Segundo Nombre"
                value={nombre2}
                onChangeText={setNombre2}
              />
            </View>
          </View>

          <View style={editProfileStyles.row}>
            <View style={editProfileStyles.halfInput}>
              <AppInput
                label="Primer Apellido"
                value={apellido1}
                onChangeText={setApellido1}
              />
            </View>
            <View style={editProfileStyles.halfInput}>
              <AppInput
                label="Segundo Apellido"
                value={apellido2}
                onChangeText={setApellido2}
              />
            </View>
          </View>

          <AppInput
            label="Teléfono Móvil"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          <View style={editProfileStyles.row}>
            <View style={editProfileStyles.halfInput}>
              <AppInput
                label="Localidad"
                value={localidad}
                onChangeText={setLocalidad}
              />
            </View>
            <View style={editProfileStyles.halfInput}>
              <AppInput
                label="Barrio"
                value={barrio}
                onChangeText={setBarrio}
              />
            </View>
          </View>

          <AppButton
            title="Guardar Cambios"
            onPress={handleSave}
            isLoading={isLoading}
            style={editProfileStyles.submitButton}
          />

          <AppButton
            title="Cancelar"
            variant="ghost"
            onPress={goBack}
            style={editProfileStyles.cancelButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileView;
