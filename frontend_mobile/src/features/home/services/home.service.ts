import apiClient from '../../../config/api';
import { HomeSummaryStats, HomeEventPreview } from '../models/home.models';

export const HomeService = {
  async getSummaryStats(): Promise<HomeSummaryStats> {
    try {
      const res = await apiClient.get('/users/stats/volunteers-count');
      const volCount = res.data?.data || res.data || 0;

      const eventsRes = await apiClient.get('/events');
      const events = Array.isArray(eventsRes.data?.data) ? eventsRes.data.data : [];

      const donationsRes = await apiClient.get('/donations');
      const donations = Array.isArray(donationsRes.data?.data) ? donationsRes.data.data : [];

      return {
        voluntariosCount: typeof volCount === 'number' ? volCount : 12,
        eventosActivosCount: events.length || 5,
        donacionesCount: donations.length || 8,
        beneficiariosImpactados: (events.length * 25) + 50,
      };
    } catch (e) {
      console.warn('Error fetching home stats, using fallback:', e);
      return {
        voluntariosCount: 48,
        eventosActivosCount: 6,
        donacionesCount: 14,
        beneficiariosImpactados: 210,
      };
    }
  },

  async getFeaturedEvents(): Promise<HomeEventPreview[]> {
    try {
      const res = await apiClient.get('/events');
      const items = Array.isArray(res.data?.data) ? res.data.data : [];
      return items.slice(0, 3).map((item: any) => ({
        id: String(item.id_evento || item.id),
        nombre: item.nombre,
        fecha: item.fecha,
        categoria: item.categoriaNombre || 'Comunidad',
        organizacionNombre: item.organizacionNombre || 'Organización Aliada',
        vacantes: item.vacantes_voluntarios || item.cupo || 0,
        imagen: item.imagen,
      }));
    } catch (e) {
      console.warn('Error fetching featured events:', e);
      return [];
    }
  },
};

export default HomeService;
