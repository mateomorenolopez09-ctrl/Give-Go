export interface Donacion {
  id_donacion: number;
  id_donante?: number;
  id_organizacion?: number;
  id_categoria: number;
  tipo_donacion: 'monetaria' | 'especie';
  monto?: number;
  moneda?: string;
  descripcion_especie?: string;
  estado: string;
  fecha_donacion: string;
  comprobante_url?: string;
  anonima: boolean;
  donante_nombre?: string;
  organizacion_nombre?: string;
}

export interface CreateDonationPayload {
  tipo_donacion: 'monetaria' | 'especie';
  monto?: number;
  descripcion_especie?: string;
  id_organizacion?: number;
  id_categoria: number;
  anonima?: boolean;
}
