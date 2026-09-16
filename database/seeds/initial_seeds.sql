-- ===================================================
-- GIVE&GO DATABASE SEEDS: CONSOLIDATED INITIAL DATA
-- Ordenado estrictamente respetando restricciones FK
-- ===================================================

USE `giveandgo_v2`;

-- 1. Categorías
INSERT INTO `categorias` (`id_categoria`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'Alimentos', 'Donaciones de alimentos y canastas básicas', 1),
(2, 'Educación', 'Apoyo educativo y tutorías', 1),
(3, 'Salud', 'Campañas de salud preventiva y kits médicos', 1),
(4, 'Medio Ambiente', 'Reforestación y cuidado ambiental', 1),
(5, 'Económico', 'Aportaciones monetarias a causas', 1)
ON DUPLICATE KEY UPDATE `nombre`=VALUES(`nombre`);

-- 2. Usuarios Base
INSERT INTO `usuarios` (`id_usuario`, `rol`, `nombre1`, `nombre2`, `apellido1`, `apellido2`, `telefono`, `correo`, `password`, `estado`) VALUES
(1, 'Admin', 'Administrador', 'General', 'General', NULL, '+57 300 123 4567', 'admin@giveandgo.com', '$2b$10$tZ9C.mJjXNco/e.e2jV9SeAAL68L16S78A9oGv2o62H9R1pW61qE.', 1),
(999, 'Voluntario', 'Donante', NULL, 'Anónimo', NULL, NULL, 'anonimo@giveandgo.com', 'none', 1),
(2, 'Voluntario', 'Carlos', 'Andrés', 'Mendoza', 'Castro', '+57 310 987 6543', 'carlos@volunteer.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(3, 'Voluntario', 'Sofía', NULL, 'Pérez', NULL, '+57 315 222 3333', 'sofia@volunteer.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(4, 'Beneficiario', 'Juan', NULL, 'Gómez', NULL, '+57 320 444 5555', 'juan@beneficiary.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(5, 'Beneficiario', 'María', NULL, 'Rodríguez', NULL, '+57 301 555 6666', 'maria@beneficiary.com', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(101, 'Organizacion', 'Fundación Manos por Kennedy', NULL, 'Organización', NULL, '+57 300 000 0000', 'contacto@manosporkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(102, 'Organizacion', 'Fundación Bogotá Solidaria', NULL, 'Organización', NULL, '+57 300 000 0000', 'info@bogotasolidaria.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1),
(103, 'Organizacion', 'Asociación Social Ciudad Kennedy', NULL, 'Organización', NULL, '+57 300 000 0000', 'hola@ciudadkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 1)
ON DUPLICATE KEY UPDATE `correo`=VALUES(`correo`);

-- 3. Organizaciones
INSERT INTO `organizaciones` (`id_organizacion`, `nombre`, `direccion`, `telefono`, `correo`, `password`, `descripcion`, `verificada`, `estado_verificacion`, `estado`) VALUES
(1, 'Fundación Manos por Kennedy', 'Calle 38 Sur # 78-45, Kennedy Central, Bogotá D.C.', '+57 300 000 0000', 'contacto@manosporkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Institución comunitaria enfocada en brindar seguridad alimentaria en Kennedy.', 1, 'aprobada', 1),
(2, 'Fundación Bogotá Solidaria', 'Carrera 80 # 40B Sur-12, Castilla, Bogotá D.C.', '+57 300 000 0000', 'info@bogotasolidaria.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Fundación sin ánimo de lucro enfocada en desarrollo y asistencia a adultos mayores.', 1, 'aprobada', 1),
(3, 'Asociación Social Ciudad Kennedy', 'Avenida Ciudad de Cali # 13-08, Patio Bonito, Bogotá D.C.', '+57 300 000 0000', 'hola@ciudadkennedy.org', '$2b$10$gO6NveiB/s/T.O3m/v9L1e7pAAsH1.S2Zp1A/9oK32V9R1pW52aD.', 'Organización para la recuperación ambiental y el apoyo pedagógico.', 0, 'pendiente', 1)
ON DUPLICATE KEY UPDATE `nombre`=VALUES(`nombre`);

-- 4. Eventos
INSERT INTO `eventos` (`id_evento`, `nombre`, `id_categoria`, `descripcion`, `direccion`, `fecha`, `cupo`, `vacantes_voluntarios`, `vacantes_beneficiarios`, `ayuda_ofrecida`, `estado`, `organizacion_id`, `barrio`, `localidad`, `ciudad`) VALUES
(1, 'Jornada de Donación en Kennedy Central', 1, 'Ayúdanos a clasificar y empaquetar alimentos recibidos para las familias vulnerables de la localidad de Kennedy.', 'Calle 38 Sur # 78-45, Kennedy Central', '2026-07-15 09:00:00', 50, 20, 30, 'Paquete nutricional no perecedero.', 1, 1, 'Kennedy Central', 'Kennedy', 'Bogotá'),
(2, 'Campaña Solidaria Patio Bonito', 2, 'Buscamos voluntarios para apoyar en el reforzamiento escolar y tutorías los fines de semana para niños.', 'Avenida Ciudad de Cali # 13-08', '2026-07-20 08:00:00', 20, 10, 10, 'Kits de útiles escolares y pedagogía.', 1, 1, 'Patio Bonito', 'Kennedy', 'Bogotá'),
(3, 'Reforestación del Humedal El Burro', 4, 'Jornada de siembra de especies nativas y limpieza en el Humedal El Burro de Kennedy.', 'Calle 8A con Carrera 82, Humedal El Burro', '2026-08-05 07:00:00', 100, 80, 20, 'Capacitación ambiental y siembra.', 1, 3, 'Castilla', 'Kennedy', 'Bogotá'),
(4, 'Jornada Comunitaria Castilla', 3, 'Campaña de salud básica preventiva y entrega de kits de aseo para adultos mayores.', 'Carrera 80 # 40B Sur-12, Castilla', '2026-06-30 09:00:00', 30, 15, 15, 'Atención médica y kits de aseo.', 1, 2, 'Castilla', 'Kennedy', 'Bogotá')
ON DUPLICATE KEY UPDATE `nombre`=VALUES(`nombre`);

-- 5. Solicitudes de Beneficiarios
INSERT INTO `solicitudes` (`id_solicitud`, `usuario_id`, `titulo`, `descripcion`, `estado`) VALUES
(1, 4, 'Apoyo alimentario en Patio Bonito', 'Solicito mercado básico no perecedero para mi núcleo familiar de 4 personas.', 'Pendiente'),
(2, 5, 'Útiles escolares en Castilla', 'Necesito cuadernos y lápices para mis dos hijos de primaria.', 'Aprobada'),
(3, 4, 'Kit de medicamentos esenciales', 'Solicitud de medicamentos de control diario para adulto mayor.', 'Rechazada')
ON DUPLICATE KEY UPDATE `titulo`=VALUES(`titulo`);

-- 6. Donaciones
INSERT INTO `donaciones` (`id_donacion`, `categoria`, `tipo`, `usuario_id`, `organizacion_id`, `estado`, `observaciones`) VALUES
(1, 'Económico', 'Monetaria', 2, 1, 1, 'Donación para la compra de suministros alimentarios.'),
(2, 'Alimentos', 'Objeto', 3, 2, 1, 'Aporte en especie para el asilo de Castilla.')
ON DUPLICATE KEY UPDATE `tipo`=VALUES(`tipo`);

INSERT INTO `donaciones_monetarias` (`id`, `metodo`, `cuenta`, `valor`, `donacion_id`) VALUES
(1, 'tarjeta', '**** **** **** 4321', 150000.00, 1)
ON DUPLICATE KEY UPDATE `valor`=VALUES(`valor`);

INSERT INTO `donaciones_objetos` (`id`, `categoria`, `descripcion`, `cantidad`, `donacion_id`) VALUES
(1, 'Alimentos', '10 kg de arroz, 5 kg de legumbres y aceite vegetal', 15, 2)
ON DUPLICATE KEY UPDATE `cantidad`=VALUES(`cantidad`);

-- 7. Auditorías
INSERT INTO `auditorias` (`fecha`, `accion`, `id_usuario`, `nombre_usuario`, `rol_usuario`) VALUES
('2026-07-16T10:00:00.000Z', 'Inicio de sesión exitoso del Administrador', 1, 'Administrador General', 'Admin'),
('2026-07-16T11:15:00.000Z', 'Creación de convocatoria exitosa: Reforestación del Humedal El Burro', 1, 'Administrador General', 'Admin'),
('2026-07-16T12:30:00.000Z', 'Inscripción de voluntario en el evento de Reforestación', 2, 'Carlos Mendoza', 'Voluntario'),
('2026-07-16T13:45:00.000Z', 'Registro de nueva donación monetaria', 2, 'Carlos Mendoza', 'Voluntario');
