import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  UserService, 
  OrganizationService, 
  EventService, 
  DonationService, 
  CategoryService,
  RequestService,
  DonacionCompleta,
  AuditService,
  AuditLog,
  VerificationService
} from '../../services/db';
import { Usuario, Organizacion, Evento, Categoria, UserRole, SolicitudVerificacion } from '../../types';
import { UserLink } from '../../components/UserLink';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { LocationPicker } from '../../components/LocationPicker';
import { DonationCard } from '../../components/DonationCard';
import { DonationDetailsModal } from '../../components/DonationDetailsModal';
import { 
  Button, 
  Input, 
  Select, 
  Card, 
  Modal, 
  Table, 
  Badge, 
  Alert, 
  ConfirmDialog, 
  SearchBar, 
  Pagination, 
  EmptyState,
  Textarea,
  formatCOP,
  formatDate
} from '../../components/UI';
import { 
  Users, 
  Building2, 
  Calendar, 
  Heart, 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  Eye,
  AlertCircle,
  BadgeCheck,
  XCircle,
  FileText,
  Clock
} from 'lucide-react';

/**
 * ==========================================
 * 1. ADMIN DASHBOARD
 * ==========================================
 */
export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    usersCount: 0,
    orgsCount: 0,
    eventsCount: 0,
    donationsCount: 0,
    monetaryTotal: 0,
    requestsCount: 0,
  });
  const [latestDonations, setLatestDonations] = useState<DonacionCompleta[]>([]);
  const [latestEvents, setLatestEvents] = useState<Evento[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    async function loadStats() {
      const users = await UserService.getAll();
      const orgs = await OrganizationService.getAll();
      const events = await EventService.getAll();
      const donations = await DonationService.getAll();
      const requests = await RequestService.getAll();
      const audits = await AuditService.getAll();

      const monetaryVal = donations
        .filter(d => d.tipo === 'monetaria' && d.monetaria)
        .reduce((sum, d) => sum + (d.monetaria?.valor || 0), 0);

      setStats({
        usersCount: users.length,
        orgsCount: orgs.length,
        eventsCount: events.length,
        donationsCount: donations.length,
        monetaryTotal: monetaryVal,
        requestsCount: requests.length,
      });

      setLatestDonations(donations.slice(-4).reverse());
      setLatestEvents(events.slice(-3).reverse());
      setAuditLogs(audits);
    }
    loadStats();
  }, []);

  const filteredAudits = auditLogs.filter(log => {
    const term = auditSearch.toLowerCase();
    return (
      log.accion.toLowerCase().includes(term) ||
      log.nombre_usuario.toLowerCase().includes(term) ||
      log.rol_usuario.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Dashboard de Administración</h1>
        <p className="text-xs text-neutral-500 mt-1">Monitorea el estado de Give&Go y consulta métricas de participación.</p>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Usuarios Registrados</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{stats.usersCount}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Voluntarios y Beneficiarios</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Organizaciones</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{stats.orgsCount}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Fundaciones e Instituciones</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Eventos Comunitarios</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{stats.eventsCount}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Causas sociales publicadas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Fondos Recaudados</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-700">{formatCOP(stats.monetaryTotal)}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Donaciones procesadas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donaciones recientes */}
        <Card title="Últimas Donaciones Registradas">
          <div className="space-y-4">
            {latestDonations.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No hay donaciones registradas.</p>
            ) : (
              latestDonations.map((don) => (
                <div key={don.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded border border-neutral-150 text-xs">
                  <div>
                    <p className="font-semibold text-neutral-900">{don.usuarioNombre}</p>
                    <p className="text-[10px] text-neutral-500">Causa: {don.categoria} | Hacia: {don.organizacionNombre}</p>
                  </div>
                  <div className="text-right">
                    {don.tipo === 'monetaria' ? (
                      <span className="font-extrabold text-red-600 text-xs">+{formatCOP(don.monetaria?.valor || 0)}</span>
                    ) : (
                      <span className="font-semibold text-neutral-800">{don.objeto?.cantidad} x {don.objeto?.categoria}</span>
                    )}
                    <p className="text-[9px] text-neutral-400 mt-0.5">{formatDate(don.fecha)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Campañas recientes */}
        <Card title="Campañas Benéficas del Mes">
          <div className="space-y-4">
            {latestEvents.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No hay eventos benéficos registrados.</p>
            ) : (
              latestEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-neutral-50 rounded border border-neutral-150 text-xs space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-neutral-800">{evt.nombre}</span>
                    <Badge variant={evt.estado === 'activo' ? 'success' : 'neutral'}>
                      {evt.estado}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-neutral-500 line-clamp-1">{evt.descripcion}</p>
                  <div className="flex justify-between text-[9px] text-neutral-400 pt-1">
                    <span>Categoría: {evt.categoria}</span>
                    <span>Fecha: {formatDate(evt.fecha)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Registro de Auditoría */}
      <Card title="Registro de Auditoría de Seguridad (System Logs)">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-neutral-500">Muestra el registro de acciones importantes (Inicios de sesión, actualizaciones de perfiles, eventos y donaciones).</p>
            <div className="w-full sm:w-64">
              <SearchBar value={auditSearch} onChange={setAuditSearch} placeholder="Buscar por acción, usuario..." />
            </div>
          </div>

          <div className="overflow-x-auto border border-neutral-150 rounded">
            <table className="min-w-full divide-y divide-neutral-200 text-left text-xs">
              <thead className="bg-neutral-100 text-neutral-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Fecha y Hora</th>
                  <th className="px-4 py-3">Acción Realizada</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Rol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150 bg-white">
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-neutral-400 italic">No se encontraron registros de auditoría.</td>
                  </tr>
                ) : (
                  filteredAudits.slice(0, 15).map((log, idx) => (
                    <tr key={log.id_audit || idx} className="hover:bg-neutral-50 font-mono text-[11px]">
                      <td className="px-4 py-2.5 text-neutral-500 text-[10px] whitespace-nowrap">
                        {formatDate(log.fecha)} {new Date(log.fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="px-4 py-2.5 font-sans font-medium text-neutral-900">{log.accion}</td>
                      <td className="px-4 py-2.5 text-neutral-700 whitespace-nowrap">{log.nombre_usuario}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Badge variant={log.rol_usuario.toLowerCase() === 'admin' ? 'danger' : log.rol_usuario.toLowerCase() === 'organizacion' ? 'info' : 'success'}>
                          {log.rol_usuario}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * ==========================================
 * 2. ADMIN USERS
 * ==========================================
 */
export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  
  // Selected user for detailed info modal
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [userEvents, setUserEvents] = useState<Evento[]>([]);
  const [userDonations, setUserDonations] = useState<DonacionCompleta[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Confirm Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Usuario, 'id'>>();

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenDetails = async (user: Usuario) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
    setIsLoadingDetails(true);
    try {
      const events = await EventService.getEventsByVolunteer(user.id);
      const donations = await DonationService.getByVolunteer(user.id);
      setUserEvents(events);
      setUserDonations(donations);
    } catch (e) {
      console.error('Error fetching user activity details:', e);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  async function loadUsers() {
    const list = await UserService.getAll();
    setUsers(list);
  }

  const handleOpenCreate = () => {
    setEditingUser(null);
    reset({
      nombre1: '',
      nombre2: '',
      apellido1: '',
      apellido2: '',
      correo: '',
      password: '',
      telefono: '',
      rol: 'voluntario',
      estado: 'activo'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUser(user);
    setValue('nombre1', user.nombre1);
    setValue('nombre2', user.nombre2 || '');
    setValue('apellido1', user.apellido1);
    setValue('apellido2', user.apellido2 || '');
    setValue('correo', user.correo);
    setValue('telefono', user.telefono);
    setValue('rol', user.rol);
    setValue('estado', user.estado);
    setValue('password', user.password || '');
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Omit<Usuario, 'id'>) => {
    if (editingUser) {
      await UserService.update(editingUser.id, data);
    } else {
      await UserService.create(data);
    }
    loadUsers();
    setIsModalOpen(false);
  };

  const handleOpenDelete = (id: string) => {
    setUserToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      await UserService.delete(userToDelete);
      loadUsers();
    }
  };

  // Filtrado
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    return (
      u.nombre1.toLowerCase().includes(term) ||
      u.apellido1.toLowerCase().includes(term) ||
      u.correo.toLowerCase().includes(term) ||
      u.rol.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Gestión de Usuarios</h1>
          <p className="text-xs text-neutral-500 mt-1">Administra accesos, roles y el estado de voluntarios y beneficiarios.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Registrar Usuario
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 p-4 rounded shadow-xs flex items-center justify-between gap-4">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por nombre, correo..." />
      </div>

      <Table<Usuario>
        headers={['Nombre Completo', 'Correo Electrónico', 'Teléfono', 'Rol', 'Estado', 'Acciones']}
        data={filteredUsers}
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-neutral-50">
            <td className="px-5 py-3 font-semibold text-neutral-950">
              <UserLink
                userId={item.id}
                name={`${item.nombre1} ${item.nombre2 || ''} ${item.apellido1} ${item.apellido2 || ''}`.trim()}
                role={item.rol}
                avatar={item.foto}
                size="sm"
              />
            </td>
            <td className="px-5 py-3 text-xs text-neutral-600">{item.correo}</td>
            <td className="px-5 py-3 text-xs text-neutral-600">{item.telefono}</td>
            <td className="px-5 py-3 text-xs">
              <Badge variant={item.rol === 'admin' ? 'danger' : item.rol === 'organizacion' ? 'info' : 'success'}>
                {item.rol}
              </Badge>
            </td>
            <td className="px-5 py-3 text-xs">
              <Badge variant={item.estado === 'activo' ? 'success' : 'neutral'}>
                {item.estado}
              </Badge>
            </td>
            <td className="px-5 py-3 text-xs flex gap-2">
              <button onClick={() => handleOpenDetails(item)} title="Ver perfil e historial" className="p-1 rounded text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => handleOpenEdit(item)} className="p-1 rounded text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100">
                <Edit className="w-4 h-4" />
              </button>
              {item.id !== 'user_admin' && (
                <button onClick={() => handleOpenDelete(item.id)} className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </td>
          </tr>
        )}
      />

      {/* Modal Formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Datos de Usuario' : 'Registrar Nuevo Usuario'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primer Nombre"
              error={errors.nombre1?.message}
              {...register('nombre1', { required: 'El nombre es obligatorio' })}
            />
            <Input
              label="Segundo Nombre"
              {...register('nombre2')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primer Apellido"
              error={errors.apellido1?.message}
              {...register('apellido1', { required: 'El apellido es obligatorio' })}
            />
            <Input
              label="Segundo Apellido"
              {...register('apellido2')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Correo electrónico"
              type="email"
              error={errors.correo?.message}
              {...register('correo', { required: 'El correo electrónico es obligatorio' })}
            />
            <Input
              label="Contraseña"
              type="password"
              {...register('password', { required: editingUser ? false : 'La contraseña es obligatoria' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Número de Teléfono"
              error={errors.telefono?.message}
              {...register('telefono', { required: 'El teléfono es obligatorio' })}
            />
            <Select
              label="Rol Asignado"
              options={[
                { value: 'voluntario', label: 'Voluntario' },
                { value: 'beneficiario', label: 'Beneficiario' },
                { value: 'organizacion', label: 'Organización' },
                { value: 'admin', label: 'Administrador' },
              ]}
              {...register('rol')}
            />
          </div>

          <Select
            label="Estado"
            options={[
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' },
            ]}
            {...register('estado')}
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar Datos
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message="¿Está completamente seguro de eliminar este usuario? Sus credenciales de acceso quedarán inhabilitadas inmediatamente."
      />

      {/* Modal Detalles e Historial de Actividad */}
      <Modal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        title="Perfil y Registro de Actividad"
      >
        {selectedUser && (
          <div className="space-y-6 text-neutral-800">
            {/* Información del Perfil */}
            <div className="bg-neutral-50 border border-neutral-150 p-4 rounded text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-neutral-900 uppercase">
                  {selectedUser.nombre1} {selectedUser.nombre2} {selectedUser.apellido1} {selectedUser.apellido2}
                </span>
                <Badge variant={selectedUser.rol === 'admin' ? 'danger' : selectedUser.rol === 'organizacion' ? 'info' : 'success'}>
                  {selectedUser.rol}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 mt-2">
                <p><strong>Correo:</strong> {selectedUser.correo}</p>
                <p><strong>Teléfono:</strong> {selectedUser.telefono}</p>
                <p><strong>Estado de Cuenta:</strong> {selectedUser.estado === 'activo' ? 'Activo' : 'Inactivo'}</p>
              </div>
            </div>

            {/* Listado de Eventos Inscritos */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-red-600" />
                Participación en Eventos ({userEvents.length})
              </h3>
              {isLoadingDetails ? (
                <p className="text-xs text-neutral-400 italic">Cargando eventos...</p>
              ) : userEvents.length === 0 ? (
                <p className="text-xs text-neutral-400 italic bg-neutral-50 p-3 rounded border border-neutral-150">No está registrado en ningún evento.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 border border-neutral-150 p-1.5 rounded">
                  {userEvents.map(evt => (
                    <div key={evt.id} className="p-2.5 bg-neutral-50 border border-neutral-100 rounded text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-neutral-900">{evt.nombre}</p>
                        <p className="text-[10px] text-neutral-500">Causa: {evt.categoria} | Dirección: {evt.direccion}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 whitespace-nowrap ml-4">{formatDate(evt.fecha)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Listado de Donaciones Realizadas */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-600" />
                Historial de Donaciones ({userDonations.length})
              </h3>
              {isLoadingDetails ? (
                <p className="text-xs text-neutral-400 italic">Cargando donaciones...</p>
              ) : userDonations.length === 0 ? (
                <p className="text-xs text-neutral-400 italic bg-neutral-50 p-3 rounded border border-neutral-150">No ha realizado ninguna donación.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-2 border border-neutral-150 p-1.5 rounded">
                  {userDonations.map(don => (
                    <div key={don.id} className="p-2.5 bg-neutral-50 border border-neutral-100 rounded text-xs flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-neutral-900">Destino: {don.organizacionNombre || 'Organización'}</p>
                        <p className="text-[10px] text-neutral-500">Causa: {don.categoria}</p>
                      </div>
                      <div className="text-right ml-4">
                        {don.tipo === 'monetaria' ? (
                          <span className="font-extrabold text-red-600">+{formatCOP(don.monetaria?.valor || 0)}</span>
                        ) : (
                          <span className="font-semibold text-neutral-800">{don.objeto?.cantidad} x {don.objeto?.categoria}</span>
                        )}
                        <p className="text-[9px] text-neutral-400">{formatDate(don.fecha)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/**
 * ==========================================
 * 3. ADMIN ORGANIZATIONS
 * ==========================================
 */
export const AdminOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organizacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organizacion | null>(null);
  
  // Confirm
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Organizacion, 'id'>>();

  useEffect(() => {
    loadOrgs();
  }, []);

  async function loadOrgs() {
    const list = await OrganizationService.getAll();
    setOrganizations(list);
  }

  const handleOpenCreate = () => {
    setEditingOrg(null);
    reset({ nombre: '', direccion: '', correo: '', password: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (org: Organizacion) => {
    setEditingOrg(org);
    setValue('nombre', org.nombre);
    setValue('direccion', org.direccion);
    setValue('correo', org.correo);
    setValue('password', org.password || '');
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Omit<Organizacion, 'id'>) => {
    if (editingOrg) {
      await OrganizationService.update(editingOrg.id, data);
    } else {
      await OrganizationService.create(data);
    }
    loadOrgs();
    setIsModalOpen(false);
  };

  const handleOpenDelete = (id: string) => {
    setOrgToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (orgToDelete) {
      await OrganizationService.delete(orgToDelete);
      loadOrgs();
    }
  };

  const filteredOrgs = organizations.filter(o => 
    o.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Gestión de Organizaciones</h1>
          <p className="text-xs text-neutral-500 mt-1">Controla los perfiles institucionales de ONGs y fundaciones asociadas.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Registrar Organización
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 p-4 rounded shadow-xs">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por organización, sede, email..." />
      </div>

      <Table<Organizacion>
        headers={['Id', 'Nombre de la ONG', 'Estado Verificación', 'Dirección Sede', 'Correo de Contacto', 'Acciones']}
        data={filteredOrgs}
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-neutral-50">
            <td className="px-5 py-3 text-xs font-semibold text-neutral-500">{item.id}</td>
            <td className="px-5 py-3 font-semibold text-neutral-900">
              <UserLink
                userId={item.id.startsWith('org_') ? item.id : `org_${item.id}`}
                name={item.nombre}
                role="organizacion"
                avatar={item.logo}
                verificada={Boolean(item.verificada)}
                size="sm"
              />
            </td>
            <td className="px-5 py-3 text-xs">
              {item.verificada ? (
                <VerifiedBadge showText size="xs" />
              ) : item.estadoVerificacion === 'pendiente' ? (
                <Badge variant="warning">Pendiente</Badge>
              ) : item.estadoVerificacion === 'rechazada' ? (
                <Badge variant="danger">Rechazada</Badge>
              ) : (
                <Badge variant="neutral">No verificada</Badge>
              )}
            </td>
            <td className="px-5 py-3 text-xs text-neutral-600">{item.direccion}</td>
            <td className="px-5 py-3 text-xs text-neutral-600">{item.correo}</td>
            <td className="px-5 py-3 text-xs flex gap-2">
              <button onClick={() => handleOpenEdit(item)} className="p-1 rounded text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleOpenDelete(item.id)} className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrg ? 'Editar Organización' : 'Registrar Nueva Sede/ONG'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Razón Social / Nombre ONG"
            error={errors.nombre?.message}
            {...register('nombre', { required: 'El nombre es obligatorio' })}
          />

          <Input
            label="Dirección de la Sede"
            error={errors.direccion?.message}
            {...register('direccion', { required: 'La dirección es obligatoria' })}
          />

          <Input
            label="Correo de la Organización"
            type="email"
            error={errors.correo?.message}
            {...register('correo', { required: 'El correo es obligatorio' })}
          />

          <Input
            label="Contraseña"
            type="password"
            {...register('password', { required: editingOrg ? false : 'La contraseña es obligatoria' })}
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar Datos
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Sede Organizativa"
        message="¿Está seguro de eliminar esta organización de la plataforma? Todos los eventos coordinados por esta sede quedarán huérfanos."
      />
    </div>
  );
};

/**
 * ==========================================
 * 3.5 ADMIN VERIFICATIONS (Solicitudes de verificación)
 * ==========================================
 */
export const AdminVerifications: React.FC = () => {
  const [requests, setRequests] = useState<SolicitudVerificacion[]>([]);
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReq, setSelectedReq] = useState<SolicitudVerificacion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'aprobada' | 'rechazada'>('aprobada');
  const [respuestaAdmin, setRespuestaAdmin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const data = await VerificationService.getAllRequests();
      setRequests(data);
    } catch (e) {
      console.error('Error al cargar solicitudes de verificación:', e);
    }
  }

  const handleOpenAction = (req: SolicitudVerificacion, type: 'aprobada' | 'rechazada') => {
    setSelectedReq(req);
    setActionType(type);
    setRespuestaAdmin(type === 'aprobada' ? 'Su organización ha sido verificada con éxito tras revisar la documentación.' : 'La solicitud no pudo ser aprobada en esta ocasión. Por favor revise el NIT y documentos enviados.');
    setIsModalOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedReq) return;
    setSubmitting(true);
    try {
      await VerificationService.respondRequest(selectedReq.id, actionType, respuestaAdmin);
      setAlertMsg({
        type: 'success',
        text: `Solicitud de ${selectedReq.nombreOrganizacion} fue ${actionType === 'aprobada' ? 'APROBADA' : 'RECHAZADA'} con éxito.`
      });
      setIsModalOpen(false);
      loadRequests();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Error al procesar la solicitud' });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingCount = requests.filter(r => r.estado === 'pendiente').length;
  const approvedCount = requests.filter(r => r.estado === 'aprobada').length;
  const rejectedCount = requests.filter(r => r.estado === 'rechazada').length;

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'todas' || r.estado === filter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      r.nombreOrganizacion.toLowerCase().includes(term) ||
      (r.nit || '').toLowerCase().includes(term) ||
      (r.correoOrganizacion || '').toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider flex items-center gap-2">
          <BadgeCheck className="w-7 h-7 text-blue-600" />
          Solicitudes de Verificación de Organizaciones
        </h1>
        <p className="text-xs text-neutral-500 mt-1">Revisa las solicitudes de verificación enviadas por las organizaciones y aprueba o rechaza sus credenciales.</p>
      </div>

      {alertMsg && (
        <Alert
          type={alertMsg.type}
          message={alertMsg.text}
          onClose={() => setAlertMsg(null)}
        />
      )}

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 select-none">
        <Card className="border-l-4 border-l-blue-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Total Solicitudes</p>
              <h3 className="text-xl font-black text-neutral-900 mt-0.5">{requests.length}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <BadgeCheck className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Pendientes de Revisión</p>
              <h3 className="text-xl font-black text-amber-700 mt-0.5">{pendingCount}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Aprobadas</p>
              <h3 className="text-xl font-black text-emerald-800 mt-0.5">{approvedCount}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card className="border-l-4 border-l-red-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Rechazadas</p>
              <h3 className="text-xl font-black text-red-700 mt-0.5">{rejectedCount}</h3>
            </div>
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Controles de Filtros y Búsqueda */}
      <div className="bg-white border border-neutral-200 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['todas', 'pendiente', 'aprobada', 'rechazada'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                filter === tab
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {tab === 'todas' ? 'Todas las Solicitudes' : tab}
              {tab === 'pendiente' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 text-[10px] bg-amber-500 text-white rounded-full font-black">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72">
          <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por ONG, NIT, correo..." />
        </div>
      </div>

      {/* Tabla de Solicitudes */}
      {filteredRequests.length === 0 ? (
        <EmptyState
          title="No se encontraron solicitudes"
          description="Actualmente no existen solicitudes de verificación que coincidan con los filtros seleccionados."
        />
      ) : (
        <Table<SolicitudVerificacion>
          headers={['Organización', 'NIT', 'Fecha Solicitud', 'Mensaje / Justificación', 'Estado', 'Acciones']}
          data={filteredRequests}
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-neutral-50/80 transition-colors">
              <td className="px-5 py-3 font-semibold text-neutral-900">
                <UserLink
                  userId={item.organizacionId}
                  name={item.nombreOrganizacion}
                  role="organizacion"
                  verificada={item.estado === 'aprobada'}
                  size="sm"
                />
                <p className="text-[10px] text-neutral-500 font-normal">{item.correoOrganizacion}</p>
              </td>
              <td className="px-5 py-3 text-xs font-mono font-medium text-neutral-700">{item.nit || 'Sin NIT'}</td>
              <td className="px-5 py-3 text-xs text-neutral-600 whitespace-nowrap">{formatDate(item.fechaSolicitud)}</td>
              <td className="px-5 py-3 text-xs text-neutral-600 max-w-xs">
                <p className="line-clamp-2 italic">{item.mensaje || 'Sin mensaje adicional.'}</p>
                {item.documentos && (
                  <p className="text-[10px] text-blue-600 font-medium mt-0.5 truncate">
                    Doc: {item.documentos}
                  </p>
                )}
                {item.respuestaAdmin && (
                  <p className="text-[10px] text-neutral-500 font-bold mt-1 bg-neutral-100 p-1 rounded">
                    Respuesta: {item.respuestaAdmin}
                  </p>
                )}
              </td>
              <td className="px-5 py-3 text-xs whitespace-nowrap">
                {item.estado === 'aprobada' ? (
                  <Badge variant="success">Aprobada</Badge>
                ) : item.estado === 'pendiente' ? (
                  <Badge variant="warning">Pendiente</Badge>
                ) : (
                  <Badge variant="danger">Rechazada</Badge>
                )}
              </td>
              <td className="px-5 py-3 text-xs whitespace-nowrap">
                {item.estado === 'pendiente' ? (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1"
                      onClick={() => handleOpenAction(item, 'aprobada')}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs px-2.5 py-1"
                      onClick={() => handleOpenAction(item, 'rechazada')}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                ) : (
                  <span className="text-[11px] text-neutral-400 italic">
                    Procesada ({item.fechaRespuesta ? formatDate(item.fechaRespuesta) : ''})
                  </span>
                )}
              </td>
            </tr>
          )}
        />
      )}

      {/* Modal para Responder Solicitud */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={actionType === 'aprobada' ? 'Aprobar Verificación' : 'Rechazar Verificación'}
      >
        {selectedReq && (
          <div className="space-y-4 text-xs text-neutral-800">
            <div className={`p-3 rounded-xl border ${actionType === 'aprobada' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
              <p className="font-bold text-sm">{selectedReq.nombreOrganizacion}</p>
              <p className="mt-0.5">NIT: {selectedReq.nit || 'No registrado'} | Email: {selectedReq.correoOrganizacion}</p>
            </div>

            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 space-y-1">
              <p className="font-bold text-neutral-700">Mensaje de la Organización:</p>
              <p className="text-neutral-600 italic">{selectedReq.mensaje || 'No incluyó mensaje de justificación.'}</p>
              {selectedReq.documentos && (
                <p className="text-neutral-600 pt-1"><strong>Documentación adjunta:</strong> {selectedReq.documentos}</p>
              )}
            </div>

            <Textarea
              label="Observaciones o Respuesta del Administrador (Opcional)"
              value={respuestaAdmin}
              onChange={(e) => setRespuestaAdmin(e.target.value)}
              placeholder="Escriba notas para la organización respecto a esta decisión..."
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className={actionType === 'aprobada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                disabled={submitting}
                onClick={handleConfirmResponse}
              >
                {submitting ? 'Guardando...' : actionType === 'aprobada' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

/**
 * ==========================================
 * 4. ADMIN EVENTS
 * ==========================================
 */
export const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [organizations, setOrganizations] = useState<Organizacion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirm
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Omit<Evento, 'id'>>();

  const watchedLat = watch('latitud');
  const watchedLng = watch('longitud');
  const watchedDireccion = watch('direccion');
  const watchedImagen = watch('imagen');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setValue('imagen', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const list = await EventService.getAll();
    setEvents(list);

    const cats = await CategoryService.getAll();
    setCategories(cats);

    const orgs = await OrganizationService.getAll();
    setOrganizations(orgs);
  }

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormError(null);
    reset({
      nombre: '',
      categoria: categories[0]?.nombre || '',
      descripcion: '',
      fecha: '',
      estado: 'activo',
      organizacionId: organizations[0]?.id || '',
      direccion: '',
      barrio: '',
      localidad: 'Kennedy',
      ciudad: 'Bogotá',
      departamento: 'Bogotá D.C.',
      pais: 'Colombia',
      punto_referencia: '',
      nombre_lugar: '',
      latitud: undefined,
      longitud: undefined,
      cupo: 0,
      imagen: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (evt: Evento) => {
    setEditingEvent(evt);
    setFormError(null);
    setValue('nombre', evt.nombre);
    setValue('categoria', evt.categoria);
    setValue('descripcion', evt.descripcion);
    setValue('fecha', evt.fecha);
    setValue('estado', evt.estado);
    setValue('organizacionId', evt.organizacionId);
    setValue('direccion', evt.direccion || '');
    setValue('barrio', evt.barrio || '');
    setValue('localidad', evt.localidad || 'Kennedy');
    setValue('ciudad', evt.ciudad || 'Bogotá');
    setValue('departamento', evt.departamento || 'Bogotá D.C.');
    setValue('pais', evt.pais || 'Colombia');
    setValue('punto_referencia', evt.punto_referencia || '');
    setValue('nombre_lugar', evt.nombre_lugar || '');
    setValue('latitud', evt.latitud || undefined);
    setValue('longitud', evt.longitud || undefined);
    setValue('cupo', evt.cupo || 0);
    setValue('imagen', evt.imagen || '');
    setIsModalOpen(true);
  };

  const handleLocationChange = (coords: {
    lat: number;
    lng: number;
    direccion?: string;
    barrio?: string;
    localidad?: string;
    ciudad?: string;
    departamento?: string;
    pais?: string;
  }) => {
    setValue('latitud', coords.lat);
    setValue('longitud', coords.lng);
    if (coords.direccion) setValue('direccion', coords.direccion);
    if (coords.barrio) setValue('barrio', coords.barrio);
    if (coords.localidad) setValue('localidad', coords.localidad);
    if (coords.ciudad) setValue('ciudad', coords.ciudad);
    if (coords.departamento) setValue('departamento', coords.departamento);
    if (coords.pais) setValue('pais', coords.pais);
  };

  const onSubmit = async (data: Omit<Evento, 'id'>) => {
    setFormError(null);

    // Coordinate validation
    if (data.latitud === undefined || data.latitud === null || isNaN(Number(data.latitud)) ||
        data.longitud === undefined || data.longitud === null || isNaN(Number(data.longitud))) {
      setFormError('Por favor ubica el evento en el mapa interactivo para generar las coordenadas de geolocalización obligatorias.');
      return;
    }

    if (Number(data.latitud) < -90 || Number(data.latitud) > 90 ||
        Number(data.longitud) < -180 || Number(data.longitud) > 180) {
      setFormError('Las coordenadas de latitud/longitud están en un rango inválido.');
      return;
    }

    try {
      const payload = {
        ...data,
        cupo: data.cupo ? parseInt(String(data.cupo), 10) : 0,
        latitud: parseFloat(String(data.latitud)),
        longitud: parseFloat(String(data.longitud))
      };

      if (editingEvent) {
        await EventService.update(editingEvent.id, payload);
      } else {
        await EventService.create(payload);
      }

      loadAll();
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Ocurrió un error al guardar el evento.');
    }
  };

  const handleOpenDelete = (id: string) => {
    setEventToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (eventToDelete) {
      await EventService.delete(eventToDelete);
      loadAll();
    }
  };

  const getOrgName = (orgId: string) => {
    return organizations.find(o => o.id === orgId)?.nombre || 'Organización';
  };

  const filteredEvents = events.filter(e => 
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Gestión de Eventos</h1>
          <p className="text-xs text-neutral-500 mt-1">Supervisa y autoriza campañas de reforestación, comedores y soporte social.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Crear Evento
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 p-4 rounded shadow-xs">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por evento, categoría..." />
      </div>

      <Table<Evento>
        headers={['Campaña', 'Categoría', 'ONG Responsable', 'Fecha', 'Estado', 'Acciones']}
        data={filteredEvents}
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-neutral-50">
            <td className="px-5 py-3">
              <p className="font-semibold text-neutral-900">{item.nombre}</p>
              <p className="text-[10px] text-neutral-500 line-clamp-1">{item.descripcion}</p>
            </td>
            <td className="px-5 py-3 text-xs text-neutral-600">{item.categoria}</td>
            <td className="px-5 py-3 text-xs text-neutral-600 font-medium">{getOrgName(item.organizacionId)}</td>
            <td className="px-5 py-3 text-xs text-neutral-600">{formatDate(item.fecha)}</td>
            <td className="px-5 py-3 text-xs">
              <Badge variant={item.estado === 'activo' ? 'success' : 'neutral'}>
                {item.estado}
              </Badge>
            </td>
            <td className="px-5 py-3 text-xs flex gap-2">
              <button onClick={() => handleOpenEdit(item)} className="p-1 rounded text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleOpenDelete(item.id)} className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? '📝 Editar Evento de Voluntariado' : '✨ Crear Convocatoria / Campaña'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl font-bold px-5"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              form="event-form" 
              variant="primary" 
              size="sm"
              className="rounded-xl font-bold px-6 bg-red-600 hover:bg-red-700 text-white border-0 shadow-xs shadow-red-600/10"
            >
              {editingEvent ? 'Guardar Cambios' : 'Crear Convocatoria'}
            </Button>
          </div>
        }
      >
        <form id="event-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-h-[60vh] overflow-y-auto px-1 pr-2">
          {formError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-xs text-red-700 rounded-xl font-bold flex items-center gap-2">
              <span>⚠️</span> {formError}
            </div>
          )}

          {/* Sección 1: Información General */}
          <div className="space-y-4 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-150 shadow-2xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200/60 pb-2 mb-3">
              <span>📋</span> Información General de la Campaña
            </h4>
            
            <Input
              label="Título del Evento / Campaña *"
              error={errors.nombre?.message}
              {...register('nombre', { required: 'El título es obligatorio' })}
              placeholder="Ej. Reforestación Parque Simón Bolívar"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Organización Organizadora *"
                options={organizations.map(o => ({ value: o.id, label: o.nombre }))}
                {...register('organizacionId')}
              />

              <Select
                label="Categoría Temática *"
                options={categories.map(c => ({ value: c.nombre, label: c.nombre }))}
                {...register('categoria')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                type="date"
                label="Fecha Programada *"
                error={errors.fecha?.message}
                {...register('fecha', { required: 'La fecha es obligatoria' })}
              />

              <Select
                label="Estado de la Campaña *"
                options={[
                  { value: 'activo', label: 'Activo / Abierto' },
                  { value: 'finalizado', label: 'Finalizado' },
                  { value: 'cancelado', label: 'Cancelado' },
                ]}
                {...register('estado')}
              />

              <Input
                type="number"
                label="Cupo de Voluntarios (0 para ilimitado)"
                error={errors.cupo?.message}
                {...register('cupo')}
                placeholder="Ej. 25"
              />
            </div>

            <Textarea
              label="Descripción detallada *"
              error={errors.descripcion?.message}
              {...register('descripcion', { required: 'La descripción es obligatoria' })}
              placeholder="Escribe los detalles de la labor, qué deben llevar los voluntarios, etc."
              rows={4}
            />
          </div>

          {/* Sección 2: Imagen del Evento */}
          <div className="bg-neutral-50/50 p-5 rounded-2xl border border-neutral-150 space-y-4 shadow-2xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200/60 pb-2 mb-2">
              <span>🖼️</span> Imagen Ilustrativa del Evento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <Input
                  label="Enlace / URL de Imagen"
                  placeholder="https://images.unsplash.com/... o pega cualquier URL"
                  {...register('imagen')}
                />
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest">O selecciona un archivo local</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-neutral-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white hover:file:bg-red-700 cursor-pointer border border-neutral-200 rounded-xl p-1 bg-white shadow-3xs"
                  />
                </div>
              </div>

              <div className="border border-dashed border-neutral-300 rounded-2xl p-4 bg-white flex flex-col items-center justify-center min-h-[140px] overflow-hidden relative shadow-3xs">
                {watchedImagen ? (
                  <div className="w-full text-center space-y-2">
                    <img 
                      src={watchedImagen} 
                      alt="Previsualización" 
                      className="max-h-[100px] mx-auto object-cover rounded-xl w-full shadow-3xs" 
                      referrerPolicy="no-referrer" 
                    />
                    <button
                      type="button"
                      onClick={() => setValue('imagen', '')}
                      className="text-[10px] font-black text-red-600 hover:text-red-700 uppercase tracking-wider block mx-auto cursor-pointer"
                    >
                      Remover Imagen
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-neutral-400 p-2">
                    <p className="text-2xl">📷</p>
                    <span className="text-[10px] font-extrabold block mt-1 uppercase tracking-wider text-neutral-500">Sin imagen</span>
                    <span className="text-[9px] text-neutral-400 block mt-0.5">Se usará un banner automático por categoría</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección 3: Ubicación */}
          <div className="space-y-5 bg-neutral-50/50 p-5 rounded-2xl border border-neutral-150 shadow-2xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800 flex items-center gap-1.5 border-b border-neutral-200/60 pb-2 mb-2">
              <span>📍</span> Ubicación y Geolocalización
            </h4>
            
            {/* Embedded map location picker */}
            <LocationPicker
              lat={watchedLat}
              lng={watchedLng}
              initialSearchTerm={watchedDireccion}
              onChange={handleLocationChange}
            />

            {/* Address Form Fields */}
            <Input
              label="Dirección Completa *"
              error={errors.direccion?.message}
              {...register('direccion', { required: 'La dirección completa es obligatoria' })}
              placeholder="Ej. Calle 26 # 50-00"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Barrio *"
                error={errors.barrio?.message}
                {...register('barrio', { required: 'El barrio es obligatorio' })}
                placeholder="Ej. Ciudad Salitre"
              />

              <Input
                label="Localidad *"
                error={errors.localidad?.message}
                {...register('localidad', { required: 'La localidad es obligatoria' })}
                placeholder="Ej. Fontibón"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Ciudad *"
                error={errors.ciudad?.message}
                {...register('ciudad', { required: 'La ciudad es obligatoria' })}
              />

              <Input
                label="Departamento *"
                error={errors.departamento?.message}
                {...register('departamento', { required: 'El departamento es obligatorio' })}
              />

              <Input
                label="País *"
                error={errors.pais?.message}
                {...register('pais', { required: 'El país es obligatorio' })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre del Lugar (Opcional)"
                {...register('nombre_lugar')}
                placeholder="Ej. Parque Simón Bolívar - Zona 3"
              />

              <Input
                label="Punto de Referencia (Opcional)"
                {...register('punto_referencia')}
                placeholder="Ej. Al lado de la concha acústica"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 bg-neutral-100 p-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-600 font-mono">
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-wider">Latitud (Generada en Mapa)</label>
                <input
                  type="text"
                  readOnly
                  className="bg-transparent border-none p-0 m-0 w-full font-mono text-neutral-850 font-bold outline-none focus:ring-0 select-all"
                  {...register('latitud')}
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-wider">Longitud (Generada en Mapa)</label>
                <input
                  type="text"
                  readOnly
                  className="bg-transparent border-none p-0 m-0 w-full font-mono text-neutral-850 font-bold outline-none focus:ring-0 select-all"
                  {...register('longitud')}
                />
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Evento"
        message="¿Está seguro de eliminar esta campaña de voluntariado? Todos los registros de asistencia de los voluntarios se borrarán permanentemente."
      />
    </div>
  );
};

/**
 * ==========================================
 * 5. ADMIN DONATIONS
 * ==========================================
 */
export const AdminDonations: React.FC = () => {
  const [donations, setDonations] = useState<DonacionCompleta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<DonacionCompleta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDonations();
  }, []);

  async function loadDonations() {
    const list = await DonationService.getAll();
    setDonations(list);
  }

  const handleOpenDetails = (don: DonacionCompleta) => {
    setSelectedDonation(don);
    setIsModalOpen(true);
  };

  const filteredDonations = donations.filter(d => 
    d.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.organizacionNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Historial de Donaciones</h1>
        <p className="text-xs text-neutral-500 mt-1">Supervisa y verifica todas las aportaciones económicas y de insumos.</p>
      </div>

      <div className="bg-white border border-neutral-200 p-4 rounded shadow-xs">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Buscar por donante, ONG, categoría..." />
      </div>

      {filteredDonations.length === 0 ? (
        <EmptyState
          title="No se encontraron donaciones"
          description="Intente ajustar el criterio de búsqueda o registre una nueva donación pública."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonations.map((don) => (
            <DonationCard
              key={don.id}
              donation={don}
              onViewDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}

      <DonationDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDonation(null);
        }}
        donation={selectedDonation}
      />
    </div>
  );
};

/**
 * ==========================================
 * 6. ADMIN CATEGORIES
 * ==========================================
 */
export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Categoria | null>(null);

  // Confirm
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [catToDelete, setCatToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<Omit<Categoria, 'id'>>();

  useEffect(() => {
    loadCats();
  }, []);

  async function loadCats() {
    const list = await CategoryService.getAll();
    setCategories(list);
  }

  const handleOpenCreate = () => {
    setEditingCat(null);
    reset({ nombre: '', descripcion: '', estado: 'activo' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Categoria) => {
    setEditingCat(cat);
    setValue('nombre', cat.nombre);
    setValue('descripcion', cat.descripcion);
    setValue('estado', cat.estado);
    setIsModalOpen(true);
  };

  const onSubmit = async (data: Omit<Categoria, 'id'>) => {
    if (editingCat) {
      await CategoryService.update(editingCat.id, data);
    } else {
      await CategoryService.create(data);
    }
    loadCats();
    setIsModalOpen(false);
  };

  const handleOpenDelete = (id: string) => {
    setCatToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (catToDelete) {
      await CategoryService.delete(catToDelete);
      loadCats();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Gestión de Categorías</h1>
          <p className="text-xs text-neutral-500 mt-1">Administra las etiquetas operativas de los eventos y donaciones.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Registrar Categoría
        </Button>
      </div>

      <Table<Categoria>
        headers={['ID', 'Categoría', 'Descripción', 'Estado', 'Acciones']}
        data={categories}
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-neutral-50">
            <td className="px-5 py-3 text-xs font-mono text-neutral-400">{item.id}</td>
            <td className="px-5 py-3 font-semibold text-neutral-950">{item.nombre}</td>
            <td className="px-5 py-3 text-xs text-neutral-600 max-w-sm">{item.descripcion}</td>
            <td className="px-5 py-3 text-xs">
              <Badge variant={item.estado === 'activo' ? 'success' : 'neutral'}>
                {item.estado}
              </Badge>
            </td>
            <td className="px-5 py-3 text-xs flex gap-2">
              <button onClick={() => handleOpenEdit(item)} className="p-1 rounded text-neutral-500 hover:text-neutral-950 hover:bg-neutral-100">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleOpenDelete(item.id)} className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </button>
            </td>
          </tr>
        )}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCat ? 'Editar Categoría' : 'Crear Nueva Categoría'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nombre de Categoría"
            error={errors.nombre?.message}
            {...register('nombre', { required: 'El nombre es requerido' })}
          />

          <Textarea
            label="Descripción General"
            error={errors.descripcion?.message}
            {...register('descripcion', { required: 'La descripción es requerida' })}
          />

          <Select
            label="Estado"
            options={[
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' },
            ]}
            {...register('estado')}
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Guardar Categoría
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        message="¿Está seguro de eliminar esta categoría del sistema?"
      />
    </div>
  );
};
