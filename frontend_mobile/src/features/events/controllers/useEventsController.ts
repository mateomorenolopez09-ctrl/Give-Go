import { useState, useEffect, useCallback } from 'react';
import { Evento } from '../models/event.models';
import { eventFeatureService } from '../services/event.service';
import { useAuth } from '../../../store/auth/AuthContext';

export const useEventsController = (navigation: any) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Evento[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventFeatureService.getAll(selectedCategory || undefined);
      setEvents(data);
    } catch (e) {
      console.warn('Error al cargar eventos:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const cats = await eventFeatureService.getCategories();
      setCategories(cats);
    } catch (e) {
      console.warn('Error al cargar categorias:', e);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchEvents();
  }, [fetchEvents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchEvents();
  };

  const handleSelectCategory = (categoryId: number | null) => {
    setSelectedCategory(prev => (prev === categoryId ? null : categoryId));
  };

  const navigateToDetail = (event: Evento) => {
    navigation.navigate('EventDetail', { eventId: event.id_evento });
  };

  const navigateToCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  return {
    user,
    events,
    categories,
    selectedCategory,
    isLoading,
    isRefreshing,
    handleRefresh,
    handleSelectCategory,
    navigateToDetail,
    navigateToCreateEvent,
  };
};

export default useEventsController;
