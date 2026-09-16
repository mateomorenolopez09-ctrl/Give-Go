import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { AuditModel } from '../models/auditModel';

export const AuditController = {
  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user || req.user.rol.toLowerCase() !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'No autorizado. Solo los administradores pueden consultar el registro de auditoría.'
        });
      }
      
      const audits = await AuditModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Registros de auditoría recuperados correctamente.',
        data: audits
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al recuperar auditorías.'
      });
    }
  }
};
