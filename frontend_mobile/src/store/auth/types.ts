export interface User {
  id_usuario: number;
  rol: 'Admin' | 'Voluntario' | 'Beneficiario' | 'Organizacion';
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  foto?: string;
  estado: number;
  verificada?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (correo: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: any, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}
