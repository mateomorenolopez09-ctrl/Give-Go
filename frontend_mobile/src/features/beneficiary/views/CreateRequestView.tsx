import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppInput } from '../../../shared/components/inputs/AppInput';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { beneficiaryFeatureService } from '../services/beneficiary.service';

interface CreateRequestViewProps {
  navigation: any;
}

export const CreateRequestView: React.FC<CreateRequestViewProps> = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urgencia, setUrgencia] = useState<'baja' | 'media' | 'alta'>('media');
  const [localidad, setLocalidad] = useState('Kennedy');
  const [barrio, setBarrio] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (!titulo.trim() || !descripcion.trim()) {
      setErrorMessage('Por favor completa el título y la descripción.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await beneficiaryFeatureService.createRequest({
        id_categoria: 1,
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        urgencia,
        localidad,
        barrio: barrio.trim() || undefined,
        direccion_entrega: direccionEntrega.trim() || undefined,
      });
      navigation.goBack();
    } catch (e: any) {
      setErrorMessage(e.response?.data?.message || e.message || 'Error al crear solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 }}>
            Pedir Asistencia
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
            Describe qué tipo de apoyo necesitas y la urgencia de tu caso.
          </Text>

          {errorMessage ? (
            <View style={{ backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#991B1B', fontWeight: '600', textAlign: 'center' }}>{errorMessage}</Text>
            </View>
          ) : null}

          <AppInput
            label="¿Qué necesitas? *"
            placeholder="Ej: Mercado de víveres para 4 personas"
            value={titulo}
            onChangeText={setTitulo}
          />

          <AppInput
            label="Detalles de la Situación *"
            placeholder="Describe tu situación actual y motivo de la solicitud..."
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
          />

          {/* Urgencia selector */}
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 8 }}>
            Nivel de Urgencia
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {(['baja', 'media', 'alta'] as const).map((lvl) => (
              <TouchableOpacity
                key={lvl}
                activeOpacity={0.8}
                onPress={() => setUrgencia(lvl)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                  backgroundColor: urgencia === lvl ? (lvl === 'alta' ? '#EF4444' : lvl === 'media' ? '#F59E0B' : '#3B82F6') : '#F3F4F6',
                }}
              >
                <Text style={{ color: urgencia === lvl ? '#FFFFFF' : '#374151', fontWeight: '700', textTransform: 'capitalize' }}>
                  {lvl}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <AppInput
                label="Localidad"
                placeholder="Kennedy"
                value={localidad}
                onChangeText={setLocalidad}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput
                label="Barrio"
                placeholder="Patio Bonito"
                value={barrio}
                onChangeText={setBarrio}
              />
            </View>
          </View>

          <AppInput
            label="Dirección de Entrega"
            placeholder="Carrera 87 # 38 - 12 Sur"
            value={direccionEntrega}
            onChangeText={setDireccionEntrega}
          />

          <AppButton
            title="Enviar Solicitud de Ayuda"
            variant="secondary"
            onPress={handleSubmit}
            isLoading={isLoading}
            style={{ marginTop: 12 }}
          />

          <AppButton
            title="Cancelar"
            variant="ghost"
            onPress={() => navigation.goBack()}
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateRequestView;
