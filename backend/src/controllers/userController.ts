 //Controlador de usuario, autentica y genera token
import { Request, Response } from 'express';
import { UsuarioModel, UsuarioDB } from '../models/usuarioModel'; // Conecta con usuarioModel
import { OrganizacionModel } from '../models/organizacionModel'; 
import { EventoModel } from '../models/eventoModel';
import { PostulacionModel } from '../models/postulacionModel';
import { DonacionModel } from '../models/donacionModel';

// 1 importaciones de utils 
import { generateToken, hashPassword, comparePassword } from '../utils/auth';//Crear token JWT,convertir contraseña en hash,comparar contraseña hasheada (incriptacion)
import { AuthenticatedRequest } from '../middlewares/authMiddleware';// Para tipar correctamente el req
import { logAudit } from '../utils/auditLogger';// Historial del loguin 

// Mapeadores auxiliares traducen el formato bak a frot
const mapRoleToFrontend = (role: string): string => {
  return role.toLowerCase();
};

const mapRoleToBackend = (role: string): 'Admin' | 'Voluntario' | 'Beneficiario' | 'Organizacion' => {
  const normalized = role.toLowerCase();
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'voluntario') return 'Voluntario';
  if (normalized === 'beneficiario') return 'Beneficiario';
  return 'Organizacion';
};

const parseSafeJSON = (val: any, defaultVal: any) => {
  if (!val) return defaultVal;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return defaultVal;
  }
};

const mapEventToFrontend = (e: any) => {
  return {
    id: `evt_${e.id_evento}`,
    nombre: e.nombre,
    categoria: e.categoria_nombre || 'General',
    descripcion: e.descripcion || '',
    fecha: e.fecha,
    estado: e.estado === 1 ? 'activo' : e.estado === 2 ? 'finalizado' : 'cancelado',
    organizacionId: `org_${e.organizacion_id}`,
    organizacionNombre: e.organizacion_nombre || 'Organización',
    direccion: e.direccion || '',
    ciudad: e.ciudad || 'Bogotá',
    departamento: e.departamento || 'Cundinamarca',
    imagen: e.imagen || ''
  };
};

const mapUserToFrontend = (user: UsuarioDB) => {
  const defaultPrivacidad = {
    mostrarCorreo: true,
    mostrarTelefono: false,
    mostrarUbicacion: true,
    mostrarBiografia: true,
    mostrarEstadisticas: true
  };

  return {
    id: String(user.id_usuario),
    rol: mapRoleToFrontend(user.rol),
    nombre1: user.nombre1,
    nombre2: user.nombre2 || '',
    apellido1: user.apellido1,
    apellido2: user.apellido2 || '',
    telefono: user.telefono || '',
    correo: user.correo,
    password: '', // No devolvemos hashes ni contraseñas desencriptadas al cliente por seguridad
    estado: user.estado === 1 ? 'activo' : 'inactivo',
    tipo_documento: user.tipo_documento || '',
    num_documento: user.num_documento || '',
    fecha_nacimiento: user.fecha_nacimiento || '',
    direccion: user.direccion || '',
    barrio: user.barrio || '',
    localidad: user.localidad || '',
    ciudad: user.ciudad || 'Bogotá',
    departamento: user.departamento || 'Cundinamarca',
    pais: user.pais || 'Colombia',
    codigo_postal: user.codigo_postal || '',
    foto: user.foto || '',
    biografia: user.biografia || '',
    fotoPortada: user.foto_portada || '',
    sitioWeb: user.sitio_web || '',
    redesSociales: parseSafeJSON(user.redes_sociales, {}),
    privacidad: parseSafeJSON(user.privacidad, defaultPrivacidad),
    mision: user.mision || '',
    vision: user.vision || '',
    fechaRegistro: user.fecha_registro || new Date().toISOString()
  };
};

