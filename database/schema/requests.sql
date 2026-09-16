-- ===================================================
-- GIVE&GO DATABASE SCHEMA: SOLICITUDES DE BENEFICIARIOS
-- ===================================================

CREATE TABLE IF NOT EXISTS `solicitudes` (
  `id_solicitud` INT AUTO_INCREMENT PRIMARY KEY,
  `usuario_id` INT NOT NULL,
  `titulo` VARCHAR(150) DEFAULT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `estado` ENUM('Pendiente', 'Aprobada', 'Rechazada') DEFAULT 'Pendiente',
  `fecha` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
