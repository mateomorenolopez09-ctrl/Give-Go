import { db } from '../config/db';

export interface OrganizacionDB {
  id_organizacion: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  correo: string;
  password?: string;
  descripcion?: string;
  estado: number; // 1 = activo, 0 = inactivo
  fecha_registro?: string;
  nit?: string;
  representante_legal?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  categoria?: string;
  logo?: string;
  latitud?: number | null;
  longitud?: number | null;
  verificada?: number; // 0 = No, 1 = Si
  estado_verificacion?: string; // 'no_solicitado', 'pendiente', 'aprobada', 'rechazada'
}

export const OrganizacionModel = {
  async getAll(): Promise<OrganizacionDB[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM organizaciones ORDER BY id_organizacion DESC');
      return rows as OrganizacionDB[];
    } else {
      return db.getFallbackData().organizaciones;
    }
  },

  async getById(id: number): Promise<OrganizacionDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM organizaciones WHERE id_organizacion = ?', [id]);
      const orgs = rows as OrganizacionDB[];
      return orgs.length > 0 ? orgs[0] : null;
    } else {
      const org = db.getFallbackData().organizaciones.find((o: any) => o.id_organizacion === id);
      return org || null;
    }
  },

  async getByEmail(correo: string): Promise<OrganizacionDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM organizaciones WHERE LOWER(correo) = LOWER(?)', [correo]);
      const orgs = rows as OrganizacionDB[];
      return orgs.length > 0 ? orgs[0] : null;
    } else {
      const org = db.getFallbackData().organizaciones.find((o: any) => o.correo.toLowerCase() === correo.toLowerCase());
      return org || null;
    }
  },

  async create(data: Omit<OrganizacionDB, 'id_organizacion' | 'fecha_registro'>): Promise<number> {
    const estado = data.estado !== undefined ? data.estado : 1;
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        `INSERT INTO organizaciones (
          nombre, direccion, telefono, correo, password, descripcion, estado,
          nit, representante_legal, barrio, localidad, ciudad, departamento, pais, categoria, logo, latitud, longitud
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.nombre, data.direccion || null, data.telefono || null, data.correo, data.password, data.descripcion || null, estado,
          data.nit || null, data.representante_legal || null, data.barrio || null, data.localidad || null, data.ciudad || null, data.departamento || null, data.pais || null, data.categoria || null, data.logo || null,
          data.latitud !== undefined ? data.latitud : null, data.longitud !== undefined ? data.longitud : null
        ]
      );
      return (result as any).insertId;
    } else {
      const orgs = db.getFallbackData().organizaciones;
      const nextId = orgs.length > 0 ? Math.max(...orgs.map((o: any) => o.id_organizacion)) + 1 : 1;
      const newOrg = {
        id_organizacion: nextId,
        nombre: data.nombre,
        direccion: data.direccion || '',
        telefono: data.telefono || '',
        correo: data.correo,
        password: data.password,
        descripcion: data.descripcion || '',
        estado,
        fecha_registro: new Date().toISOString(),
        nit: data.nit || '',
        representante_legal: data.representante_legal || '',
        barrio: data.barrio || '',
        localidad: data.localidad || '',
        ciudad: data.ciudad || '',
        departamento: data.departamento || '',
        pais: data.pais || '',
        categoria: data.categoria || '',
        logo: data.logo || '',
        latitud: data.latitud !== undefined ? data.latitud : null,
        longitud: data.longitud !== undefined ? data.longitud : null
      };
      orgs.push(newOrg);
      db.saveFallbackData();
      return nextId;
    }
  },

  async update(id: number, data: Partial<Omit<OrganizacionDB, 'id_organizacion' | 'fecha_registro'>>): Promise<boolean> {
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
      const [result] = await db.query(`UPDATE organizaciones SET ${fields.join(', ')} WHERE id_organizacion = ?`, values);
      return (result as any).affectedRows > 0;
    } else {
      const orgs = db.getFallbackData().organizaciones;
      const org = orgs.find((o: any) => o.id_organizacion === id);
      if (!org) return false;
      
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined) {
          org[key] = val;
        }
      });
      
      db.saveFallbackData();
      return true;
    }
  },

  async delete(id: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const [result] = await db.query('DELETE FROM organizaciones WHERE id_organizacion = ?', [id]);
      return (result as any).affectedRows > 0;
    } else {
      const orgs = db.getFallbackData().organizaciones;
      const index = orgs.findIndex((o: any) => o.id_organizacion === id);
      if (index === -1) return false;
      
      orgs.splice(index, 1);
      db.saveFallbackData();
      return true;
    }
  }
};
