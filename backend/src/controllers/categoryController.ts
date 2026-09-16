import { Request, Response } from 'express';
import { CategoriaModel, CategoriaDB } from '../models/categoriaModel';

const mapCategoryToFrontend = (cat: CategoriaDB) => {
  return {
    id: `cat_${cat.id_categoria}`,
    nombre: cat.nombre,
    descripcion: cat.descripcion || '',
    estado: cat.estado === 1 ? 'activo' : 'inactivo'
  };
};

export const CategoryController = {
  async getAll(req: Request, res: Response) {
    try {
      const categories = await CategoriaModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Categorías recuperadas con éxito.',
        data: categories.map(mapCategoryToFrontend)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('cat_', ''), 10);
      
      const cat = await CategoriaModel.getById(id);
      if (!cat) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada.',
          errors: []
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Categoría recuperada.',
        data: mapCategoryToFrontend(cat)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async create(req: Request, res: Response) {
    try {
      const { nombre, descripcion, estado } = req.body;
      
      const existing = await CategoriaModel.getByName(nombre);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'La categoría ya existe.',
          errors: []
        });
      }

      const insertId = await CategoriaModel.create({
        nombre,
        descripcion,
        estado: estado === 'activo' || estado === 1 ? 1 : 0
      });

      const cat = await CategoriaModel.getById(insertId);
      if (!cat) throw new Error('Error al recuperar la categoría creada.');

      return res.status(201).json({
        success: true,
        message: 'Categoría creada con éxito.',
        data: mapCategoryToFrontend(cat)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('cat_', ''), 10);
      const { nombre, descripcion, estado } = req.body;

      const updateData: any = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (estado !== undefined) updateData.estado = estado === 'activo' || estado === 1 ? 1 : 0;

      const ok = await CategoriaModel.update(id, updateData);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada.',
          errors: []
        });
      }

      const cat = await CategoriaModel.getById(id);
      if (!cat) throw new Error('Categoría no encontrada.');

      return res.status(200).json({
        success: true,
        message: 'Categoría actualizada con éxito.',
        data: mapCategoryToFrontend(cat)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('cat_', ''), 10);

      const ok = await CategoriaModel.delete(id);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Categoría no encontrada.',
          errors: []
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Categoría eliminada con éxito.',
        data: { id: `cat_${id}` }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  }
};
