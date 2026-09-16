-- ===================================================
-- GIVE&GO DATABASE SCHEMA: CATEGORÍAS
-- ===================================================

CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(100) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `estado` TINYINT DEFAULT 1 -- 1 = activo, 0 = inactivo
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
