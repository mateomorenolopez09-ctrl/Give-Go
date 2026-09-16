import { Request, Response } from 'express';
import { EventoModel } from '../models/eventoModel';
import { CategoriaModel } from '../models/categoriaModel';
import { OrganizacionModel } from '../models/organizacionModel';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { logAudit } from '../utils/auditLogger';

const mapEventToFrontend = (evt: any) => {
  let estadoStr = 'activo';
  if (evt.estado === 2) estadoStr = 'finalizado';
  if (evt.estado === 0) estadoStr = 'cancelado';

  const cupoNum = evt.cupo !== undefined && evt.cupo !== null ? parseInt(String(evt.cupo), 10) : 0;
  const vacVol = evt.vacantes_voluntarios !== undefined && evt.vacantes_voluntarios !== null
    ? parseInt(String(evt.vacantes_voluntarios), 10)
    : (evt.vacantesVoluntarios !== undefined ? parseInt(String(evt.vacantesVoluntarios), 10) : cupoNum);
  const vacBen = evt.vacantes_beneficiarios !== undefined && evt.vacantes_beneficiarios !== null
    ? parseInt(String(evt.vacantes_beneficiarios), 10)
    : (evt.vacantesBeneficiarios !== undefined ? parseInt(String(evt.vacantesBeneficiarios), 10) : 20);

  return {
    id: `evt_${evt.id_evento}`,
    nombre: evt.nombre,
    categoria: evt.categoria_nombre || 'General',
    descripcion: evt.descripcion || '',
    direccion: evt.direccion || '',
    fecha: evt.fecha,
    cupo: cupoNum,
    vacantesVoluntarios: vacVol,
    vacantesBeneficiarios: vacBen,
    ayudaOfrecida: evt.ayuda_ofrecida || evt.ayudaOfrecida || '',
    estado: estadoStr,
    organizacionId: `org_${evt.organizacion_id}`,
    organizacionNombre: evt.organizacion_nombre || evt.organizacionNombre || '',
    barrio: evt.barrio || '',
    localidad: evt.localidad || '',
    ciudad: evt.ciudad || 'Bogotá',
    departamento: evt.departamento || 'Bogotá D.C.',
    pais: evt.pais || 'Colombia',
    punto_referencia: evt.punto_referencia || '',
    nombre_lugar: evt.nombre_lugar || '',
    latitud: evt.latitud !== null && evt.latitud !== undefined ? parseFloat(evt.latitud) : null,
    longitud: evt.longitud !== null && evt.longitud !== undefined ? parseFloat(evt.longitud) : null,
    imagen: evt.imagen || ''
  };
};

const mapUserToFrontend = (user: any) => {
  return {
    id: String(user.id_usuario),
    rol: user.rol.toLowerCase(),
    nombre1: user.nombre1,
    nombre2: user.nombre2 || '',
    apellido1: user.apellido1,
    apellido2: user.apellido2 || '',
    telefono: user.telefono || '',
    correo: user.correo,
    estado: user.estado === 1 ? 'activo' : 'inactivo'
  };
};

