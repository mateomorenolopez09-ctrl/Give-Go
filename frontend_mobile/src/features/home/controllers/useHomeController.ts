import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../store/auth/AuthContext';
import { HomeService } from '../services/home.service';
import { HomeSummaryStats, HomeEventPreview, HomeQuickAction } from '../models/home.models';

export function useHomeController(navigation?: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<HomeSummaryStats>({
    voluntariosCount: 0,
    eventosActivosCount: 0,
    donacionesCount: 0,
    beneficiariosImpactados: 0,
  });
  const [featuredEvents, setFeaturedEvents] = useState<HomeEventPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsData, eventsData] = await Promise.all([
        HomeService.getSummaryStats(),
        HomeService.getFeaturedEvents(),
      ]);
      setStats(statsData);
      setFeaturedEvents(eventsData);
    } catch (err) {
      console.error('Error loading home data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const quickActions: HomeQuickAction[] = [
    {
      id: 'events',
      title: 'Explorar Eventos',
      subtitle: 'Voluntariado y ayuda social',
      iconName: 'calendar',
      color: '#DC2626',
      route: 'Events',
    },
    {
      id: 'donations',
      title: 'Donaciones',
      subtitle: 'Aporta a causas solidarias',
      iconName: 'heart',
      color: '#16A34A',
      route: 'Donations',
    },
    {
      id: 'beneficiary',
      title: 'Solicitar Ayuda',
      subtitle: 'Gestión de necesidades',
      iconName: 'help-circle',
      color: '#2563EB',
      route: 'Beneficiary',
    },
    {
      id: 'profile',
      title: 'Mi Perfil',
      subtitle: 'Certificados y configuración',
      iconName: 'user',
      color: '#9333EA',
      route: 'Profile',
    },
  ];

  const handleActionPress = (action: HomeQuickAction) => {
    if (navigation?.navigate) {
      navigation.navigate(action.route);
    }
  };

  const handleEventPress = (eventId: string) => {
    if (navigation?.navigate) {
      navigation.navigate('Events', { screen: 'EventDetail', params: { eventId } });
    }
  };

  return {
    user,
    stats,
    featuredEvents,
    quickActions,
    isLoading,
    refreshing,
    onRefresh,
    handleActionPress,
    handleEventPress,
  };
}

export default useHomeController;
