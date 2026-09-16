import { db } from '../config/db';

export interface DonacionDB {
  id_donacion: number;
  categoria?: string;
  tipo: 'Monetaria' | 'Objeto';
  fecha?: string;
  usuario_id: number;
  organizacion_id: number;
  estado: number; // 1 = activo, 0 = inactivo
  observaciones?: string;
}

export interface DonacionMonetariaDB {
  id: number;
  metodo: string;
  cuenta: string;
  valor: number;
  donacion_id: number;
}

export interface DonacionObjetoDB {
  id: number;
  categoria: string;
  descripcion: string;
  cantidad: number;
  donacion_id: number;
}

export const DonacionModel = {
  async getAll(): Promise<any[]> {
    if (db.isMySQLConnected()) {
      // Usamos consultas JOIN limpias
      const [rows] = await db.query(`
        SELECT d.*, 
               u.nombre1 as usuario_nombre, u.apellido1 as usuario_apellido,
               o.nombre as organizacion_nombre,
               dm.metodo, dm.cuenta, dm.valor,
               dob.categoria as objeto_categoria, dob.descripcion as objeto_descripcion, dob.cantidad
        FROM donaciones d
        LEFT JOIN usuarios u ON d.usuario_id = u.id_usuario
        LEFT JOIN organizaciones o ON d.organizacion_id = o.id_organizacion
        LEFT JOIN donaciones_monetarias dm ON d.id_donacion = dm.donacion_id
        LEFT JOIN donaciones_objetos dob ON d.id_donacion = dob.donacion_id
        ORDER BY d.fecha DESC
      `);
      return rows as any[];
    } else {
      const fallback = db.getFallbackData();
      return fallback.donaciones.map((d: any) => {
        const u = fallback.usuarios.find((usr: any) => usr.id_usuario === d.usuario_id);
        const o = fallback.organizaciones.find((org: any) => org.id_organizacion === d.organizacion_id);
        const dm = fallback.donaciones_monetarias.find((mon: any) => mon.donacion_id === d.id_donacion);
        const dob = fallback.donaciones_objetos.find((obj: any) => obj.donacion_id === d.id_donacion);

        return {
          ...d,
          usuario_nombre: u ? u.nombre1 : 'Anónimo',
          usuario_apellido: u ? u.apellido1 : '',
          organizacion_nombre: o ? o.nombre : 'Organización',
          metodo: dm ? dm.metodo : null,
          cuenta: dm ? dm.cuenta : null,
          valor: dm ? dm.valor : null,
          objeto_categoria: dob ? dob.categoria : null,
          objeto_descripcion: dob ? dob.descripcion : null,
          cantidad: dob ? dob.cantidad : null
        };
      });
    }
  },

  async getById(id: number): Promise<any | null> {
    const list = await this.getAll();
    const match = list.find((d: any) => d.id_donacion === id);
    return match || null;
  },

  async getByVolunteer(usuarioId: number): Promise<any[]> {
    const list = await this.getAll();
    return list.filter((d: any) => d.usuario_id === usuarioId);
  },

  async getByOrganization(organizacionId: number): Promise<any[]> {
    const list = await this.getAll();
    return list.filter((d: any) => d.organizacion_id === organizacionId);
  },

  async createMonetary(
    donation: Omit<DonacionDB, 'id_donacion' | 'tipo' | 'fecha'>,
    monetary: Omit<DonacionMonetariaDB, 'id' | 'donacion_id'>
  ): Promise<number> {
    const estado = donation.estado !== undefined ? donation.estado : 1;
    if (db.isMySQLConnected()) {
      // Iniciar transacción de SQL puro mediante mysql2
      const [donationRes] = await db.query(
        `INSERT INTO donaciones (categoria, tipo, usuario_id, organizacion_id, estado, observaciones) 
         VALUES (?, 'Monetaria', ?, ?, ?, ?)`,
        [donation.categoria || 'Económico', donation.usuario_id, donation.organizacion_id, estado, donation.observaciones || null]
      );
      const insertId = (donationRes as any).insertId;
      
      await db.query(
        `INSERT INTO donaciones_monetarias (metodo, cuenta, valor, donacion_id) 
         VALUES (?, ?, ?, ?)`,
        [monetary.metodo, monetary.cuenta, monetary.valor, insertId]
      );
      return insertId;
    } else {
      const fallback = db.getFallbackData();
      const donId = fallback.donaciones.length > 0 ? Math.max(...fallback.donaciones.map((d: any) => d.id_donacion)) + 1 : 1;
      
      fallback.donaciones.push({
        id_donacion: donId,
        categoria: donation.categoria || 'Económico',
        tipo: 'Monetaria',
        usuario_id: donation.usuario_id,
        organizacion_id: donation.organizacion_id,
        estado,
        observaciones: donation.observaciones || '',
        fecha: new Date().toISOString()
      });

      const dmId = fallback.donaciones_monetarias.length > 0 ? Math.max(...fallback.donaciones_monetarias.map((m: any) => m.id)) + 1 : 1;
      fallback.donaciones_monetarias.push({
        id: dmId,
        metodo: monetary.metodo,
        cuenta: monetary.cuenta,
        valor: monetary.valor,
        donacion_id: donId
      });

      db.saveFallbackData();
      return donId;
    }
  },

  async createObject(
    donation: Omit<DonacionDB, 'id_donacion' | 'tipo' | 'fecha'>,
    objectDetail: Omit<DonacionObjetoDB, 'id' | 'donacion_id'>
  ): Promise<number> {
    const estado = donation.estado !== undefined ? donation.estado : 1;
    if (db.isMySQLConnected()) {
      const [donationRes] = await db.query(
        `INSERT INTO donaciones (categoria, tipo, usuario_id, organizacion_id, estado, observaciones) 
         VALUES (?, 'Objeto', ?, ?, ?, ?)`,
        [donation.categoria || objectDetail.categoria, donation.usuario_id, donation.organizacion_id, estado, donation.observaciones || null]
      );
      const insertId = (donationRes as any).insertId;
      
      await db.query(
        `INSERT INTO donaciones_objetos (categoria, descripcion, cantidad, donacion_id) 
         VALUES (?, ?, ?, ?)`,
        [objectDetail.categoria, objectDetail.descripcion, objectDetail.cantidad, insertId]
      );
      return insertId;
    } else {
      const fallback = db.getFallbackData();
      const donId = fallback.donaciones.length > 0 ? Math.max(...fallback.donaciones.map((d: any) => d.id_donacion)) + 1 : 1;
      
      fallback.donaciones.push({
        id_donacion: donId,
        categoria: donation.categoria || objectDetail.categoria,
        tipo: 'Objeto',
        usuario_id: donation.usuario_id,
        organizacion_id: donation.organizacion_id,
        estado,
        observaciones: donation.observaciones || '',
        fecha: new Date().toISOString()
      });

      const dobId = fallback.donaciones_objetos.length > 0 ? Math.max(...fallback.donaciones_objetos.map((o: any) => o.id)) + 1 : 1;
      fallback.donaciones_objetos.push({
        id: dobId,
        categoria: objectDetail.categoria,
        descripcion: objectDetail.descripcion,
        cantidad: objectDetail.cantidad,
        donacion_id: donId
      });

      db.saveFallbackData();
      return donId;
    }
  },

  async delete(id: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      // Eliminar de los hijos primero
      await db.query('DELETE FROM donaciones_monetarias WHERE donacion_id = ?', [id]);
      await db.query('DELETE FROM donaciones_objetos WHERE donacion_id = ?', [id]);
      const [result] = await db.query('DELETE FROM donaciones WHERE id_donacion = ?', [id]);
      return (result as any).affectedRows > 0;
    } else {
      const fallback = db.getFallbackData();
      const index = fallback.donaciones.findIndex((d: any) => d.id_donacion === id);
      if (index === -1) return false;
      
      fallback.donaciones.splice(index, 1);
      fallback.donaciones_monetarias = fallback.donaciones_monetarias.filter((m: any) => m.donacion_id !== id);
      fallback.donaciones_objetos = fallback.donaciones_objetos.filter((o: any) => o.donacion_id !== id);
      
      db.saveFallbackData();
      return true;
    }
  }
};
