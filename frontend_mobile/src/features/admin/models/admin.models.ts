export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalDonations: number;
  pendingVerifications: number;
}

export interface AdminUserItem {
  id_usuario: number | string;
  nombre1: string;
  apellido1: string;
  correo: string;
  rol: 'Admin' | 'Voluntario' | 'Beneficiario' | 'Organizacion';
  estado: number;
  fecha_registro?: string;
}

export interface AdminAuditItem {
  id_audit: number;
  fecha: string;
  accion: string;
  nombre_usuario: string;
  rol_usuario: string;
}
