import { NotificationItem } from '../models/notification.models';

export const notificationFeatureService = {
  async getNotifications(): Promise<NotificationItem[]> {
    return [
      {
        id: 1,
        titulo: '¡Bienvenido a Give&Go!',
        mensaje: 'Explora jornadas de voluntariado y oportunidades de impacto en tu localidad.',
        fecha: new Date().toISOString(),
        leida: false,
        tipo: 'sistema',
      },
      {
        id: 2,
        titulo: 'Convocatoria cerca de ti',
        mensaje: 'Hay una jornada comunitaria en Kennedy este fin de semana.',
        fecha: new Date(Date.now() - 86400000).toISOString(),
        leida: true,
        tipo: 'evento',
      },
    ];
  },
};

export default notificationFeatureService;
