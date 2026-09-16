export interface SolicitudAyuda {
  id_solicitud: number;
  id_beneficiario: number;
  id_categoria: number;
  categoria_nombre?: string;
  titulo: string;
  descripcion: string;
  urgencia: 'baja' | 'media' | 'alta';
  estado: 'pendiente' | 'en_revision' | 'aprobada' | 'entregada' | 'rechazada';
  fecha_solicitud: string;
  direccion_entrega?: string;
  barrio?: string;
  localidad?: string;
}

export interface CreateSolicitudPayload {
  id_categoria: number;
  titulo: string;
  descripcion: string;
  urgencia: 'baja' | 'media' | 'alta';
  direccion_entrega?: string;
  barrio?: string;
  localidad?: string;
}
