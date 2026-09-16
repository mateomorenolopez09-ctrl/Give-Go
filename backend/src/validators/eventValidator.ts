import { body } from 'express-validator';
import { validateResults } from './validateHelper';

export const validateEvent = [
  body('nombre')
    .custom((val, { req }) => {
      const name = val || req.body.titulo;
      if (!name || String(name).trim().length < 3) {
        throw new Error('El nombre o título del evento es obligatorio (mínimo 3 caracteres).');
      }
      return true;
    }),
  body('fecha')
    .custom((val, { req }) => {
      const date = val || req.body.fecha_inicio || req.body.fechaInicio;
      if (!date) {
        throw new Error('La fecha del evento es obligatoria.');
      }
      return true;
    }),
  body('latitud')
    .optional({ nullable: true })
    .isFloat({ min: -90, max: 90 }).withMessage('La latitud debe ser un número entre -90 y 90.'),
  body('longitud')
    .optional({ nullable: true })
    .isFloat({ min: -180, max: 180 }).withMessage('La longitud debe ser un número entre -180 y 180.'),
  validateResults
];