export const EventController = {
  async getAll(req: Request, res: Response) {
    try {
      const events = await EventoModel.getAll();
      return res.status(200).json({
        success: true,
        message: 'Eventos recuperados con éxito.',
        data: events.map(mapEventToFrontend)
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
      const id = parseInt(rawId.replace('evt_', ''), 10);
      
      const evt = await EventoModel.getById(id);
      if (!evt) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado.',
          errors: []
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Evento recuperado.',
        data: mapEventToFrontend(evt)
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
        nombre, titulo, categoria, id_categoria, idCategoria, descripcion, direccion, fecha, fecha_inicio, fechaInicio,
        cupo, cupo_maximo, cupoMaximo, vacantesVoluntarios, vacantesBeneficiarios, ayudaOfrecida, estado, organizacionId, id_organizacion,
        barrio, localidad, ciudad, departamento, pais, punto_referencia, nombre_lugar, latitud, longitud, imagen
      } = req.body;
      
      const eventTitle = (nombre || titulo || '').trim();
      const eventDate = fecha || fecha_inicio || fechaInicio || new Date().toISOString();
      const eventCupo = cupo || cupo_maximo || cupoMaximo || 20;

      let orgId = parseInt(String(organizacionId || id_organizacion || '').replace('org_', '').replace('usr_', ''), 10);
      let existingOrg = !isNaN(orgId) ? await OrganizacionModel.getById(orgId) : null;
      if (!existingOrg) {
        const userEmail = (req as AuthenticatedRequest).user?.correo;
        if (userEmail) {
          existingOrg = await OrganizacionModel.getByEmail(userEmail);
        }
        if (!existingOrg) {
          const allOrgs = await OrganizacionModel.getAll();
          if (allOrgs.length > 0) existingOrg = allOrgs[0];
        }
        if (existingOrg) {
          orgId = existingOrg.id_organizacion;
        } else {
          orgId = 1;
        }
      }
      
      // Intentar buscar la categoría por nombre, si no existe buscar por ID, o crear/usar por defecto 1
      let catId = 1;
      const rawCat = categoria || id_categoria || idCategoria;
      if (typeof rawCat === 'string' && isNaN(Number(rawCat.replace('cat_', '')))) {
        const matchedCat = await CategoriaModel.getByName(rawCat);
        if (matchedCat) catId = matchedCat.id_categoria;
      } else if (rawCat) {
        const checkId = parseInt(String(rawCat).replace('cat_', ''), 10);
        if (!isNaN(checkId)) catId = checkId;
      }

      let estadoInt = 1;
      if (estado === 'finalizado') estadoInt = 2;
      if (estado === 'cancelado') estadoInt = 0;

      const insertId = await EventoModel.create({
        nombre: eventTitle,
        id_categoria: catId,
        descripcion: descripcion || '',
        direccion: direccion || '',
        fecha: eventDate,
        cupo: eventCupo ? parseInt(String(eventCupo), 10) : 0,
        vacantes_voluntarios: vacantesVoluntarios !== undefined ? parseInt(String(vacantesVoluntarios), 10) : (eventCupo ? parseInt(String(eventCupo), 10) : 0),
        vacantes_beneficiarios: vacantesBeneficiarios !== undefined ? parseInt(String(vacantesBeneficiarios), 10) : 20,
        ayuda_ofrecida: ayudaOfrecida || '',
        estado: estadoInt,
        organizacion_id: orgId,
        barrio: barrio || '',
        localidad: localidad || 'Bogotá',
        ciudad: ciudad || 'Bogotá',
        departamento: departamento || 'Bogotá D.C.',
        pais: pais || 'Colombia',
        punto_referencia: punto_referencia || '',
        nombre_lugar: nombre_lugar || '',
        latitud: latitud !== undefined && latitud !== null ? parseFloat(String(latitud)) : undefined,
        longitud: longitud !== undefined && longitud !== null ? parseFloat(String(longitud)) : undefined,
        imagen: imagen || ''
      });

      const evt = await EventoModel.getById(insertId);
      if (!evt) throw new Error('Error al recuperar el evento creado.');

      // Loguear auditoría
      const creatorId = (req as AuthenticatedRequest).user?.id || 1;
      await logAudit(creatorId, `Creó el evento solidario: "${evt.nombre}".`);

      return res.status(201).json({
        success: true,
        message: 'Evento creado con éxito.',
        data: mapEventToFrontend(evt)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message || 'Error al crear evento.',
        errors: []
      });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('evt_', ''), 10);
      const { 
        nombre, categoria, descripcion, direccion, fecha, cupo, vacantesVoluntarios, vacantesBeneficiarios, ayudaOfrecida, estado, organizacionId,
        barrio, localidad, ciudad, departamento, pais, punto_referencia, nombre_lugar, latitud, longitud, imagen
      } = req.body;

      const updateData: any = {};
      if (nombre !== undefined) updateData.nombre = nombre;
      if (descripcion !== undefined) updateData.descripcion = descripcion;
      if (direccion !== undefined) updateData.direccion = direccion;
      if (fecha !== undefined) updateData.fecha = fecha;
      if (cupo !== undefined) updateData.cupo = parseInt(String(cupo), 10);
      if (vacantesVoluntarios !== undefined) updateData.vacantes_voluntarios = parseInt(String(vacantesVoluntarios), 10);
      if (vacantesBeneficiarios !== undefined) updateData.vacantes_beneficiarios = parseInt(String(vacantesBeneficiarios), 10);
      if (ayudaOfrecida !== undefined) updateData.ayuda_ofrecida = ayudaOfrecida;
      if (barrio !== undefined) updateData.barrio = barrio;
      if (localidad !== undefined) updateData.localidad = localidad;
      if (ciudad !== undefined) updateData.ciudad = ciudad;
      if (departamento !== undefined) updateData.departamento = departamento;
      if (pais !== undefined) updateData.pais = pais;
      if (punto_referencia !== undefined) updateData.punto_referencia = punto_referencia;
      if (nombre_lugar !== undefined) updateData.nombre_lugar = nombre_lugar;
      if (latitud !== undefined) updateData.latitud = latitud !== null ? parseFloat(String(latitud)) : null;
      if (longitud !== undefined) updateData.longitud = longitud !== null ? parseFloat(String(longitud)) : null;
      if (imagen !== undefined) updateData.imagen = imagen;
      
      if (organizacionId !== undefined) {
        updateData.organizacion_id = parseInt(String(organizacionId).replace('org_', ''), 10);
      }

      if (categoria !== undefined) {
        const matchedCat = await CategoriaModel.getByName(categoria);
        if (matchedCat) {
          updateData.id_categoria = matchedCat.id_categoria;
        } else {
          const checkId = parseInt(categoria.replace('cat_', ''), 10);
          if (!isNaN(checkId)) {
            updateData.id_categoria = checkId;
          }
        }
      }

      if (estado !== undefined) {
        let estadoInt = 1;
        if (estado === 'finalizado') estadoInt = 2;
        if (estado === 'cancelado') estadoInt = 0;
        updateData.estado = estadoInt;
      }

      const ok = await EventoModel.update(id, updateData);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado.',
          errors: []
        });
      }

      const evt = await EventoModel.getById(id);
      if (!evt) throw new Error('Evento no encontrado.');

      // Loguear auditoría
      const editorId = (req as AuthenticatedRequest).user?.id || 1;
      await logAudit(editorId, `Actualizó el evento solidario: "${evt.nombre}".`);

      return res.status(200).json({
        success: true,
        message: 'Evento actualizado con éxito.',
        data: mapEventToFrontend(evt)
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
      const id = parseInt(rawId.replace('evt_', ''), 10);

      const evt = await EventoModel.getById(id);
      const targetName = evt ? evt.nombre : `ID ${id}`;

      const ok = await EventoModel.delete(id);
      if (!ok) {
        return res.status(404).json({
          success: false,
          message: 'Evento no encontrado.',
          errors: []
        });
      }

      // Loguear auditoría
      const deleterId = (req as AuthenticatedRequest).user?.id || 1;
      await logAudit(deleterId, `Eliminó el evento solidario: "${targetName}".`);

      return res.status(200).json({
        success: true,
        message: 'Evento eliminado con éxito.',
        data: { id: `evt_${id}` }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  // Obtener participantes registrados de un evento
  async getParticipants(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('evt_', ''), 10);

      const participants = await EventoModel.getParticipants(id);
      return res.status(200).json({
        success: true,
        message: 'Participantes del evento recuperados.',
        data: participants.map(mapUserToFrontend)
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  // Registrar inscripción de voluntario
  async registerParticipant(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('evt_', ''), 10);
      const { usuarioId } = req.body;
      const tokenUserId = (req as AuthenticatedRequest).user?.id;
      const uId = usuarioId ? parseInt(String(usuarioId).replace('usr_', ''), 10) : tokenUserId;

      if (!uId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido para la inscripción.',
          errors: []
        });
      }

      const ok = await EventoModel.registerParticipant(id, uId);
      if (!ok) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo realizar la inscripción. Es posible que ya esté inscrito o no haya cupos.',
          errors: []
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Inscripción realizada con éxito.',
        data: { inscrito: true }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  // Cancelar inscripción
  async unregisterParticipant(req: Request, res: Response) {
    try {
      const rawId = req.params.id;
      const id = parseInt(rawId.replace('evt_', ''), 10);
      const { usuarioId } = req.body;
      const tokenUserId = (req as AuthenticatedRequest).user?.id;
      const uId = usuarioId ? parseInt(String(usuarioId).replace('usr_', ''), 10) : tokenUserId;

      if (!uId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido.',
          errors: []
        });
      }

      const ok = await EventoModel.unregisterParticipant(id, uId);
      if (!ok) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo cancelar la inscripción.',
          errors: []
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Inscripción cancelada con éxito.',
        data: { inscrito: false }
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: err.message,
        errors: []
      });
    }
  },

  // Obtener eventos inscritos de un voluntario
  async getEventsByVolunteer(req: Request, res: Response) {
    try {
      const rawUserId = req.params.usuarioId;
      const usuarioId = parseInt(rawUserId.replace('usr_', ''), 10);

      const events = await EventoModel.getEventsByVolunteer(usuarioId);
      return res.status(200).json({
        success: true,
        message: 'Eventos del voluntario recuperados.',
        data: events.map(mapEventToFrontend)
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
