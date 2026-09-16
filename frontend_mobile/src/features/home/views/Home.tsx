import React from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHomeController } from '../controllers/useHomeController';
import { HomeHero } from '../components/HomeHero';
import { QuickActionCard } from '../components/QuickActionCard';
import { styles } from '../styles/home.styles';
import { AppLoader } from '../../../shared/components/loaders/AppLoader';

interface HomeProps {
  navigation?: any;
}

export const Home: React.FC<HomeProps> = ({ navigation }) => {
  const {
    user,
    stats,
    featuredEvents,
    quickActions,
    isLoading,
    refreshing,
    onRefresh,
    handleActionPress,
    handleEventPress,
  } = useHomeController(navigation);

  if (isLoading) {
    return <AppLoader message="Cargando Give&Go..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Hero Section */}
        <HomeHero
          userName={user ? `${user.nombre1} ${user.apellido1}` : undefined}
          userRole={user?.rol}
        />

        {/* Resumen de Impacto */}
        <Text style={styles.sectionTitle}>Impacto en la Comunidad</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.voluntariosCount}</Text>
            <Text style={styles.statLabel}>Voluntarios Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.eventosActivosCount}</Text>
            <Text style={styles.statLabel}>Eventos Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.donacionesCount}</Text>
            <Text style={styles.statLabel}>Donaciones</Text>
          </View>
        </View>

        {/* Acciones Rápidas */}
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              onPress={handleActionPress}
            />
          ))}
        </View>

        {/* Próximos Eventos */}
        {featuredEvents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Próximos Eventos</Text>
            <View style={styles.eventsContainer}>
              {featuredEvents.map((evt) => (
                <TouchableOpacity
                  key={evt.id}
                  style={styles.actionCard}
                  onPress={() => handleEventPress(evt.id)}
                >
                  <Text style={styles.actionTitle}>{evt.nombre}</Text>
                  <Text style={styles.actionSubtitle}>
                    {evt.categoria} • {evt.organizacionNombre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
