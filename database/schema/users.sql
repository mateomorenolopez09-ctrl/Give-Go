-- ===================================================
-- GIVE&GO DATABASE SCHEMA: USUARIOS
-- ===================================================

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` INT AUTO_INCREMENT PRIMARY KEY,
  `rol` ENUM('Admin', 'Voluntario', 'Beneficiario', 'Organizacion') NOT NULL,
  `nombre1` VARCHAR(50) NOT NULL,
  `nombre2` VARCHAR(50) DEFAULT NULL,
  `apellido1` VARCHAR(50) NOT NULL,
  `apellido2` VARCHAR(50) DEFAULT NULL,
  `tipo_documento` VARCHAR(20) DEFAULT NULL,
  `num_documento` VARCHAR(50) DEFAULT NULL,
  `fecha_nacimiento` DATE DEFAULT NULL,
  `telefono` VARCHAR(20) DEFAULT NULL,
  `correo` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  `barrio` VARCHAR(100) DEFAULT NULL,
  `localidad` VARCHAR(100) DEFAULT NULL,
  `ciudad` VARCHAR(100) DEFAULT 'Bogotá',
  `departamento` VARCHAR(100) DEFAULT 'Bogotá D.C.',
  `pais` VARCHAR(100) DEFAULT 'Colombia',
  `codigo_postal` VARCHAR(20) DEFAULT NULL,
  `foto` TEXT DEFAULT NULL,
  `foto_portada` TEXT DEFAULT NULL,
  `biografia` TEXT DEFAULT NULL,
  `sitio_web` VARCHAR(255) DEFAULT NULL,
  `redes_sociales` TEXT DEFAULT NULL,
  `privacidad` TEXT DEFAULT NULL,
  `mision` TEXT DEFAULT NULL,
  `vision` TEXT DEFAULT NULL,
  `estado` TINYINT DEFAULT 1, -- 1 = activo, 0 = inactivo
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
