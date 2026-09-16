import { body } from 'express-validator';
import { validateResults } from './validateHelper';

export const validateMonetaryDonation = [
  body('donation.usuarioId')
    .notEmpty().withMessage('El ID del usuario donante es obligatorio.'),
  body('donation.organizacionId')
    .notEmpty().withMessage('La organización de destino es obligatoria.'),
  body('monetary.metodo')
    .notEmpty().withMessage('El método de pago es obligatorio.')
    .isIn(['transferencia', 'tarjeta', 'paypal']).withMessage('Método de pago inválido.'),
  body('monetary.valor')
    .notEmpty().withMessage('El valor es obligatorio.')
    .isFloat({ min: 1 }).withMessage('El valor debe ser mayor o igual a 1.'),
  validateResults
];

export const validateObjectDonation = [
  body('donation.usuarioId')
    .notEmpty().withMessage('El ID del usuario donante es obligatorio.'),
  body('donation.organizacionId')
    .notEmpty().withMessage('La organización de destino es obligatoria.'),
  body('objectDetail.categoria')
    .notEmpty().withMessage('La categoría del objeto es obligatoria.'),
  body('objectDetail.cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria.')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor o igual a 1.'),
  validateResults
];
