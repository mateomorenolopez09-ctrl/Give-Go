-- ===================================================
-- MIGRATION 001: INITIAL SCHEMA CREATION
-- ===================================================

CREATE DATABASE IF NOT EXISTS `giveandgo_v2` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `giveandgo_v2`;

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
  `estado` TINYINT DEFAULT 1,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `estado` TINYINT DEFAULT 1,
  `fecha_registro` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `estado` TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `eventos` (
  `id_evento` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(150) NOT NULL,
  `id_categoria` INT NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `direccion` VARCHAR(255) DEFAULT NULL,
  `fecha` DATETIME NOT NULL,
  `cupo` INT DEFAULT 0,
  `vacantes_voluntarios` INT DEFAULT 0,
  `vacantes_beneficiarios` INT DEFAULT 0,
  `ayuda_ofrecida` TEXT DEFAULT NULL,
  `estado` TINYINT DEFAULT 1,
  `organizacion_id` INT NOT NULL,
  `barrio` VARCHAR(100) DEFAULT NULL,
  `localidad` VARCHAR(100) DEFAULT NULL,
  `ciudad` VARCHAR(100) DEFAULT 'Bogotá',
  `departamento` VARCHAR(100) DEFAULT 'Bogotá D.C.',
  `pais` VARCHAR(100) DEFAULT 'Colombia',
  `punto_referencia` VARCHAR(255) DEFAULT NULL,
  `nombre_lugar` VARCHAR(150) DEFAULT NULL,
  `latitud` DECIMAL(10,8) DEFAULT NULL,
  `longitud` DECIMAL(11,8) DEFAULT NULL,
  `imagen` TEXT DEFAULT NULL,
  FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON DELETE RESTRICT,
  FOREIGN KEY (`organizacion_id`) REFERENCES `organizaciones` (`id_organizacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tabla_postulaciones` (
  `id_postulacion` INT AUTO_INCREMENT PRIMARY KEY,
  `id_evento` INT NOT NULL,
  `id_usuario` INT NOT NULL,
  `tipo_postulacion` ENUM('voluntario', 'beneficiario') NOT NULL,
  `estado_postulacion` ENUM('pendiente', 'aprobado', 'rechazado', 'confirmado', 'cancelado') DEFAULT 'pendiente',
  `fecha_postulacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_aprobacion` DATETIME DEFAULT NULL,
  `fecha_confirmacion` DATETIME DEFAULT NULL,
  `observaciones` TEXT DEFAULT NULL,
  UNIQUE KEY `unique_postulacion` (`id_evento`, `id_usuario`, `tipo_postulacion`),
  FOREIGN KEY (`id_evento`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `donaciones` (
  `id_donacion` INT AUTO_INCREMENT PRIMARY KEY,
  `categoria` VARCHAR(100) DEFAULT NULL,
  `tipo` ENUM('Monetaria', 'Objeto') NOT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` INT NOT NULL,
  `organizacion_id` INT NOT NULL,
  `estado` TINYINT DEFAULT 1,
  `observaciones` TEXT DEFAULT NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  FOREIGN KEY (`organizacion_id`) REFERENCES `organizaciones` (`id_organizacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `donaciones_monetarias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `metodo` VARCHAR(50) NOT NULL,
  `cuenta` VARCHAR(50) NOT NULL,
  `valor` DECIMAL(15,2) NOT NULL,
  `donacion_id` INT NOT NULL,
  FOREIGN KEY (`donacion_id`) REFERENCES `donaciones` (`id_donacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `donaciones_objetos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `categoria` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `cantidad` INT NOT NULL,
  `donacion_id` INT NOT NULL,
  FOREIGN KEY (`donacion_id`) REFERENCES `donaciones` (`id_donacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id_solicitud` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `titulo` VARCHAR(150) DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `estado` ENUM('Pendiente', 'Aprobada', 'Rechazada') DEFAULT 'Pendiente',
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `auditorias` (
  `id_audit` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha` VARCHAR(50) NOT NULL,
  `accion` VARCHAR(255) NOT NULL,
  `id_usuario` INT NOT NULL,
  `nombre_usuario` VARCHAR(150) NOT NULL,
  `rol_usuario` VARCHAR(50) NOT NULL,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
