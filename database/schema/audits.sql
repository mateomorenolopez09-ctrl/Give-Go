-- ===================================================
-- GIVE&GO DATABASE SCHEMA: AUDITORÍAS / LOGS
-- ===================================================

CREATE TABLE IF NOT EXISTS `auditorias` (
  `id_audit` INT AUTO_INCREMENT PRIMARY KEY,
  `fecha` VARCHAR(50) NOT NULL,
  `accion` VARCHAR(255) NOT NULL,
  `id_usuario` INT NOT NULL,
  `nombre_usuario` VARCHAR(150) NOT NULL,
  `rol_usuario` VARCHAR(50) NOT NULL,
  FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
