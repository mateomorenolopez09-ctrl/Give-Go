import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateResults = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorList = errors.array().map(err => ({
      campo: (err as any).path || (err as any).param,
      mensaje: err.msg
    }));
    const firstErrorMessage = errorList[0]?.mensaje || 'Error de validación en los campos enviados.';

    return res.status(400).json({
      success: false,
      message: firstErrorMessage,
      errors: errorList
    });
  }
  next();
};
