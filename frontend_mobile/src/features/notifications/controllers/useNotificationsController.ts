import { useState, useEffect } from 'react';
import { NotificationItem } from '../models/notification.models';
import { notificationFeatureService } from '../services/notification.service';

export const useNotificationsController = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const items = await notificationFeatureService.getNotifications();
      setNotifications(items);
    } catch (e) {
      console.warn('Error al cargar notificaciones:', e);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifications,
    isLoading,
    refresh: loadNotifications,
  };
};

export default useNotificationsController;
