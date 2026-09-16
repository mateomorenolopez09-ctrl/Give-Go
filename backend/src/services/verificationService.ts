import { SolicitudVerificacionModel, SolicitudVerificacionDB } from '../models/solicitudVerificacionModel';
import { OrganizacionModel } from '../models/organizacionModel';

export class VerificationService {
  static async getAll() {
    return await SolicitudVerificacionModel.getAll();
  }

  static async getById(id: number) {
    return await SolicitudVerificacionModel.getById(id);
  }

  static async getByOrgId(orgId: number) {
    return await SolicitudVerificacionModel.getByOrgId(orgId);
  }

  static async create(data: Partial<SolicitudVerificacionDB>) {
    const id = await SolicitudVerificacionModel.create(data);
    if (data.organizacion_id) {
      await OrganizacionModel.update(data.organizacion_id, { estado_verificacion: 'pendiente' });
    }
    return id;
  }

  static async updateStatus(id: number, estado: 'aprobada' | 'rechazada', respuestaAdmin?: string) {
    const solicitud = await SolicitudVerificacionModel.getById(id);
    if (!solicitud) return false;

    await SolicitudVerificacionModel.updateStatus(id, estado, respuestaAdmin);
    if (solicitud.organizacion_id) {
      await OrganizacionModel.update(solicitud.organizacion_id, {
        verificada: estado === 'aprobada' ? 1 : 0,
        estado_verificacion: estado,
      });
    }
    return true;
  }
}
