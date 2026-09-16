import { db } from '../config/db';

export interface SolicitudDB {
  id_solicitud: number;
  usuario_id: number;
  titulo?: string;
  descripcion?: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada';
  fecha?: string;
}

export const SolicitudModel = {
  async getAll(): Promise<any[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT s.*, u.nombre1, u.apellido1, u.correo, u.telefono 
        FROM solicitudes s
        INNER JOIN usuarios u ON s.usuario_id = u.id_usuario
        ORDER BY s.fecha DESC
      `);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      return fallback.solicitudes.map((s: any) => {
        const user = fallback.usuarios.find((u: any) => u.id_usuario === s.usuario_id);
        return {
          ...s,
          nombre1: user ? user.nombre1 : 'Beneficiario',
          apellido1: user ? user.apellido1 : 'Anónimo',
          correo: user ? user.correo : '',
          telefono: user ? user.telefono : ''
        };
      });
    }
  },

  async getById(id: number): Promise<any | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT s.*, u.nombre1, u.apellido1, u.correo, u.telefono 
        FROM solicitudes s
        INNER JOIN usuarios u ON s.usuario_id = u.id_usuario
        WHERE s.id_solicitud = ?
      `, [id]);
      const reqs = rows as any[];
      return reqs.length > 0 ? reqs[0] : null;
    } else {
      const fallback = db.getFallbackData();
      const s = fallback.solicitudes.find((sol: any) => sol.id_solicitud === id);
      if (!s) return null;
      const user = fallback.usuarios.find((u: any) => u.id_usuario === s.usuario_id);
      return {
        ...s,
        nombre1: user ? user.nombre1 : 'Beneficiario',
        apellido1: user ? user.apellido1 : 'Anónimo',
        correo: user ? user.correo : '',
        telefono: user ? user.telefono : ''
      };
    }
  },

  async getByBeneficiary(usuarioId: number): Promise<any[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT s.*, u.nombre1, u.apellido1, u.correo, u.telefono 
        FROM solicitudes s
        INNER JOIN usuarios u ON s.usuario_id = u.id_usuario
        WHERE s.usuario_id = ?
        ORDER BY s.fecha DESC
      `, [usuarioId]);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      return fallback.solicitudes.filter((s: any) => s.usuario_id === usuarioId).map((s: any) => {
        const user = fallback.usuarios.find((u: any) => u.id_usuario === s.usuario_id);
        return {
          ...s,
          nombre1: user ? user.nombre1 : 'Beneficiario',
          apellido1: user ? user.apellido1 : 'Anónimo',
          correo: user ? user.correo : '',
          telefono: user ? user.telefono : ''
        };
      });
    }
  },

  async create(data: Omit<SolicitudDB, 'id_solicitud'>): Promise<number> {
    const estado = data.estado || 'Pendiente';
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        `INSERT INTO solicitudes (usuario_id, titulo, descripcion, estado) 
         VALUES (?, ?, ?, ?)`,
        [data.usuario_id, data.titulo || null, data.descripcion || null, estado]
      );
      return (result as any).insertId;
    } else {
      const reqs = db.getFallbackData().solicitudes;
      const nextId = reqs.length > 0 ? Math.max(...reqs.map((s: any) => s.id_solicitud)) + 1 : 1;
      const newReq = {
        id_solicitud: nextId,
        usuario_id: data.usuario_id,
        titulo: data.titulo || '',
        descripcion: data.descripcion || '',
        estado,
        fecha: new Date().toISOString()
      };
      reqs.push(newReq);
      db.saveFallbackData();
      return nextId;
    }
  },

  async update(id: number, data: Partial<Omit<SolicitudDB, 'id_solicitud' | 'usuario_id'>>): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const fields: string[] = [];
      const values: any[] = [];
      
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined) {
          fields.push(`${key} = ?`);
          values.push(val);
        }
      });
      
      if (fields.length === 0) return true;
      
      values.push(id);
      const [result] = await db.query(`UPDATE solicitudes SET ${fields.join(', ')} WHERE id_solicitud = ?`, values);
      return (result as any).affectedRows > 0;
    } else {
      const reqs = db.getFallbackData().solicitudes;
      const req = reqs.find((s: any) => s.id_solicitud === id);
      if (!req) return false;
      
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined) {
          req[key] = val;
        }
      });
      
      db.saveFallbackData();
      return true;
    }
  },

  async delete(id: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const [result] = await db.query('DELETE FROM solicitudes WHERE id_solicitud = ?', [id]);
      return (result as any).affectedRows > 0;
    } else {
      const reqs = db.getFallbackData().solicitudes;
      const index = reqs.findIndex((s: any) => s.id_solicitud === id);
      if (index === -1) return false;
      
      reqs.splice(index, 1);
      db.saveFallbackData();
      return true;
    }
  }
};
