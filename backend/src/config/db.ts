import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Configuración de variables de entorno con valores por defecto
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'giveandgo_v2',
  connectionLimit: 10,
};

let pool: mysql.Pool | null = null;
let useFallback = true;
let fallbackData: any = {};
const FALLBACK_FILE_PATH = path.join(process.cwd(), 'backend', 'src', 'data', 'fallback_db.json');

// Inicializar el JSON de fallback con datos semilla
const seedFallbackData = () => {
  fallbackData = {
    categorias: [
      { id_categoria: 1, nombre: 'Alimentos', descripcion: 'Donaciones de alimentos', estado: 1 },
      { id_categoria: 2, nombre: 'Educación', descripcion: 'Apoyo educativo', estado: 1 },
      { id_categoria: 3, nombre: 'Salud', descripcion: 'Campañas de salud', estado: 1 },
      { id_categoria: 4, nombre: 'Medio Ambiente', descripcion: 'Reforestación de zonas verdes', estado: 1 },
      { id_categoria: 5, nombre: 'Económico', descripcion: 'Aportaciones monetarias', estado: 1 },
    ],
    usuarios: [
      {
        id_usuario: 1,
        rol: 'Admin',
        nombre1: 'Administrador',
        apellido1: 'General',
        correo: 'admin@giveandgo.com',
        // Hash de 'Admin123*'
        password: '$2b$10$tZ9C.mJjXNco/e.e2jV9SeAAL68L16S78A9oGv2o62H9R1pW61qE.',
        telefono: '+57 300 123 4567',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 999,
        rol: 'Voluntario',
        nombre1: 'Donante',
        apellido1: 'Anónimo',
        correo: 'anonimo@giveandgo.com',
        password: 'none',
        telefono: '',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 2,
        rol: 'Voluntario',
        nombre1: 'Carlos',
        nombre2: 'Andrés',
        apellido1: 'Mendoza',
        apellido2: 'Castro',
        correo: 'carlos@volunteer.com',
        // Hash de 'User123*'
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 310 987 6543',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 3,
        rol: 'Voluntario',
        nombre1: 'Sofía',
        apellido1: 'Pérez',
        correo: 'sofia@volunteer.com',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 315 222 3333',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 4,
        rol: 'Beneficiario',
        nombre1: 'Juan',
        apellido1: 'Gómez',
        correo: 'juan@beneficiary.com',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 320 444 5555',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 5,
        rol: 'Beneficiario',
        nombre1: 'María',
        apellido1: 'Rodríguez',
        correo: 'maria@beneficiary.com',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 301 555 6666',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 101, // Vinculado a org_1
        rol: 'Organizacion',
        nombre1: 'Fundación Manos por Kennedy',
        apellido1: 'Organización',
        correo: 'contacto@manosporkennedy.org',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 300 000 0000',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 102, // Vinculado a org_2
        rol: 'Organizacion',
        nombre1: 'Fundación Bogotá Solidaria',
        apellido1: 'Organización',
        correo: 'info@bogotasolidaria.org',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 300 000 0000',
        estado: 1,
        fecha_registro: new Date().toISOString()
      },
      {
        id_usuario: 103, // Vinculado a org_3
        rol: 'Organizacion',
        nombre1: 'Asociación Social Ciudad Kennedy',
        apellido1: 'Organización',
        correo: 'hola@ciudadkennedy.org',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 300 000 0000',
        estado: 1,
        fecha_registro: new Date().toISOString()
      }
    ],
    organizaciones: [
      {
        id_organizacion: 1,
        nombre: 'Fundación Manos por Kennedy',
        direccion: 'Calle 38 Sur # 78-45, Kennedy Central, Bogotá D.C.',
        correo: 'contacto@manosporkennedy.org',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 300 000 0000',
        descripcion: 'Institución comunitaria enfocada en brindar seguridad alimentaria en Kennedy.',
        estado: 1,
        fecha_registro: new Date().toISOString(),
        barrio: 'Kennedy Central',
        localidad: 'Kennedy',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        pais: 'Colombia',
        categoria: 'Alimentos',
        latitud: 4.6186,
        longitud: -74.1481
      },
      {
        id_organizacion: 2,
        nombre: 'Fundación Bogotá Solidaria',
        direccion: 'Carrera 80 # 40B Sur-12, Castilla, Bogotá D.C.',
        correo: 'info@bogotasolidaria.org',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 300 000 0000',
        descripcion: 'Fundación sin ánimo de lucro enfocada en desarrollo y asistencia a adultos mayores.',
        estado: 1,
        fecha_registro: new Date().toISOString(),
        barrio: 'Castilla',
        localidad: 'Kennedy',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        pais: 'Colombia',
        categoria: 'Salud',
        latitud: 4.6445,
        longitud: -74.1412
      },
      {
        id_organizacion: 3,
        nombre: 'Asociación Social Ciudad Kennedy',
        direccion: 'Avenida Ciudad de Cali # 13-08, Patio Bonito, Bogotá D.C.',
        correo: 'hola@ciudadkennedy.org',
        password: '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.',
        telefono: '+57 300 000 0000',
        descripcion: 'Organización para la recuperación ambiental y el apoyo pedagógico.',
        estado: 1,
        fecha_registro: new Date().toISOString(),
        barrio: 'Patio Bonito',
        localidad: 'Kennedy',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        pais: 'Colombia',
        categoria: 'Medio Ambiente',
        latitud: 4.6288,
        longitud: -74.1620
      }
    ],
    eventos: [
      {
        id_evento: 1,
        nombre: 'Jornada de Donación en Kennedy Central',
        id_categoria: 1,
        descripcion: 'Ayúdanos a clasificar y empaquetar alimentos recibidos para las familias vulnerables de la localidad de Kennedy en nuestro centro comunitario.',
        direccion: 'Calle 38 Sur # 78-45, Kennedy Central',
        fecha: '2026-07-15T09:00:00Z',
        cupo: 50,
        vacantes_voluntarios: 15,
        vacantes_beneficiarios: 35,
        ayuda_ofrecida: 'Entrega de paquetes nutricionales y mercados básicos con arroz, legumbres y aceite para núcleos familiares.',
        estado: 1,
        organizacion_id: 1,
        barrio: 'Kennedy Central',
        localidad: 'Kennedy',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        pais: 'Colombia',
        punto_referencia: 'Frente al parque central',
        nombre_lugar: 'Sede Principal',
        latitud: 4.6186,
        longitud: -74.1481,
        imagen: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000'
      },
      {
        id_evento: 2,
        nombre: 'Campaña Solidaria Patio Bonito',
        id_categoria: 2,
        descripcion: 'Buscamos voluntarios para apoyar en el reforzamiento escolar y tutorías los fines de semana para niños del sector de Patio Bonito.',
        direccion: 'Avenida Ciudad de Cali # 13-08',
        fecha: '2026-07-20T08:00:00Z',
        cupo: 20,
        vacantes_voluntarios: 8,
        vacantes_beneficiarios: 25,
        ayuda_ofrecida: 'Kits completos de útiles escolares (cuadernos, cartuchera, colores) y tutorías de nivelación académica.',
        estado: 1,
        organizacion_id: 1,
        barrio: 'Patio Bonito',
        localidad: 'Kennedy',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        pais: 'Colombia',
        punto_referencia: 'Sede comunal',
        nombre_lugar: 'Salón Comunal Patio Bonito',
        latitud: 4.6288,
        longitud: -74.1620,
        imagen: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1000'
      },
      {
        id_evento: 3,
        nombre: 'Reforestación del Humedal El Burro',
        id_categoria: 4,
        descripcion: 'Jornada de siembra de especies nativas y limpieza en el Humedal El Burro de Kennedy. ¡Trae ropa cómoda y guantes!',
        direccion: 'Calle 8A con Carrera 82, Humedal El Burro',
        fecha: '2026-08-05T07:00:00Z',
        cupo: 100,
        vacantes_voluntarios: 40,
        vacantes_beneficiarios: 60,
        ayuda_ofrecida: 'Capacitación ambiental, refrigerios y entrega de plantas nativas ornamentales para la comunidad.',
        estado: 1,
        organizacion_id: 3,
        barrio: 'El Burro',
        localidad: 'Kennedy',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        pais: 'Colombia',
        punto_referencia: 'Entrada por la avenida Cali',
        nombre_lugar: 'Reserva Humedal El Burro',
        latitud: 4.6421,
        longitud: -74.1485,
        imagen: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1000'
      },
      {
        id_evento: 4,
        nombre: 'Jornada Comunitaria Castilla',
        id_categoria: 3,
        descripcion: 'Campaña de salud básica preventiva y entrega de kits de aseo para adultos mayores del barrio Castilla.',
        direccion: 'Carrera 80 # 40B Sur-12, Castilla',
        fecha: '2026-06-30T09:00:00Z',
        cupo: 30,
        vacantes_voluntarios: 10,
        vacantes_beneficiarios: 20,
        ayuda_ofrecida: 'Valoración médica básica preventiva, kits de aseo personal y orientación en hábitos de vida saludable.',
        estado: 1,
        organizacion_id: 2,
        barrio: 'Castilla',
        localidad: 'Kennedy',
        ciudad: 'Bogotá',
        departamento: 'Bogotá D.C.',
        pais: 'Colombia',
        punto_referencia: 'Diagonal a la iglesia de Castilla',
        nombre_lugar: 'Centro de Adulto Mayor Castilla',
        latitud: 4.6445,
        longitud: -74.1412,
        imagen: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000'
      }
    ],
    tabla_postulaciones: [
      {
        id_postulacion: 1,
        id_evento: 1,
        id_usuario: 4, // Juan (Beneficiario)
        tipo_postulacion: 'beneficiario',
        estado_postulacion: 'aprobado',
        fecha_postulacion: '2026-06-21T10:00:00Z',
        fecha_aprobacion: '2026-06-22T08:30:00Z',
        fecha_confirmacion: null,
        observaciones: 'Aprobado para recibir kit nutricional familiar.'
      },
      {
        id_postulacion: 2,
        id_evento: 2,
        id_usuario: 5, // María (Beneficiaria)
        tipo_postulacion: 'beneficiario',
        estado_postulacion: 'pendiente',
        fecha_postulacion: '2026-06-25T14:15:00Z',
        fecha_aprobacion: null,
        fecha_confirmacion: null,
        observaciones: 'Postulante registrada para kits escolares.'
      },
      {
        id_postulacion: 3,
        id_evento: 3,
        id_usuario: 2, // Carlos (Voluntario)
        tipo_postulacion: 'voluntario',
        estado_postulacion: 'confirmado',
        fecha_postulacion: '2026-06-20T09:00:00Z',
        fecha_aprobacion: '2026-06-20T11:00:00Z',
        fecha_confirmacion: '2026-06-21T12:00:00Z',
        observaciones: 'Voluntario confirmado para apoyo logístico.'
      }
    ],
    seguimiento_eventos: [],
    donaciones: [
      {
        id_donacion: 1,
        categoria: 'Económico',
        tipo: 'Monetaria',
        fecha: '2026-06-22T10:00:00Z',
        usuario_id: 2, // Carlos
        organizacion_id: 1, // Manos por Kennedy
        estado: 1,
        observaciones: 'Donación para la compra de suministros alimentarios.'
      },
      {
        id_donacion: 2,
        categoria: 'Alimentos',
        tipo: 'Objeto',
        fecha: '2026-06-24T15:30:00Z',
        usuario_id: 3, // Sofia
        organizacion_id: 2, // Bogotá Solidaria
        estado: 1,
        observaciones: 'Aporte en especie para el asilo de Castilla.'
      }
    ],
    donaciones_monetarias: [
      {
        id: 1,
        metodo: 'tarjeta',
        cuenta: '**** **** **** 4321',
        valor: 150000.00,
        donacion_id: 1
      }
    ],
    donaciones_objetos: [
      {
        id: 1,
        categoria: 'Alimentos',
        descripcion: '10 kg de arroz, 5 kg de legumbres y aceite vegetal',
        cantidad: 15,
        donacion_id: 2
      }
    ],
    solicitudes: [
      {
        id_solicitud: 1,
        usuario_id: 4, // Juan
        titulo: 'Apoyo alimentario en Patio Bonito',
        descripcion: 'Solicito mercado básico no perecedero para mi núcleo familiar de 4 personas en el barrio Patio Bonito, Kennedy.',
        estado: 'Pendiente',
        fecha: '2026-06-20T12:00:00Z'
      },
      {
        id_solicitud: 2,
        usuario_id: 5, // María
        titulo: 'Útiles escolares en Castilla',
        descripcion: 'Necesito cuadernos, lápices y útiles escolares para mis dos hijos de primaria en Castilla.',
        estado: 'Aprobada',
        fecha: '2026-06-18T10:00:00Z'
      },
      {
        id_solicitud: 3,
        usuario_id: 4, // Juan
        titulo: 'Kit de medicamentos esenciales',
        descripcion: 'Solicitud de apoyo para adquirir medicamentos de control diario para un adulto mayor en el barrio Kennedy Central.',
        estado: 'Rechazada',
        fecha: '2026-06-10T09:00:00Z'
      }
    ],
    auditorias: [
      {
        id_audit: 1,
        fecha: '2026-07-16T10:00:00.000Z',
        accion: 'Inicio de sesión exitoso del Administrador',
        id_usuario: 1,
        nombre_usuario: 'Administrador General',
        rol_usuario: 'Admin'
      },
      {
        id_audit: 2,
        fecha: '2026-07-16T11:15:00.000Z',
        accion: 'Creación de convocatoria exitosa: Reforestación del Humedal El Burro',
        id_usuario: 1,
        nombre_usuario: 'Administrador General',
        rol_usuario: 'Admin'
      },
      {
        id_audit: 3,
        fecha: '2026-07-16T12:30:00.000Z',
        accion: 'Inscripción de voluntario en el evento de Reforestación',
        id_usuario: 2,
        nombre_usuario: 'Carlos Mendoza',
        rol_usuario: 'Voluntario'
      }
    ]
  };
};

