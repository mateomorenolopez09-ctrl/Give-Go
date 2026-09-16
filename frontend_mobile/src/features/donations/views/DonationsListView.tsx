import React from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Gift, Heart, Inbox } from 'lucide-react-native';
import { donationsStyles } from '../styles/donations.styles';
import { DonationItemCard } from '../components/DonationItemCard';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';
import { useDonationsController } from '../controllers/useDonationsController';

interface DonationsListViewProps {
  navigation: any;
}

export const DonationsListView: React.FC<DonationsListViewProps> = ({ navigation }) => {
  const {
    donations,
    isLoading,
    isRefreshing,
    handleRefresh,
    navigateToCreate,
  } = useDonationsController(navigation);

  return (
    <SafeAreaView style={donationsStyles.container}>
      <View style={donationsStyles.header}>
        <Text style={donationsStyles.title}>Donaciones Solidarias</Text>
        <Text style={donationsStyles.subtitle}>
          Aportes y entregas directas a causas comunitarias en Bogotá
        </Text>
      </View>

      {isLoading && !isRefreshing ? (
        <AppLoader message="Cargando donaciones..." />
      ) : (
        <FlatList
          data={donations}
          keyExtractor={(item, index) => (item.id_donacion || `don_${index}`).toString()}
          renderItem={({ item }) => <DonationItemCard donation={item} />}
          contentContainerStyle={donationsStyles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Inbox size={48} color="#94A3B8" strokeWidth={1.5} />
              <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 12, color: '#1E293B' }}>
                No hay donaciones registradas
              </Text>
              <Text style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4 }}>
                Sé el primero en realizar una donación voluntaria para las familias de la comunidad.
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={navigateToCreate}
        style={donationsStyles.fab}
      >
        <Heart size={20} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={donationsStyles.fabText}>Hacer Donación</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DonationsListView;

