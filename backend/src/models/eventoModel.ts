import { db } from '../config/db';

export interface EventoDB {
  id_evento: number;
  nombre: string;
  id_categoria: number;
  descripcion?: string;
  direccion?: string;
  fecha: string;
  cupo?: number;
  vacantes_voluntarios?: number;
  vacantes_beneficiarios?: number;
  ayuda_ofrecida?: string;
  estado: number; // 1 = activo, 2 = finalizado, 0 = cancelado
  organizacion_id: number;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  punto_referencia?: string;
  nombre_lugar?: string;
  latitud?: number;
  longitud?: number;
  imagen?: string;
}

export const EventoModel = {
  async getAll(): Promise<any[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT e.*, c.nombre as categoria_nombre, o.nombre as organizacion_nombre 
        FROM eventos e
        LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
        LEFT JOIN organizaciones o ON e.organizacion_id = o.id_organizacion
        ORDER BY e.fecha DESC
      `);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      return fallback.eventos.map((e: any) => {
        const cat = fallback.categorias.find((c: any) => c.id_categoria === e.id_categoria);
        const org = fallback.organizaciones.find((o: any) => o.id_organizacion === e.organizacion_id);
        return {
          ...e,
          categoria_nombre: cat ? cat.nombre : 'General',
          organizacion_nombre: org ? org.nombre : 'Organización'
        };
      });
    }
  },

  async getById(id: number): Promise<any | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT e.*, c.nombre as categoria_nombre, o.nombre as organizacion_nombre 
        FROM eventos e
        LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
        LEFT JOIN organizaciones o ON e.organizacion_id = o.id_organizacion
        WHERE e.id_evento = ?
      `, [id]);
      const evts = rows as any[];
      return evts.length > 0 ? evts[0] : null;
    } else {
      const fallback = db.getFallbackData();
      const e = fallback.eventos.find((ev: any) => ev.id_evento === id);
      if (!e) return null;
      const cat = fallback.categorias.find((c: any) => c.id_categoria === e.id_categoria);
      const org = fallback.organizaciones.find((o: any) => o.id_organizacion === e.organizacion_id);
      return {
        ...e,
        categoria_nombre: cat ? cat.nombre : 'General',
        organizacion_nombre: org ? org.nombre : 'Organización'
      };
    }
  },

  async create(data: Omit<EventoDB, 'id_evento'>): Promise<number> {
    const estado = data.estado !== undefined ? data.estado : 1;
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        `INSERT INTO eventos (
          nombre, id_categoria, descripcion, direccion, fecha, cupo, vacantes_voluntarios, vacantes_beneficiarios, ayuda_ofrecida, estado, organizacion_id,
          barrio, localidad, ciudad, departamento, pais, punto_referencia, nombre_lugar, latitud, longitud, imagen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.nombre,
          data.id_categoria,
          data.descripcion || null,
          data.direccion || null,
          data.fecha,
          data.cupo || 0,
          data.vacantes_voluntarios || 0,
          data.vacantes_beneficiarios || 0,
          data.ayuda_ofrecida || null,
          estado,
          data.organizacion_id,
          data.barrio || null,
          data.localidad || null,
          data.ciudad || 'Bogotá',
          data.departamento || 'Bogotá D.C.',
          data.pais || 'Colombia',
          data.punto_referencia || null,
          data.nombre_lugar || null,
          data.latitud !== undefined ? data.latitud : null,
          data.longitud !== undefined ? data.longitud : null,
          data.imagen || null
        ]
      );
      return (result as any).insertId;
    } else {
      const evts = db.getFallbackData().eventos;
      const nextId = evts.length > 0 ? Math.max(...evts.map((e: any) => e.id_evento)) + 1 : 1;
      const newEvt = {
        id_evento: nextId,
        nombre: data.nombre,
        id_categoria: data.id_categoria,
        descripcion: data.descripcion || '',
        direccion: data.direccion || '',
        fecha: data.fecha,
        cupo: data.cupo || 0,
        vacantes_voluntarios: data.vacantes_voluntarios || 0,
        vacantes_beneficiarios: data.vacantes_beneficiarios || 0,
        ayuda_ofrecida: data.ayuda_ofrecida || '',
        estado,
        organizacion_id: data.organizacion_id,
        barrio: data.barrio || '',
        localidad: data.localidad || '',
        ciudad: data.ciudad || 'Bogotá',
        departamento: data.departamento || 'Bogotá D.C.',
        pais: data.pais || 'Colombia',
        punto_referencia: data.punto_referencia || '',
        nombre_lugar: data.nombre_lugar || '',
        latitud: data.latitud !== undefined ? data.latitud : null,
        longitud: data.longitud !== undefined ? data.longitud : null,
        imagen: data.imagen || ''
      };
      evts.push(newEvt);
      db.saveFallbackData();
      return nextId;
    }
  },

  async update(id: number, data: Partial<Omit<EventoDB, 'id_evento'>>): Promise<boolean> {
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
      const [result] = await db.query(`UPDATE eventos SET ${fields.join(', ')} WHERE id_evento = ?`, values);
      return (result as any).affectedRows > 0;
    } else {
      const evts = db.getFallbackData().eventos;
      const evt = evts.find((e: any) => e.id_evento === id);
      if (!evt) return false;
      
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined) {
          evt[key] = val;
        }
      });
      
      db.saveFallbackData();
      return true;
    }
  },

  async delete(id: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const [result] = await db.query('DELETE FROM eventos WHERE id_evento = ?', [id]);
      return (result as any).affectedRows > 0;
    } else {
      const evts = db.getFallbackData().eventos;
      const index = evts.findIndex((e: any) => e.id_evento === id);
      if (index === -1) return false;
      
      evts.splice(index, 1);
      db.saveFallbackData();
      return true;
    }
  },

  // Obtener participantes registrados de un evento
  async getParticipants(eventoId: number): Promise<any[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT u.id_usuario, u.nombre1, u.nombre2, u.apellido1, u.apellido2, u.telefono, u.correo, u.rol, se.fecha as fecha_registro
        FROM seguimiento_eventos se
        INNER JOIN usuarios u ON se.usuario_id = u.id_usuario
        WHERE se.evento_id = ?
      `, [eventoId]);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      const tracking = fallback.seguimiento_eventos.filter((t: any) => t.evento_id === eventoId);
      return tracking.map((t: any) => {
        const user = fallback.usuarios.find((u: any) => u.id_usuario === t.usuario_id);
        return user ? { ...user, fecha_registro: t.fecha } : null;
      }).filter((u: any) => u !== null);
    }
  },

  // Registrar inscripción de voluntario
  async registerParticipant(eventoId: number, usuarioId: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      try {
        const [result] = await db.query(
          'INSERT INTO seguimiento_eventos (evento_id, usuario_id) VALUES (?, ?)',
          [eventoId, usuarioId]
        );
        return (result as any).affectedRows > 0;
      } catch (err) {
        // En caso de duplicados
        return false;
      }
    } else {
      const fallback = db.getFallbackData();
      const exists = fallback.seguimiento_eventos.some((t: any) => t.evento_id === eventoId && t.usuario_id === usuarioId);
      if (exists) return false;

      fallback.seguimiento_eventos.push({
        id_seguimiento: Date.now(),
        evento_id: eventoId,
        usuario_id: usuarioId,
        fecha: new Date().toISOString()
      });
      db.saveFallbackData();
      return true;
    }
  },

  // Cancelar inscripción
  async unregisterParticipant(eventoId: number, usuarioId: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        'DELETE FROM seguimiento_eventos WHERE evento_id = ? AND usuario_id = ?',
        [eventoId, usuarioId]
      );
      return (result as any).affectedRows > 0;
    } else {
      const fallback = db.getFallbackData();
      const index = fallback.seguimiento_eventos.findIndex((t: any) => t.evento_id === eventoId && t.usuario_id === usuarioId);
      if (index === -1) return false;

      fallback.seguimiento_eventos.splice(index, 1);
      db.saveFallbackData();
      return true;
    }
  },

  // Obtener eventos inscritos de un voluntario
  async getEventsByVolunteer(usuarioId: number): Promise<any[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query(`
        SELECT e.*, c.nombre as categoria_nombre, o.nombre as organizacion_nombre 
        FROM seguimiento_eventos se
        INNER JOIN eventos e ON se.evento_id = e.id_evento
        LEFT JOIN categorias c ON e.id_categoria = c.id_categoria
        LEFT JOIN organizaciones o ON e.organizacion_id = o.id_organizacion
        WHERE se.usuario_id = ?
        ORDER BY e.fecha DESC
      `, [usuarioId]);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      const tracking = fallback.seguimiento_eventos.filter((t: any) => t.usuario_id === usuarioId);
      const eventIds = tracking.map((t: any) => t.evento_id);
      return fallback.eventos.filter((e: any) => eventIds.includes(e.id_evento)).map((e: any) => {
        const cat = fallback.categorias.find((c: any) => c.id_categoria === e.id_categoria);
        const org = fallback.organizaciones.find((o: any) => o.id_organizacion === e.organizacion_id);
        return {
          ...e,
          categoria_nombre: cat ? cat.nombre : 'General',
          organizacion_nombre: org ? org.nombre : 'Organización'
        };
      });
    }
  }
};
