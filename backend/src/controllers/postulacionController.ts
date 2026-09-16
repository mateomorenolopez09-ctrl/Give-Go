import { Request, Response } from 'express';
import { PostulacionModel } from '../models/postulacionModel';

export const mapPostulacionToFrontend = (p: any) => {
  if (!p) return null;
  const nombreComp = [p.nombre1, p.nombre2, p.apellido1, p.apellido2]
    .filter(Boolean)
    .join(' ')
    .trim() || p.usuarioNombre || p.usuario_nombre || `Usuario #${p.id_usuario || p.usuarioId || ''}`;

  return {
    id: String(p.id_postulacion || p.id || ''),
    eventoId: String(p.id_evento || p.eventoId || ''),
    eventoNombre: p.evento_nombre || p.eventoNombre || '',
    eventoFecha: p.evento_fecha || p.eventoFecha || '',
    eventoDireccion: p.evento_direccion || p.eventoDireccion || '',
    ayudaOfrecida: p.ayuda_ofrecida || p.ayudaOfrecida || '',
    organizacionNombre: p.organizacion_nombre || p.organizacionNombre || '',
    usuarioId: String(p.id_usuario || p.usuarioId || ''),
    usuarioNombre: nombreComp,
    usuarioCorreo: p.correo || p.usuarioCorreo || '',
    usuarioTelefono: p.telefono || p.usuarioTelefono || '',
    tipoPostulacion: p.tipo_postulacion || p.tipoPostulacion || 'voluntario',
    estadoPostulacion: p.estado_postulacion || p.estadoPostulacion || 'pendiente',
    fechaPostulacion: p.fecha_postulacion || p.fechaPostulacion || new Date().toISOString(),
    fechaAprobacion: p.fecha_aprobacion || p.fechaAprobacion || null,
    fechaConfirmacion: p.fecha_confirmacion || p.fechaConfirmacion || null,
    observaciones: p.observaciones || ''
  };
};

export const postulacionController = {
  // Obtener todas las postulaciones
  async getAllPostulaciones(req: Request, res: Response) {
    try {
      const postulaciones = await PostulacionModel.getAll();
      return res.json({ success: true, data: postulaciones.map(mapPostulacionToFrontend) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error al obtener las postulaciones.' });
    }
  },

  // Obtener postulaciones por usuario
  async getUserPostulaciones(req: Request, res: Response) {
    try {
      const { usuarioId } = req.params;
      const { tipo } = req.query;
      const cleanUserId = parseInt(String(usuarioId).replace('usr_', '').replace('org_', ''), 10);
      const postulaciones = await PostulacionModel.getByUser(cleanUserId, tipo as string);
      return res.json({ success: true, data: postulaciones.map(mapPostulacionToFrontend) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error al obtener postulaciones del usuario.' });
    }
  },

  // Obtener postulaciones por evento
  async getEventPostulaciones(req: Request, res: Response) {
    try {
      const { eventoId } = req.params;
      const { tipo } = req.query;
      const cleanEvtId = parseInt(String(eventoId).replace('evt_', ''), 10);
      const postulaciones = await PostulacionModel.getByEvent(cleanEvtId, tipo as string);
      return res.json({ success: true, data: postulaciones.map(mapPostulacionToFrontend) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error al obtener postulaciones del evento.' });
    }
  },

  // Obtener postulaciones para eventos de una organización
  async getOrgPostulaciones(req: Request, res: Response) {
    try {
      const { organizacionId } = req.params;
      const { tipo } = req.query;
      const cleanOrgId = parseInt(String(organizacionId).replace('org_', '').replace('usr_', ''), 10);
      const postulaciones = await PostulacionModel.getByOrganization(cleanOrgId, tipo as string);
      return res.json({ success: true, data: postulaciones.map(mapPostulacionToFrontend) });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error al obtener postulaciones de la organización.' });
    }
  },

  // Crear una nueva postulación
  async createPostulacion(req: Request, res: Response) {
    try {
      const { id_evento, id_usuario, tipo_postulacion, observaciones } = req.body;

      if (!id_evento || !id_usuario || !tipo_postulacion) {
        return res.status(400).json({
          success: false,
          message: 'Faltan parámetros requeridos: id_evento, id_usuario o tipo_postulacion.'
        });
      }

      if (!['voluntario', 'beneficiario'].includes(tipo_postulacion)) {
        return res.status(400).json({
          success: false,
          message: 'El tipo_postulacion debe ser "voluntario" o "beneficiario".'
        });
      }

      const cleanEvtId = parseInt(String(id_evento).replace('evt_', ''), 10);
      const cleanUserId = parseInt(String(id_usuario).replace('usr_', '').replace('org_', ''), 10);

      const result = await PostulacionModel.create({
        id_evento: cleanEvtId,
        id_usuario: cleanUserId,
        tipo_postulacion,
        observaciones
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json({
        success: true,
        message: 'Postulación registrada exitosamente.',
        data: { id: result.id }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error al crear la postulación.' });
    }
  },

  // Actualizar el estado de una postulación
  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { estado_postulacion, observaciones } = req.body;

      if (!estado_postulacion) {
        return res.status(400).json({ success: false, message: 'El campo estado_postulacion es obligatorio.' });
      }

      const validStates = ['pendiente', 'aprobado', 'rechazado', 'confirmado', 'cancelado'];
      if (!validStates.includes(estado_postulacion)) {
        return res.status(400).json({ success: false, message: `Estado no válido. Opciones: ${validStates.join(', ')}` });
      }

      const updated = await PostulacionModel.updateStatus(Number(id), estado_postulacion, observaciones);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Postulación no encontrada o no actualizada.' });
      }

      return res.json({ success: true, message: `Estado de postulación actualizado a "${estado_postulacion}".` });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error al actualizar el estado de la postulación.' });
    }
  },

  // Eliminar / Cancelar postulación
  async deletePostulacion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await PostulacionModel.delete(Number(id));
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Postulación no encontrada.' });
      }
      return res.json({ success: true, message: 'Postulación eliminada exitosamente.' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Error al eliminar la postulación.' });
    }
  }
};
