import { db } from '../config/db';

export interface CategoriaDB {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  estado: number; // 1 = activo, 0 = inactivo
}

export const CategoriaModel = {
  async getAll(): Promise<CategoriaDB[]> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
      return rows as CategoriaDB[];
    } else {
      return db.getFallbackData().categorias;
    }
  },

  async getById(id: number): Promise<CategoriaDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM categorias WHERE id_categoria = ?', [id]);
      const cats = rows as CategoriaDB[];
      return cats.length > 0 ? cats[0] : null;
    } else {
      const cat = db.getFallbackData().categorias.find((c: any) => c.id_categoria === id);
      return cat || null;
    }
  },

  async getByName(nombre: string): Promise<CategoriaDB | null> {
    if (db.isMySQLConnected()) {
      const [rows] = await db.query('SELECT * FROM categorias WHERE LOWER(nombre) = LOWER(?)', [nombre]);
      const cats = rows as CategoriaDB[];
      return cats.length > 0 ? cats[0] : null;
    } else {
      const cat = db.getFallbackData().categorias.find((c: any) => c.nombre.toLowerCase() === nombre.toLowerCase());
      return cat || null;
    }
  },

  async create(data: { nombre: string; descripcion?: string; estado?: number }): Promise<number> {
    const estado = data.estado !== undefined ? data.estado : 1;
    if (db.isMySQLConnected()) {
      const [result] = await db.query(
        'INSERT INTO categorias (nombre, descripcion, estado) VALUES (?, ?, ?)',
        [data.nombre, data.descripcion || '', estado]
      );
      return (result as any).insertId;
    } else {
      const categories = db.getFallbackData().categorias;
      const nextId = categories.length > 0 ? Math.max(...categories.map((c: any) => c.id_categoria)) + 1 : 1;
      const newCat = {
        id_categoria: nextId,
        nombre: data.nombre,
        descripcion: data.descripcion || '',
        estado
      };
      categories.push(newCat);
      db.saveFallbackData();
      return nextId;
    }
  },

  async update(id: number, data: { nombre?: string; descripcion?: string; estado?: number }): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const fields: string[] = [];
      const values: any[] = [];
      
      if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre); }
      if (data.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(data.descripcion); }
      if (data.estado !== undefined) { fields.push('estado = ?'); values.push(data.estado); }
      
      if (fields.length === 0) return true;
      
      values.push(id);
      const [result] = await db.query(`UPDATE categorias SET ${fields.join(', ')} WHERE id_categoria = ?`, values);
      return (result as any).affectedRows > 0;
    } else {
      const categories = db.getFallbackData().categorias;
      const cat = categories.find((c: any) => c.id_categoria === id);
      if (!cat) return false;
      
      if (data.nombre !== undefined) cat.nombre = data.nombre;
      if (data.descripcion !== undefined) cat.descripcion = data.descripcion;
      if (data.estado !== undefined) cat.estado = data.estado;
      
      db.saveFallbackData();
      return true;
    }
  },

  async delete(id: number): Promise<boolean> {
    if (db.isMySQLConnected()) {
      const [result] = await db.query('DELETE FROM categorias WHERE id_categoria = ?', [id]);
      return (result as any).affectedRows > 0;
    } else {
      const categories = db.getFallbackData().categorias;
      const index = categories.findIndex((c: any) => c.id_categoria === id);
      if (index === -1) return false;
      
      categories.splice(index, 1);
      db.saveFallbackData();
      return true;
    }
  }
};
