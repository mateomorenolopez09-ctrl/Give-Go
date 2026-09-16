import { body } from 'express-validator';
import { validateResults } from './validateHelper';

export const validateRequest = [
  body('beneficiarioId')
    .optional({ checkFalsy: true })
    .custom((val, { req }) => {
      // If not in body, check if authenticated user exists in req
      const userId = val || req.body?.id_beneficiario || req.user?.id;
      if (!userId) {
        throw new Error('El ID del beneficiario es obligatorio.');
      }
      return true;
    }),
  body('titulo')
    .trim()
    .notEmpty().withMessage('El título es obligatorio.')
    .isLength({ min: 3, max: 150 }).withMessage('El título debe tener entre 3 y 150 caracteres.'),
  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria.'),
  validateResults
];

