import { SolicitudModel, SolicitudDB } from '../models/solicitudModel';

export class RequestService {
  static async getAll() {
    return await SolicitudModel.getAll();
  }

  static async getById(id: number) {
    return await SolicitudModel.getById(id);
  }

  static async getByUser(userId: number) {
    return await SolicitudModel.getByUser(userId);
  }

  static async create(data: Partial<SolicitudDB>) {
    return await SolicitudModel.create(data);
  }

  static async updateStatus(id: number, status: 'Pendiente' | 'Aprobada' | 'Rechazada') {
    return await SolicitudModel.update(id, { estado: status });
  }
}
