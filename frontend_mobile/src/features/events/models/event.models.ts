export interface Evento {
  id_evento: number;
  id_organizacion?: number;
  nombre_organizacion?: string;
  organizacion_verificada?: boolean;
  id_categoria: number;
  nombre_categoria?: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  hora_inicio?: string;
  hora_fin?: string;
  cupo_maximo?: number;
  cupos_disponibles?: number;
  cupos_ocupados?: number;
  direccion?: string;
  barrio?: string;
  localidad?: string;
  latitud?: number;
  longitud?: number;
  estado: string;
  imagen_url?: string;
}

export interface Postulacion {
  id_postulacion: number;
  id_evento: number;
  id_usuario: number;
  tipo: 'voluntario' | 'beneficiario';
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  fecha_registro: string;
  evento_titulo?: string;
  usuario_nombre?: string;
}
