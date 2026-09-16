import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { EventService, DonationService, DonacionCompleta } from '../../services/db';
import { Evento, Usuario } from '../../types';
import { Button, Input, Card, Table, Badge, Alert, EmptyState, ConfirmDialog, formatCOP, formatDate } from '../../components/UI';
import { Calendar, Heart, Award, ShieldCheck, User, Trash2, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DonationCard } from '../../components/DonationCard';
import { DonationDetailsModal } from '../../components/DonationDetailsModal';

/**
 * ==========================================
 * 1. VOLUNTEER DASHBOARD
 * ==========================================
 */
export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState<Evento[]>([]);
  const [myDonations, setMyDonations] = useState<DonacionCompleta[]>([]);

  useEffect(() => {
    if (!user) return;
    async function loadData() {
      const evts = await EventService.getEventsByVolunteer(user.id);
      setMyEvents(evts);

      const dons = await DonationService.getByVolunteer(user.id);
      setMyDonations(dons);
    }
    loadData();
  }, [user]);

  const totalEcon = myDonations
    .filter(d => d.tipo === 'monetaria' && d.monetaria)
    .reduce((sum, d) => sum + (d.monetaria?.valor || 0), 0);

  // Estimación de horas comunitarias (~4 horas promedio por jornada)
  const estimatedHours = myEvents.length * 4;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-neutral-900 via-neutral-850 to-neutral-950 text-white p-6 rounded-2xl shadow-md border border-neutral-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-brand text-xs font-black uppercase tracking-wider">
            <Award className="w-4 h-4 text-red-500" />
            <span>Comunidad Voluntaria Give&amp;Go</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            ¡Hola, {user?.nombre1}! Gracias por aportar tu tiempo y corazón.
          </h1>
          <p className="text-xs text-neutral-400 max-w-xl leading-relaxed">
            Aquí puedes visualizar tu impacto comunitario en la localidad de Kennedy, consultar tus eventos agendados y revisar tu historial de donaciones.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/events">
            <Button variant="primary" size="sm" className="bg-brand hover:bg-brand-hover text-white font-bold shadow-sm">
              <Calendar className="w-4 h-4 mr-1.5" />
              Explorar Eventos
            </Button>
          </Link>
          <Link to="/donations">
            <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold">
              <Heart className="w-4 h-4 mr-1.5 text-red-400" />
              Realizar Aporte
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de Métricas de Voluntariado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Eventos Inscritos */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Eventos Inscritos</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{myEvents.length}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Jornadas activas agendadas</p>
          </div>
        </div>

        {/* Metric 2: Horas de Voluntariado */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Horas de Voluntariado</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">~{estimatedHours} hrs</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Tiempo donado estimado</p>
          </div>
        </div>

        {/* Metric 3: Donado Económico */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Donaciones Económicas</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{formatCOP(totalEcon)}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Aportes monetarios confirmados</p>
          </div>
        </div>

        {/* Metric 4: Certificados y Reconocimientos */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Insignias &amp; Certificados</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-1.5">
              <Badge variant="warning">Voluntario Activo</Badge>
              {myDonations.length > 0 && <Badge variant="success">Donante</Badge>}
            </div>
            <p className="text-[11px] font-medium text-neutral-500 mt-2">Reconocimiento social en Kennedy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximos Eventos */}
        <Card 
          title="Mis Próximas Campañas"
          subtitle="Jornadas de apoyo donde tienes cupo reservado"
          headerAction={
            <Link to="/volunteer/events">
              <Button variant="outline" size="sm" className="font-bold text-xs">
                Ver Todo el Listado
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {myEvents.length === 0 ? (
              <EmptyState
                title="Aún no te has inscrito en eventos"
                description="Explora las causas activas en Kennedy e inscríbete para transformar vidas."
                actionText="Buscar Eventos Disponibles"
                onAction={() => window.location.href = '/events'}
              />
            ) : (
              myEvents.map((evt) => (
                <div key={evt.id} className="p-4 bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-xl transition-colors flex justify-between items-center gap-3">
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-neutral-900 text-sm leading-snug">{evt.nombre}</h4>
                    <p className="text-xs text-neutral-500 flex items-center gap-2">
                      <span>Causa: <strong className="text-neutral-700">{evt.categoria}</strong></span>
                      <span>•</span>
                      <span>Fecha: <strong className="text-neutral-700">{formatDate(evt.fecha)}</strong></span>
                    </p>
                  </div>
                  <Badge variant="success">Inscrito</Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Historial Donaciones */}
        <Card 
          title="Mi Historial de Donaciones"
          subtitle="Últimos aportes benéficos registrados a organizaciones"
          headerAction={
            <Link to="/donations">
              <Button variant="primary" size="sm" className="bg-brand font-bold text-xs">
                Realizar Donación
              </Button>
            </Link>
          }
        >
          <div className="space-y-3">
            {myDonations.length === 0 ? (
              <EmptyState
                title="Sin donaciones registradas"
                description="Tu apoyo económico o en especie hace posible que las fundaciones sigan operando."
                actionText="Hacer una Donación"
                onAction={() => window.location.href = '/donations'}
              />
            ) : (
              myDonations.slice(0, 4).map((don) => (
                <div key={don.id} className="p-4 bg-neutral-50/80 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-xl transition-colors flex justify-between items-center gap-3">
                  <div className="space-y-1">
                    <p className="font-extrabold text-neutral-900 text-sm">
                      Donación {don.tipo === 'monetaria' ? 'Económica' : 'de Objeto/Especie'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Hacia: <strong className="text-neutral-700">{don.organizacionNombre}</strong> el {formatDate(don.fecha)}
                    </p>
                  </div>
                  <span className="font-black text-brand text-sm shrink-0">
                    {don.tipo === 'monetaria' ? `+${formatCOP(don.monetaria?.valor || 0)}` : `${don.objeto?.cantidad} u.`}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * ==========================================
 * 2. VOLUNTEER PROFILE
 * ==========================================
 */
export const VolunteerProfile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Partial<Usuario>>({
    defaultValues: {
      nombre1: user?.nombre1 || '',
      nombre2: user?.nombre2 || '',
      apellido1: user?.apellido1 || '',
      apellido2: user?.apellido2 || '',
      telefono: user?.telefono || '',
      correo: user?.correo || '',
      password: user?.password || '',
    }
  });

  const onSubmit = async (data: Partial<Usuario>) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const result = await updateProfile(data);
    if (result.success) {
      setSuccessMsg('Tu perfil ha sido actualizado con éxito.');
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al actualizar el perfil.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Mi Perfil</h1>
        <p className="text-xs text-neutral-500 mt-1">Mantén tus datos personales y credenciales de acceso actualizados.</p>
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {errorMsg && <Alert type="danger" message={errorMsg} />}

      <Card title="Datos de la Cuenta">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primer Nombre"
              error={errors.nombre1?.message}
              {...register('nombre1', { required: 'El primer nombre es requerido' })}
            />
            <Input
              label="Segundo Nombre (Opcional)"
              {...register('nombre2')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Primer Apellido"
              error={errors.apellido1?.message}
              {...register('apellido1', { required: 'El primer apellido es requerido' })}
            />
            <Input
              label="Segundo Apellido (Opcional)"
              {...register('apellido2')}
            />
          </div>

          <Input
            label="Número de Teléfono"
            error={errors.telefono?.message}
            {...register('telefono', { required: 'El número de teléfono es obligatorio' })}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100">
            <Input
              label="Correo Electrónico"
              type="email"
              error={errors.correo?.message}
              {...register('correo', { required: 'El correo electrónico es requerido' })}
            />

            <Input
              label="Establecer Nueva Contraseña"
              type="password"
              error={errors.password?.message}
              {...register('password', { required: 'La contraseña no puede quedar en blanco' })}
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Actualizar Perfil
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

/**
 * ==========================================
 * 3. VOLUNTEER EVENTS
 * ==========================================
 */
export const VolunteerEvents: React.FC = () => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<Evento[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    loadMyEvents();
  }, [user]);

  async function loadMyEvents() {
    if (!user) return;
    const list = await EventService.getEventsByVolunteer(user.id);
    setRegisteredEvents(list);
  }

  const handleOpenCancel = (evtId: string) => {
    setSelectedEventId(evtId);
    setIsConfirmOpen(true);
  };

  const handleCancelRegistration = async () => {
    if (user && selectedEventId) {
      await EventService.unregisterParticipant(selectedEventId, user.id);
      loadMyEvents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Mis Eventos de Voluntariado</h1>
          <p className="text-xs text-neutral-500 mt-1">Revisa el listado de campañas activas donde has confirmado asistencia.</p>
        </div>
        <Link to="/events">
          <Button variant="primary" size="sm">
            Buscar Nuevos Eventos
          </Button>
        </Link>
      </div>

      <Table<Evento>
        headers={['Campaña', 'Categoría', 'Fecha', 'Estado', 'Acciones']}
        data={registeredEvents}
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-neutral-50">
            <td className="px-5 py-3">
              <span className="font-semibold text-neutral-900">{item.nombre}</span>
              <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{item.descripcion}</p>
            </td>
            <td className="px-5 py-3 text-xs text-neutral-600">{item.categoria}</td>
            <td className="px-5 py-3 text-xs text-neutral-600">{formatDate(item.fecha)}</td>
            <td className="px-5 py-3 text-xs">
              <Badge variant="success">Suscrito</Badge>
            </td>
            <td className="px-5 py-3 text-xs">
              <button 
                onClick={() => handleOpenCancel(item.id)} 
                className="p-1.5 rounded text-red-600 hover:text-red-800 hover:bg-red-50 flex items-center gap-1 font-semibold"
              >
                <Trash2 className="w-4 h-4" />
                <span>Baja</span>
              </button>
            </td>
          </tr>
        )}
      />

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleCancelRegistration}
        title="Cancelar Inscripción de Voluntariado"
        message="¿Seguro de darte de baja en esta campaña? Al retirarte, el cupo quedará libre para otros voluntarios."
      />
    </div>
  );
};

/**
 * ==========================================
 * 4. VOLUNTEER DONATIONS
 * ==========================================
 */
export const VolunteerDonations: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonacionCompleta[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<DonacionCompleta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadDons() {
      const list = await DonationService.getByVolunteer(user.id);
      setDonations(list);
    }
    loadDons();
  }, [user]);

  const handleOpenDetails = (don: DonacionCompleta) => {
    setSelectedDonation(don);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Historial de Mis Donaciones</h1>
          <p className="text-xs text-neutral-500 mt-1">Consulta el detalle de todas tus aportaciones benéficas.</p>
        </div>
        <Link to="/donations">
          <Button variant="primary" size="sm">
            Realizar Nueva Donación
          </Button>
        </Link>
      </div>

      {donations.length === 0 ? (
        <EmptyState
          title="No tienes donaciones registradas"
          description="Cada grano de arena cuenta. Tu generosidad puede cambiar vidas en Kennedy. ¡Anímate a realizar tu primera donación!"
          action={
            <Link to="/donations">
              <Button variant="primary">Hacer mi primera donación</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((don) => (
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
