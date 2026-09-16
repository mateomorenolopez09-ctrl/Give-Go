import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { EventService, PostulacionService } from '../../services/db';
import { Evento, Postulacion } from '../../types';
import { Button, Card, Badge, Modal, ConfirmDialog, Textarea, Alert, EmptyState, formatDate } from '../../components/UI';
import { HeartHandshake, Calendar, MapPin, Building, CheckCircle, Clock, XCircle, AlertCircle, Info, ChevronRight } from 'lucide-react';

export const BeneficiaryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'explorar' | 'mis_postulaciones'>('explorar');
  const [events, setEvents] = useState<Evento[]>([]);
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para postularse a un evento
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);

  // Modal para confirmar asistencia o retirar postulación
  const [isConfirmCancelOpen, setIsConfirmCancelOpen] = useState(false);
  const [postulacionToCancel, setPostulacionToCancel] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    try {
      const allEvents = await EventService.getAll();
      const activeEvts = allEvents.filter(e => e.estado === 'activo');
      setEvents(activeEvts);

      const userPostulaciones = await PostulacionService.getByUser(user.id, 'beneficiario');
      setPostulaciones(userPostulaciones);
    } catch (err) {
      console.error('Error al cargar datos del beneficiario:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenApplyModal = (evento: Evento) => {
    setSelectedEvent(evento);
    setObservaciones('');
    setApplyError(null);
    setApplySuccess(null);
    setIsApplyModalOpen(true);
  };

  const handleApplyToEvent = async () => {
    if (!user || !selectedEvent) return;
    setApplying(true);
    setApplyError(null);

    try {
      const res = await PostulacionService.create({
        id_evento: selectedEvent.id,
        id_usuario: user.id,
        tipo_postulacion: 'beneficiario',
        observaciones: observaciones.trim() || 'Postulación registrada por el beneficiario.'
      });

      if (res?.success) {
        setApplySuccess('¡Tu postulación ha sido enviada exitosamente! La organización revisará tu solicitud.');
        await loadData();
        setTimeout(() => {
          setIsApplyModalOpen(false);
          setActiveTab('mis_postulaciones');
        }, 1200);
      } else {
        setApplyError(res?.message || 'No se pudo registrar la postulación.');
      }
    } catch (err: any) {
      setApplyError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setApplying(false);
    }
  };

  const handleConfirmAttendance = async (postulacionId: string) => {
    try {
      await PostulacionService.updateStatus(postulacionId, 'confirmado', 'Asistencia confirmada por el beneficiario.');
      await loadData();
    } catch (err) {
      console.error('Error al confirmar asistencia:', err);
    }
  };

  const handleOpenCancel = (id: string) => {
    setPostulacionToCancel(id);
    setIsConfirmCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (postulacionToCancel) {
      try {
        await PostulacionService.delete(postulacionToCancel);
        await loadData();
      } catch (err) {
        console.error('Error al cancelar postulación:', err);
      } finally {
        setIsConfirmCancelOpen(false);
      }
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <Badge variant="success">Aprobado para Ayuda</Badge>;
      case 'confirmado':
        return <Badge variant="success">Asistencia Confirmada</Badge>;
      case 'rechazado':
        return <Badge variant="danger">No Aprobado</Badge>;
      case 'cancelado':
        return <Badge variant="neutral">Cancelado</Badge>;
      default:
        return <Badge variant="warning">En Revisión (Pendiente)</Badge>;
    }
  };

  const isAppliedToEvent = (eventoId: string) => {
    return postulaciones.some(p => String(p.eventoId) === String(eventoId));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Portal de Ayuda y Beneficios</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">
            Panel de Beneficiarios
          </h1>
          <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
            Postúlate a las jornadas y programas comunitarios de las organizaciones aliadas en la localidad de Kennedy para recibir apoyos nutricionales, de salud, educación y vestuario.
          </p>
        </div>

        {/* Pestanas de Navegacion Principal */}
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveTab('explorar')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'explorar'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Jornadas Disponibles
          </button>
          <button
            onClick={() => setActiveTab('mis_postulaciones')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'mis_postulaciones'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Mis Postulaciones</span>
            {postulaciones.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
                {postulaciones.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards Summary for Beneficiaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Total Postulaciones</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{postulaciones.length}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Convocatorias solicitadas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Ayudas Aprobadas</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-700">
              {postulaciones.filter(p => p.estado === 'aprobado' || p.estado === 'confirmado').length}
            </p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Cupos asignados con éxito</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">En Revisión</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-amber-600">
              {postulaciones.filter(p => p.estado === 'pendiente').length}
            </p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Solicitudes en evaluación</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Jornadas Disponibles</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{events.length}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Convocatorias activas en Kennedy</p>
          </div>
        </div>
      </div>

      {/* VISTA 1: EXPLORAR EVENTOS Y JORNADAS */}
      {activeTab === 'explorar' && (
        <div className="space-y-6">
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-900">
            <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950 mb-0.5">¿Cómo funciona la postulación a eventos?</p>
              <p className="text-emerald-800 leading-relaxed">
                Las organizaciones publican sus convocatorias comunitarias detallando los cupos y el tipo de ayuda a entregar (alimentos, útiles, medicamentos, etc.). Haz clic en <strong>"Postularme para recibir ayuda"</strong> en el evento de tu interés para registrar tu solicitud directamente.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <EmptyState
              title="Sin Jornadas Activas"
              description="Actualmente no hay jornadas o programas activos programados por las organizaciones comunitarias en la zona. Revisa nuevamente pronto."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
              {events.map((evt, idx) => {
                const applied = isAppliedToEvent(evt.id);
                const userPostulacion = postulaciones.find(p => String(p.eventoId) === String(evt.id));

                return (
                  <Card key={evt.id ? `evt_${evt.id}_${idx}` : `evt_idx_${idx}`} className="flex flex-col justify-between overflow-hidden border border-neutral-200 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md">
                    <div>
                      {/* Imagen o encabezado del evento */}
                      {evt.imagen ? (
                        <div className="h-40 w-full overflow-hidden relative">
                          <img src={evt.imagen} alt={evt.nombre} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-neutral-800 shadow">
                            {evt.categoria || 'Comunitario'}
                          </div>
                        </div>
                      ) : (
                        <div className="h-28 bg-emerald-900/10 p-4 flex items-end justify-between border-b border-neutral-100">
                          <span className="bg-white px-2.5 py-1 rounded-full text-[11px] font-bold text-emerald-900 shadow-sm">
                            {evt.categoria || 'Comunitario'}
                          </span>
                        </div>
                      )}

                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-extrabold text-neutral-900 text-base leading-snug">
                            {evt.nombre}
                          </h3>
                        </div>

                        {/* Organización organizadora */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                          <Building className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Organización: {evt.organizacionId ? `Organización #${evt.organizacionId}` : 'Aliado Give&Go'}</span>
                        </div>

                        {/* Ayuda ofrecida */}
                        {evt.ayudaOfrecida && (
                          <div className="bg-neutral-50 rounded-lg p-3 border border-neutral-200/80 text-xs text-neutral-800">
                            <span className="font-bold text-emerald-900 block mb-0.5">
                              🎁 Ayuda / Beneficio Ofrecido:
                            </span>
                            <p className="text-neutral-700 leading-normal">{evt.ayudaOfrecida}</p>
                          </div>
                        )}

                        <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                          {evt.descripcion}
                        </p>

                        <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-xs text-neutral-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span>{formatDate(evt.fecha)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                            <span className="truncate">{evt.direccion || evt.barrio || 'Kennedy, Bogotá D.C.'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      {applied ? (
                        <div className="bg-neutral-100 p-3 rounded-lg border border-neutral-200 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                            <span>Ya estás postulado a este evento</span>
                          </div>
                          <button
                            onClick={() => setActiveTab('mis_postulaciones')}
                            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold flex items-center"
                          >
                            Ver Estado <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          className="w-full justify-center bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                          onClick={() => handleOpenApplyModal(evt)}
                        >
                          <HeartHandshake className="w-4 h-4 mr-2" />
                          Postularme para Recibir Ayuda
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: MIS POSTULACIONES A EVENTOS */}
      {activeTab === 'mis_postulaciones' && (
        <div className="space-y-6">
          {postulaciones.length === 0 ? (
            <EmptyState
              title="Aún no tienes postulaciones"
              description="No te has postulado a ninguna jornada comunitaria. Revisa las jornadas disponibles en Kennedy y envía tu primera postulación."
              actionText="Ver Jornadas Disponibles"
              onAction={() => setActiveTab('explorar')}
            />
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-neutral-900">
                Historial de Postulaciones a Jornadas
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {postulaciones.map((post, idx) => (
                  <Card key={post.id ? `post_${post.id}_${idx}` : `post_idx_${idx}`} className="p-5 border border-neutral-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-neutral-100 pb-3">
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-neutral-400 block mb-0.5">
                          Postulación #{post.id}
                        </span>
                        <h3 className="font-extrabold text-neutral-900 text-base">
                          {post.eventoNombre || `Evento #${post.eventoId}`}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Organización: {post.organizacionNombre || 'Organización aliada'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        {getStatusBadge(post.estadoPostulacion)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="font-bold text-neutral-700 block">📅 Fecha del Evento:</span>
                        <p className="text-neutral-600">{formatDate(post.eventoFecha || post.fechaPostulacion)}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-neutral-700 block">📍 Dirección / Sede:</span>
                        <p className="text-neutral-600">{post.eventoDireccion || 'Kennedy Central, Bogotá'}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-neutral-700 block">🎁 Beneficio Ofrecido:</span>
                        <p className="text-neutral-600">{post.ayudaOfrecida || 'Entrega de apoyo comunitario'}</p>
                      </div>
                    </div>

                    {post.observaciones && (
                      <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs">
                        <span className="font-bold text-neutral-800 block mb-0.5">Notas del caso / Respuesta:</span>
                        <p className="text-neutral-700 italic">{post.observaciones}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-neutral-100 flex-wrap gap-2 text-xs">
                      <span className="text-neutral-400 font-medium">
                        Fecha de postulación: {formatDate(post.fechaPostulacion)}
                      </span>

                      <div className="flex items-center gap-2">
                        {post.estadoPostulacion === 'aprobado' && (
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-700 hover:bg-emerald-800"
                            onClick={() => handleConfirmAttendance(post.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" />
                            Confirmar mi Asistencia
                          </Button>
                        )}

                        {['pendiente', 'aprobado'].includes(post.estadoPostulacion) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleOpenCancel(post.id)}
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Retirar Postulación
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal para realizar la postulación */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Postulación a Jornada de Ayuda"
      >
        {selectedEvent && (
          <div className="space-y-4 text-xs">
            {applyError && <Alert variant="danger">{applyError}</Alert>}
            {applySuccess && <Alert variant="success">{applySuccess}</Alert>}

            <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-black text-emerald-950 text-sm">{selectedEvent.nombre}</h4>
              <p className="text-emerald-900 leading-relaxed">{selectedEvent.descripcion}</p>
              
              {selectedEvent.ayudaOfrecida && (
                <div className="pt-2 border-t border-emerald-200/80 font-bold text-emerald-900">
                  🎁 Ayuda a recibir: {selectedEvent.ayudaOfrecida}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-800 mb-1">
                ¿Deseas agregar alguna observación o detalle para la organización? (Opcional)
              </label>
              <Textarea
                rows={3}
                placeholder="Indica el número de personas en tu grupo familiar, alguna condición especial o teléfono de contacto adicional..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-neutral-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsApplyModalOpen(false)}
                disabled={applying}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800"
                onClick={handleApplyToEvent}
                isLoading={applying}
              >
                Confirmar Postulación
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Diálogo de Confirmación para Cancelar/Retirar Postulación */}
      <ConfirmDialog
        isOpen={isConfirmCancelOpen}
        onClose={() => setIsConfirmCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Retirar Postulación a Evento"
        message="¿Estás seguro de que deseas retirar tu postulación a esta jornada? La organización liberará el espacio para otros miembros de la comunidad."
      />
    </div>
  );
};
