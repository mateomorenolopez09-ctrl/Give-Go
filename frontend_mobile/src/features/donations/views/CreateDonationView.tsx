import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Coins, Package, Check } from 'lucide-react-native';
import { AppInput } from '../../../shared/components/inputs/AppInput';
import { AppButton } from '../../../shared/components/buttons/AppButton';
import { donationFeatureService } from '../services/donation.service';

interface CreateDonationViewProps {
  navigation: any;
}

export const CreateDonationView: React.FC<CreateDonationViewProps> = ({ navigation }) => {
  const [tipo, setTipo] = useState<'monetaria' | 'especie'>('monetaria');
  const [monto, setMonto] = useState('50000');
  const [descripcionEspecie, setDescripcionEspecie] = useState('');
  const [anonima, setAnonima] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await donationFeatureService.create({
        tipo_donacion: tipo,
        monto: tipo === 'monetaria' ? parseFloat(monto) : undefined,
        descripcion_especie: tipo === 'especie' ? descripcionEspecie : undefined,
        id_categoria: 1,
        anonima,
      });
      navigation.goBack();
    } catch (e: any) {
      setErrorMessage(e.response?.data?.message || e.message || 'Error al procesar donación');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6' }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 }}>
            Registrar Donación
          </Text>
          <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
            Tu ayuda llega de forma transparente y directa a quienes más lo necesitan.
          </Text>

          {errorMessage ? (
            <View style={{ backgroundColor: '#FEE2E2', padding: 10, borderRadius: 8, marginBottom: 12 }}>
              <Text style={{ color: '#991B1B', fontWeight: '600', textAlign: 'center' }}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Tipo Selector */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTipo('monetaria')}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tipo === 'monetaria' ? '#DC2626' : '#F3F4F6',
              }}
            >
              <Coins size={18} color={tipo === 'monetaria' ? '#FFFFFF' : '#374151'} strokeWidth={2} style={{ marginRight: 6 }} />
              <Text style={{ color: tipo === 'monetaria' ? '#FFFFFF' : '#374151', fontWeight: '700' }}>
                Monetaria
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTipo('especie')}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: tipo === 'especie' ? '#DC2626' : '#F3F4F6',
              }}
            >
              <Package size={18} color={tipo === 'especie' ? '#FFFFFF' : '#374151'} strokeWidth={2} style={{ marginRight: 6 }} />
              <Text style={{ color: tipo === 'especie' ? '#FFFFFF' : '#374151', fontWeight: '700' }}>
                En Especie
              </Text>
            </TouchableOpacity>
          </View>

          {tipo === 'monetaria' ? (
            <AppInput
              label="Monto en Pesos Colombianos (COP) *"
              placeholder="50000"
              value={monto}
              onChangeText={setMonto}
              keyboardType="numeric"
            />
          ) : (
            <AppInput
              label="Descripción de los Artículos o Alimentos *"
              placeholder="Ej: 3 cajas de alimentos no perecederos, arroz, lentejas y aceite"
              value={descripcionEspecie}
              onChangeText={setDescripcionEspecie}
              multiline
              numberOfLines={4}
            />
          )}

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setAnonima(!anonima)}
            style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: anonima ? '#DC2626' : '#9CA3AF',
                backgroundColor: anonima ? '#DC2626' : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              {anonima && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
            </View>
            <Text style={{ fontSize: 13, color: '#374151' }}>Deseo que mi donación sea anónima</Text>
          </TouchableOpacity>

          <AppButton
            title="Confirmar Donación"
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

export default CreateDonationView;

