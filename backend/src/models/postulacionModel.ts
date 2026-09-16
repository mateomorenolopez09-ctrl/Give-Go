import { db } from '../config/db';

export interface PostulacionDB {
  id_postulacion: number;
  id_evento: number;
  id_usuario: number;
  tipo_postulacion: 'voluntario' | 'beneficiario';
  estado_postulacion: 'pendiente' | 'aprobado' | 'rechazado' | 'confirmado' | 'cancelado';
  fecha_postulacion: string;
  fecha_aprobacion?: string | null;
  fecha_confirmacion?: string | null;
  observaciones?: string | null;
}

export const PostulacionModel = {
  // Obtener todas las postulaciones con joins
  async getAll(): Promise<any[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT p.*, 
               e.nombre as evento_nombre, e.fecha as evento_fecha, e.direccion as evento_direccion, e.ayuda_ofrecida,
               o.nombre as organizacion_nombre,
               u.nombre1, u.nombre2, u.apellido1, u.apellido2, u.correo, u.telefono, u.rol
        FROM tabla_postulaciones p
        INNER JOIN eventos e ON p.id_evento = e.id_evento
        LEFT JOIN organizaciones o ON e.organizacion_id = o.id_organizacion
        INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
        ORDER BY p.fecha_postulacion DESC
      `);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      const postulaciones = fallback.tabla_postulaciones || [];
      return postulaciones.map((p: any) => {
        const evt = fallback.eventos.find((e: any) => e.id_evento === p.id_evento);
        const org = evt ? fallback.organizaciones.find((o: any) => o.id_organizacion === evt.organizacion_id) : null;
        const usr = fallback.usuarios.find((u: any) => u.id_usuario === p.id_usuario);
        return {
          ...p,
          evento_nombre: evt ? evt.nombre : 'Evento',
          evento_fecha: evt ? evt.fecha : '',
          evento_direccion: evt ? evt.direccion : '',
          ayuda_ofrecida: evt ? evt.ayuda_ofrecida : '',
          organizacion_nombre: org ? org.nombre : 'Organización',
          nombre1: usr ? usr.nombre1 : '',
          nombre2: usr ? usr.nombre2 : '',
          apellido1: usr ? usr.apellido1 : '',
          apellido2: usr ? usr.apellido2 : '',
          correo: usr ? usr.correo : '',
          telefono: usr ? usr.telefono : '',
          rol: usr ? usr.rol : ''
        };
      });
    }
  },

  // Obtener postulaciones de un usuario
  async getByUser(usuarioId: number, tipoPostulacion?: string): Promise<any[]> {
    const all = await this.getAll();
    return all.filter((p: any) => {
      const matchesUser = p.id_usuario === usuarioId;
      const matchesTipo = tipoPostulacion ? p.tipo_postulacion === tipoPostulacion : true;
      return matchesUser && matchesTipo;
    });
  },

  // Obtener postulaciones de un evento
  async getByEvent(eventoId: number, tipoPostulacion?: string): Promise<any[]> {
    const all = await this.getAll();
    return all.filter((p: any) => {
      const matchesEvent = p.id_evento === eventoId;
      const matchesTipo = tipoPostulacion ? p.tipo_postulacion === tipoPostulacion : true;
      return matchesEvent && matchesTipo;
    });
  },

  // Obtener postulaciones de eventos creados por una organización
  async getByOrganization(organizacionId: number | string, tipoPostulacion?: string): Promise<any[]> {
    const cleanOrgId = typeof organizacionId === 'number' ? organizacionId : parseInt(String(organizacionId || '').replace('org_', '').replace('usr_', ''), 10);

    if (db.isMySQLConnected()) {
      let query = `
        SELECT p.*, 
               e.nombre as evento_nombre, e.fecha as evento_fecha, e.direccion as evento_direccion, e.ayuda_ofrecida,
               o.nombre as organizacion_nombre,
               u.nombre1, u.nombre2, u.apellido1, u.apellido2, u.correo, u.telefono, u.rol
        FROM tabla_postulaciones p
        INNER JOIN eventos e ON p.id_evento = e.id_evento
        LEFT JOIN organizaciones o ON e.organizacion_id = o.id_organizacion
        INNER JOIN usuarios u ON p.id_usuario = u.id_usuario
        WHERE (e.organizacion_id = ? OR e.organizacion_id = ? OR o.id_organizacion = ?)
      `;
      const params: any[] = [cleanOrgId, cleanOrgId, cleanOrgId];
      if (tipoPostulacion) {
        query += ` AND p.tipo_postulacion = ?`;
        params.push(tipoPostulacion);
      }
      query += ` ORDER BY p.fecha_postulacion DESC`;
      const [rows] = await db.query(query, params);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      const orgEvents = fallback.eventos.filter((e: any) => {
        const cleanEOrg = parseInt(String(e.organizacion_id || '').replace('org_', '').replace('usr_', ''), 10);
        return cleanEOrg === cleanOrgId || e.organizacion_id === cleanOrgId || e.organizacion_id === `org_${cleanOrgId}` || e.organizacion_id === `usr_${cleanOrgId}`;
      }).map((e: any) => e.id_evento);

      const all = await this.getAll();
      return all.filter((p: any) => {
        const matchesOrg = orgEvents.includes(p.id_evento);
        const matchesTipo = tipoPostulacion ? p.tipo_postulacion === tipoPostulacion : true;
        return matchesOrg && matchesTipo;
      });
    }
  },

  // Crear una nueva postulación
  async create(data: {
    id_evento: number;
    id_usuario: number;
    tipo_postulacion: 'voluntario' | 'beneficiario';
    observaciones?: string;
  }): Promise<{ success: boolean; id?: number; message?: string }> {
    const estado_postulacion = 'pendiente';
    const fecha_postulacion = new Date().toISOString();

    if (db.isMySQLConnected()) {
      try {
        // Verificar existencia previa
        const [existing]: any = await db.query(
          'SELECT * FROM tabla_postulaciones WHERE id_evento = ? AND id_usuario = ? AND tipo_postulacion = ?',
          [data.id_evento, data.id_usuario, data.tipo_postulacion]
        );
        if (existing && existing.length > 0) {
          return { success: false, message: 'Ya tienes una postulación registrada para este evento.' };
        }

        const [result]: any = await db.query(
          `INSERT INTO tabla_postulaciones 
           (id_evento, id_usuario, tipo_postulacion, estado_postulacion, observaciones) 
           VALUES (?, ?, ?, ?, ?)`,
          [data.id_evento, data.id_usuario, data.tipo_postulacion, estado_postulacion, data.observaciones || null]
        );
        return { success: true, id: result.insertId };
      } catch (err: any) {
        return { success: false, message: err.message || 'Error al guardar la postulación en la base de datos.' };
      }
    } else {
      const fallback = db.getFallbackData();
      if (!fallback.tabla_postulaciones) {
        fallback.tabla_postulaciones = [];
      }

      const exists = fallback.tabla_postulaciones.some(
        (p: any) => p.id_evento === data.id_evento && p.id_usuario === data.id_usuario && p.tipo_postulacion === data.tipo_postulacion
      );

      if (exists) {
        return { success: false, message: 'Ya tienes una postulación registrada para este evento.' };
      }

      const nextId = fallback.tabla_postulaciones.length > 0
        ? Math.max(...fallback.tabla_postulaciones.map((p: any) => p.id_postulacion || 0)) + 1
        : 1;

      const newPostulacion = {
        id_postulacion: nextId,
        id_evento: data.id_evento,
        id_usuario: data.id_usuario,
        tipo_postulacion: data.tipo_postulacion,
        estado_postulacion,
        fecha_postulacion,
        fecha_aprobacion: null,
        fecha_confirmacion: null,
        observaciones: data.observaciones || null
      };

      fallback.tabla_postulaciones.push(newPostulacion);
      db.saveFallbackData();
      return { success: true, id: nextId };
    }
  },

  // Actualizar estado de una postulación
  async updateStatus(
    idPostulacion: number,
    nuevoEstado: 'pendiente' | 'aprobado' | 'rechazado' | 'confirmado' | 'cancelado',
    observaciones?: string
  ): Promise<boolean> {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (db.isMySQLConnected()) {
      let query = `UPDATE tabla_postulaciones SET estado_postulacion = ?`;
      const params: any[] = [nuevoEstado];

      if (nuevoEstado === 'aprobado' || nuevoEstado === 'rechazado') {
        query += `, fecha_aprobacion = NOW()`;
      } else if (nuevoEstado === 'confirmado') {
        query += `, fecha_confirmacion = NOW()`;
      }

      if (observaciones !== undefined) {
        query += `, observaciones = ?`;
        params.push(observaciones);
      }

      query += ` WHERE id_postulacion = ?`;
      params.push(idPostulacion);

      const [result]: any = await db.query(query, params);
      return result.affectedRows > 0;
    } else {
      const fallback = db.getFallbackData();
      const p = (fallback.tabla_postulaciones || []).find((item: any) => item.id_postulacion === idPostulacion);
      if (!p) return false;

      p.estado_postulacion = nuevoEstado;
      if (nuevoEstado === 'aprobado' || nuevoEstado === 'rechazado') {
        p.fecha_aprobacion = now;
      } else if (nuevoEstado === 'confirmado') {
        p.fecha_confirmacion = now;
      }
      if (observaciones !== undefined) {
        p.observaciones = observaciones;
      }

      db.saveFallbackData();
      return true;
    }
  },

  // Eliminar / cancelar postulación
  async delete(idPostulacion: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const [result]: any = await db.query('DELETE FROM tabla_postulaciones WHERE id_postulacion = ?', [idPostulacion]);
      return result.affectedRows > 0;
    } else {
      const fallback = db.getFallbackData();
      const index = (fallback.tabla_postulaciones || []).findIndex((p: any) => p.id_postulacion === idPostulacion);
      if (index === -1) return false;

      fallback.tabla_postulaciones.splice(index, 1);
      db.saveFallbackData();
      return true;
    }
  }
};
