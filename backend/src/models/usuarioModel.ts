// Ejecuta las consultas SQL en la base de datos
import { db } from '../config/db';// Conectamos con la base de datos

export interface UsuarioDB {
  id_usuario: number;
  rol: 'Admin' | 'Voluntario' | 'Beneficiario' | 'Organizacion';
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  telefono?: string;
  correo: string;
  password?: string;
  estado: number; // 1 = activo, 0 = inactivo
  fecha_registro?: string;
  tipo_documento?: string;
  num_documento?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  barrio?: string;
  localidad?: string;
  ciudad?: string;
  departamento?: string;
  pais?: string;
  codigo_postal?: string;
  foto?: string;
  biografia?: string;
  foto_portada?: string;
  sitio_web?: string;
  redes_sociales?: string;
  privacidad?: string;
  mision?: string;
  vision?: string;
}

export const UsuarioModel = {
  async getAll(): Promise<UsuarioDB[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM usuarios ORDER BY id_usuario DESC');
      return rows as UsuarioDB[];
    } else {
      return db.getFallbackData().usuarios;
    }
  },

  async getById(id: number): Promise<UsuarioDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM usuarios WHERE id_usuario = ?', [id]);
      const users = rows as UsuarioDB[];
      return users.length > 0 ? users[0] : null;
    } else {
      const user = db.getFallbackData().usuarios.find((u: any) => u.id_usuario === id);
      return user || null;
    }
  },

  async getByEmail(correo: string): Promise<UsuarioDB | null> {
    if (db.isMySQLConnected()) {
      //   AQUI SALTA a db.ts y ejecuta la consulta en MySQL
      const [rows] = await db.query('SELECT * FROM usuarios WHERE LOWER(correo) = LOWER(?)', [correo]);
      const users = rows as UsuarioDB[];
      return users.length > 0 ? users[0] : null;
    } else {
      const user = db.getFallbackData().usuarios.find((u: any) => u.correo.toLowerCase() === correo.toLowerCase());
      return user || null;
    }
  },

  async create(data: Omit<UsuarioDB, 'id_usuario' | 'fecha_registro'>): Promise<number> {
    const estado = data.estado !== undefined ? data.estado : 1;
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        `INSERT INTO usuarios (
          rol, nombre1, nombre2, apellido1, apellido2, telefono, correo, password, estado,
          tipo_documento, num_documento, fecha_nacimiento, direccion, barrio, localidad, ciudad, departamento, pais, codigo_postal, foto
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.rol, data.nombre1, data.nombre2 || null, data.apellido1, data.apellido2 || null, data.telefono || null, data.correo, data.password, estado,
          data.tipo_documento || null, data.num_documento || null, data.fecha_nacimiento || null, data.direccion || null, data.barrio || null, data.localidad || null, data.ciudad || null, data.departamento || null, data.pais || null, data.codigo_postal || null, data.foto || null
        ]
      );
      return (result as any).insertId;
    } else {
      const users = db.getFallbackData().usuarios;
      const nextId = users.length > 0 ? Math.max(...users.map((u: any) => u.id_usuario)) + 1 : 1;
      const newUser = {
        id_usuario: nextId,
        rol: data.rol,
        nombre1: data.nombre1,
        nombre2: data.nombre2 || '',
        apellido1: data.apellido1,
        apellido2: data.apellido2 || '',
        telefono: data.telefono || '',
        correo: data.correo,
        password: data.password,
        estado,
        fecha_registro: new Date().toISOString(),
        tipo_documento: data.tipo_documento || '',
        num_documento: data.num_documento || '',
        fecha_nacimiento: data.fecha_nacimiento || '',
        direccion: data.direccion || '',
        barrio: data.barrio || '',
        localidad: data.localidad || '',
        ciudad: data.ciudad || '',
        departamento: data.departamento || '',
        pais: data.pais || '',
        codigo_postal: data.codigo_postal || '',
        foto: data.foto || ''
      };
      users.push(newUser);
      db.saveFallbackData();
      return nextId;
    }
  },

  async update(id: number, data: Partial<Omit<UsuarioDB, 'id_usuario' | 'fecha_registro'>>): Promise<boolean> {
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
      const [result] = await db.query(`UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`, values);
      return (result as any).affectedRows > 0;
    } else {
      const users = db.getFallbackData().usuarios;
      const user = users.find((u: any) => u.id_usuario === id);
      if (!user) return false;
      
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined) {
          user[key] = val;
        }
      });
      
      db.saveFallbackData();
      return true;
    }
  },

  async delete(id: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const [result] = await db.query('DELETE FROM usuarios WHERE id_usuario = ?', [id]);
      return (result as any).affectedRows > 0;
    } else {
      const users = db.getFallbackData().usuarios;
      const index = users.findIndex((u: any) => u.id_usuario === id);
      if (index === -1) return false;
      
      users.splice(index, 1);
      db.saveFallbackData();
      return true;
    }
  }
};
