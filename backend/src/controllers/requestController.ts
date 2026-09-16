import { Request, Response } from 'express';
import { SolicitudModel } from '../models/solicitudModel';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const mapRequestToFrontend = (req: any) => {
  let fechaStr = '';
  if (req.fecha) {
    if (req.fecha instanceof Date) {
      fechaStr = req.fecha.toISOString().split('T')[0];
    } else if (typeof req.fecha === 'string') {
      fechaStr = req.fecha.split('T')[0];
    } else {
      fechaStr = new Date(req.fecha).toISOString().split('T')[0];
    }
  } else {
    fechaStr = new Date().toISOString().split('T')[0];
  }

  return {
    id: `sol_${req.id_solicitud}`,
    beneficiarioId: String(req.usuario_id),
    titulo: req.titulo || '',
    descripcion: req.descripcion || '',
    estado: req.estado.toLowerCase(), // 'pendiente' | 'aprobada' | 'rechazada'
    fecha: fechaStr
  };
};

const mapStateToBackend = (state: string): 'Pendiente' | 'Aprobada' | 'Rechazada' => {
  const norm = state.toLowerCase();
  if (norm === 'aprobada' || norm === 'completada') return 'Aprobada';
  if (norm === 'rechazada') return 'Rechazada';
  return 'Pendiente';
};

export const RequestController = {
  async getAll(req: Request, res: Response) {
    try {
      const requests = await SolicitudModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Solicitudes recuperadas con éxito.',
        data: requests.map(mapRequestToFrontend)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async getMyRequests(req: Request, res: Response) {
    try {
      const uId = (req as AuthenticatedRequest).user?.id || 1;
      const requests = await SolicitudModel.getByBeneficiary(uId);
      return res.status(200).json({
        success: true,
        message: 'Mis solicitudes recuperadas.',
        data: requests.map(mapRequestToFrontend)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('sol_', ''), 10);
      
      const sol = await SolicitudModel.getById(id);
      if (!sol) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada.',
          errors: []
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Solicitud recuperada.',
        data: mapRequestToFrontend(sol)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async getByBeneficiary(req: Request, res: Response) {
    try {
      const rawId = req.params.beneficiarioId;
      const id = parseInt(rawId.replace('usr_', ''), 10);

      const requests = await SolicitudModel.getByBeneficiary(id);
      return res.status(200).json({
        success: true,
        message: 'Solicitudes del beneficiario recuperadas.',
        data: requests.map(mapRequestToFrontend)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { beneficiarioId, titulo, descripcion, estado } = req.body;
      let uId = (req as AuthenticatedRequest).user?.id;
      if (!uId && beneficiarioId) {
        uId = parseInt(String(beneficiarioId).replace('usr_', ''), 10);
      }
      if (!uId) uId = 1;

      const insertId = await SolicitudModel.create({
        usuario_id: uId,
        titulo: titulo || 'Solicitud de Ayuda Social',
        descripcion: descripcion || '',
        estado: mapStateToBackend(estado || 'pendiente')
      });

      const sol = await SolicitudModel.getById(insertId);
      if (!sol) throw new Error('Error al recuperar la solicitud creada.');

      return res.status(201).json({
        success: true,
        message: 'Solicitud creada con éxito.',
        data: mapRequestToFrontend(sol)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al crear solicitud.',
        errors: []
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('sol_', ''), 10);
      const { titulo, descripcion, estado } = req.body;

      const updateData: any = {};
      if (titulo !== undefined) updateData.titulo = titulo;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (estado !== undefined) updateData.estado = mapStateToBackend(estado);

      const ok = await SolicitudModel.update(id, updateData);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada.',
          errors: []
        });
      }

      const sol = await SolicitudModel.getById(id);
      if (!sol) throw new Error('Solicitud no encontrada.');

      return res.status(200).json({
        success: true,
        message: 'Solicitud actualizada con éxito.',
        data: mapRequestToFrontend(sol)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('sol_', ''), 10);

      const ok = await SolicitudModel.delete(id);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Solicitud no encontrada.',
          errors: []
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Solicitud eliminada con éxito.',
        data: { id: `sol_${id}` }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  }
};