const enrichUserIfOrganization = async (frontendUser: any) => {
  if (frontendUser.rol === 'organizacion') {
    const org = await OrganizacionModel.getByEmail(frontendUser.correo);
    if (org) {
      const orgFormattedId = `org_${org.id_organizacion}`;
      return {
        ...frontendUser,
        id: orgFormattedId,
        organizacionId: orgFormattedId,
        id_organizacion: org.id_organizacion,
        nombre1: org.nombre || frontendUser.nombre1,
        nit: org.nit || '',
        representante_legal: org.representante_legal || '',
        barrio: org.barrio || '',
        localidad: org.localidad || '',
        ciudad: org.ciudad || '',
        departamento: org.departamento || '',
        pais: org.pais || '',
        categoria: org.categoria || '',
        logo: org.logo || '',
        descripcion: org.descripcion || '',
        direccion: org.direccion || frontendUser.direccion || '',
        telefono: org.telefono || frontendUser.telefono || '',
        verificada: Boolean(org.verificada),
        estadoVerificacion: org.estado_verificacion || (org.verificada ? 'aprobada' : 'no_solicitado')
      };
    }
  }
  return frontendUser;
};

export const UserController = {
  //  Metodo Login 
  async login(req: Request, res: Response) {
    try {
      const { correo, password } = req.body;
      // 2 Redirige a usuarioModel 
      const user = await UsuarioModel.getByEmail(correo);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'El correo electrónico no está registrado.',
          errors: []
        });
      }

      if (user.estado === 0) {
        return res.status(403).json({
          success: false,
          message: 'Su cuenta está inactiva. Contacte al administrador.',
          errors: []
        });
      }

      // Unificación con bcrypt para todos los usuarios
      const isMatch = await comparePassword(password, user.password || '');

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'La contraseña es incorrecta.',
          errors: []
        });
      }

      const frontendUser = await enrichUserIfOrganization(mapUserToFrontend(user));
      const token = generateToken({
        id: user.id_usuario,
        rol: user.rol,
        correo: user.correo
      });

      // Configurar cookie segura opcional
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
      });

      // Loguear auditoría
      await logAudit(user.id_usuario, 'Inicio de sesión exitoso.');

      //  3 Si sale todo bien envia este mensaje de vuelta al frontend
      return res.status(200).json({
        success: true,
        message: 'Sesión iniciada correctamente.',
        data: {
          user: frontendUser,
          token
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al iniciar sesión.',
        errors: []
      });
    }
  },

  // Registro de usuarios estándar
  async register(req: Request, res: Response) {
    try {
      const { 
        rol, nombre1, nombre2, apellido1, apellido2, telefono, correo, password,
        barrio, localidad, direccion, ciudad, departamento, pais, tipo_documento, num_documento
      } = req.body;
      
      const existing = await UsuarioModel.getByEmail(correo);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'El correo ya está registrado por otro usuario.',
          errors: []
        });
      }

      const hashedPassword = await hashPassword(password);
      
      const insertId = await UsuarioModel.create({
        rol: mapRoleToBackend(rol),
        nombre1,
        nombre2: nombre2 || '',
        apellido1,
        apellido2: apellido2 || '',
        telefono: telefono || '',
        correo,
        password: hashedPassword,
        barrio: barrio || '',
        localidad: localidad || '',
        direccion: direccion || '',
        ciudad: ciudad || 'Bogotá',
        departamento: departamento || 'Cundinamarca',
        pais: pais || 'Colombia',
        tipo_documento: tipo_documento || '',
        num_documento: num_documento || '',
        estado: 1 // activo por defecto
      });

      const user = await UsuarioModel.getById(insertId);
      if (!user) throw new Error('Error al recuperar el usuario creado.');

      const frontendUser = await enrichUserIfOrganization(mapUserToFrontend(user));
      const token = generateToken({
        id: user.id_usuario,
        rol: user.rol,
        correo: user.correo
      });

      // Loguear auditoría
      await logAudit(insertId, `Registro de nuevo usuario con rol: ${user.rol}.`);

      return res.status(201).json({
        success: true,
        message: 'Usuario registrado con éxito.',
        data: {
          user: frontendUser,
          token
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al registrar el usuario.',
        errors: []
      });
    }
  },

  // Obtener perfil actual
  async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) throw new Error('No autenticado.');
      const user = await UsuarioModel.getById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.',
          errors: []
        });
      }
      const frontendUser = await enrichUserIfOrganization(mapUserToFrontend(user));
      return res.status(200).json({
        success: true,
        message: 'Perfil recuperado.',
        data: frontendUser
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  // Actualizar perfil del usuario logueado
  async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) throw new Error('No autenticado.');
      const id = req.user.id;
      const {
        nombre1, nombre2, apellido1, apellido2, telefono, correo, password,
        tipo_documento, num_documento, fecha_nacimiento, direccion, barrio, localidad, ciudad, departamento, pais, codigo_postal, foto,
        biografia, fotoPortada, foto_portada, sitioWeb, sitio_web, redesSociales, redes_sociales, privacidad, mision, vision
      } = req.body;

      const updateData: Partial<UsuarioDB> = {};
      if (nombre1 !== undefined) updateData.nombre1 = nombre1;
      if (nombre2 !== undefined) updateData.nombre2 = nombre2;
      if (apellido1 !== undefined) updateData.apellido1 = apellido1;
      if (apellido2 !== undefined) updateData.apellido2 = apellido2;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (correo !== undefined) updateData.correo = correo;
      if (tipo_documento !== undefined) updateData.tipo_documento = tipo_documento;
      if (num_documento !== undefined) updateData.num_documento = num_documento;
      if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (barrio !== undefined) updateData.barrio = barrio;
      if (localidad !== undefined) updateData.localidad = localidad;
      if (ciudad !== undefined) updateData.ciudad = ciudad;
      if (departamento !== undefined) updateData.departamento = departamento;
      if (pais !== undefined) updateData.pais = pais;
      if (codigo_postal !== undefined) updateData.codigo_postal = codigo_postal;
      if (foto !== undefined) updateData.foto = foto;
      
      if (biografia !== undefined) updateData.biografia = biografia;
      if (fotoPortada !== undefined || foto_portada !== undefined) updateData.foto_portada = fotoPortada || foto_portada;
      if (sitioWeb !== undefined || sitio_web !== undefined) updateData.sitio_web = sitioWeb || sitio_web;
      if (redesSociales !== undefined || redes_sociales !== undefined) {
        updateData.redes_sociales = typeof (redesSociales || redes_sociales) === 'object' ? JSON.stringify(redesSociales || redes_sociales) : (redesSociales || redes_sociales);
      }
      if (privacidad !== undefined) {
        updateData.privacidad = typeof privacidad === 'object' ? JSON.stringify(privacidad) : privacidad;
      }
      if (mision !== undefined) updateData.mision = mision;
      if (vision !== undefined) updateData.vision = vision;
      
      if (password && password.trim() !== '') {
        updateData.password = await hashPassword(password);
      }

      await UsuarioModel.update(id, updateData);
      const updatedUser = await UsuarioModel.getById(id);
      if (!updatedUser) throw new Error('Usuario no encontrado.');

      // Sincronizar con la tabla organizaciones si es un usuario Organizacion
      if (updatedUser.rol === 'Organizacion') {
        const org = await OrganizacionModel.getByEmail(updatedUser.correo);
        if (org) {
          const orgUpdate: any = {};
          if (nombre1 !== undefined) orgUpdate.nombre = nombre1;
          if (correo !== undefined) orgUpdate.correo = correo;
          if (telefono !== undefined) orgUpdate.telefono = telefono;
          if (direccion !== undefined) orgUpdate.direccion = direccion;
          if (barrio !== undefined) orgUpdate.barrio = barrio;
          if (localidad !== undefined) orgUpdate.localidad = localidad;
          if (ciudad !== undefined) orgUpdate.ciudad = ciudad;
          if (departamento !== undefined) orgUpdate.departamento = departamento;
          if (pais !== undefined) orgUpdate.pais = pais;
          if (password && password.trim() !== '') orgUpdate.password = updateData.password;
          
          // Campos específicos de organizaciones
          const { nit, representante_legal, descripcion, categoria, logo } = req.body;
          if (nit !== undefined) orgUpdate.nit = nit;
          if (representante_legal !== undefined) orgUpdate.representante_legal = representante_legal;
          if (descripcion !== undefined) orgUpdate.descripcion = descripcion;
          if (categoria !== undefined) orgUpdate.categoria = categoria;
          if (logo !== undefined) orgUpdate.logo = logo;

          await OrganizacionModel.update(org.id_organizacion, orgUpdate);
        }
      }

      // Loguear auditoría
      await logAudit(id, 'Actualizó sus datos de perfil.');

      const frontendUser = await enrichUserIfOrganization(mapUserToFrontend(updatedUser));
      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente.',
        data: frontendUser
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al actualizar perfil.',
        errors: []
      });
    }
  },

  // CRUD Administrativo
  async getAll(req: Request, res: Response) {
    try {
      const users = await UsuarioModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Usuarios recuperados correctamente.',
        data: users.map(mapUserToFrontend)
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
      const id = parseInt(req.params.id, 10);
      const user = await UsuarioModel.getById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.',
          errors: []
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Usuario recuperado.',
        data: mapUserToFrontend(user)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async getByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const user = await UsuarioModel.getByEmail(email);
      if (!user) {
        return res.status(200).json({
          success: true,
          message: 'Usuario no registrado.',
          data: null
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Usuario recuperado.',
        data: mapUserToFrontend(user)
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
      const { rol, nombre1, nombre2, apellido1, apellido2, telefono, correo, password, estado } = req.body;
      const existing = await UsuarioModel.getByEmail(correo);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'El correo electrónico ya está registrado.',
          errors: []
        });
      }

      const hashedPassword = await hashPassword(password || 'User123*');
      const insertId = await UsuarioModel.create({
        rol: mapRoleToBackend(rol),
        nombre1,
        nombre2,
        apellido1,
        apellido2,
        telefono,
        correo,
        password: hashedPassword,
        estado: estado === 'activo' || estado === 1 ? 1 : 0
      });

      const user = await UsuarioModel.getById(insertId);
      if (!user) throw new Error('Error al crear usuario.');

      const adminId = (req as AuthenticatedRequest).user?.id || 1;
      await logAudit(adminId, `Creó el usuario ${user.nombre1} ${user.apellido1} (${user.rol}).`);

      return res.status(201).json({
        success: true,
        message: 'Usuario creado correctamente.',
        data: mapUserToFrontend(user)
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
      const id = parseInt(req.params.id, 10);
      const {
        rol, nombre1, nombre2, apellido1, apellido2, telefono, correo, password, estado,
        tipo_documento, num_documento, fecha_nacimiento, direccion, barrio, localidad, ciudad, departamento, pais, codigo_postal, foto,
        biografia, fotoPortada, foto_portada, sitioWeb, sitio_web, redesSociales, redes_sociales, privacidad, mision, vision,
        nit, representante_legal, descripcion, categoria, logo
      } = req.body;

      const updateData: Partial<UsuarioDB> = {};
      if (rol !== undefined) updateData.rol = mapRoleToBackend(rol);
      if (nombre1 !== undefined) updateData.nombre1 = nombre1;
      if (nombre2 !== undefined) updateData.nombre2 = nombre2;
      if (apellido1 !== undefined) updateData.apellido1 = apellido1;
      if (apellido2 !== undefined) updateData.apellido2 = apellido2;
      if (telefono !== undefined) updateData.telefono = telefono;
      if (correo !== undefined) updateData.correo = correo;
      if (estado !== undefined) updateData.estado = estado === 'activo' || estado === 1 ? 1 : 0;
      if (tipo_documento !== undefined) updateData.tipo_documento = tipo_documento;
      if (num_documento !== undefined) updateData.num_documento = num_documento;
      if (fecha_nacimiento !== undefined) updateData.fecha_nacimiento = fecha_nacimiento;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (barrio !== undefined) updateData.barrio = barrio;
      if (localidad !== undefined) updateData.localidad = localidad;
      if (ciudad !== undefined) updateData.ciudad = ciudad;
      if (departamento !== undefined) updateData.departamento = departamento;
      if (pais !== undefined) updateData.pais = pais;
      if (codigo_postal !== undefined) updateData.codigo_postal = codigo_postal;
      if (foto !== undefined) updateData.foto = foto;

      if (biografia !== undefined) updateData.biografia = biografia;
      if (fotoPortada !== undefined || foto_portada !== undefined) updateData.foto_portada = fotoPortada || foto_portada;
      if (sitioWeb !== undefined || sitio_web !== undefined) updateData.sitio_web = sitioWeb || sitio_web;
      if (redesSociales !== undefined || redes_sociales !== undefined) {
        const resVal = redesSociales || redes_sociales;
        updateData.redes_sociales = typeof resVal === 'object' ? JSON.stringify(resVal) : resVal;
      }
      if (privacidad !== undefined) {
        updateData.privacidad = typeof privacidad === 'object' ? JSON.stringify(privacidad) : privacidad;
      }
      if (mision !== undefined) updateData.mision = mision;
      if (vision !== undefined) updateData.vision = vision;

      if (password && password.trim() !== '') {
        updateData.password = await hashPassword(password);
      }

      const ok = await UsuarioModel.update(id, updateData);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.',
          errors: []
        });
      }

      const user = await UsuarioModel.getById(id);
      if (!user) throw new Error('Usuario no encontrado.');

      // Sincronizar con la tabla organizaciones si es una Organización
      if (user.rol === 'Organizacion') {
        const org = await OrganizacionModel.getByEmail(user.correo);
        if (org) {
          const orgDataToUpdate: any = {};
          if (nombre1 !== undefined) orgDataToUpdate.nombre = nombre1;
          if (nit !== undefined) orgDataToUpdate.nit = nit;
          if (representante_legal !== undefined) orgDataToUpdate.representante_legal = representante_legal;
          if (descripcion !== undefined || biografia !== undefined) orgDataToUpdate.descripcion = descripcion || biografia;
          if (categoria !== undefined) orgDataToUpdate.categoria = categoria;
          if (logo !== undefined || foto !== undefined) orgDataToUpdate.logo = logo || foto;
          if (direccion !== undefined) orgDataToUpdate.direccion = direccion;
          if (telefono !== undefined) orgDataToUpdate.telefono = telefono;
          if (correo !== undefined) orgDataToUpdate.correo = correo;
          if (barrio !== undefined) orgDataToUpdate.barrio = barrio;
          if (localidad !== undefined) orgDataToUpdate.localidad = localidad;
          if (ciudad !== undefined) orgDataToUpdate.ciudad = ciudad;
          if (departamento !== undefined) orgDataToUpdate.departamento = departamento;
          if (pais !== undefined) orgDataToUpdate.pais = pais;

          if (Object.keys(orgDataToUpdate).length > 0) {
            await OrganizacionModel.update(org.id_organizacion, orgDataToUpdate);
          }
        }
      }

      let frontendUser = await enrichUserIfOrganization(mapUserToFrontend(user));

      const adminId = (req as AuthenticatedRequest).user?.id || 1;
      await logAudit(adminId, `Actualizó los datos del usuario: ${user.nombre1} ${user.apellido1} (${user.rol}).`);

      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente.',
        data: frontendUser
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async getVolunteersCount(req: Request, res: Response) {
    try {
      const users = await UsuarioModel.getAll();
      const count = users.filter(u => u.rol === 'Voluntario').length;
      return res.status(200).json({
        success: true,
        message: 'Conteo de voluntarios obtenido correctamente.',
        data: count
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
      const id = parseInt(rawId.replace('org_', '').replace('usr_', ''), 10);
      const authUser = (req as AuthenticatedRequest).user;

      if (!authUser) {
        return res.status(401).json({
          success: false,
          message: 'No autenticado.',
          errors: []
        });
      }

      // Permitir si es Admin O si el usuario se está eliminando a sí mismo
      if (authUser.rol !== 'Admin' && authUser.id !== id) {
        return res.status(403).json({
          success: false,
          message: 'No tiene permisos para eliminar esta cuenta.',
          errors: []
        });
      }

      const user = await UsuarioModel.getById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado.',
          errors: []
        });
      }

      // Si el usuario es una organización, eliminar también el registro de la organización
      if (user.rol === 'Organizacion') {
        const org = await OrganizacionModel.getByEmail(user.correo);
        if (org) {
          await OrganizacionModel.delete(org.id_organizacion);
        }
      }

      const targetName = `${user.nombre1} ${user.apellido1}`.trim() || user.correo;
      const ok = await UsuarioModel.delete(id);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'No se pudo eliminar el usuario.',
          errors: []
        });
      }

      await logAudit(authUser.id, `Eliminó la cuenta de usuario: ${targetName} (Rol: ${user.rol}).`);

      return res.status(200).json({
        success: true,
        message: 'Cuenta eliminada correctamente.',
        data: { id }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { correo, nuevaPassword } = req.body;
      const user = await UsuarioModel.getByEmail(correo);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'El correo electrónico no está registrado.',
          errors: []
        });
      }

      if (nuevaPassword) {
        const hashedPassword = await hashPassword(nuevaPassword);
        const ok = await UsuarioModel.update(user.id_usuario, { password: hashedPassword });
        if (!ok) {
          return res.status(500).json({
            success: false,
            message: 'No se pudo actualizar la contraseña. Intente nuevamente.',
            errors: []
          });
        }
        await logAudit(user.id_usuario, 'Restablecimiento de contraseña de usuario exitoso.');
        return res.status(200).json({
          success: true,
          message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.',
          data: { correo }
        });
      } else {
        return res.status(200).json({
          success: true,
          message: 'Correo electrónico verificado con éxito.',
          data: { correo, verified: true }
        });
      }
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al procesar la solicitud.',
        errors: []
      });
    }
  },

  // Obtener Perfil Público
  async getPublicProfile(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      let user: any = null;
      let org: any = null;

      // Si el ID inicia con org_, buscar primero en organizaciones
      if (rawId.startsWith('org_')) {
        const orgId = parseInt(rawId.replace('org_', ''), 10);
        org = await OrganizacionModel.getById(orgId);
        if (org) {
          user = await UsuarioModel.getByEmail(org.correo);
          if (!user) {
            user = {
              id_usuario: org.id_organizacion,
              rol: 'Organizacion',
              nombre1: org.nombre,
              apellido1: '',
              correo: org.correo,
              telefono: org.telefono || '',
              direccion: org.direccion || '',
              barrio: org.barrio || '',
              localidad: org.localidad || '',
              ciudad: org.ciudad || 'Bogotá',
              departamento: org.departamento || 'Cundinamarca',
              pais: org.pais || 'Colombia',
              foto: org.logo || '',
              estado: 1,
              fecha_registro: new Date().toISOString()
            };
          }
        }
      }

      if (!user) {
        const numericId = parseInt(rawId.replace('usr_', '').replace('org_', ''), 10);
        if (!isNaN(numericId)) {
          user = await UsuarioModel.getById(numericId);
        }
        if (!user) {
          user = await UsuarioModel.getByEmail(rawId);
        }
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Perfil de usuario no encontrado.',
          errors: []
        });
      }

      let frontendUser = await enrichUserIfOrganization(mapUserToFrontend(user));

      const allEvents = await EventoModel.getAll();
      const allPostulaciones = await PostulacionModel.getAll();
      const allDonations = await DonacionModel.getAll();
      const allUsers = await UsuarioModel.getAll();
      const allOrgs = await OrganizacionModel.getAll();

      const numericUserId = user.id_usuario;
      const userRole = frontendUser.rol;

      let stats: any = {};
      let eventosRelacionados: any[] = [];
      let actividadReciente: any[] = [];
      let insignias: any[] = [];

      if (userRole === 'admin') {
        stats = {
          usuariosAdministrados: allUsers.length,
          organizacionesVerificadas: allOrgs.length,
          eventosAdministrados: allEvents.length
        };
        eventosRelacionados = allEvents.slice(0, 6).map(e => mapEventToFrontend(e));
        insignias = [
          { id: '1', nombre: 'Administrador Principal', descripcion: 'Guardián del ecosistema Give&Go', icono: 'shield', fechaObtencion: user.fecha_registro || '2026-01-01' },
          { id: '2', nombre: 'Supervisión Continua', descripcion: 'Soporte y auditoría de la plataforma', icono: 'award', fechaObtencion: '2026-02-15' }
        ];
      } else if (userRole === 'organizacion') {
        const orgId = frontendUser.id_organizacion || numericUserId;
        const orgEvents = allEvents.filter((e: any) => e.organizacion_id === orgId || e.organizacion_id === numericUserId);
        const orgEventIds = new Set(orgEvents.map((e: any) => e.id_evento));

        const orgPostulaciones = allPostulaciones.filter((p: any) => orgEventIds.has(p.id_evento));
        const beneAtendidos = new Set(orgPostulaciones.filter((p: any) => p.tipo_postulacion === 'beneficiario' && (p.estado_postulacion === 'aprobado' || p.estado_postulacion === 'confirmado')).map((p: any) => p.id_usuario)).size;
        const volRegistrados = new Set(orgPostulaciones.filter((p: any) => p.tipo_postulacion === 'voluntario' && (p.estado_postulacion === 'aprobado' || p.estado_postulacion === 'confirmado')).map((p: any) => p.id_usuario)).size;
        const orgDonations = allDonations.filter((d: any) => String(d.organizacion_id) === String(orgId) || String(d.organizacion_id) === String(numericUserId));

        stats = {
          eventosCreados: orgEvents.length,
          beneficiariosAtendidos: beneAtendidos || orgEvents.length * 15,
          voluntariosRegistrados: volRegistrados || orgEvents.length * 8,
          donacionesRecibidas: orgDonations.length
        };

        eventosRelacionados = orgEvents.map(e => mapEventToFrontend(e));

        orgEvents.forEach((e: any) => {
          actividadReciente.push({
            id: `evt_${e.id_evento}`,
            tipo: 'evento',
            titulo: `Publicó el evento "${e.nombre}"`,
            descripcion: e.descripcion || 'Nueva iniciativa de impacto social.',
            fecha: e.fecha
          });
        });

        insignias = [
          { id: 'b1', nombre: 'Organización Verificada', descripcion: 'Certificado de veracidad y legalidad Give&Go', icono: 'check', fechaObtencion: '2026-01-10' },
          { id: 'b2', nombre: '100+ Impactos', descripcion: 'Ha beneficiado a más de 100 familias en Bogotá', icono: 'heart', fechaObtencion: '2026-03-20' },
          { id: 'b3', nombre: 'Gestión Transparente', descripcion: '100% de reportes de donación al día', icono: 'star', fechaObtencion: '2026-05-01' }
        ];
      } else if (userRole === 'voluntario') {
        const volPostulaciones = allPostulaciones.filter((p: any) => p.id_usuario === numericUserId && p.tipo_postulacion === 'voluntario');
        const volDonations = allDonations.filter((d: any) => d.usuario_id === numericUserId);

        const participatedEventIds = new Set(volPostulaciones.map((p: any) => p.id_evento));
        const volEvents = allEvents.filter((e: any) => participatedEventIds.has(e.id_evento));

        stats = {
          eventosParticipados: volEvents.length || volPostulaciones.length,
          horasVoluntariado: (volEvents.length || volPostulaciones.length) * 5 || 24,
          certificados: volEvents.length > 0 ? Math.max(1, volEvents.length) : 2,
          donacionesRealizadas: volDonations.length
        };

        eventosRelacionados = volEvents.map(e => mapEventToFrontend(e));

        volPostulaciones.forEach((p: any) => {
          actividadReciente.push({
            id: `post_${p.id_postulacion}`,
            tipo: 'postulacion',
            titulo: `Se unió como voluntario en "${p.evento_nombre || 'Jornada Solidaria'}"`,
            descripcion: `Estado: ${p.estado_postulacion}`,
            fecha: p.fecha_postulacion
          });
        });

        volDonations.forEach((d: any) => {
          actividadReciente.push({
            id: `don_${d.id_donacion}`,
            tipo: 'donacion',
            titulo: `Realizó una donación ${d.tipo === 'monetaria' ? 'económica' : 'en especie'}`,
            descripcion: `Categoría: ${d.categoria_nombre || 'General'}`,
            fecha: d.fecha
          });
        });

        insignias = [
          { id: 'v1', nombre: 'Primer Voluntariado', descripcion: 'Completó su primera jornada social', icono: 'star', fechaObtencion: '2026-02-01' },
          { id: 'v2', nombre: 'Manos Solidarias', descripcion: 'Superó 20 horas de servicio a la comunidad', icono: 'heart', fechaObtencion: '2026-04-12' },
          { id: 'v3', nombre: 'Donante Activo', descripcion: 'Contribuyó activamente con recursos e insumos', icono: 'award', fechaObtencion: '2026-06-05' }
        ];
      } else if (userRole === 'beneficiario') {
        const benePostulaciones = allPostulaciones.filter((p: any) => p.id_usuario === numericUserId && p.tipo_postulacion === 'beneficiario');
        const beneEventIds = new Set(benePostulaciones.map((p: any) => p.id_evento));
        const beneEvents = allEvents.filter((e: any) => beneEventIds.has(e.id_evento));

        const orgsSupported = new Set(beneEvents.map((e: any) => e.organizacion_id)).size;

        stats = {
          eventosAyudaRecibida: beneEvents.length || benePostulaciones.length,
          ayudasRecibidas: benePostulaciones.length || 3,
          organizacionesApoyo: orgsSupported || 2
        };

        eventosRelacionados = beneEvents.map(e => mapEventToFrontend(e));

        benePostulaciones.forEach((p: any) => {
          actividadReciente.push({
            id: `post_${p.id_postulacion}`,
            tipo: 'solicitud',
            titulo: `Inscrito para recibir apoyo en "${p.evento_nombre || 'Jornada Comunitaria'}"`,
            descripcion: `Lugar: ${p.evento_direccion || 'Bogotá D.C.'}`,
            fecha: p.fecha_postulacion
          });
        });

        insignias = [
          { id: 'ben1', nombre: 'Beneficiario Verificado', descripcion: 'Inscripción aprobada en la red solidaria', icono: 'check', fechaObtencion: '2026-01-20' },
          { id: 'ben2', nombre: 'Comunidad Activa', descripcion: 'Participante constante en jornadas de asistencia', icono: 'heart', fechaObtencion: '2026-03-10' }
        ];
      }

      // PRIVACIDAD Y RESTRICCIONES DE SENSIVILIDAD PARA BENEFICIARIOS
      if (userRole === 'beneficiario') {
        // Para beneficiarios: NO mostrar correo, teléfono, documento ni dirección exacta por defecto
        if (!frontendUser.privacidad?.mostrarCorreo) delete frontendUser.correo;
        if (!frontendUser.privacidad?.mostrarTelefono) delete frontendUser.telefono;
        delete frontendUser.num_documento;
        if (!frontendUser.privacidad?.mostrarUbicacion) delete frontendUser.direccion;
      } else {
        if (!frontendUser.privacidad?.mostrarCorreo) delete frontendUser.correo;
        if (!frontendUser.privacidad?.mostrarTelefono) delete frontendUser.telefono;
        if (!frontendUser.privacidad?.mostrarUbicacion) delete frontendUser.direccion;
        if (!frontendUser.privacidad?.mostrarBiografia) frontendUser.biografia = '';
        if (!frontendUser.privacidad?.mostrarEstadisticas) stats = {};
      }

      return res.status(200).json({
        success: true,
        message: 'Perfil público recuperado con éxito.',
        data: {
          user: frontendUser,
          organization: org ? {
            id: `org_${org.id_organizacion}`,
            nombre: org.nombre,
            direccion: org.direccion,
            correo: org.correo,
            telefono: org.telefono,
            nit: org.nit,
            representante_legal: org.representante_legal,
            descripcion: org.descripcion,
            categoria: org.categoria,
            logo: org.logo,
            ciudad: org.ciudad,
            departamento: org.departamento
          } : undefined,
          stats,
          actividadReciente: actividadReciente.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
          eventosRelacionados,
          insignias
        }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al obtener perfil público.',
        errors: []
      });
    }
  }
};
