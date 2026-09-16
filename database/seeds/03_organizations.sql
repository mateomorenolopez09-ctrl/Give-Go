-- ===================================================
-- GIVE&GO DATABASE SEED: ORGANIZACIONES INICIALES
-- ===================================================

INSERT INTO `organizaciones` (`id_organizacion`, `nombre`, `direccion`, `telefono`, `correo`, `password`, `descripcion`, `verificada`, `estado_verificacion`, `estado`) VALUES
(1, 'Fundación Manos por Kennedy', 'Calle 38 Sur # 78-45, Kennedy Central, Bogotá D.C.', '+57 300 000 0000', 'contacto@manosporkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Institución comunitaria enfocada en brindar seguridad alimentaria en Kennedy.', 1, 'aprobada', 1),
(2, 'Fundación Bogotá Solidaria', 'Carrera 80 # 40B Sur-12, Castilla, Bogotá D.C.', '+57 300 000 0000', 'info@bogotasolidaria.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Fundación sin ánimo de lucro enfocada en desarrollo y asistencia a adultos mayores.', 1, 'aprobada', 1),
(3, 'Asociación Social Ciudad Kennedy', 'Avenida Ciudad de Cali # 13-08, Patio Bonito, Bogotá D.C.', '+57 300 000 0000', 'hola@ciudadkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Organización para la recuperación ambiental y el apoyo pedagógico.', 0, 'pendiente', 1);
