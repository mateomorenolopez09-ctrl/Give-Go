import { Usuario, Organizacion, Evento, Categoria, Solicitud, Donacion, DonacionMonetaria, DonacionObjeto } from '../types';

export const INITIAL_USERS: Usuario[] = [
  {
    id: 'user_admin',
    rol: 'admin',
    nombre1: 'Administrador',
    nombre2: 'Global',
    apellido1: 'Give',
    apellido2: 'Go',
    telefono: '+57 300 123 4567',
    correo: 'admin@giveandgo.com',
    password: 'Admin123*',
    estado: 'activo'
  },
  {
    id: 'user_vol_1',
    rol: 'voluntario',
    nombre1: 'Carlos',
    nombre2: 'Andrés',
    apellido1: 'Mendoza',
    apellido2: 'Castro',
    telefono: '+57 310 987 6543',
    correo: 'carlos@volunteer.com',
    password: 'User123*',
    estado: 'activo'
  },
  {
    id: 'user_vol_2',
    rol: 'voluntario',
    nombre1: 'Sofía',
    apellido1: 'Pérez',
    telefono: '+57 315 222 3333',
    correo: 'sofia@volunteer.com',
    password: 'User123*',
    estado: 'activo'
  },
  {
    id: 'user_ben_1',
    rol: 'beneficiario',
    nombre1: 'Juan',
    apellido1: 'Gómez',
    telefono: '+57 320 444 5555',
    correo: 'juan@beneficiary.com',
    password: 'User123*',
    estado: 'activo'
  },
  {
    id: 'user_ben_2',
    rol: 'beneficiario',
    nombre1: 'María',
    apellido1: 'Rodríguez',
    telefono: '+57 301 555 6666',
    correo: 'maria@beneficiary.com',
    password: 'User123*',
    estado: 'activo'
  }
];

export const INITIAL_ORGANIZATIONS: Organizacion[] = [
  {
    id: 'org_1',
    nombre: 'Fundación Manos por Kennedy',
    direccion: 'Calle 38 Sur # 78-45, Kennedy Central, Bogotá D.C.',
    correo: 'contacto@manosporkennedy.org',
    password: 'Org123*'
  },
  {
    id: 'org_2',
    nombre: 'Fundación Bogotá Solidaria',
    direccion: 'Carrera 80 # 40B Sur-12, Castilla, Bogotá D.C.',
    correo: 'info@bogotasolidaria.org',
    password: 'Org123*'
  },
  {
    id: 'org_3',
    nombre: 'Asociación Social Ciudad Kennedy',
    direccion: 'Avenida Ciudad de Cali # 13-08, Patio Bonito, Bogotá D.C.',
    correo: 'hola@ciudadkennedy.org',
    password: 'Org123*'
  }
];

// Ensure they also exist in Users list with 'organizacion' role to support unified login if needed
export const INITIAL_ORG_USERS: Usuario[] = INITIAL_ORGANIZATIONS.map(org => ({
  id: org.id,
  rol: 'organizacion',
  nombre1: org.nombre,
  apellido1: 'Organización',
  telefono: '+57 300 000 0000',
  correo: org.correo,
  password: org.password,
  estado: 'activo'
}));

export const INITIAL_CATEGORIES: Categoria[] = [
  {
    id: 'cat_1',
    nombre: 'Alimentos',
    descripcion: 'Campañas de recogida y distribución de alimentos no perecederos en la localidad',
    estado: 'activo'
  },
  {
    id: 'cat_2',
    nombre: 'Educación',
    descripcion: 'Apoyo escolar, donación de útiles y kits escolares, tutorías pedagógicas',
    estado: 'activo'
  },
  {
    id: 'cat_3',
    nombre: 'Salud',
    descripcion: 'Asistencia médica comunitaria, brigadas de salud y donación de elementos de higiene',
    estado: 'activo'
  },
  {
    id: 'cat_4',
    nombre: 'Medio Ambiente',
    descripcion: 'Reforestación de zonas verdes, recuperación de parques y limpieza de humedales',
    estado: 'activo'
  },
  {
    id: 'cat_5',
    nombre: 'Económico',
    descripcion: 'Aportaciones monetarias para el sostenimiento de comedores comunitarios y albergues',
    estado: 'activo'
  }
];

