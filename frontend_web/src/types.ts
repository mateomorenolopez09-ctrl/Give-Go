export type UserRole = 'admin' | 'voluntario' | 'beneficiario' | 'organizacion';

export interface UserPrivacyConfig {
  mostrarCorreo?: boolean;
  mostrarTelefono?: boolean;
  mostrarUbicacion?: boolean;
  mostrarBiografia?: boolean;
  mostrarEstadisticas?: boolean;
}

export interface UserSocials {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  github?: string;
}

export interface Usuario {
  id: string;
  rol: UserRole;
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  telefono?: string;
  correo?: string;
  password?: string;
  estado: 'activo' | 'inactivo';
  tipo_documento?: string;
  num_documento?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  codigo_postal?: string;
  foto?: string;
  biografia?: string;
  fotoPortada?: string;
  foto_portada?: string;
  sitioWeb?: string;
  redesSociales?: UserSocials;
  privacidad?: UserPrivacyConfig;
  mision?: string;
  vision?: string;
  fechaRegistro?: string;
  // Campos de organización cuando el usuario es una Organización
  organizacionId?: string;
  id_organizacion?: number;
  nit?: string;
  representante_legal?: string;
  categoria?: string;
  logo?: string;
  descripcion?: string;
  verificada?: boolean;
  estadoVerificacion?: 'no_solicitado' | 'pendiente' | 'aprobada' | 'rechazada';
}

export interface Organizacion {
  id: string;
  nombre: string;
  direccion: string;
  correo: string;
  password?: string;
  telefono?: string;
  nit?: string;
  representante_legal?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  descripcion?: string;
  categoria?: string;
  logo?: string;
  latitud?: number | null;
  longitud?: number | null;
  mision?: string;
  vision?: string;
  sitioWeb?: string;
  redesSociales?: UserSocials;
  fotoPortada?: string;
  verificada?: boolean;
  estadoVerificacion?: 'no_solicitado' | 'pendiente' | 'aprobada' | 'rechazada';
}

export interface SolicitudVerificacion {
  id: string;
  id_solicitud?: number;
  organizacionId: string;
  id_organizacion?: number;
  nombreOrganizacion: string;
  correoOrganizacion: string;
  nit?: string;
  mensaje?: string;
  documentos?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuestaAdmin?: string;
  fechaSolicitud: string;
  fechaRespuesta?: string | null;
}

export interface UserBadge {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string; // 'shield' | 'award' | 'check' | 'heart' | 'star'
  fechaObtencion: string;
}

export interface UserActivityItem {
  id: string;
  tipo: 'evento' | 'postulacion' | 'donacion' | 'solicitud' | 'insignia';
  titulo: string;
  descripcion: string;
  fecha: string;
  link?: string;
}

export interface PublicProfileData {
  user: Usuario;
  organization?: Organizacion;
  stats: {
    // Admin
    usuariosAdministrados?: number;
    organizacionesVerificadas?: number;
    eventosAdministrados?: number;
    // Org
    eventosCreados?: number;
    beneficiariosAtendidos?: number;
    voluntariosRegistrados?: number;
    donacionesRecibidas?: number;
    // Volunteer
    eventosParticipados?: number;
    horasVoluntariado?: number;
    certificados?: number;
    donacionesRealizadas?: number;
    // Beneficiary
    eventosAyudaRecibida?: number;
    ayudasRecibidas?: number;
    organizacionesApoyo?: number;
  };
  actividadReciente: UserActivityItem[];
  eventosRelacionados: Evento[];
  insignias: UserBadge[];
}

export interface Evento {
  id: string;
  nombre: string;
  categoria: string; // id de la categoria o nombre
  descripcion: string;
  fecha: string;
  estado: 'activo' | 'finalizado' | 'cancelado';
  organizacionId: string;
  organizacionNombre?: string;
  direccion?: string;
  cupo?: number;
  vacantesVoluntarios?: number;
  vacantesBeneficiarios?: number;
  ayudaOfrecida?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  punto_referencia?: string;
  nombre_lugar?: string;
  latitud?: number | null;
  longitud?: number | null;
  imagen?: string;
}

export interface Postulacion {
  id: string;
  eventoId: string;
  eventoNombre?: string;
  eventoFecha?: string;
  eventoDireccion?: string;
  ayudaOfrecida?: string;
  organizacionNombre?: string;
  usuarioId: string;
  usuarioNombre?: string;
  usuarioCorreo?: string;
  usuarioTelefono?: string;
  tipoPostulacion: 'voluntario' | 'beneficiario';
  estadoPostulacion: 'pendiente' | 'aprobado' | 'rechazado' | 'confirmado' | 'cancelado';
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'confirmado' | 'cancelado' | string;
  fechaPostulacion: string;
  fechaAprobacion?: string;
  fechaConfirmacion?: string;
  observaciones?: string;
}

export interface SeguimientoEvento {
  eventoId: string;
  usuarioId: string;
  fechaRegistro: string;
}

export interface Donacion {
  id: string;
  categoria: string; // e.g., 'Alimentos', 'Salud', 'Educación', 'Económico'
  tipo: 'monetaria' | 'objeto';
  fecha: string;
  usuarioId: string; // ID del voluntario donante
  organizacionId: string; // ID de la organización destino
}

export interface DonacionMonetaria {
  id: string;
  metodo: string; // 'transferencia' | 'tarjeta' | 'paypal'
  cuenta: string;
  valor: number;
  donacionId: string;
}

export interface DonacionObjeto {
  id: string;
  categoria: string;
  descripcion: string;
  cantidad: number;
  donacionId: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'activo' | 'inactivo';
}

export interface Solicitud {
  id: string;
  beneficiarioId: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'completada';
  fecha: string;
}
