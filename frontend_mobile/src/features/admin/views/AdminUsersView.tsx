import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminController } from '../controllers/useAdminController';
import { AdminUserCard } from '../components/AdminUserCard';
import { styles } from '../styles/admin.styles';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';

export const AdminUsersView: React.FC = () => {
  const { users, isLoading, refreshing, onRefresh } = useAdminController();

  if (isLoading) {
    return <AppLoader message="Cargando usuarios..." />;
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
          <Text style={styles.title}>Gestión de Usuarios</Text>
          <Text style={styles.subtitle}>Directorio completo de cuentas registradas</Text>
        </View>

        {users.map((u) => (
          <AdminUserCard key={String(u.id_usuario)} user={u} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminUsersView;
