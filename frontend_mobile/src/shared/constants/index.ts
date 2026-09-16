export const CATEGORIES_FALLBACK = [
  { id_categoria: 1, nombre: 'Alimentos', descripcion: 'Donaciones de alimentos y canastas básicas' },
  { id_categoria: 2, nombre: 'Educación', descripcion: 'Apoyo educativo, tutorías y útiles' },
  { id_categoria: 3, nombre: 'Salud', descripcion: 'Campañas médicas y kits de salud preventiva' },
  { id_categoria: 4, nombre: 'Medio Ambiente', descripcion: 'Reforestación y jornadas de reciclaje' },
  { id_categoria: 5, nombre: 'Económico', descripcion: 'Aportaciones monetarias a causas directas' },
];

export const APPLICATION_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobado',
  REJECTED: 'rechazado',
  CONFIRMED: 'confirmado',
  CANCELLED: 'cancelado',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  VOLUNTEER: 'voluntario',
  BENEFICIARY: 'beneficiario',
  ORGANIZATION: 'organizacion',
} as const;
