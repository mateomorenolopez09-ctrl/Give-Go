export interface LoginPayload {
  correo: string;
  password: string;
}

export interface RegisterVolunteerPayload {
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  correo: string;
  password: string;
  telefono?: string;
  direccion?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  rol: 'Voluntario';
}

export interface RegisterBeneficiaryPayload {
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  correo: string;
  password: string;
  telefono?: string;
  direccion?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  rol: 'Beneficiario';
}

export interface ForgotPasswordPayload {
  correo: string;
}
