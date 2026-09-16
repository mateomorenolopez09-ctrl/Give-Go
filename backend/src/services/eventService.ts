import { EventoModel, EventoDB } from '../models/eventoModel';
import { PostulacionModel } from '../models/postulacionModel';

export class EventService {
  static async getAll() {
    return await EventoModel.getAll();
  }

  static async getById(id: number) {
    return await EventoModel.getById(id);
  }

  static async create(data: Partial<EventoDB>) {
    return await EventoModel.create(data);
  }

  static async update(id: number, data: Partial<EventoDB>) {
    return await EventoModel.update(id, data);
  }

  static async delete(id: number) {
    return await EventoModel.delete(id);
  }

  static async getApplicationsByEvent(eventId: number) {
    return await PostulacionModel.getByEvent(eventId);
  }

  static async apply(eventId: number, userId: number, type: 'voluntario' | 'beneficiario') {
    return await PostulacionModel.create({
      id_evento: eventId,
      id_usuario: userId,
      tipo_postulacion: type,
      estado_postulacion: 'pendiente',
    });
  }
}
