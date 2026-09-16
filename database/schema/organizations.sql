-- ===================================================
-- GIVE&GO DATABASE SCHEMA: ORGANIZACIONES
-- ===================================================

CREATE TABLE IF NOT EXISTS `organizaciones` (
  `id_organizacion` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  `telefono` VARCHAR(20) DEFAULT NULL,
  `correo` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `nit` VARCHAR(50) DEFAULT NULL,
  `representante_legal` VARCHAR(150) DEFAULT NULL,
  `barrio` VARCHAR(100) DEFAULT NULL,
  `localidad` VARCHAR(100) DEFAULT NULL,
  `ciudad` VARCHAR(100) DEFAULT 'Bogotá',
  `departamento` VARCHAR(100) DEFAULT 'Bogotá D.C.',
  `pais` VARCHAR(100) DEFAULT 'Colombia',
  `categoria` VARCHAR(100) DEFAULT NULL,
  `logo` TEXT DEFAULT NULL,
  `foto_portada` TEXT DEFAULT NULL,
  `mision` TEXT DEFAULT NULL,
  `vision` TEXT DEFAULT NULL,
  `sitio_web` VARCHAR(255) DEFAULT NULL,
  `redes_sociales` TEXT DEFAULT NULL,
  `latitud` DECIMAL(10,8) DEFAULT NULL,
  `longitud` DECIMAL(11,8) DEFAULT NULL,
  `verificada` TINYINT DEFAULT 0, -- 0 = No verificada, 1 = Verificada
  `estado_verificacion` VARCHAR(50) DEFAULT 'no_solicitado', -- 'no_solicitado', 'pendiente', 'aprobada', 'rechazada'
  `estado` TINYINT DEFAULT 1, -- 1 = activo, 0 = inactivo
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
