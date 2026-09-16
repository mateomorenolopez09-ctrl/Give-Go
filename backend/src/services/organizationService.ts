import { OrganizacionModel, OrganizacionDB } from '../models/organizacionModel';

export class OrganizationService {
  static async getAll() {
    return await OrganizacionModel.getAll();
  }

  static async getById(id: number) {
    return await OrganizacionModel.getById(id);
  }

  static async getByEmail(correo: string) {
    return await OrganizacionModel.getByEmail(correo);
  }

  static async create(data: Partial<OrganizacionDB>) {
    return await OrganizacionModel.create(data);
  }

  static async update(id: number, data: Partial<OrganizacionDB>) {
    return await OrganizacionModel.update(id, data);
  }

  static async delete(id: number) {
    return await OrganizacionModel.delete(id);
  }
}
