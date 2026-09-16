-- ===================================================
-- GIVE&GO DATABASE SCHEMA: DONACIONES
-- ===================================================

CREATE TABLE IF NOT EXISTS `donaciones` (
  `id_donacion` INT AUTO_INCREMENT PRIMARY KEY,
  `categoria` VARCHAR(100) DEFAULT NULL,
  `tipo` ENUM('Monetaria', 'Objeto') NOT NULL,
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `usuario_id` INT NOT NULL,
  `organizacion_id` INT NOT NULL,
  `estado` TINYINT DEFAULT 1, -- 1 = activo, 0 = inactivo
  `observaciones` TEXT DEFAULT NULL,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  FOREIGN KEY (`organizacion_id`) REFERENCES `organizaciones` (`id_organizacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Donaciones Monetarias
CREATE TABLE IF NOT EXISTS `donaciones_monetarias` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `metodo` VARCHAR(50) NOT NULL,
  `cuenta` VARCHAR(50) NOT NULL,
  `valor` DECIMAL(15,2) NOT NULL,
  `donacion_id` INT NOT NULL,
  FOREIGN KEY (`donacion_id`) REFERENCES `donaciones` (`id_donacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Donaciones de Objetos (Especie)
CREATE TABLE IF NOT EXISTS `donaciones_objetos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `categoria` VARCHAR(100) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `cantidad` INT NOT NULL,
  `donacion_id` INT NOT NULL,
  FOREIGN KEY (`donacion_id`) REFERENCES `donaciones` (`id_donacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
