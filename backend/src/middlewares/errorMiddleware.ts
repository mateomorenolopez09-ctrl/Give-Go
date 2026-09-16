import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  errors?: any[];
}

export const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor.';
  const errors = err.errors || [];

  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
