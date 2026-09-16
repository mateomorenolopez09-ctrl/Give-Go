-- =========================================================================
-- GIVE&GO - BASE DE DATOS COMPLETA PARA XAMPP (MySQL / phpMyAdmin)
-- =========================================================================
-- Este archivo crea la base de datos giveandgo_v2, todas sus tablas,
-- relaciones de clave foránea e inserta los datos iniciales necesarios.
--
-- Instrucciones para importar en XAMPP:
-- 1. Abre el Panel de Control de XAMPP e inicia los módulos Apache y MySQL.
-- 2. Abre tu navegador y ve a: http://localhost/phpmyadmin
-- 3. Haz clic en la pestaña "Importar" (o "Import").
-- 4. Selecciona este archivo (giveandgo_full_xampp.sql) y presiona "Continuar".
-- =========================================================================

CREATE DATABASE IF NOT EXISTS giveandgo_v2 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE giveandgo_v2;

SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Tabla: Categorías
-- --------------------------------------------------------
DROP TABLE IF EXISTS categorias;
CREATE TABLE categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  estado TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabla: Usuarios
-- --------------------------------------------------------
DROP TABLE IF EXISTS usuarios;
CREATE TABLE usuarios (
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

-- --------------------------------------------------------
-- 3. Tabla: Organizaciones
-- --------------------------------------------------------
DROP TABLE IF EXISTS organizaciones;
CREATE TABLE organizaciones (
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

-- --------------------------------------------------------
-- 4. Tabla: Eventos
-- --------------------------------------------------------
DROP TABLE IF EXISTS eventos;
CREATE TABLE eventos (
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
  imagen TEXT DEFAULT NULL,
  FOREIGN KEY (id_categoria) REFERENCES categorias (id_categoria) ON DELETE RESTRICT,
  FOREIGN KEY (organizacion_id) REFERENCES organizaciones (id_organizacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Tabla: Postulaciones
-- --------------------------------------------------------
DROP TABLE IF EXISTS tabla_postulaciones;
CREATE TABLE tabla_postulaciones (
  id_postulacion INT AUTO_INCREMENT PRIMARY KEY,
  id_evento INT NOT NULL,
  id_usuario INT NOT NULL,
  tipo_postulacion ENUM('voluntario', 'beneficiario') NOT NULL,
  estado_postulacion ENUM('pendiente', 'aprobado', 'rechazado', 'confirmado', 'cancelado') DEFAULT 'pendiente',
  fecha_postulacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_aprobacion DATETIME DEFAULT NULL,
  fecha_confirmacion DATETIME DEFAULT NULL,
  observaciones TEXT DEFAULT NULL,
  UNIQUE KEY unique_postulacion (id_evento, id_usuario, tipo_postulacion),
  FOREIGN KEY (id_evento) REFERENCES eventos (id_evento) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabla: Seguimiento de Eventos
-- --------------------------------------------------------
DROP TABLE IF EXISTS seguimiento_eventos;
CREATE TABLE seguimiento_eventos (
  id_seguimiento INT AUTO_INCREMENT PRIMARY KEY,
  evento_id INT NOT NULL,
  usuario_id INT NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_evento_usuario (evento_id, usuario_id),
  FOREIGN KEY (evento_id) REFERENCES eventos (id_evento) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Tabla: Donaciones
-- --------------------------------------------------------
DROP TABLE IF EXISTS donaciones;
CREATE TABLE donaciones (
  id_donacion INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(100) DEFAULT NULL,
  tipo ENUM('Monetaria', 'Objeto') NOT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INT NOT NULL,
  organizacion_id INT NOT NULL,
  estado TINYINT DEFAULT 1,
  observaciones TEXT DEFAULT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id_usuario) ON DELETE CASCADE,
  FOREIGN KEY (organizacion_id) REFERENCES organizaciones (id_organizacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Tabla: Donaciones Monetarias
-- --------------------------------------------------------
DROP TABLE IF EXISTS donaciones_monetarias;
CREATE TABLE donaciones_monetarias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  metodo VARCHAR(50) NOT NULL,
  cuenta VARCHAR(50) NOT NULL,
  valor DECIMAL(15,2) NOT NULL,
  donacion_id INT NOT NULL,
  FOREIGN KEY (donacion_id) REFERENCES donaciones (id_donacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Tabla: Donaciones de Objetos
-- --------------------------------------------------------
DROP TABLE IF EXISTS donaciones_objetos;
CREATE TABLE donaciones_objetos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(100) NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INT NOT NULL,
  donacion_id INT NOT NULL,
  FOREIGN KEY (donacion_id) REFERENCES donaciones (id_donacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Tabla: Solicitudes de Beneficiarios
-- --------------------------------------------------------
DROP TABLE IF EXISTS solicitudes;
CREATE TABLE solicitudes (
  id_solicitud INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  titulo VARCHAR(150) DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  estado ENUM('Pendiente', 'Aprobada', 'Rechazada') DEFAULT 'Pendiente',
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. Tabla: Auditorías
-- --------------------------------------------------------
DROP TABLE IF EXISTS auditorias;
CREATE TABLE auditorias (
  id_audit INT AUTO_INCREMENT PRIMARY KEY,
  fecha VARCHAR(50) NOT NULL,
  accion VARCHAR(255) NOT NULL,
  id_usuario INT NOT NULL,
  nombre_usuario VARCHAR(150) NOT NULL,
  rol_usuario VARCHAR(50) NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 12. Tabla: Solicitudes de Verificación
-- --------------------------------------------------------
DROP TABLE IF EXISTS solicitudes_verificacion;
CREATE TABLE solicitudes_verificacion (
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
  fecha_respuesta DATETIME DEFAULT NULL,
  FOREIGN KEY (organizacion_id) REFERENCES organizaciones (id_organizacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- DATOS INICIALES (SEEDS)
-- =========================================================================

-- 1. Categorías
INSERT INTO categorias (id_categoria, nombre, descripcion, estado) VALUES
(1, 'Alimentos', 'Donaciones de alimentos y canastas básicas', 1),
(2, 'Educación', 'Apoyo educativo y tutorías', 1),
(3, 'Salud', 'Campañas de salud preventiva y kits médicos', 1),
(4, 'Medio Ambiente', 'Reforestación y cuidado ambiental', 1),
(5, 'Económico', 'Aportaciones monetarias a causas', 1);

-- 2. Usuarios Base
-- Passwords:
-- admin@giveandgo.com -> Admin123*
-- carlos@volunteer.com, sofia@volunteer.com, juan@beneficiary.com, etc. -> User123*
INSERT INTO usuarios (id_usuario, rol, nombre1, nombre2, apellido1, apellido2, telefono, correo, password, estado) VALUES
(1, 'Admin', 'Administrador', 'General', 'General', NULL, '+57 300 123 4567', 'admin@giveandgo.com', '$2b$10$tZ9C.mJjXNco/e.e2jV9SeAAL68L16S78A9oGv2o62H9R1pW61qE.', 1),
(999, 'Voluntario', 'Donante', NULL, 'Anónimo', NULL, NULL, 'anonimo@giveandgo.com', 'none', 1),
(2, 'Voluntario', 'Carlos', 'Andrés', 'Mendoza', 'Castro', '+57 310 987 6543', 'carlos@volunteer.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(3, 'Voluntario', 'Sofía', NULL, 'Pérez', NULL, '+57 315 222 3333', 'sofia@volunteer.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(4, 'Beneficiario', 'Juan', NULL, 'Gómez', NULL, '+57 320 444 5555', 'juan@beneficiary.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(5, 'Beneficiario', 'María', NULL, 'Rodríguez', NULL, '+57 301 555 6666', 'maria@beneficiary.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(101, 'Organizacion', 'Fundación Manos por Kennedy', NULL, 'Organización', NULL, '+57 300 000 0000', 'contacto@manosporkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(102, 'Organizacion', 'Fundación Bogotá Solidaria', NULL, 'Organización', NULL, '+57 300 000 0000', 'info@bogotasolidaria.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(103, 'Organizacion', 'Asociación Social Ciudad Kennedy', NULL, 'Organización', NULL, '+57 300 000 0000', 'hola@ciudadkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1);

-- 3. Organizaciones
INSERT INTO organizaciones (id_organizacion, nombre, direccion, telefono, correo, password, descripcion, verificada, estado_verificacion, estado, latitud, longitud, barrio, localidad, ciudad, categoria) VALUES
(1, 'Fundación Manos por Kennedy', 'Calle 38 Sur # 78-45, Kennedy Central, Bogotá D.C.', '+57 300 000 0000', 'contacto@manosporkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Institución comunitaria enfocada en brindar seguridad alimentaria en Kennedy.', 1, 'aprobada', 1, 4.6186, -74.1481, 'Kennedy Central', 'Kennedy', 'Bogotá', 'Alimentos'),
(2, 'Fundación Bogotá Solidaria', 'Carrera 80 # 40B Sur-12, Castilla, Bogotá D.C.', '+57 300 000 0000', 'info@bogotasolidaria.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Fundación sin ánimo de lucro enfocada en desarrollo y asistencia a adultos mayores.', 1, 'aprobada', 1, 4.6445, -74.1412, 'Castilla', 'Kennedy', 'Bogotá', 'Salud'),
(3, 'Asociación Social Ciudad Kennedy', 'Avenida Ciudad de Cali # 13-08, Patio Bonito, Bogotá D.C.', '+57 300 000 0000', 'hola@ciudadkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Organización para la recuperación ambiental y el apoyo pedagógico.', 0, 'pendiente', 1, 4.6288, -74.1620, 'Patio Bonito', 'Kennedy', 'Bogotá', 'Medio Ambiente');

-- 4. Eventos
INSERT INTO eventos (id_evento, nombre, id_categoria, descripcion, direccion, fecha, cupo, vacantes_voluntarios, vacantes_beneficiarios, ayuda_ofrecida, estado, organizacion_id, barrio, localidad, ciudad, latitud, longitud, imagen) VALUES
(1, 'Jornada de Donación en Kennedy Central', 1, 'Ayúdanos a clasificar y empaquetar alimentos recibidos para las familias vulnerables de la localidad de Kennedy.', 'Calle 38 Sur # 78-45, Kennedy Central', '2026-07-15 09:00:00', 50, 20, 30, 'Paquete nutricional no perecedero con arroz, granos y aceite.', 1, 1, 'Kennedy Central', 'Kennedy', 'Bogotá', 4.6186, -74.1481, 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1000'),
(2, 'Campaña Solidaria Patio Bonito', 2, 'Buscamos voluntarios para apoyar en el reforzamiento escolar y tutorías los fines de semana para niños.', 'Avenida Ciudad de Cali # 13-08', '2026-07-20 08:00:00', 20, 10, 10, 'Kits de útiles escolares y tutorías pedagógicas.', 1, 1, 'Patio Bonito', 'Kennedy', 'Bogotá', 4.6288, -74.1620, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1000'),
(3, 'Reforestación del Humedal El Burro', 4, 'Jornada de siembra de especies nativas y limpieza en el Humedal El Burro de Kennedy.', 'Calle 8A con Carrera 82, Humedal El Burro', '2026-08-05 07:00:00', 100, 80, 20, 'Capacitación ambiental, refrigerios y siembra de plantas.', 1, 3, 'Castilla', 'Kennedy', 'Bogotá', 4.6421, -74.1485, 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1000'),
(4, 'Jornada Comunitaria Castilla', 3, 'Campaña de salud básica preventiva y entrega de kits de aseo para adultos mayores.', 'Carrera 80 # 40B Sur-12, Castilla', '2026-06-30 09:00:00', 30, 15, 15, 'Atención médica básica preventiva y kits de aseo.', 1, 2, 'Castilla', 'Kennedy', 'Bogotá', 4.6445, -74.1412, 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1000');

-- 5. Postulaciones a Eventos
INSERT INTO tabla_postulaciones (id_postulacion, id_evento, id_usuario, tipo_postulacion, estado_postulacion, fecha_postulacion, fecha_aprobacion, observaciones) VALUES
(1, 1, 4, 'beneficiario', 'aprobado', '2026-06-21 10:00:00', '2026-06-22 08:30:00', 'Aprobado para entrega de kit nutricional familiar.'),
(2, 2, 5, 'beneficiario', 'pendiente', '2026-06-25 14:15:00', NULL, 'Postulante para kits de útiles escolares.'),
(3, 3, 2, 'voluntario', 'confirmado', '2026-06-20 09:00:00', '2026-06-20 11:00:00', 'Voluntario confirmado para logística.');

-- 6. Solicitudes de Beneficiarios
INSERT INTO solicitudes (id_solicitud, usuario_id, titulo, descripcion, estado, fecha) VALUES
(1, 4, 'Apoyo alimentario en Patio Bonito', 'Solicito mercado básico no perecedero para mi núcleo familiar de 4 personas.', 'Pendiente', '2026-06-20 12:00:00'),
(2, 5, 'Útiles escolares en Castilla', 'Necesito cuadernos y lápices para mis dos hijos de primaria.', 'Aprobada', '2026-06-18 10:00:00'),
(3, 4, 'Kit de medicamentos esenciales', 'Solicitud de medicamentos de control diario para adulto mayor.', 'Rechazada', '2026-06-10 09:00:00');

-- 7. Donaciones
INSERT INTO donaciones (id_donacion, categoria, tipo, usuario_id, organizacion_id, estado, observaciones, fecha) VALUES
(1, 'Económico', 'Monetaria', 2, 1, 1, 'Donación para la compra de suministros alimentarios.', '2026-06-22 10:00:00'),
(2, 'Alimentos', 'Objeto', 3, 2, 1, 'Aporte en especie para el asilo de Castilla.', '2026-06-24 15:30:00');

INSERT INTO donaciones_monetarias (id, metodo, cuenta, valor, donacion_id) VALUES
(1, 'tarjeta', '**** **** **** 4321', 150000.00, 1);

INSERT INTO donaciones_objetos (id, categoria, descripcion, cantidad, donacion_id) VALUES
(1, 'Alimentos', '10 kg de arroz, 5 kg de legumbres y aceite vegetal', 15, 2);

-- 8. Auditorías
INSERT INTO auditorias (fecha, accion, id_usuario, nombre_usuario, rol_usuario) VALUES
('2026-07-16T10:00:00.000Z', 'Inicio de sesión exitoso del Administrador', 1, 'Administrador General', 'Admin'),
('2026-07-16T11:15:00.000Z', 'Creación de convocatoria: Reforestación del Humedal El Burro', 1, 'Administrador General', 'Admin'),
('2026-07-16T12:30:00.000Z', 'Inscripción de voluntario en el evento de Reforestación', 2, 'Carlos Mendoza', 'Voluntario'),
('2026-07-16T13:45:00.000Z', 'Registro de nueva donación monetaria', 2, 'Carlos Mendoza', 'Voluntario');

SET FOREIGN_KEY_CHECKS = 1;

-- Fin del script
