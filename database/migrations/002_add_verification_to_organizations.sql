-- ===================================================
-- MIGRATION 002: ADD VERIFICATION AND VERIFICATION REQUESTS
-- ===================================================

USE `giveandgo_v2`;

-- 1. Agregar columnas de verificación a Organizaciones
ALTER TABLE `organizaciones` ADD COLUMN IF NOT EXISTS `verificada` TINYINT DEFAULT 0;
ALTER TABLE `organizaciones` ADD COLUMN IF NOT EXISTS `estado_verificacion` VARCHAR(50) DEFAULT 'no_solicitado';

-- 2. Crear tabla de Solicitudes de Verificación
CREATE TABLE IF NOT EXISTS `solicitudes_verificacion` (
  `id_solicitud` INT AUTO_INCREMENT PRIMARY KEY,
  `organizacion_id` INT NOT NULL,
  `nombre_organizacion` VARCHAR(150) NOT NULL,
  `correo_organizacion` VARCHAR(100) NOT NULL,
  `nit` VARCHAR(50) DEFAULT NULL,
  `mensaje` TEXT DEFAULT NULL,
  `documentos` TEXT DEFAULT NULL,
  `estado` ENUM('pendiente', 'aprobada', 'rechazada') DEFAULT 'pendiente',
  `respuesta_admin` TEXT DEFAULT NULL,
  `fecha_solicitud` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `fecha_respuesta` DATETIME DEFAULT NULL,
  FOREIGN KEY (`organizacion_id`) REFERENCES `organizaciones` (`id_organizacion`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