export const INITIAL_EVENTS: Evento[] = [
  {
    id: 'evt_1',
    nombre: 'Jornada de Donación en Kennedy Central',
    categoria: 'Alimentos',
    descripcion: 'Ayúdanos a clasificar y empaquetar alimentos recibidos para las familias vulnerables de la localidad de Kennedy en nuestro centro comunitario.',
    fecha: '2026-07-15',
    estado: 'activo',
    organizacionId: 'org_1'
  },
  {
    id: 'evt_2',
    nombre: 'Campaña Solidaria Patio Bonito',
    categoria: 'Educación',
    descripcion: 'Buscamos voluntarios para apoyar en el reforzamiento escolar y tutorías los fines de semana para niños del sector de Patio Bonito.',
    fecha: '2026-07-20',
    estado: 'activo',
    organizacionId: 'org_1'
  },
  {
    id: 'evt_3',
    nombre: 'Reforestación del Humedal El Burro',
    categoria: 'Medio Ambiente',
    descripcion: 'Jornada de siembra de especies nativas y limpieza en el Humedal El Burro de Kennedy. ¡Trae ropa cómoda y guantes!',
    fecha: '2026-08-05',
    estado: 'activo',
    organizacionId: 'org_3'
  },
  {
    id: 'evt_4',
    nombre: 'Jornada Comunitaria Castilla',
    categoria: 'Salud',
    descripcion: 'Campaña de salud básica preventiva y entrega de kits de aseo para adultos mayores del barrio Castilla.',
    fecha: '2026-06-30',
    estado: 'activo',
    organizacionId: 'org_2'
  }
];

export const INITIAL_REQUESTS: Solicitud[] = [
  {
    id: 'sol_1',
    beneficiarioId: 'user_ben_1',
    titulo: 'Apoyo alimentario en Patio Bonito',
    descripcion: 'Solicito mercado básico no perecedero para mi núcleo familiar de 4 personas en el barrio Patio Bonito, Kennedy.',
    estado: 'pendiente',
    fecha: '2026-06-20'
  },
  {
    id: 'sol_2',
    beneficiarioId: 'user_ben_2',
    titulo: 'Útiles escolares en Castilla',
    descripcion: 'Necesito cuadernos, lápices y útiles escolares para mis dos hijos de primaria en Castilla.',
    estado: 'aprobada',
    fecha: '2026-06-18'
  },
  {
    id: 'sol_3',
    beneficiarioId: 'user_ben_1',
    titulo: 'Kit de medicamentos esenciales',
    descripcion: 'Solicitud de apoyo para adquirir medicamentos de control diario para un adulto mayor en el barrio Kennedy Central.',
    estado: 'rechazada',
    fecha: '2026-06-10'
  }
];

export const INITIAL_DONATIONS: Donacion[] = [
  {
    id: 'don_1',
    categoria: 'Económico',
    tipo: 'monetaria',
    fecha: '2026-06-22',
    usuarioId: 'user_vol_1',
    organizacionId: 'org_1'
  },
  {
    id: 'don_2',
    categoria: 'Alimentos',
    tipo: 'objeto',
    fecha: '2026-06-24',
    usuarioId: 'user_vol_2',
    organizacionId: 'org_2'
  }
];

export const INITIAL_DONATIONS_MONETARY: DonacionMonetaria[] = [
  {
    id: 'dm_1',
    metodo: 'tarjeta',
    cuenta: '**** **** **** 4321',
    valor: 150000,
    donacionId: 'don_1'
  }
];

export const INITIAL_DONATIONS_OBJECTS: DonacionObjeto[] = [
  {
    id: 'do_1',
    categoria: 'Alimentos',
    descripcion: '10 kg de arroz, 5 kg de legumbres y aceite vegetal',
    cantidad: 15,
    donacionId: 'don_2'
  }
];
