import { db } from '../config/db';

export interface SolicitudVerificacionDB {
  id_solicitud: number;
  organizacion_id: number;
  nombre_organizacion: string;
  correo_organizacion: string;
  nit?: string;
  mensaje?: string;
  documentos?: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  respuesta_admin?: string;
  fecha_solicitud?: string;
  fecha_respuesta?: string;
}

export const SolicitudVerificacionModel = {
  async getAll(): Promise<SolicitudVerificacionDB[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM solicitudes_verificacion ORDER BY id_solicitud DESC');
      return rows as SolicitudVerificacionDB[];
    } else {
      const fallback = db.getFallbackData();
      if (!fallback.solicitudes_verificacion) {
        fallback.solicitudes_verificacion = [];
      }
      return fallback.solicitudes_verificacion;
    }
  },

  async getById(id: number): Promise<SolicitudVerificacionDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM solicitudes_verificacion WHERE id_solicitud = ?', [id]);
      const list = rows as SolicitudVerificacionDB[];
      return list.length > 0 ? list[0] : null;
    } else {
      const fallback = db.getFallbackData();
      const list = fallback.solicitudes_verificacion || [];
      const item = list.find((s: any) => s.id_solicitud === id);
      return item || null;
    }
  },

  async getPendingByOrgId(orgId: number): Promise<SolicitudVerificacionDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(
        'SELECT * FROM solicitudes_verificacion WHERE organizacion_id = ? AND estado = "pendiente" ORDER BY id_solicitud DESC LIMIT 1',
        [orgId]
      );
      const list = rows as SolicitudVerificacionDB[];
      return list.length > 0 ? list[0] : null;
    } else {
      const fallback = db.getFallbackData();
      const list = fallback.solicitudes_verificacion || [];
      const item = list.find((s: any) => s.organizacion_id === orgId && s.estado === 'pendiente');
      return item || null;
    }
  },

  async getLatestByOrgId(orgId: number): Promise<SolicitudVerificacionDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(
        'SELECT * FROM solicitudes_verificacion WHERE organizacion_id = ? ORDER BY id_solicitud DESC LIMIT 1',
        [orgId]
      );
      const list = rows as SolicitudVerificacionDB[];
      return list.length > 0 ? list[0] : null;
    } else {
      const fallback = db.getFallbackData();
      const list = fallback.solicitudes_verificacion || [];
      const items = list.filter((s: any) => s.organizacion_id === orgId);
      if (items.length === 0) return null;
      items.sort((a: any, b: any) => b.id_solicitud - a.id_solicitud);
      return items[0];
    }
  },

  async create(data: Omit<SolicitudVerificacionDB, 'id_solicitud' | 'fecha_solicitud'>): Promise<number> {
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        `INSERT INTO solicitudes_verificacion (
          organizacion_id, nombre_organizacion, correo_organizacion, nit, mensaje, documentos, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          data.organizacion_id,
          data.nombre_organizacion,
          data.correo_organizacion,
          data.nit || null,
          data.mensaje || null,
          data.documentos || null,
          data.estado || 'pendiente'
        ]
      );
      return (result as any).insertId;
    } else {
      const fallback = db.getFallbackData();
      if (!fallback.solicitudes_verificacion) {
        fallback.solicitudes_verificacion = [];
      }
      const list = fallback.solicitudes_verificacion;
      const nextId = list.length > 0 ? Math.max(...list.map((s: any) => s.id_solicitud || 0)) + 1 : 1;
      const newItem: SolicitudVerificacionDB = {
        id_solicitud: nextId,
        organizacion_id: data.organizacion_id,
        nombre_organizacion: data.nombre_organizacion,
        correo_organizacion: data.correo_organizacion,
        nit: data.nit || '',
        mensaje: data.mensaje || '',
        documentos: data.documentos || '',
        estado: data.estado || 'pendiente',
        respuesta_admin: '',
        fecha_solicitud: new Date().toISOString()
      };
      list.unshift(newItem);
      db.saveFallbackData();
      return nextId;
    }
  },

  async updateStatus(id: number, estado: 'aprobada' | 'rechazada', respuesta_admin?: string): Promise<boolean> {
    const fecha_respuesta = new Date().toISOString();
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        'UPDATE solicitudes_verificacion SET estado = ?, respuesta_admin = ?, fecha_respuesta = ? WHERE id_solicitud = ?',
        [estado, respuesta_admin || null, fecha_respuesta, id]
      );
      return (result as any).affectedRows > 0;
    } else {
      const fallback = db.getFallbackData();
      const list = fallback.solicitudes_verificacion || [];
      const item = list.find((s: any) => s.id_solicitud === id);
      if (!item) return false;
      item.estado = estado;
      item.respuesta_admin = respuesta_admin || '';
      item.fecha_respuesta = fecha_respuesta;
      db.saveFallbackData();
      return true;
    }
  }
};
