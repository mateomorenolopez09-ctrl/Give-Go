import { UsuarioModel, UsuarioDB } from '../models/usuarioModel';

export class UserService {
  static async getAll() {
    return await UsuarioModel.getAll();
  }

  static async getById(id: number) {
    return await UsuarioModel.getById(id);
  }

  static async getByEmail(email: string) {
    return await UsuarioModel.getByEmail(email);
  }

  static async update(id: number, data: Partial<UsuarioDB>) {
    return await UsuarioModel.update(id, data);
  }

  static async delete(id: number) {
    return await UsuarioModel.delete(id);
  }

  static async countVolunteers() {
    const all = await UsuarioModel.getAll();
    return all.filter((u) => u.rol === 'Voluntario' && u.estado === 1).length;
  }
}
