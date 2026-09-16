import { db } from '../config/db';

export interface AuditDB {
  id_audit?: number;
  fecha: string;
  accion: string;
  id_usuario: number;
  nombre_usuario: string;
  rol_usuario: string;
}

export const AuditModel = {
  async getAll(): Promise<AuditDB[]> {
    if (db.isMySQLConnected()) {
      try {
        await db.query(`
          CREATE TABLE IF NOT EXISTS auditorias (
            id_audit INT AUTO_INCREMENT PRIMARY KEY,
            fecha VARCHAR(50) NOT NULL,
            accion VARCHAR(255) NOT NULL,
            id_usuario INT NOT NULL,
            nombre_usuario VARCHAR(150) NOT NULL,
            rol_usuario VARCHAR(50) NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);
        const [rows] = await db.query('SELECT * FROM auditorias ORDER BY id_audit DESC');
        return rows as AuditDB[];
      } catch (e) {
        console.error("Error fetching audits from MySQL", e);
        return [];
      }
    } else {
      const fallback = db.getFallbackData();
      if (!fallback.auditorias) {
        fallback.auditorias = [];
      }
      return fallback.auditorias;
    }
  },

  async create(data: Omit<AuditDB, 'id_audit'>): Promise<number> {
    if (db.isMySQLConnected()) {
      try {
        // Asegurar que la tabla existe en MySQL
        await db.query(`
          CREATE TABLE IF NOT EXISTS auditorias (
            id_audit INT AUTO_INCREMENT PRIMARY KEY,
            fecha VARCHAR(50) NOT NULL,
            accion VARCHAR(255) NOT NULL,
            id_usuario INT NOT NULL,
            nombre_usuario VARCHAR(150) NOT NULL,
            rol_usuario VARCHAR(50) NOT NULL
          )
        `);
        const [result] = await db.query(
          `INSERT INTO auditorias (fecha, accion, id_usuario, nombre_usuario, rol_usuario) 
           VALUES (?, ?, ?, ?, ?)`,
          [data.fecha, data.accion, data.id_usuario, data.nombre_usuario, data.rol_usuario]
        );
        return (result as any).insertId;
      } catch (e) {
        console.error("Error creating audit in MySQL, falling back to local list log", e);
      }
    }
    
    const fallback = db.getFallbackData();
    if (!fallback.auditorias) {
      fallback.auditorias = [];
    }
    const nextId = fallback.auditorias.length > 0 ? Math.max(...fallback.auditorias.map((a: any) => a.id_audit || 0)) + 1 : 1;
    const newAudit = {
      id_audit: nextId,
      ...data
    };
    fallback.auditorias.push(newAudit);
    db.saveFallbackData();
    return nextId;
  }
};
