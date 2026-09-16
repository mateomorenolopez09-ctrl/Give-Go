import { apiClient } from '../../../services/api/apiClient';
import { Donacion, CreateDonationPayload } from '../models/donation.models';

const normalizeDonation = (d: any): Donacion => {
  if (!d) return d;
  const isMonetary = (d.tipo || d.tipo_donacion || '').toLowerCase() === 'monetaria';
  const idNum = d.id_donacion !== undefined ? d.id_donacion : (d.id ? parseInt(String(d.id).replace('don_', ''), 10) : 0);
  const montoVal = d.monto !== undefined ? d.monto : (d.monetaria?.valor !== undefined ? d.monetaria.valor : (d.valor ? parseFloat(String(d.valor)) : 0));
  const descEspecie = d.descripcion_especie || d.objeto?.descripcion || d.objeto_descripcion || (d.objeto ? `${d.objeto.categoria} (${d.objeto.cantidad} unid.)` : '');

  return {
    id_donacion: idNum,
    id_donante: d.usuario_id || (d.usuarioId ? parseInt(String(d.usuarioId).replace('usr_', ''), 10) : undefined),
    id_organizacion: d.organizacion_id || (d.organizacionId ? parseInt(String(d.organizacionId).replace('org_', ''), 10) : undefined),
    id_categoria: d.id_categoria || 1,
    tipo_donacion: isMonetary ? 'monetaria' : 'especie',
    monto: montoVal,
    moneda: 'COP',
    descripcion_especie: descEspecie,
    estado: d.estado || 'completada',
    fecha_donacion: d.fecha_donacion || d.fecha || new Date().toISOString(),
    anonima: d.anonima ?? false,
    donante_nombre: d.donante_nombre || d.usuarioNombre || 'Donante Solidario',
    organizacion_nombre: d.organizacion_nombre || d.organizacionNombre || 'Organización',
  };
};

export const donationFeatureService = {
  async getAll(): Promise<Donacion[]> {
    const res = await apiClient.get('/donations');
    const list = res.data.data || [];
    return list.map(normalizeDonation);
  },

  async getById(id: number | string): Promise<Donacion> {
    const res = await apiClient.get(`/donations/${id}`);
    return normalizeDonation(res.data.data);
  },

  async create(data: CreateDonationPayload): Promise<Donacion> {
    const payload = {
      tipo_donacion: data.tipo_donacion,
      tipo: data.tipo_donacion,
      monto: data.monto,
      descripcion_especie: data.descripcion_especie,
      id_categoria: data.id_categoria || 1,
      id_organizacion: data.id_organizacion || 1,
      anonima: data.anonima ?? false,
      monetary: data.tipo_donacion === 'monetaria' ? {
        valor: data.monto || 50000,
        metodo: 'tarjeta',
        cuenta: '*** 1234'
      } : undefined,
      objectDetail: data.tipo_donacion === 'especie' ? {
        categoria: 'Alimentos y Víveres',
        descripcion: data.descripcion_especie || 'Donación en especie',
        cantidad: 1
      } : undefined
    };
    const res = await apiClient.post('/donations', payload);
    return normalizeDonation(res.data.data);
  },

  async getMyDonations(): Promise<Donacion[]> {
    const res = await apiClient.get('/donations/user/me');
    const list = res.data.data || [];
    return list.map(normalizeDonation);
  },
};

export default donationFeatureService;

