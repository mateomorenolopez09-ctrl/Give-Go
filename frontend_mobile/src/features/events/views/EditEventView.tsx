import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createEventStyles } from '../styles/createEvent.styles';
import { AppInput } from '../../../shared/components/inputs/AppInput';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { eventFeatureService } from '../services/event.service';

interface EditEventViewProps {
  route: any;
  navigation: any;
}

export const EditEventView: React.FC<EditEventViewProps> = ({ route, navigation }) => {
  const { event } = route.params || {};
  const [titulo, setTitulo] = useState(event?.titulo || '');
  const [descripcion, setDescripcion] = useState(event?.descripcion || '');
  const [cupoMaximo, setCupoMaximo] = useState(String(event?.cupo_maximo || 20));
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!event?.id_evento) return;
    setIsLoading(true);
    try {
      await eventFeatureService.update(event.id_evento, {
        titulo,
        descripcion,
        cupo_maximo: parseInt(cupoMaximo, 10) || 20,
      });
      navigation.goBack();
    } catch (e) {
      console.warn('Error al actualizar evento:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={createEventStyles.container}>
      <ScrollView contentContainerStyle={createEventStyles.scrollContent}>
        <View style={createEventStyles.card}>
          <Text style={createEventStyles.title}>Editar Jornada</Text>

          <AppInput
            label="Título"
            value={titulo}
            onChangeText={setTitulo}
          />

          <AppInput
            label="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
          />

          <AppInput
            label="Cupo Máximo"
            value={cupoMaximo}
            onChangeText={setCupoMaximo}
            keyboardType="numeric"
          />

          <AppButton
            title="Guardar Cambios"
            onPress={handleUpdate}
            isLoading={isLoading}
            style={createEventStyles.submitButton}
          />

          <AppButton
            title="Cancelar"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={createEventStyles.cancelButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditEventView;