// Crear carpeta data si no existe
const dataDir = path.dirname(FALLBACK_FILE_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Cargar o guardar datos de fallback
const loadFallback = () => {
  if (fs.existsSync(FALLBACK_FILE_PATH)) {
    try {
      const dataStr = fs.readFileSync(FALLBACK_FILE_PATH, 'utf-8');
      fallbackData = JSON.parse(dataStr);
    } catch (e) {
      console.error('Error reading fallback database file, re-initializing seeds', e);
      seedFallbackData();
      saveFallback();
    }
  } else {
    seedFallbackData();
    saveFallback();
  }
};

const saveFallback = () => {
  try {
    fs.writeFileSync(FALLBACK_FILE_PATH, JSON.stringify(fallbackData, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing to fallback database file', e);
  }
};

loadFallback();

// Función para verificar y reparar el usuario administrador (admin@giveandgo.com / Admin123*)
async function checkAndRepairAdmin() {
  const adminEmail = 'admin@giveandgo.com';
  const adminPassword = 'Admin123*';
  
  try {
    const salt = await bcrypt.genSalt(10);
    const correctHash = await bcrypt.hash(adminPassword, salt);

    if (!useFallback && pool) {
      //  Verificar en MySQL
      const [rows]: any = await pool.query('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?)', [adminEmail]);
      if (rows.length === 0) {
        console.log('El usuario administrador no existe en MySQL. Creándolo...');
        await pool.query(
          `INSERT INTO usuarios (rol, nombre1, apellido1, correo, password, estado, telefono) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          ['Admin', 'Administrador', 'General', adminEmail, correctHash, 1, '+57 300 123 4567']
        );
        console.log('Usuario administrador creado con éxito en MySQL.');
      } else {
        const adminUser = rows[0];
        const isMatch = await bcrypt.compare(adminPassword, adminUser.password || '');
        if (!isMatch) {
          console.log('La contraseña del administrador no coincide en MySQL. Actualizándola...');
          await pool.query('UPDATE usuarios SET password = ? WHERE id_usuario = ?', [correctHash, adminUser.id_usuario]);
          console.log('Contraseña del administrador actualizada correctamente en MySQL.');
        } else {
          console.log('✔ Usuario administrador verificado y correcto en MySQL.');
        }
      }
    }


    const fallbackAdmin = fallbackData.usuarios.find((u: any) => u.correo.toLowerCase() === adminEmail);
    if (!fallbackAdmin) {
      console.log('El usuario administrador no existe en fallback. Creándolo...');
      const nextId = fallbackData.usuarios.length > 0 ? Math.max(...fallbackData.usuarios.map((u: any) => u.id_usuario)) + 1 : 1;
      fallbackData.usuarios.push({
        id_usuario: nextId,
        rol: 'Admin',
        nombre1: 'Administrador',
        apellido1: 'General',
        correo: adminEmail,
        password: correctHash,
        telefono: '+57 300 123 4567',
        estado: 1,
        fecha_registro: new Date().toISOString()
      });
      saveFallback();
      console.log('Usuario administrador creado con éxito en fallback.');
    } else {
      const isMatch = await bcrypt.compare(adminPassword, fallbackAdmin.password || '');
      if (!isMatch) {
        console.log('La contraseña del administrador no coincide en fallback. Actualizándola...');
        fallbackAdmin.password = correctHash;
        saveFallback();
        console.log('Contraseña del administrador actualizada correctamente en fallback.');
      } else {
        console.log('✔ Usuario administrador verificado y correcto en fallback.');
      }
    }
  } catch (err) {
    console.error('Error al verificar/reparar el administrador:', err);
  }
}

// 1. INICIALIZACIÓN DE LA CONEXIÓN MySQL (XAMPP / MariaDB / MySQL 8)
export const initDB = async () => {
  if (process.env.DB_HOST && process.env.DB_USER) {
    try {
      //  Intentar crear la base de datos automáticamente si no existe en XAMPP
      try {
        const rootConn = await mysql.createConnection({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password,
        });
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
        await rootConn.end();
      } catch (initDbErr: any) {
        
      }
    // 2 Crea el pool de conexiones a MySQL
      pool = mysql.createPool(dbConfig);
      
      const connection = await pool.getConnection();
      console.log(`✔ Conectado exitosamente a MySQL en ${dbConfig.host}:${dbConfig.port} (Base de datos: ${dbConfig.database})`);
      
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS categorias (
          id_categoria INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          descripcion TEXT DEFAULT NULL,
          estado TINYINT DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id_usuario INT AUTO_INCREMENT PRIMARY KEY,
          rol ENUM('Admin', 'Voluntario', 'Beneficiario', 'Organizacion') NOT NULL,
          nombre1 VARCHAR(50) NOT NULL,
          nombre2 VARCHAR(50) DEFAULT NULL,
          apellido1 VARCHAR(50) NOT NULL,
          apellido2 VARCHAR(50) DEFAULT NULL,
          tipo_documento VARCHAR(20) DEFAULT NULL,
          num_documento VARCHAR(50) DEFAULT NULL,
          fecha_nacimiento DATE DEFAULT NULL,
          telefono VARCHAR(20) DEFAULT NULL,
          correo VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          direccion VARCHAR(255) DEFAULT NULL,
          barrio VARCHAR(100) DEFAULT NULL,
          localidad VARCHAR(100) DEFAULT NULL,
          ciudad VARCHAR(100) DEFAULT 'Bogotá',
          departamento VARCHAR(100) DEFAULT 'Bogotá D.C.',
          pais VARCHAR(100) DEFAULT 'Colombia',
          codigo_postal VARCHAR(20) DEFAULT NULL,
          foto TEXT DEFAULT NULL,
          foto_portada TEXT DEFAULT NULL,
          biografia TEXT DEFAULT NULL,
          sitio_web VARCHAR(255) DEFAULT NULL,
          redes_sociales TEXT DEFAULT NULL,
          privacidad TEXT DEFAULT NULL,
          mision TEXT DEFAULT NULL,
          vision TEXT DEFAULT NULL,
          estado TINYINT DEFAULT 1,
          fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS organizaciones (
          id_organizacion INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          direccion VARCHAR(255) DEFAULT NULL,
          telefono VARCHAR(20) DEFAULT NULL,
          correo VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          descripcion TEXT DEFAULT NULL,
          nit VARCHAR(50) DEFAULT NULL,
          representante_legal VARCHAR(150) DEFAULT NULL,
          barrio VARCHAR(100) DEFAULT NULL,
          localidad VARCHAR(100) DEFAULT NULL,
          ciudad VARCHAR(100) DEFAULT 'Bogotá',
          departamento VARCHAR(100) DEFAULT 'Bogotá D.C.',
          pais VARCHAR(100) DEFAULT 'Colombia',
          categoria VARCHAR(100) DEFAULT NULL,
          logo TEXT DEFAULT NULL,
          foto_portada TEXT DEFAULT NULL,
          mision TEXT DEFAULT NULL,
          vision TEXT DEFAULT NULL,
          sitio_web VARCHAR(255) DEFAULT NULL,
          redes_sociales TEXT DEFAULT NULL,
          latitud DECIMAL(10,8) DEFAULT NULL,
          longitud DECIMAL(11,8) DEFAULT NULL,
          verificada TINYINT DEFAULT 0,
          estado_verificacion VARCHAR(50) DEFAULT 'no_solicitado',
          estado TINYINT DEFAULT 1,
          fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS eventos (
          id_evento INT AUTO_INCREMENT PRIMARY KEY,
          nombre VARCHAR(150) NOT NULL,
          id_categoria INT NOT NULL,
          descripcion TEXT DEFAULT NULL,
          direccion VARCHAR(255) DEFAULT NULL,
          fecha DATETIME NOT NULL,
          cupo INT DEFAULT 0,
          vacantes_voluntarios INT DEFAULT 0,
          vacantes_beneficiarios INT DEFAULT 0,
          ayuda_ofrecida TEXT DEFAULT NULL,
          estado TINYINT DEFAULT 1,
          organizacion_id INT NOT NULL,
          barrio VARCHAR(100) DEFAULT NULL,
          localidad VARCHAR(100) DEFAULT NULL,
          ciudad VARCHAR(100) DEFAULT 'Bogotá',
          departamento VARCHAR(100) DEFAULT 'Bogotá D.C.',
          pais VARCHAR(100) DEFAULT 'Colombia',
          punto_referencia VARCHAR(255) DEFAULT NULL,
          nombre_lugar VARCHAR(150) DEFAULT NULL,
          latitud DECIMAL(10,8) DEFAULT NULL,
          longitud DECIMAL(11,8) DEFAULT NULL,
          imagen TEXT DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS donaciones (
          id_donacion INT AUTO_INCREMENT PRIMARY KEY,
          categoria VARCHAR(100) DEFAULT NULL,
          tipo ENUM('Monetaria', 'Objeto') NOT NULL,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          usuario_id INT NOT NULL,
          organizacion_id INT NOT NULL,
          estado TINYINT DEFAULT 1,
          observaciones TEXT DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS donaciones_monetarias (
          id INT AUTO_INCREMENT PRIMARY KEY,
          metodo VARCHAR(50) NOT NULL,
          cuenta VARCHAR(50) NOT NULL,
          valor DECIMAL(15,2) NOT NULL,
          donacion_id INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS donaciones_objetos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          categoria VARCHAR(100) NOT NULL,
          descripcion TEXT NOT NULL,
          cantidad INT NOT NULL,
          donacion_id INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS solicitudes (
          id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
          usuario_id INT NOT NULL,
          titulo VARCHAR(150) DEFAULT NULL,
          descripcion TEXT DEFAULT NULL,
          estado ENUM('Pendiente', 'Aprobada', 'Rechazada') DEFAULT 'Pendiente',
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await connection.query(`
        CREATE TABLE IF NOT EXISTS solicitudes_verificacion (
          id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
          organizacion_id INT NOT NULL,
          nombre_organizacion VARCHAR(150) NOT NULL,
          correo_organizacion VARCHAR(100) NOT NULL,
          nit VARCHAR(50) DEFAULT NULL,
          mensaje TEXT DEFAULT NULL,
          documentos TEXT DEFAULT NULL,
          estado ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
          respuesta_admin TEXT DEFAULT NULL,
          fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_respuesta DATETIME DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      // Asegurar columnas en usuarios
      const userColumns = [
        "tipo_documento VARCHAR(50) NULL",
        "num_documento VARCHAR(50) NULL",
        "fecha_nacimiento VARCHAR(50) NULL",
        "direccion VARCHAR(255) NULL",
        "barrio VARCHAR(100) NULL",
        "localidad VARCHAR(100) NULL",
        "ciudad VARCHAR(100) NULL",
        "departamento VARCHAR(100) NULL",
        "pais VARCHAR(100) NULL",
        "codigo_postal VARCHAR(50) NULL",
        "foto TEXT NULL"
      ];
      for (const col of userColumns) {
        try {
          const colName = col.split(' ')[0];
          await connection.query(`ALTER TABLE usuarios ADD COLUMN ${colName} ${col.replace(colName, '')}`);
        } catch (e: any) {
          // Ignorar error de columna duplicada
        }
      }

      // Asegurar columnas en organizaciones
      const orgColumns = [
        "nit VARCHAR(50) NULL",
        "representante_legal VARCHAR(150) NULL",
        "barrio VARCHAR(100) NULL",
        "localidad VARCHAR(100) NULL",
        "ciudad VARCHAR(100) NULL",
        "departamento VARCHAR(100) NULL",
        "pais VARCHAR(100) NULL",
        "categoria VARCHAR(100) NULL",
        "logo TEXT NULL",
        "latitud DOUBLE NULL",
        "longitud DOUBLE NULL"
      ];
      for (const col of orgColumns) {
        try {
          const colName = col.split(' ')[0];
          await connection.query(`ALTER TABLE organizaciones ADD COLUMN ${colName} ${col.replace(colName, '')}`);
        } catch (e: any) {
          // Ignorar error de columna duplicada
        }
      }

      // Asegurar columnas en eventos
      const eventColumns = [
        "barrio VARCHAR(100) NULL",
        "localidad VARCHAR(100) NULL",
        "ciudad VARCHAR(100) NULL DEFAULT 'Bogotá'",
        "departamento VARCHAR(100) NULL DEFAULT 'Bogotá D.C.'",
        "pais VARCHAR(100) NULL DEFAULT 'Colombia'",
        "punto_referencia VARCHAR(255) NULL",
        "nombre_lugar VARCHAR(255) NULL",
        "latitud DOUBLE NULL",
        "longitud DOUBLE NULL",
        "imagen TEXT NULL",
        "vacantes_voluntarios INT DEFAULT 10",
        "vacantes_beneficiarios INT DEFAULT 25",
        "ayuda_ofrecida TEXT NULL"
      ];
      for (const col of eventColumns) {
        try {
          const colName = col.split(' ')[0];
          await connection.query(`ALTER TABLE eventos ADD COLUMN ${colName} ${col.replace(colName, '')}`);
        } catch (e: any) {
          // Ignorar error de columna duplicada
        }
      }

      // Asegurar que la tabla_postulaciones existe en MySQL
      try {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS tabla_postulaciones (
            id_postulacion INT AUTO_INCREMENT PRIMARY KEY,
            id_evento INT NOT NULL,
            id_usuario INT NOT NULL,
            tipo_postulacion ENUM('voluntario', 'beneficiario') NOT NULL,
            estado_postulacion ENUM('pendiente', 'aprobado', 'rechazado', 'confirmado', 'cancelado') DEFAULT 'pendiente',
            fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_aprobacion DATETIME DEFAULT NULL,
            fecha_confirmacion DATETIME DEFAULT NULL,
            observaciones TEXT DEFAULT NULL,
            UNIQUE KEY unique_postulacion (id_evento, id_usuario, tipo_postulacion)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      } catch (e: any) {
        console.warn('⚠ Advertencia: No se pudo verificar/crear la tabla_postulaciones en MySQL:', e.message);
      }

      // Asegurar que la tabla seguimiento_eventos existe en MySQL
      try {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS seguimiento_eventos (
            id_seguimiento INT AUTO_INCREMENT PRIMARY KEY,
            evento_id INT NOT NULL,
            usuario_id INT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_seguimiento (evento_id, usuario_id)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
      } catch (e: any) {
        console.warn('⚠ Advertencia: No se pudo verificar/crear la tabla seguimiento_eventos en MySQL:', e.message);
      }

      // Asegurar que la tabla de auditorías existe en MySQL
      try {
        await connection.query(`
          CREATE TABLE IF NOT EXISTS auditorias (
            id_audit INT AUTO_INCREMENT PRIMARY KEY,
            fecha VARCHAR(50) NOT NULL,
            accion VARCHAR(255) NOT NULL,
            id_usuario INT NOT NULL,
            nombre_usuario VARCHAR(150) NOT NULL,
            rol_usuario VARCHAR(50) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);

        // Seed if empty
        const [auditCountRows] = await connection.query('SELECT COUNT(*) as count FROM auditorias');
        if (auditCountRows && (auditCountRows as any)[0] && (auditCountRows as any)[0].count === 0) {
          const nowStr = new Date().toISOString();
          await connection.query(`
            INSERT INTO auditorias (fecha, accion, id_usuario, nombre_usuario, rol_usuario) VALUES
            (?, 'Inicio y puesta en marcha del sistema Give&Go', 1, 'Administrador General', 'Admin'),
            (?, 'Sincronización de base de datos relacional completada', 1, 'Administrador General', 'Admin'),
            (?, 'Configuración de categorías y organizaciones semilla', 1, 'Administrador General', 'Admin')
          `, [nowStr, nowStr, nowStr]);
          console.log('✅ Semilla de auditorías cargada con éxito en MySQL.');
        }
      } catch (e: any) {
        console.warn('⚠ Advertencia: No se pudo crear/verificar/semillar la tabla de auditorías en MySQL:', e.message);
      }

      // Sembrar categorías si están vacías
      try {
        const [catCountRows] = await connection.query('SELECT COUNT(*) as count FROM categorias');
        if (catCountRows && (catCountRows as any)[0] && (catCountRows as any)[0].count === 0) {
          await connection.query(`
            INSERT INTO categorias (id_categoria, nombre, descripcion, estado) VALUES
            (1, 'Alimentos', 'Donaciones de alimentos y canastas básicas', 1),
            (2, 'Educación', 'Apoyo educativo y tutorías', 1),
            (3, 'Salud', 'Campañas de salud preventiva y kits médicos', 1),
            (4, 'Medio Ambiente', 'Reforestación y cuidado ambiental', 1),
            (5, 'Económico', 'Aportaciones monetarias a causas', 1);
          `);
          console.log('✅ Semilla de categorías cargada con éxito en MySQL.');
        }
      } catch (e: any) {
        console.warn('⚠ Advertencia al sembrar categorías:', e.message);
      }

      connection.release();
      useFallback = false;
    } catch (err: any) {
      console.warn('⚠ Advertencia: No se pudo conectar a MySQL en XAMPP. Código de error:', err.code);
      console.warn('👉 Usando el motor de fallback basado en JSON para garantizar funcionamiento continuo.');
      console.warn('👉 Para usar XAMPP: Inicia el servicio MySQL en el panel de XAMPP e importa database/giveandgo_full_xampp.sql en phpMyAdmin.');
      useFallback = true;
    }
  } else {
    console.warn('⚠ Advertencia: Variables de entorno de base de datos no configuradas.');
    useFallback = true;
  }
  
  // Garantizar que el administrador esté configurado y operativo en cualquier modo
  await checkAndRepairAdmin();
};

export const db = {
  isMySQLConnected: () => !useFallback,
  
  query: async (sql: string, params: any[] = []): Promise<any> => {
    if (!useFallback && pool) {

      // 4 Ejecuta la consulta REAL en MySQL.toma una conexion del pool envia la consulta SQL a MYSQL espera respuesta 
      // devulve conexion al pool
      return await pool.query(sql, params);
    

    } else {
      
      return handleFallbackQuery(sql, params);
    }
  },
  
  getFallbackData: () => fallbackData,
  saveFallbackData: () => saveFallback(),
};

// 5  PROCESADOR DE FALLBACK (si MySQL no está) 
function handleFallbackQuery(sql: string, params: any[]): any {
  const queryNormalized = sql.trim().replace(/\s+/g, ' ').toLowerCase();
  
  // 1. SELECT categorias
  if (queryNormalized.startsWith('select * from categorias')) {
    return [fallbackData.categorias, []];
  }
  
  // 2. SELECT usuarios
  if (queryNormalized.startsWith('select * from usuarios')) {
    let result = [...fallbackData.usuarios];
    if (queryNormalized.includes('where correo = ?')) {
      const email = params[0]?.toLowerCase();
      result = result.filter(u => u.correo.toLowerCase() === email);
    } else if (queryNormalized.includes('where id_usuario = ?')) {
      const id = parseInt(params[0], 10);
      result = result.filter(u => u.id_usuario === id);
    }
    return [result, []];
  }
  
  // 3. SELECT organizaciones
  if (queryNormalized.startsWith('select * from organizaciones')) {
    let result = [...fallbackData.organizaciones];
    if (queryNormalized.includes('where id_organizacion = ?')) {
      const id = parseInt(params[0], 10);
      result = result.filter(o => o.id_organizacion === id);
    } else if (queryNormalized.includes('where correo = ?')) {
      const email = params[0]?.toLowerCase();
      result = result.filter(o => o.correo.toLowerCase() === email);
    }
    return [result, []];
  }

  // 4. SELECT eventos
  if (queryNormalized.startsWith('select * from eventos')) {
    let result = [...fallbackData.eventos];
    if (queryNormalized.includes('where id_evento = ?')) {
      const id = parseInt(params[0], 10);
      result = result.filter(e => e.id_evento === id);
    } else if (queryNormalized.includes('where organizacion_id = ?')) {
      const orgId = parseInt(params[0], 10);
      result = result.filter(e => e.organizacion_id === orgId);
    }
    return [result, []];
  }

  // 5. SELECT solicitudes
  if (queryNormalized.startsWith('select * from solicitudes')) {
    let result = [...fallbackData.solicitudes];
    if (queryNormalized.includes('where id_solicitud = ?')) {
      const id = parseInt(params[0], 10);
      result = result.filter(s => s.id_solicitud === id);
    } else if (queryNormalized.includes('where usuario_id = ?')) {
      const uId = parseInt(params[0], 10);
      result = result.filter(s => s.usuario_id === uId);
    }
    return [result, []];
  }

  // 5.5 SELECT auditorias
  if (queryNormalized.startsWith('select * from auditorias')) {
    const audits = fallbackData.auditorias || [];
    const sortedAudits = [...audits].sort((a, b) => (b.id_audit || 0) - (a.id_audit || 0));
    return [sortedAudits, []];
  }

  // 6. SELECT donaciones, donaciones_monetarias, donaciones_objetos
  if (queryNormalized.startsWith('select * from donaciones') || queryNormalized.includes('join donaciones')) {
    // Para simplificar, devolvemos donaciones mapeadas
    return [fallbackData.donaciones, []];
  }

  // Fallback por defecto si no coincide con las consultas típicas (evitar crashes)
  return [[], []];
}
