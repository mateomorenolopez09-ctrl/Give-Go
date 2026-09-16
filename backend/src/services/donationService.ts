import { DonacionModel, DonacionDB } from '../models/donacionModel';

export class DonationService {
  static async getAll() {
    return await DonacionModel.getAll();
  }

  static async getById(id: number) {
    return await DonacionModel.getById(id);
  }

  static async getByUser(userId: number) {
    return await DonacionModel.getByUser(userId);
  }

  static async create(data: Partial<DonacionDB>, detailData?: any) {
    return await DonacionModel.create(data, detailData);
  }

  static async getStats() {
    const all = await DonacionModel.getAll();
    const monetaryTotal = all
      .filter((d: any) => d.tipo === 'Monetaria' && d.valor)
      .reduce((sum: number, d: any) => sum + Number(d.valor || 0), 0);
    const objectCount = all.filter((d: any) => d.tipo === 'Objeto').length;

    return {
      totalDonations: all.length,
      monetaryTotal,
      objectCount,
    };
  }
}
