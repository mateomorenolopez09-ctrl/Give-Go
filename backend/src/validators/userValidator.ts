// Valida los datos antes de llegar al controlador
import { body } from 'express-validator';
import { validateResults } from './validateHelper';// conecta con ValidateHelper

export const validateLogin = [
  body('correo')
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
    .notEmpty().withMessage('El correo electrónico es obligatorio.'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),

  validateResults // Si todo esta bien helper ejecuta next() y pasa al siguiente en la cadena que es controllers
];

export const validateRegister = [
  body('rol')
    .notEmpty().withMessage('El rol es obligatorio.')
    .custom((val) => {
      const normalized = String(val || '').toLowerCase().trim();
      if (!['admin', 'voluntario', 'beneficiario', 'organizacion'].includes(normalized)) {
        throw new Error('Rol inválido. Debe ser voluntario, beneficiario, organizacion o admin.');
      }
      return true;
    }),
  body('nombre1')
    .trim()
    .notEmpty().withMessage('El primer nombre es obligatorio.')
    .isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener entre 2 y 50 caracteres.'),
  body('apellido1')
    .trim()
    .notEmpty().withMessage('El primer apellido es obligatorio.')
    .isLength({ min: 2, max: 50 }).withMessage('El apellido debe tener entre 2 y 50 caracteres.'),
  body('correo')
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.')
    .notEmpty().withMessage('El correo electrónico es obligatorio.'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  validateResults
];

export const validateOrgRegister = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre de la organización es obligatorio.')
    .isLength({ min: 3, max: 150 }).withMessage('El nombre debe tener entre 3 y 150 caracteres.'),
  body('direccion')
    .trim()
    .notEmpty().withMessage('La dirección es obligatoria.'),
  body('correo')
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido.'),
  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres.'),
  validateResults
];
