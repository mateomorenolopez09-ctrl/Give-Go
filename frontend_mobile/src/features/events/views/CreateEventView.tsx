import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createEventStyles } from '../styles/createEvent.styles';
import { AppInput } from '../../../shared/components/inputs/AppInput';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { useCreateEventController } from '../controllers/useCreateEventController';

interface CreateEventViewProps {
  navigation: any;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({ navigation }) => {
  const {
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    fechaInicio,
    setFechaInicio,
    horaInicio,
    setHoraInicio,
    cupoMaximo,
    setCupoMaximo,
    direccion,
    setDireccion,
    barrio,
    setBarrio,
    localidad,
    setLocalidad,
    isLoading,
    errorMessage,
    handleCreate,
    goBack,
  } = useCreateEventController(navigation);

  return (
    <SafeAreaView style={createEventStyles.container}>
      <ScrollView contentContainerStyle={createEventStyles.scrollContent}>
        <View style={createEventStyles.card}>
          <Text style={createEventStyles.title}>Crear Nueva Jornada</Text>
          <Text style={createEventStyles.subtitle}>
            Convoca voluntarios y personas beneficiarias para una causa social
          </Text>

          {errorMessage ? (
            <View style={{ backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#991B1B', fontWeight: '600', textAlign: 'center' }}>{errorMessage}</Text>
            </View>
          ) : null}

          <AppInput
            label="Título de la Convocatoria *"
            placeholder="Ej: Jornada de Reforestación Humedal El Burro"
            value={titulo}
            onChangeText={setTitulo}
          />

          <AppInput
            label="Descripción *"
            placeholder="Explica el objetivo, qué deben llevar los voluntarios..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
          />

          <View style={createEventStyles.row}>
            <View style={createEventStyles.halfInput}>
              <AppInput
                label="Fecha (YYYY-MM-DD) *"
                placeholder="2026-09-15"
                value={fechaInicio}
                onChangeText={setFechaInicio}
              />
            </View>
            <View style={createEventStyles.halfInput}>
              <AppInput
                label="Hora Inicio"
                placeholder="08:00"
                value={horaInicio}
                onChangeText={setHoraInicio}
              />
            </View>
          </View>

          <View style={createEventStyles.row}>
            <View style={createEventStyles.halfInput}>
              <AppInput
                label="Localidad"
                placeholder="Kennedy"
                value={localidad}
                onChangeText={setLocalidad}
              />
            </View>
            <View style={createEventStyles.halfInput}>
              <AppInput
                label="Cupo Máximo"
                placeholder="25"
                value={cupoMaximo}
                onChangeText={setCupoMaximo}
                keyboardType="numeric"
              />
            </View>
          </View>

          <AppInput
            label="Dirección de Encuentro"
            placeholder="Calle 42 Sur # 78K - 10"
            value={direccion}
            onChangeText={setDireccion}
          />

          <AppInput
            label="Barrio"
            placeholder="Castilla"
            value={barrio}
            onChangeText={setBarrio}
          />

          <AppButton
            title="Publicar Convocatoria"
            onPress={handleCreate}
            isLoading={isLoading}
            style={createEventStyles.submitButton}
          />

          <AppButton
            title="Cancelar"
            variant="ghost"
            onPress={goBack}
            style={createEventStyles.cancelButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateEventView;
