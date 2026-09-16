-- ===================================================
-- GIVE&GO DATABASE SEED: AUDITORÍAS / HISTORIAL DE ACCIONES
-- ===================================================

INSERT INTO `auditorias` (`fecha`, `accion`, `id_usuario`, `nombre_usuario`, `rol_usuario`) VALUES
('2026-07-16T10:00:00.000Z', 'Inicio de sesión exitoso del Administrador', 1, 'Administrador General', 'Admin'),
('2026-07-16T11:15:00.000Z', 'Creación de convocatoria exitosa: Reforestación del Humedal El Burro', 1, 'Administrador General', 'Admin'),
('2026-07-16T12:30:00.000Z', 'Inscripción de voluntario en el evento de Reforestación', 2, 'Carlos Mendoza', 'Voluntario'),
('2026-07-16T13:45:00.000Z', 'Registro de nueva donación monetaria', 2, 'Carlos Mendoza', 'Voluntario');
