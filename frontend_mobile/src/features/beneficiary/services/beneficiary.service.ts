import { apiClient } from '../../../services/api/apiClient';
import { SolicitudAyuda, CreateSolicitudPayload } from '../models/beneficiary.models';

const normalizeRequest = (r: any): SolicitudAyuda => {
  if (!r) return r;
  const idNum = r.id_solicitud !== undefined ? r.id_solicitud : (r.id ? parseInt(String(r.id).replace('sol_', ''), 10) : 0);
  const uId = r.id_beneficiario || (r.beneficiarioId ? parseInt(String(r.beneficiarioId).replace('usr_', ''), 10) : 1);
  const rawStatus = (r.estado || 'pendiente').toLowerCase();
  let statusVal: SolicitudAyuda['estado'] = 'pendiente';
  if (rawStatus.includes('aprob') || rawStatus === 'completada') statusVal = 'aprobada';
  else if (rawStatus.includes('rechaz')) statusVal = 'rechazada';
  else if (rawStatus.includes('entreg')) statusVal = 'entregada';
  else if (rawStatus.includes('revis')) statusVal = 'en_revision';

  return {
    id_solicitud: idNum,
    id_beneficiario: uId,
    id_categoria: r.id_categoria || 1,
    categoria_nombre: r.categoria_nombre || r.categoria || 'Ayuda Humanitaria',
    titulo: r.titulo || 'Solicitud de Asistencia',
    descripcion: r.descripcion || '',
    urgencia: (r.urgencia || 'media').toLowerCase(),
    estado: statusVal,
    fecha_solicitud: r.fecha_solicitud || r.fecha || new Date().toISOString(),
    direccion_entrega: r.direccion_entrega || r.direccion || '',
    barrio: r.barrio || '',
    localidad: r.localidad || 'Bogotá',
  };
};

export const beneficiaryFeatureService = {
  async getMyRequests(): Promise<SolicitudAyuda[]> {
    const res = await apiClient.get('/requests/me');
    const list = res.data.data || [];
    return list.map(normalizeRequest);
  },

  async createRequest(payload: CreateSolicitudPayload): Promise<SolicitudAyuda> {
    const res = await apiClient.post('/requests', {
      ...payload,
      beneficiarioId: undefined, // Let token handle or send
    });
    return normalizeRequest(res.data.data);
  },

  async cancelRequest(id: number): Promise<boolean> {
    const res = await apiClient.delete(`/requests/${id}`);
    return res.data.success;
  },
};

export default beneficiaryFeatureService;

