import { 
  Usuario, 
  Organizacion, 
  Evento, 
  Donacion, 
  DonacionMonetaria, 
  DonacionObjeto, 
  Categoria, 
  Solicitud,
  Postulacion,
  SolicitudVerificacion
} from '../types';

/**
 * SERVICIOS DE DONACIÓN (COMPLETA)
 */
export interface DonacionCompleta extends Donacion {
  organizacionNombre?: string;
  usuarioNombre?: string;
  monetaria?: DonacionMonetaria;
  objeto?: DonacionObjeto;
}

// Helper central para realizar llamadas HTTP a la API REST de Node.js / Express
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem('gg_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const result = await response.json();
  if (!result || !result.success) {
    throw new Error(result?.message || 'Error en la petición API');
  }
  return result.data !== undefined ? result.data : result;
}

/**
 * SERVICIOS DE USUARIO
 */
export const UserService = {
  async getPublicProfile(id: string): Promise<import('../types').PublicProfileData | undefined> {
    try {
      return await apiFetch<import('../types').PublicProfileData>(`/api/users/public/${id}`);
    } catch (e) {
      console.error('Error fetching public profile:', e);
      return undefined;
    }
  },

  async getAll(): Promise<Usuario[]> {
    return apiFetch<Usuario[]>('/api/users');
  },

  async getById(id: string): Promise<Usuario | undefined> {
    try {
      const user = await apiFetch<Usuario>(`/api/users/${id}`);
      return user || undefined;
    } catch {
      return undefined;
    }
  },

  async getByEmail(correo: string): Promise<Usuario | undefined> {
    try {
      const user = await apiFetch<Usuario | null>(`/api/users/by-email/${encodeURIComponent(correo)}`);
      return user || undefined;
    } catch {
      return undefined;
    }
  },

  async getVolunteersCount(): Promise<number> {
    try {
      return await apiFetch<number>('/api/users/stats/volunteers-count');
    } catch {
      return 0;
    }
  },

  async login(correo: string, password: string): Promise<{ user: Usuario; token: string }> {
    return apiFetch<{ user: Usuario; token: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password })
    });
  },

  async register(user: Omit<Usuario, 'id' | 'estado'>): Promise<{ user: Usuario; token: string }> {
    return apiFetch<{ user: Usuario; token: string }>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  async create(user: Omit<Usuario, 'id'>): Promise<Usuario> {
    return apiFetch<Usuario>('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  async update(id: string, updatedData: Partial<Usuario>): Promise<Usuario> {
    return apiFetch<Usuario>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/users/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  async forgotPassword(correo: string, nuevaPassword?: string): Promise<{ correo: string; verified?: boolean }> {
    return apiFetch<{ correo: string; verified?: boolean }>('/api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ correo, nuevaPassword })
    });
  }
};

/**
 * SERVICIOS DE ORGANIZACIÓN
 */
export const OrganizationService = {
  async getAll(): Promise<Organizacion[]> {
    return apiFetch<Organizacion[]>('/api/organizations');
  },

  async getById(id: string): Promise<Organizacion | undefined> {
    try {
      const org = await apiFetch<Organizacion>(`/api/organizations/${id}`);
      return org || undefined;
    } catch {
      return undefined;
    }
  },

  async create(org: Omit<Organizacion, 'id'>): Promise<Organizacion> {
    return apiFetch<Organizacion>('/api/organizations', {
      method: 'POST',
      body: JSON.stringify(org)
    });
  },

  async update(id: string, updatedData: Partial<Organizacion>): Promise<Organizacion> {
    return apiFetch<Organizacion>(`/api/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/organizations/${id}`, {
      method: 'DELETE'
    });
    return true;
  }
};

/**
 * SERVICIOS DE VERIFICACIÓN DE ORGANIZACIONES
 */
export const VerificationService = {
  async getAllRequests(): Promise<SolicitudVerificacion[]> {
    return apiFetch<SolicitudVerificacion[]>('/api/verifications');
  },

  async getOrgStatus(orgId: string): Promise<{
    verificada: boolean;
    estadoVerificacion: 'no_solicitado' | 'pendiente' | 'aprobada' | 'rechazada';
    activeRequest?: SolicitudVerificacion;
  }> {
    return apiFetch<{
      verificada: boolean;
      estadoVerificacion: 'no_solicitado' | 'pendiente' | 'aprobada' | 'rechazada';
      activeRequest?: SolicitudVerificacion;
    }>(`/api/verifications/org/${orgId}`);
  },

  async requestVerification(data: {
    organizacionId: string;
    nit?: string;
    mensaje?: string;
    documentos?: string;
  }): Promise<SolicitudVerificacion> {
    return apiFetch<SolicitudVerificacion>('/api/verifications/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async respondRequest(id: string, estado: 'aprobada' | 'rechazada', respuestaAdmin?: string): Promise<SolicitudVerificacion> {
    return apiFetch<SolicitudVerificacion>(`/api/verifications/${id}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ estado, respuestaAdmin })
    });
  }
};

/**
 * SERVICIOS DE EVENTOS
 */
export const EventService = {
  async getAll(): Promise<Evento[]> {
    return apiFetch<Evento[]>('/api/events');
  },

  async getById(id: string): Promise<Evento | undefined> {
    try {
      const evt = await apiFetch<Evento>(`/api/events/${id}`);
      return evt || undefined;
    } catch {
      return undefined;
    }
  },

  async create(evt: Omit<Evento, 'id'>): Promise<Evento> {
    return apiFetch<Evento>('/api/events', {
      method: 'POST',
      body: JSON.stringify(evt)
    });
  },

  async update(id: string, updatedData: Partial<Evento>): Promise<Evento> {
    return apiFetch<Evento>(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/events/${id}`, {
      method: 'DELETE'
    });
    return true;
  },

  // Obtener participantes registrados de un evento
  async getParticipants(eventoId: string): Promise<Usuario[]> {
    return apiFetch<Usuario[]>(`/api/events/${eventoId}/participants`);
  },

  // Inscribir voluntario en evento
  async registerParticipant(eventoId: string, usuarioId: string): Promise<boolean> {
    const res = await apiFetch<{ inscrito: boolean }>(`/api/events/${eventoId}/register`, {
      method: 'POST',
      body: JSON.stringify({ usuarioId })
    });
    return res.inscrito;
  },

  // Cancelar inscripción de voluntario
  async unregisterParticipant(eventoId: string, usuarioId: string): Promise<boolean> {
    await apiFetch<any>(`/api/events/${eventoId}/unregister`, {
      method: 'POST',
      body: JSON.stringify({ usuarioId })
    });
    return true;
  },

  // Obtener eventos en los que participa un usuario voluntario
  async getEventsByVolunteer(usuarioId: string): Promise<Evento[]> {
    return apiFetch<Evento[]>(`/api/events/volunteer/${usuarioId}`);
  }
};

/**
 * SERVICIOS DE CATEGORÍA
 */
export const CategoryService = {
  async getAll(): Promise<Categoria[]> {
    return apiFetch<Categoria[]>('/api/categories');
  },

  async getById(id: string): Promise<Categoria | undefined> {
    try {
      const cat = await apiFetch<Categoria>(`/api/categories/${id}`);
      return cat || undefined;
    } catch {
      return undefined;
    }
  },

  async create(cat: Omit<Categoria, 'id'>): Promise<Categoria> {
    return apiFetch<Categoria>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(cat)
    });
  },

  async update(id: string, updatedData: Partial<Categoria>): Promise<Categoria> {
    return apiFetch<Categoria>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/categories/${id}`, {
      method: 'DELETE'
    });
    return true;
  }
};

/**
 * SERVICIOS DE SOLICITUDES (BENEFICIARIOS)
 */
export const RequestService = {
  async getAll(): Promise<Solicitud[]> {
    return apiFetch<Solicitud[]>('/api/requests');
  },

  async getById(id: string): Promise<Solicitud | undefined> {
    try {
      const req = await apiFetch<Solicitud>(`/api/requests/${id}`);
      return req || undefined;
    } catch {
      return undefined;
    }
  },

  async getByBeneficiary(beneficiarioId: string): Promise<Solicitud[]> {
    return apiFetch<Solicitud[]>(`/api/requests/beneficiary/${beneficiarioId}`);
  },

  async create(req: Omit<Solicitud, 'id' | 'fecha'>): Promise<Solicitud> {
    return apiFetch<Solicitud>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  },

  async update(id: string, updatedData: Partial<Solicitud>): Promise<Solicitud> {
    return apiFetch<Solicitud>(`/api/requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/requests/${id}`, {
      method: 'DELETE'
    });
    return true;
  }
};

/**
 * SERVICIOS DE DONACIÓN
 */
export const DonationService = {
  async getAll(): Promise<DonacionCompleta[]> {
    return apiFetch<DonacionCompleta[]>('/api/donations');
  },

  async getById(id: string): Promise<DonacionCompleta | undefined> {
    try {
      const d = await apiFetch<DonacionCompleta>(`/api/donations/${id}`);
      return d || undefined;
    } catch {
      return undefined;
    }
  },

  async getByVolunteer(usuarioId: string): Promise<DonacionCompleta[]> {
    return apiFetch<DonacionCompleta[]>(`/api/donations/volunteer/${usuarioId}`);
  },

  async getByOrganization(organizacionId: string): Promise<DonacionCompleta[]> {
    return apiFetch<DonacionCompleta[]>(`/api/donations/organization/${organizacionId}`);
  },

  async createMonetary(
    donation: Omit<Donacion, 'id' | 'fecha' | 'tipo'>,
    monetary: Omit<DonacionMonetaria, 'id' | 'donacionId'>
  ): Promise<DonacionCompleta> {
    return apiFetch<DonacionCompleta>('/api/donations/monetary', {
      method: 'POST',
      body: JSON.stringify({ donation, monetary })
    });
  },

  async createObject(
    donation: Omit<Donacion, 'id' | 'fecha' | 'tipo'>,
    objectDetail: Omit<DonacionObjeto, 'id' | 'donacionId'>
  ): Promise<DonacionCompleta> {
    return apiFetch<DonacionCompleta>('/api/donations/object', {
      method: 'POST',
      body: JSON.stringify({ donation, objectDetail })
    });
  },

  async delete(id: string): Promise<boolean> {
    await apiFetch<any>(`/api/donations/${id}`, {
      method: 'DELETE'
    });
    return true;
  }
};

/**
 * SERVICIOS DE AUDITORÍA (AUDIT LOGS)
 */
export interface AuditLog {
  id_audit?: number;
  fecha: string;
  accion: string;
  id_usuario: number;
  nombre_usuario: string;
  rol_usuario: string;
}

export const AuditService = {
  async getAll(): Promise<AuditLog[]> {
    try {
      return await apiFetch<AuditLog[]>('/api/audits');
    } catch (e) {
      console.error('Error fetching audit logs:', e);
      return [];
    }
  }
};

/**
 * SERVICIOS DE POSTULACIONES A EVENTOS (NUEVO MODELO DE EVENTOS Y BENEFICIARIOS)
 */
export const PostulacionService = {
  async getAll(): Promise<Postulacion[]> {
    return apiFetch<Postulacion[]>('/api/postulaciones');
  },

  async getByUser(usuarioId: string, tipo?: 'voluntario' | 'beneficiario'): Promise<Postulacion[]> {
    const cleanId = String(usuarioId).replace('usr_', '').replace('org_', '');
    const url = `/api/postulaciones/usuario/${cleanId}${tipo ? `?tipo=${tipo}` : ''}`;
    return apiFetch<Postulacion[]>(url);
  },

  async getByEvent(eventoId: string, tipo?: 'voluntario' | 'beneficiario'): Promise<Postulacion[]> {
    const cleanId = String(eventoId).replace('evt_', '');
    const url = `/api/postulaciones/evento/${cleanId}${tipo ? `?tipo=${tipo}` : ''}`;
    return apiFetch<Postulacion[]>(url);
  },

  async getByOrganization(organizacionId: string, tipo?: 'voluntario' | 'beneficiario'): Promise<Postulacion[]> {
    const cleanId = String(organizacionId).replace('org_', '');
    const url = `/api/postulaciones/organizacion/${cleanId}${tipo ? `?tipo=${tipo}` : ''}`;
    return apiFetch<Postulacion[]>(url);
  },

  async create(data: {
    id_evento: number | string;
    id_usuario: number | string;
    tipo_postulacion: 'voluntario' | 'beneficiario';
    observaciones?: string;
  }): Promise<{ success: boolean; id?: number; message?: string }> {
    try {
      const cleanData = {
        ...data,
        id_evento: String(data.id_evento).replace('evt_', ''),
        id_usuario: String(data.id_usuario).replace('usr_', '').replace('org_', '')
      };
      const res = await apiFetch<any>('/api/postulaciones', {
        method: 'POST',
        body: JSON.stringify(cleanData)
      });
      return {
        success: true,
        id: res?.id || res?.data?.id,
        message: 'Postulación registrada exitosamente.'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Error al registrar la postulación.'
      };
    }
  },

  async updateStatus(
    id: number | string,
    estado_postulacion: 'pendiente' | 'aprobado' | 'rechazado' | 'confirmado' | 'cancelado',
    observaciones?: string
  ): Promise<boolean> {
    try {
      await apiFetch<any>(`/api/postulaciones/${id}/estado`, {
        method: 'PUT',
        body: JSON.stringify({ estado_postulacion, observaciones })
      });
      return true;
    } catch {
      return false;
    }
  },

  async delete(id: number | string): Promise<boolean> {
    try {
      await apiFetch<any>(`/api/postulaciones/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch {
      return false;
    }
  }
};

