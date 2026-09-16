-- ===================================================
-- GIVE&GO DATABASE SCHEMA: EVENTOS & POSTULACIONES
-- ===================================================

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
  `estado` TINYINT DEFAULT 1, -- 1 = activo, 2 = finalizado, 0 = cancelado
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

-- Tabla de Postulaciones a Eventos (Voluntarios y Beneficiarios)
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

-- Tabla de Inscripciones a Eventos (Compatibilidad de seguimiento)
CREATE TABLE IF NOT EXISTS `seguimiento_eventos` (
  `id_seguimiento` INT AUTO_INCREMENT PRIMARY KEY,
  `evento_id` INT NOT NULL,
  `usuario_id` INT NOT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_evento_usuario` (`evento_id`, `usuario_id`),
  FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id_evento`) ON DELETE CASCADE,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
