import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Handshake, Plus, Inbox } from 'lucide-react-native';
import { beneficiaryStyles } from '../styles/beneficiary.styles';
import { RequestItemCard } from '../components/RequestItemCard';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';
import { useBeneficiaryController } from '../controllers/useBeneficiaryController';

interface BeneficiaryRequestsViewProps {
  navigation: any;
}

export const BeneficiaryRequestsView: React.FC<BeneficiaryRequestsViewProps> = ({ navigation }) => {
  const {
    requests,
    isLoading,
    isRefreshing,
    handleRefresh,
    navigateToCreate,
  } = useBeneficiaryController(navigation);

  return (
    <SafeAreaView style={beneficiaryStyles.container}>
      <View style={beneficiaryStyles.header}>
        <Text style={beneficiaryStyles.title}>Mis Solicitudes de Ayuda</Text>
        <Text style={beneficiaryStyles.subtitle}>
          Seguimiento de pedidos de asistencia humanitaria y alimentos
        </Text>
      </View>

      {isLoading && !isRefreshing ? (
        <AppLoader message="Cargando solicitudes..." />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item, index) => (item.id_solicitud || `req_${index}`).toString()}
          renderItem={({ item }) => <RequestItemCard request={item} />}
          contentContainerStyle={beneficiaryStyles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Inbox size={48} color="#94A3B8" strokeWidth={1.5} />
              <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 12, color: '#1E293B' }}>
                No tienes solicitudes activas
              </Text>
              <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
                Si tú o tu familia necesitan apoyo alimentario, educativo o médico, crea una solicitud.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={navigateToCreate}
        style={beneficiaryStyles.fab}
      >
        <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={beneficiaryStyles.fabText}>Nueva Solicitud</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default BeneficiaryRequestsView;

