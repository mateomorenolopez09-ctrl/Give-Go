import { apiClient } from '../../../services/api/apiClient';
import { Evento, Postulacion } from '../models/event.models';

const normalizeEvent = (evt: any): Evento => {
  if (!evt) return evt;
  const idNum = evt.id_evento !== undefined ? evt.id_evento : (evt.id ? parseInt(String(evt.id).replace('evt_', ''), 10) : 0);
  return {
    id_evento: idNum,
    id: evt.id || `evt_${idNum}`,
    titulo: evt.titulo || evt.nombre || 'Sin título',
    nombre: evt.nombre || evt.titulo || 'Sin título',
    descripcion: evt.descripcion || '',
    id_categoria: evt.id_categoria || (evt.categoriaId ? parseInt(String(evt.categoriaId).replace('cat_', ''), 10) : 1),
    nombre_categoria: evt.nombre_categoria || evt.categoria || 'General',
    categoria: evt.categoria || evt.nombre_categoria || 'General',
    id_organizacion: evt.id_organizacion || (evt.organizacionId ? parseInt(String(evt.organizacionId).replace('org_', ''), 10) : 1),
    nombre_organizacion: evt.nombre_organizacion || evt.organizacionNombre || '',
    organizacionNombre: evt.organizacionNombre || evt.nombre_organizacion || '',
    organizacion_verificada: evt.organizacion_verificada ?? true,
    fecha_inicio: evt.fecha_inicio || evt.fecha || new Date().toISOString(),
    fecha: evt.fecha || evt.fecha_inicio || new Date().toISOString(),
    hora_inicio: evt.hora_inicio || '08:00',
    hora_fin: evt.hora_fin || '12:00',
    cupo_maximo: evt.cupo_maximo || evt.cupo || 20,
    cupos_disponibles: evt.cupos_disponibles ?? evt.vacantesVoluntarios ?? evt.cupo ?? 20,
    cupos_ocupados: evt.cupos_ocupados || 0,
    vacantesVoluntarios: evt.vacantesVoluntarios ?? evt.cupos_disponibles ?? 20,
    vacantesBeneficiarios: evt.vacantesBeneficiarios ?? 20,
    direccion: evt.direccion || '',
    barrio: evt.barrio || '',
    localidad: evt.localidad || 'Bogotá',
    latitud: evt.latitud || null,
    longitud: evt.longitud || null,
    estado: evt.estado || 'activo',
    imagen_url: evt.imagen_url || evt.imagen || '',
  } as any;
};

export const eventFeatureService = {
  async getAll(categoriaId?: number): Promise<Evento[]> {
    const params: any = {};
    if (categoriaId) params.categoria = categoriaId;
    const res = await apiClient.get('/events', { params });
    const rawList = res.data.data || [];
    return rawList.map(normalizeEvent);
  },

  async getById(id: number | string): Promise<Evento> {
    const res = await apiClient.get(`/events/${id}`);
    return normalizeEvent(res.data.data);
  },

  async create(data: Partial<Evento>): Promise<Evento> {
    const payload = {
      nombre: data.titulo || (data as any).nombre,
      titulo: data.titulo || (data as any).nombre,
      descripcion: data.descripcion,
      fecha: data.fecha_inicio || (data as any).fecha,
      fecha_inicio: data.fecha_inicio || (data as any).fecha,
      hora_inicio: data.hora_inicio,
      cupo: data.cupo_maximo || (data as any).cupo,
      cupo_maximo: data.cupo_maximo || (data as any).cupo,
      categoria: data.id_categoria || (data as any).categoria || 1,
      id_categoria: data.id_categoria || 1,
      direccion: data.direccion,
      barrio: data.barrio,
      localidad: data.localidad,
      estado: data.estado || 'activo',
    };
    const res = await apiClient.post('/events', payload);
    return normalizeEvent(res.data.data);
  },

  async update(id: number | string, data: Partial<Evento>): Promise<Evento> {
    const res = await apiClient.put(`/events/${id}`, data);
    return normalizeEvent(res.data.data);
  },

  async delete(id: number | string): Promise<boolean> {
    const res = await apiClient.delete(`/events/${id}`);
    return res.data.success;
  },

  async registerParticipant(eventoId: number | string, tipo?: 'voluntario' | 'beneficiario'): Promise<{ success: boolean; message?: string }> {
    const res = await apiClient.post(`/events/${eventoId}/register`, { tipo: tipo || 'voluntario' });
    return res.data;
  },

  async getCategories() {
    const res = await apiClient.get('/categories');
    const list = res.data.data || [];
    return list.map((c: any) => ({
      ...c,
      id_categoria: c.id_categoria ?? (c.id ? parseInt(String(c.id).replace('cat_', ''), 10) : 1),
      nombre: c.nombre || c.nombre_categoria || 'Categoría',
    }));
  },

  async getUserPostulaciones(usuarioId: number | string): Promise<Postulacion[]> {
    const res = await apiClient.get(`/postulaciones/usuario/${usuarioId}`);
    return res.data.data || [];
  },
};

export default eventFeatureService;

