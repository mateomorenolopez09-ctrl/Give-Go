-- ===================================================
-- GIVE&GO DATABASE SEED: EVENTOS INICIALES
-- ===================================================

INSERT INTO `eventos` (`id_evento`, `nombre`, `id_categoria`, `descripcion`, `direccion`, `fecha`, `cupo`, `vacantes_voluntarios`, `vacantes_beneficiarios`, `ayuda_ofrecida`, `estado`, `organizacion_id`, `barrio`, `localidad`, `ciudad`) VALUES
(1, 'Jornada de Donación en Kennedy Central', 1, 'Ayúdanos a clasificar y empaquetar alimentos recibidos para las familias vulnerables de la localidad de Kennedy en nuestro centro comunitario.', 'Calle 38 Sur # 78-45, Kennedy Central', '2026-07-15 09:00:00', 50, 20, 30, 'Paquete nutricional no perecedero y frutas frescas.', 1, 1, 'Kennedy Central', 'Kennedy', 'Bogotá'),
(2, 'Campaña Solidaria Patio Bonito', 2, 'Buscamos voluntarios para apoyar en el reforzamiento escolar y tutorías los fines de semana para niños del sector de Patio Bonito.', 'Avenida Ciudad de Cali # 13-08', '2026-07-20 08:00:00', 20, 10, 10, 'Kits de útiles escolares y acompañamiento pedagógico.', 1, 1, 'Patio Bonito', 'Kennedy', 'Bogotá'),
(3, 'Reforestación del Humedal El Burro', 4, 'Jornada de siembra de especies nativas y limpieza en el Humedal El Burro de Kennedy. ¡Trae ropa cómoda y guantes!', 'Calle 8A con Carrera 82, Humedal El Burro', '2026-08-05 07:00:00', 100, 80, 20, 'Capacitación ambiental y siembra comunitaria.', 1, 3, 'Castilla', 'Kennedy', 'Bogotá'),
(4, 'Jornada Comunitaria Castilla', 3, 'Campaña de salud básica preventiva y entrega de kits de aseo para adultos mayores del barrio Castilla.', 'Carrera 80 # 40B Sur-12, Castilla', '2026-06-30 09:00:00', 30, 15, 15, 'Atención médica general y kits de autocuidado.', 1, 2, 'Castilla', 'Kennedy', 'Bogotá');
