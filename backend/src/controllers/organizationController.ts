import { Request, Response } from 'express';
import { OrganizacionModel, OrganizacionDB } from '../models/organizacionModel';
import { UsuarioModel } from '../models/usuarioModel';
import { hashPassword } from '../utils/auth';

const mapOrgToFrontend = (org: OrganizacionDB) => {
  return {
    id: `org_${org.id_organizacion}`,
    nombre: org.nombre,
    direccion: org.direccion || '',
    telefono: org.telefono || '',
    correo: org.correo,
    descripcion: org.descripcion || '',
    nit: org.nit || '',
    representante_legal: org.representante_legal || '',
    barrio: org.barrio || '',
    localidad: org.localidad || '',
    ciudad: org.ciudad || '',
    departamento: org.departamento || '',
    pais: org.pais || '',
    categoria: org.categoria || '',
    logo: org.logo || '',
    latitud: org.latitud !== undefined ? org.latitud : null,
    longitud: org.longitud !== undefined ? org.longitud : null,
    verificada: Boolean(org.verificada),
    estadoVerificacion: org.estado_verificacion || (org.verificada ? 'aprobada' : 'no_solicitado')
  };
};

export const OrganizationController = {
  async getAll(req: Request, res: Response) {
    try {
      const orgs = await OrganizacionModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Organizaciones recuperadas correctamente.',
        data: orgs.map(mapOrgToFrontend)
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
      // Soportar IDs en formato string 'org_X' o número X
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('org_', ''), 10);
      
      const org = await OrganizacionModel.getById(id);
      if (!org) {
        return res.status(404).json({
          success: false,
          message: 'Organización no encontrada.',
          errors: []
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Organización recuperada.',
        data: mapOrgToFrontend(org)
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
      const { 
        nombre, direccion, correo, password, telefono, descripcion,
        latitud, longitud, barrio, localidad, ciudad, departamento, pais, categoria 
      } = req.body;
      
      const existingUser = await UsuarioModel.getByEmail(correo);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado por otra cuenta.',
          errors: []
        });
      }

      const hashedPassword = await hashPassword(password);

      // 1. Crear organización en `organizaciones`
      const id_organizacion = await OrganizacionModel.create({
        nombre,
        direccion,
        correo,
        password: hashedPassword,
        telefono: telefono || '+57 300 000 0000',
        descripcion: descripcion || '',
        estado: 1,
        latitud: latitud !== undefined ? Number(latitud) : null,
        longitud: longitud !== undefined ? Number(longitud) : null,
        barrio: barrio || '',
        localidad: localidad || '',
        ciudad: ciudad || 'Bogotá',
        departamento: departamento || 'Bogotá D.C.',
        pais: pais || 'Colombia',
        categoria: categoria || ''
      });

      // 2. Crear usuario asociado en `usuarios` para el login
      await UsuarioModel.create({
        rol: 'Organizacion',
        nombre1: nombre,
        apellido1: 'Organización',
        telefono: telefono || '+57 300 000 0000',
        correo,
        password: hashedPassword,
        estado: 1
      });

      const org = await OrganizacionModel.getById(id_organizacion);
      if (!org) throw new Error('Error al recuperar la organización creada.');

      return res.status(201).json({
        success: true,
        message: 'Organización registrada con éxito.',
        data: mapOrgToFrontend(org)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al registrar la organización.',
        errors: []
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('org_', ''), 10);
      const {
        nombre, direccion, correo, password, telefono, descripcion,
        nit, representante_legal, barrio, localidad, ciudad, departamento, pais, categoria, logo,
        latitud, longitud
      } = req.body;

      // Recuperar actual para saber el correo y sincronizar con usuario
      const currentOrg = await OrganizacionModel.getById(id);
      if (!currentOrg) {
        return res.status(404).json({
          success: false,
          message: 'Organización no encontrada.',
          errors: []
        });
      }

      const updateData: Partial<OrganizacionDB> = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (correo !== undefined) updateData.correo = correo;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (nit !== undefined) updateData.nit = nit;
      if (representante_legal !== undefined) updateData.representante_legal = representante_legal;
      if (barrio !== undefined) updateData.barrio = barrio;
      if (localidad !== undefined) updateData.localidad = localidad;
      if (ciudad !== undefined) updateData.ciudad = ciudad;
      if (departamento !== undefined) updateData.departamento = departamento;
      if (pais !== undefined) updateData.pais = pais;
      if (categoria !== undefined) updateData.categoria = categoria;
      if (logo !== undefined) updateData.logo = logo;
      if (latitud !== undefined) updateData.latitud = latitud !== null ? Number(latitud) : null;
      if (longitud !== undefined) updateData.longitud = longitud !== null ? Number(longitud) : null;
      
      if (password) {
        updateData.password = await hashPassword(password);
      }

      // 1. Actualizar organización
      const ok = await OrganizacionModel.update(id, updateData);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Organización no encontrada.',
          errors: []
        });
      }

      // 2. Sincronizar con el usuario correspondiente en `usuarios`
      const user = await UsuarioModel.getByEmail(currentOrg.correo);
      if (user) {
        const userUpdate: any = {};
        if (nombre !== undefined) userUpdate.nombre1 = nombre;
        if (correo !== undefined) userUpdate.correo = correo;
        if (password) userUpdate.password = updateData.password;
        if (telefono !== undefined) userUpdate.telefono = telefono;
        await UsuarioModel.update(user.id_usuario, userUpdate);
      }

      const org = await OrganizacionModel.getById(id);
      if (!org) throw new Error('Organización no encontrada.');
      return res.status(200).json({
        success: true,
        message: 'Organización actualizada correctamente.',
        data: mapOrgToFrontend(org)
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
      const id = parseInt(rawId.replace('org_', ''), 10);

      const org = await OrganizacionModel.getById(id);
      if (!org) {
        return res.status(404).json({
          success: false,
          message: 'Organización no encontrada.',
          errors: []
        });
      }

      // 1. Eliminar de `organizaciones`
      await OrganizacionModel.delete(id);

      // 2. Eliminar de `usuarios`
      const user = await UsuarioModel.getByEmail(org.correo);
      if (user) {
        await UsuarioModel.delete(user.id_usuario);
      }

      return res.status(200).json({
        success: true,
        message: 'Organización eliminada correctamente.',
        data: { id: `org_${id}` }
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
