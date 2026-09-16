-- ===================================================
-- GIVE&GO DATABASE SEED: USUARIOS INICIALES
-- Nota: Contraseñas encriptadas con bcrypt salt rounds = 10
-- Admin: 'Admin123*'
-- Voluntarios y Beneficiarios: 'User123*'
-- ===================================================

INSERT INTO `usuarios` (`id_usuario`, `rol`, `nombre1`, `nombre2`, `apellido1`, `apellido2`, `telefono`, `correo`, `password`, `estado`) VALUES
(1, 'Admin', 'Administrador', 'General', 'General', NULL, '+57 300 123 4567', 'admin@giveandgo.com', '$2b$10$tZ9C.mJjXNco/e.e2jV9SeAAL68L16S78A9oGv2o62H9R1pW61qE.', 1),
(999, 'Voluntario', 'Donante', NULL, 'Anónimo', NULL, NULL, 'anonimo@giveandgo.com', 'none', 1),
(2, 'Voluntario', 'Carlos', 'Andrés', 'Mendoza', 'Castro', '+57 310 987 6543', 'carlos@volunteer.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(3, 'Voluntario', 'Sofía', NULL, 'Pérez', NULL, '+57 315 222 3333', 'sofia@volunteer.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(4, 'Beneficiario', 'Juan', NULL, 'Gómez', NULL, '+57 320 444 5555', 'juan@beneficiary.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(5, 'Beneficiario', 'María', NULL, 'Rodríguez', NULL, '+57 301 555 6666', 'maria@beneficiary.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(101, 'Organizacion', 'Fundación Manos por Kennedy', NULL, 'Organización', NULL, '+57 300 000 0000', 'contacto@manosporkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(102, 'Organizacion', 'Fundación Bogotá Solidaria', NULL, 'Organización', NULL, '+57 300 000 0000', 'info@bogotasolidaria.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(103, 'Organizacion', 'Asociación Social Ciudad Kennedy', NULL, 'Organización', NULL, '+57 300 000 0000', 'hola@ciudadkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1);
