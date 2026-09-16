-- ===================================================
-- GIVE&GO DATABASE SEED: DONACIONES INICIALES
-- ===================================================

-- Donación Monetaria
INSERT INTO `donaciones` (`id_donacion`, `categoria`, `tipo`, `usuario_id`, `organizacion_id`, `estado`, `observaciones`) VALUES
(1, 'Económico', 'Monetaria', 2, 1, 1, 'Donación para la compra de suministros alimentarios.');

INSERT INTO `donaciones_monetarias` (`id`, `metodo`, `cuenta`, `valor`, `donacion_id`) VALUES
(1, 'tarjeta', '**** **** **** 4321', 150000.00, 1);

-- Donación en Objeto (Especie)
INSERT INTO `donaciones` (`id_donacion`, `categoria`, `tipo`, `usuario_id`, `organizacion_id`, `estado`, `observaciones`) VALUES
(2, 'Alimentos', 'Objeto', 3, 2, 1, 'Aporte en especie para el asilo de Castilla.');

INSERT INTO `donaciones_objetos` (`id`, `categoria`, `descripcion`, `cantidad`, `donacion_id`) VALUES
(1, 'Alimentos', '10 kg de arroz, 5 kg de legumbres y aceite vegetal', 15, 2);
