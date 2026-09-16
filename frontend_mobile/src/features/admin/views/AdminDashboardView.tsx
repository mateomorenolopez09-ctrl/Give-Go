import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminController } from '../controllers/useAdminController';
import { AdminStatCard } from '../components/AdminStatCard';
import { AdminUserCard } from '../components/AdminUserCard';
import { styles } from '../styles/admin.styles';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';

export const AdminDashboardView: React.FC = () => {
  const { stats, users, isLoading, refreshing, onRefresh } = useAdminController();

  if (isLoading) {
    return <AppLoader message="Cargando panel de administración..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Panel de Control</Text>
          <Text style={styles.subtitle}>Supervisión del sistema Give&Go</Text>
        </View>

        <View style={styles.statsGrid}>
          <AdminStatCard label="Usuarios Totales" value={stats.totalUsers} color="#DC2626" />
          <AdminStatCard label="Eventos" value={stats.totalEvents} color="#2563EB" />
          <AdminStatCard label="Donaciones" value={stats.totalDonations} color="#16A34A" />
          <AdminStatCard label="Verif. Pendientes" value={stats.pendingVerifications} color="#D97706" />
        </View>

        <Text style={styles.sectionTitle}>Usuarios Recientes</Text>
        {users.slice(0, 5).map((u) => (
          <AdminUserCard key={String(u.id_usuario)} user={u} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminDashboardView;
