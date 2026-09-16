import { AuditModel } from '../models/auditModel';
import { AuditLogger } from '../utils/auditLogger';

export class AuditService {
  static async getAll() {
    return await AuditModel.getAll();
  }

  static async log(userId: number, userName: string, userRole: string, action: string) {
    return await AuditLogger.log(userId, userName, userRole, action);
  }
}
