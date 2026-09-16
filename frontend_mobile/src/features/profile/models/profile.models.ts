import { User } from '../../../store/auth/types';

export interface UserProfile extends User {
  total_horas_voluntariado?: number;
  total_donaciones?: number;
  total_jornadas?: number;
}

export interface UpdateProfilePayload {
  nombre1?: string;
  nombre2?: string;
  apellido1?: string;
  apellido2?: string;
  telefono?: string;
  direccion?: string;
  barrio?: string;
  localidad?: string;
}
