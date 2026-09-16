import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { EventService, DonationService, CategoryService, PostulacionService, DonacionCompleta, VerificationService } from '../../services/db';
import { Evento, Usuario, Categoria, Postulacion, SolicitudVerificacion } from '../../types';
import { Button, Input, Select, Card, Table, Badge, Modal, ConfirmDialog, Textarea, EmptyState, Alert, formatCOP, formatDate } from '../../components/UI';
import { UserLink } from '../../components/UserLink';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { Calendar, Heart, Users, Plus, Edit, Trash2, Mail, Phone, Box, CheckCircle, XCircle, HeartHandshake, Eye, Sparkles, Globe, Edit3, ExternalLink, BadgeCheck, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LocationPicker } from '../../components/LocationPicker';
import { DonationCard } from '../../components/DonationCard';
import { DonationDetailsModal } from '../../components/DonationDetailsModal';

const isMyOrgEvent = (evtOrgId: string, u: any): boolean => {
  if (!u) return false;
  const cleanEvt = String(evtOrgId || '').replace('org_', '').replace('usr_', '');
  const cleanUserId = String(u.id || '').replace('org_', '').replace('usr_', '');
  const cleanOrgId = u.organizacionId ? String(u.organizacionId).replace('org_', '').replace('usr_', '') : '';
  const cleanIdOrg = u.id_organizacion ? String(u.id_organizacion) : '';
  return cleanEvt === cleanUserId || (cleanOrgId !== '' && cleanEvt === cleanOrgId) || (cleanIdOrg !== '' && cleanEvt === cleanIdOrg) || evtOrgId === u.id || evtOrgId === u.organizacionId;
};

/**
 * ==========================================
 * 1. ORGANIZATION DASHBOARD
 * ==========================================
 */
export const OrgDashboard: React.FC = () => {
  const { user } = useAuth();
  const [eventsCount, setEventsCount] = useState(0);
  const [receivedDonations, setReceivedDonations] = useState<DonacionCompleta[]>([]);
  const [volunteersCount, setVolunteersCount] = useState(0);
  const [beneficiariosCount, setBeneficiariosCount] = useState(0);
  const [recentBeneficiarios, setRecentBeneficiarios] = useState<Postulacion[]>([]);
  const [recentVolunteers, setRecentVolunteers] = useState<VolunteerAssoc[]>([]);

  // Estado de Verificación
  const [verificationStatus, setVerificationStatus] = useState<'no_solicitado' | 'pendiente' | 'aprobada' | 'rechazada'>('no_solicitado');
  const [isVerified, setIsVerified] = useState(false);
  const [activeReq, setActiveReq] = useState<SolicitudVerificacion | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [reqNit, setReqNit] = useState('');
  const [reqMensaje, setReqMensaje] = useState('');
  const [reqDocs, setReqDocs] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    async function loadStats() {
      // Cargar estado de verificación
      const orgIdToUse = (user as any)?.organizacionId || user?.id;
      try {
        const verStatus = await VerificationService.getOrgStatus(orgIdToUse);
        setIsVerified(Boolean(verStatus.verificada));
        setVerificationStatus(verStatus.estadoVerificacion || 'no_solicitado');
        if (verStatus.activeRequest) {
          setActiveReq(verStatus.activeRequest);
        }
      } catch (err) {
        console.error('Error cargando verificación:', err);
      }

      // Filtrar eventos de esta organización
      const allEvents = await EventService.getAll();
      const orgEvents = allEvents.filter(e => isMyOrgEvent(e.organizacionId, user));
      setEventsCount(orgEvents.length);

      // Filtrar donaciones recibidas
      const dons = await DonationService.getByOrganization(orgIdToUse);
      setReceivedDonations(dons);

      // Cargar voluntarios inscritos y postulados
      const volPost = await PostulacionService.getByOrganization(orgIdToUse, 'voluntario');
      const volList: VolunteerAssoc[] = [];
      const seenVolKeys = new Set<string>();

      volPost.forEach(p => {
        const key = `${p.eventoId}_${p.usuarioId}`;
        seenVolKeys.add(key);
        volList.push({
          id: p.id || key,
          nombre: p.usuarioNombre || `Voluntario #${p.usuarioId}`,
          correo: p.usuarioCorreo || 'Sin correo',
          telefono: p.usuarioTelefono || 'Sin teléfono',
          eventoNombre: p.eventoNombre || `Evento #${p.eventoId}`
        });
      });

      for (const evt of orgEvents) {
        const parts = await EventService.getParticipants(evt.id);
        parts.forEach(p => {
          const key = `${evt.id}_${p.id}`;
          if (!seenVolKeys.has(key)) {
            seenVolKeys.add(key);
            volList.push({
              id: key,
              nombre: [p.nombre1, p.nombre2, p.apellido1, p.apellido2].filter(Boolean).join(' ') || p.correo || `Voluntario #${p.id}`,
              correo: p.correo,
              telefono: p.telefono,
              eventoNombre: evt.nombre,
            });
          }
        });
      }
      setVolunteersCount(volList.length);
      setRecentVolunteers(volList.slice(0, 4));

      // Cargar beneficiarios postulados a mis eventos
      const benPost = await PostulacionService.getByOrganization(orgIdToUse, 'beneficiario');
      setBeneficiariosCount(benPost.length);
      setRecentBeneficiarios(benPost.slice(0, 4));
    }
    loadStats();
  }, [user]);

  const handleOpenVerificationModal = () => {
    setReqNit(user?.nit || '');
    setReqMensaje('');
    setReqDocs('');
    setIsVerificationModalOpen(true);
  };

  const handleSendVerificationRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const orgId = user.organizacionId || user.id;
    setReqSubmitting(true);
    try {
      const newReq = await VerificationService.requestVerification({
        organizacionId: orgId,
        nit: reqNit,
        mensaje: reqMensaje,
        documentos: reqDocs
      });
      setVerificationStatus('pendiente');
      setActiveReq(newReq);
      setIsVerificationModalOpen(false);
      setAlertMsg({
        type: 'success',
        text: '¡Solicitud enviada correctamente! El equipo de administración de Give&Go revisará tus datos.'
      });
    } catch (err: any) {
      setAlertMsg({
        type: 'error',
        text: err.message || 'Ocurrió un error al enviar la solicitud.'
      });
    } finally {
      setReqSubmitting(false);
    }
  };

  const totalFunds = receivedDonations
    .filter(d => d.tipo === 'monetaria' && d.monetaria)
    .reduce((sum, d) => sum + (d.monetaria?.valor || 0), 0);

  return (
    <div className="space-y-8">
      {alertMsg && (
        <Alert
          type={alertMsg.type}
          message={alertMsg.text}
          onClose={() => setAlertMsg(null)}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Panel Organizativo</h1>
            {isVerified && <VerifiedBadge showText size="sm" />}
          </div>
          <p className="text-xs text-neutral-500 mt-1">Administra tus causas sociales, revisa a tus voluntarios, aprueba beneficiarios y audita las donaciones recibidas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Botón de Verificación */}
          {isVerified ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold">
              <BadgeCheck className="w-4 h-4 text-blue-600 fill-blue-100 shrink-0" />
              <span>Verificada</span>
            </div>
          ) : (
            <Button
              variant={verificationStatus === 'pendiente' ? 'outline' : 'primary'}
              size="sm"
              disabled={verificationStatus === 'pendiente'}
              onClick={handleOpenVerificationModal}
              className={
                verificationStatus === 'pendiente'
                  ? 'border-amber-300 bg-amber-50 text-amber-800 cursor-not-allowed opacity-90 font-bold text-xs'
                  : 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs'
              }
            >
              <BadgeCheck className="w-4 h-4 mr-1.5" />
              {verificationStatus === 'pendiente'
                ? 'Solicitud Pendiente'
                : verificationStatus === 'rechazada'
                ? 'Volver a Solicitar Verificación'
                : 'Solicitar verificación'}
            </Button>
          )}

          <Link to="/profile?tab=perfil_publico">
            <Button variant="outline" size="sm" className="border-neutral-300 font-bold text-xs">
              <Sparkles className="w-4 h-4 mr-1.5 text-yellow-500" />
              Personalizar Perfil Público
            </Button>
          </Link>
          <Link to="/org/volunteers">
            <Button variant="primary" size="sm" className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs">
              <Users className="w-4 h-4 mr-1.5" />
              Ver Personas Vinculadas
            </Button>
          </Link>
        </div>
      </div>

      {/* Tarjeta Informativa del Estado de Verificación */}
      {!isVerified && (
        <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
          verificationStatus === 'pendiente'
            ? 'bg-amber-50/80 border-amber-200 text-amber-900'
            : verificationStatus === 'rechazada'
            ? 'bg-red-50/80 border-red-200 text-red-900'
            : 'bg-blue-50/80 border-blue-200 text-blue-900'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              verificationStatus === 'pendiente'
                ? 'bg-amber-100 text-amber-700'
                : verificationStatus === 'rechazada'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {verificationStatus === 'pendiente' ? (
                <Clock className="w-5 h-5 animate-spin-slow" />
              ) : verificationStatus === 'rechazada' ? (
                <AlertCircle className="w-5 h-5" />
              ) : (
                <BadgeCheck className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm flex items-center gap-2">
                {verificationStatus === 'pendiente'
                  ? 'Solicitud de Verificación en Revisión'
                  : verificationStatus === 'rechazada'
                  ? 'Solicitud de Verificación Rechazada'
                  : 'Verifica tu Organización en Give&Go'}
              </h3>
              <p className="text-xs opacity-90 leading-relaxed">
                {verificationStatus === 'pendiente'
                  ? 'Tu solicitud de verificación fue enviada al equipo de administración y se encuentra en proceso de validación.'
                  : verificationStatus === 'rechazada'
                  ? activeReq?.respuestaAdmin
                    ? `Nota del Administrador: "${activeReq.respuestaAdmin}". Puedes corregir la información y enviar una nueva solicitud.`
                    : 'Tu solicitud anterior no fue aprobada. Puedes volver a enviar tus datos corregidos para su evaluación.'
                  : 'Obtén la insignia de verificación oficial para destacar la legitimidad de tu fundación, inspirar más confianza en donantes y voluntarios y figurar prioritariamente.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 self-end md:self-center">
            <Button
              variant="primary"
              size="sm"
              disabled={verificationStatus === 'pendiente'}
              onClick={handleOpenVerificationModal}
              className={
                verificationStatus === 'pendiente'
                  ? 'bg-amber-200 text-amber-800 cursor-not-allowed font-bold text-xs'
                  : verificationStatus === 'rechazada'
                  ? 'bg-red-600 hover:bg-red-700 text-white font-bold text-xs'
                  : 'bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs'
              }
            >
              {verificationStatus === 'pendiente'
                ? 'Pendiente de Revisión'
                : verificationStatus === 'rechazada'
                ? 'Reenviar Solicitud'
                : 'Solicitar verificación'}
            </Button>
          </div>
        </div>
      )}

      {/* Banner de Personalización de Perfil Público */}
      <div className="bg-gradient-to-r from-red-900 via-neutral-900 to-black text-white rounded-2xl p-6 shadow-md border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-yellow-300 backdrop-blur-sm border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Perfil Público Institucional
          </div>
          <h2 className="text-lg font-black uppercase tracking-wider text-white">
            Personaliza tu Perfil Público Institucional
          </h2>
          <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
            Configura la imagen de portada, biografía, misión, visión, redes sociales y visibilidad de tu fundación para generar confianza en voluntarios y donantes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0 justify-center">
          <Link to="/profile?tab=perfil_publico">
            <button className="bg-white hover:bg-neutral-100 text-neutral-950 font-black border border-white shadow-xs text-xs px-4 py-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all">
              <Edit3 className="w-4 h-4 mr-1.5 text-red-600 shrink-0" />
              <span className="text-neutral-950 font-black">Personalizar Perfil</span>
            </button>
          </Link>
          <Link to={`/perfil/${user?.organizacionId || (user?.id.startsWith('org_') ? user?.id : `org_${user?.id}`)}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="border-white/40 text-white hover:bg-white/10 font-bold text-xs px-4 py-2.5">
              <Globe className="w-4 h-4 mr-1.5 text-red-400" />
              <span className="text-white font-bold">Ver mi Perfil en Vivo</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid de métricas de la ONG */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 select-none">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Causas Creadas</span>
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{eventsCount}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Campañas registradas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Beneficiarios</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-emerald-700">{beneficiariosCount}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Solicitudes recibidas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Voluntarios</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{volunteersCount}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Personas vinculadas</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider">Fondos Recibidos</span>
            <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-black text-neutral-900">{formatCOP(totalFunds)}</p>
            <p className="text-[11px] font-medium text-neutral-500 mt-0.5">Donaciones monetarias</p>
          </div>
        </div>
      </div>

      {/* Listado de Beneficiarios y Voluntarios Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Beneficiarios postulados recientemente */}
        <Card title="Últimos Beneficiarios Postulados">
          <div className="space-y-3">
            {recentBeneficiarios.length === 0 ? (
              <p className="text-xs text-neutral-400 italic text-center py-6">No hay postulaciones de beneficiarios aún.</p>
            ) : (
              recentBeneficiarios.map((post, idx) => (
                <div key={post.id ? `dash_ben_${post.id}` : `dash_ben_idx_${idx}`} className="flex justify-between items-center p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">{post.usuarioNombre || `Beneficiario #${post.usuarioId}`}</p>
                    <p className="text-[10px] text-emerald-800 font-semibold">Evento: {post.eventoNombre || `Jornada #${post.eventoId}`}</p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <Badge variant={
                      post.estadoPostulacion === 'aprobado' || post.estadoPostulacion === 'confirmado' ? 'success' :
                      post.estadoPostulacion === 'rechazado' ? 'danger' : 'warning'
                    }>
                      {post.estadoPostulacion}
                    </Badge>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2 text-right">
              <Link to="/org/volunteers" className="text-xs font-extrabold text-emerald-800 hover:underline">
                Gestionar todos los beneficiarios &rarr;
              </Link>
            </div>
          </div>
        </Card>

        {/* Voluntarios inscritos recientemente */}
        <Card title="Últimos Voluntarios Inscritos">
          <div className="space-y-3">
            {recentVolunteers.length === 0 ? (
              <p className="text-xs text-neutral-400 italic text-center py-6">No hay voluntarios inscritos en tus campañas aún.</p>
            ) : (
              recentVolunteers.map((vol, idx) => (
                <div key={`dash_vol_${idx}`} className="flex justify-between items-center p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">{vol.nombre}</p>
                    <p className="text-[10px] text-red-600 font-semibold">Campaña: {vol.eventoNombre}</p>
                  </div>
                  <div className="text-right text-[11px] text-neutral-500">
                    <div className="font-medium">{vol.correo}</div>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2 text-right">
              <Link to="/org/volunteers" className="text-xs font-extrabold text-neutral-800 hover:underline">
                Ver todos los voluntarios &rarr;
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donaciones Recientes Recibidas */}
        <Card title="Últimos Fondos y Materiales Recibidos">
          <div className="space-y-4">
            {receivedDonations.length === 0 ? (
              <p className="text-xs text-neutral-400 italic text-center py-6">Aún no has recibido donaciones mediante la plataforma.</p>
            ) : (
              receivedDonations.slice(-3).reverse().map((don) => (
                <div key={don.id} className="flex justify-between items-center p-3 bg-neutral-50 rounded border border-neutral-150 text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">{don.usuarioNombre}</p>
                    <p className="text-[10px] text-neutral-500">Causa: {don.categoria} | Tipo: {don.tipo}</p>
                  </div>
                  <div className="text-right">
                    {don.tipo === 'monetaria' ? (
                      <span className="font-extrabold text-red-600">+{formatCOP(don.monetaria?.valor || 0)}</span>
                    ) : (
                      <span className="font-semibold text-neutral-800">{don.objeto?.cantidad} x {don.objeto?.categoria}</span>
                    )}
                    <p className="text-[9px] text-neutral-400">{formatDate(don.fecha)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Guías rápidas de acción */}
        <Card title="Recursos Rápidos para el Gestor">
          <div className="space-y-3 text-xs leading-relaxed text-neutral-600">
            <p>1. <strong>Crea un evento o jornada social</strong>: Describe la campaña con metas claras e indica fecha, horario y vacantes disponibles.</p>
            <p>2. <strong>Atiende a los Beneficiarios</strong>: Revisa sus postulaciones en la pestaña "Personas Vinculadas" para aprobar o rechazar su cupo.</p>
            <p>3. <strong>Contacto con el Voluntario</strong>: En la sección de vinculados puedes consultar correos y teléfonos para coordinar la logística.</p>
          </div>
        </Card>
      </div>

      {/* Modal para Solicitar Verificación */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        title="Solicitar Verificación de Organización"
      >
        <form onSubmit={handleSendVerificationRequest} className="space-y-4">
          <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-blue-600 shrink-0" />
              Verificación Oficial Give&Go
            </p>
            <p className="text-[11px] leading-relaxed text-blue-800">
              Al verificar tu organización, obtendrás la insignia de autenticidad en tu perfil público, publicaciones, eventos y donaciones recibidas.
            </p>
          </div>

          <Input
            label="Número de Identificación Tributaria (NIT) *"
            value={reqNit}
            onChange={(e) => setReqNit(e.target.value)}
            placeholder="Ej. 900.123.456-7"
            required
          />

          <Textarea
            label="Mensaje o Justificación de la Solicitud"
            value={reqMensaje}
            onChange={(e) => setReqMensaje(e.target.value)}
            placeholder="Describe brevemente el objeto social de tu organización, trayectoria y por qué solicitas la verificación..."
            rows={3}
          />

          <Input
            label="Enlace a Documentación de Soporte (RUT, Cámara de Comercio o Web) - Opcional"
            value={reqDocs}
            onChange={(e) => setReqDocs(e.target.value)}
            placeholder="https://drive.google.com/dir-documentos..."
          />

          <div className="pt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsVerificationModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 font-bold"
              disabled={reqSubmitting}
            >
              {reqSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

/**
 * ==========================================
 * 2. ORGANIZATION EVENTS
 * ==========================================
 */
export const OrgEvents: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Evento[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Confirm
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Omit<Evento, 'id' | 'organizacionId'>>();

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
    loadMyEvents();
  }, [user]);

  async function loadMyEvents() {
    if (!user) return;
    const allEvents = await EventService.getAll();
    setEvents(allEvents.filter(e => isMyOrgEvent(e.organizacionId, user)));

    const cats = await CategoryService.getAll();
    setCategories(cats.filter(c => c.estado === 'activo'));
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
      vacantesVoluntarios: 10,
      vacantesBeneficiarios: 20,
      ayudaOfrecida: '',
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
    setValue('vacantesVoluntarios', evt.vacantesVoluntarios || 0);
    setValue('vacantesBeneficiarios', evt.vacantesBeneficiarios || 0);
    setValue('ayudaOfrecida', evt.ayudaOfrecida || '');
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

  const onSubmit = async (data: Omit<Evento, 'id' | 'organizacionId'>) => {
    if (!user) return;
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
        organizacionId: (user as any).organizacionId || user.id,
        cupo: data.cupo ? parseInt(String(data.cupo), 10) : 0,
        latitud: parseFloat(String(data.latitud)),
        longitud: parseFloat(String(data.longitud))
      };

      if (editingEvent) {
        await EventService.update(editingEvent.id, payload);
      } else {
        await EventService.create(payload);
      }

      loadMyEvents();
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
      loadMyEvents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Mis Eventos / Campañas</h1>
          <p className="text-xs text-neutral-500 mt-1">Crea y edita tus convocatorias de voluntariado e indica requerimientos.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-1" />
          Crear Evento
        </Button>
      </div>

      <Table<Evento>
        headers={['Campaña', 'Categoría', 'Fecha Programada', 'Estado', 'Dirección', 'Acciones']}
        data={events}
        renderRow={(item) => (
          <tr key={item.id} className="hover:bg-neutral-50 text-xs">
            <td className="px-5 py-3">
              <span className="font-bold text-neutral-900 text-sm">{item.nombre}</span>
              <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5">{item.descripcion}</p>
            </td>
            <td className="px-5 py-3 font-semibold text-neutral-600">{item.categoria}</td>
            <td className="px-5 py-3 font-medium text-neutral-600">{formatDate(item.fecha)}</td>
            <td className="px-5 py-3">
              <Badge variant={item.estado === 'activo' ? 'success' : 'neutral'}>
                {item.estado}
              </Badge>
            </td>
            <td className="px-5 py-3 text-neutral-500 font-medium truncate max-w-xs">{item.direccion || 'No especificada'}</td>
            <td className="px-5 py-3 flex gap-2">
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
        title={editingEvent ? '📝 Editar Evento / Campaña' : '✨ Crear Convocatoria / Campaña'}
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
              label="Nombre de la Convocatoria / Campaña *"
              error={errors.nombre?.message}
              {...register('nombre', { required: 'El nombre es obligatorio' })}
              placeholder="Ej. Reforestación Parque Simón Bolívar"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Categoría *"
                options={categories.map(c => ({ value: c.nombre, label: c.nombre }))}
                {...register('categoria')}
              />

              <Input
                type="date"
                label="Fecha del Evento *"
                error={errors.fecha?.message}
                {...register('fecha', { required: 'La fecha es obligatoria' })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Estado Inicial de la Convocatoria *"
                options={[
                  { value: 'activo', label: 'Activo / Abierto' },
                  { value: 'finalizado', label: 'Finalizado' },
                  { value: 'cancelado', label: 'Cancelado' },
                ]}
                {...register('estado')}
              />

              <Input
                type="number"
                label="Vacantes Voluntarios"
                {...register('vacantesVoluntarios')}
                placeholder="Ej. 15"
              />

              <Input
                type="number"
                label="Vacantes Beneficiarios"
                {...register('vacantesBeneficiarios')}
                placeholder="Ej. 30"
              />
            </div>

            <Input
              label="Ayuda / Beneficio Ofrecido a los Beneficiarios *"
              {...register('ayudaOfrecida')}
              placeholder="Ej. Kit alimentario mensual + atención médica general"
            />

            <Textarea
              label="Descripción detallada de la labor *"
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
        title="Eliminar Convocatoria"
        message="¿Está seguro de eliminar de forma permanente esta convocatoria? No podrá recuperarse."
      />
    </div>
  );
};

/**
 * ==========================================
 * 3. ORGANIZATION CAMPAIGNS (DONATIONS RECEIVED)
 * ==========================================
 */
export const OrgCampaigns: React.FC = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState<DonacionCompleta[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<DonacionCompleta | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadDonations() {
      const orgIdToUse = (user as any).organizacionId || user.id;
      const list = await DonationService.getByOrganization(orgIdToUse);
      setDonations(list);
    }
    loadDonations();
  }, [user]);

  const handleOpenDetails = (don: DonacionCompleta) => {
    setSelectedDonation(don);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Donaciones Recibidas</h1>
        <p className="text-xs text-neutral-500 mt-1">Consulta los registros de apoyo y los fondos que los voluntarios han destinado a tu sede.</p>
      </div>

      {donations.length === 0 ? (
        <EmptyState
          title="No has recibido donaciones"
          description="Aún no se registran donaciones para tu organización mediante la plataforma."
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

/**
 * ==========================================
 * 4. ORGANIZATION VOLUNTEERS
 * ==========================================
 */
interface VolunteerAssoc {
  id: string;
  postulacionId?: string;
  eventoId?: string;
  usuarioId?: string;
  nombre: string;
  correo: string;
  telefono: string;
  eventoNombre: string;
  fechaPostulacion?: string;
  estado?: string;
  observaciones?: string;
}

export const OrgVolunteers: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'voluntarios' | 'beneficiarios'>('voluntarios');
  const [volunteers, setVolunteers] = useState<VolunteerAssoc[]>([]);
  const [beneficiarioPostulaciones, setBeneficiarioPostulaciones] = useState<Postulacion[]>([]);

  // Modals state
  const [selectedVolunteerModal, setSelectedVolunteerModal] = useState<VolunteerAssoc | null>(null);
  const [selectedBeneficiarioModal, setSelectedBeneficiarioModal] = useState<Postulacion | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{ type: 'voluntario' | 'beneficiario'; item: VolunteerAssoc | Postulacion } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  async function loadData() {
    if (!user) return;
    const allEvents = await EventService.getAll();
    const orgEvents = allEvents.filter(e => isMyOrgEvent(e.organizacionId, user));
    const orgIdToUse = (user as any).organizacionId || user.id;

    // 1. Postulaciones de voluntarios
    const volPost = await PostulacionService.getByOrganization(orgIdToUse, 'voluntario');
    const assocList: VolunteerAssoc[] = [];
    const seenVolKeys = new Set<string>();

    volPost.forEach(p => {
      const key = `${p.eventoId}_${p.usuarioId}`;
      seenVolKeys.add(key);
      assocList.push({
        id: p.id || key,
        postulacionId: p.id,
        eventoId: p.eventoId,
        usuarioId: p.usuarioId,
        nombre: p.usuarioNombre || `Voluntario #${p.usuarioId}`,
        correo: p.usuarioCorreo || 'Sin correo',
        telefono: p.usuarioTelefono || 'Sin teléfono',
        eventoNombre: p.eventoNombre || `Evento #${p.eventoId}`,
        fechaPostulacion: p.fechaPostulacion,
        estado: p.estadoPostulacion,
        observaciones: p.observaciones
      });
    });

    // 2. Participantes directos
    for (const evt of orgEvents) {
      const parts = await EventService.getParticipants(evt.id);
      parts.forEach(p => {
        const key = `${evt.id}_${p.id}`;
        if (!seenVolKeys.has(key)) {
          seenVolKeys.add(key);
          assocList.push({
            id: key,
            eventoId: evt.id,
            usuarioId: String(p.id),
            nombre: [p.nombre1, p.nombre2, p.apellido1, p.apellido2].filter(Boolean).join(' ') || p.correo || `Voluntario #${p.id}`,
            correo: p.correo,
            telefono: p.telefono,
            eventoNombre: evt.nombre,
          });
        }
      });
    }
    setVolunteers(assocList);

    // 3. Cargar postulaciones de beneficiarios
    const benPost = await PostulacionService.getByOrganization(orgIdToUse, 'beneficiario');
    setBeneficiarioPostulaciones(benPost);
  }

  const handleUpdateStatus = async (id: string, nuevoEstado: 'aprobado' | 'rechazado') => {
    try {
      await PostulacionService.updateStatus(id, nuevoEstado, `Estado actualizado a ${nuevoEstado} por la organización.`);
      await loadData();
    } catch (err) {
      console.error('Error al actualizar estado:', err);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTarget) return;
    const { type, item } = deleteConfirmTarget;
    try {
      if (type === 'voluntario') {
        const vol = item as VolunteerAssoc;
        if (vol.postulacionId) {
          await PostulacionService.delete(vol.postulacionId);
        }
        if (vol.eventoId && vol.usuarioId) {
          await EventService.unregisterParticipant(vol.eventoId, vol.usuarioId);
        }
      } else {
        const ben = item as Postulacion;
        if (ben.id) {
          await PostulacionService.delete(ben.id);
        }
      }
      setDeleteConfirmTarget(null);
      await loadData();
    } catch (err) {
      console.error('Error al eliminar vinculación:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-wider">Personas Vinculadas y Convocatorias</h1>
          <p className="text-xs text-neutral-500 mt-1">Revisa y gestiona los voluntarios inscritos y las postulaciones de beneficiarios comunitarios.</p>
        </div>

        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-xl border border-neutral-200">
          <button
            onClick={() => setActiveTab('voluntarios')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'voluntarios'
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Voluntarios Inscritos ({volunteers.length})
          </button>
          <button
            onClick={() => setActiveTab('beneficiarios')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'beneficiarios'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span>Beneficiarios Postulados</span>
            {beneficiarioPostulaciones.length > 0 && (
              <span className="bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
                {beneficiarioPostulaciones.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'voluntarios' ? (
        <Table<VolunteerAssoc>
          headers={['Voluntario', 'Campaña en la que participa', 'Correo Electrónico', 'Número de Teléfono', 'Acciones']}
          data={volunteers}
          renderRow={(item) => (
            <tr key={item.id} className="hover:bg-neutral-50 text-xs">
              <td className="px-5 py-3 font-bold text-neutral-900">
                <UserLink
                  userId={item.usuarioId || item.id}
                  name={item.nombre}
                  role="voluntario"
                  size="sm"
                />
              </td>
              <td className="px-5 py-3 font-semibold text-red-600">{item.eventoNombre}</td>
              <td className="px-5 py-3 font-medium text-neutral-600">
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{item.correo}</span>
                </div>
              </td>
              <td className="px-5 py-3 font-medium text-neutral-600">
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{item.telefono}</span>
                </div>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-neutral-700 hover:bg-neutral-100 text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 font-semibold"
                    onClick={() => setSelectedVolunteerModal(item)}
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-500" />
                    Ver
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 border-red-200 text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 font-semibold"
                    onClick={() => setDeleteConfirmTarget({ type: 'voluntario', item })}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    Eliminar
                  </Button>
                </div>
              </td>
            </tr>
          )}
        />
      ) : (
        <div className="space-y-4">
          {beneficiarioPostulaciones.length === 0 ? (
            <EmptyState
              title="Sin Postulaciones de Beneficiarios"
              description="Aún no se han recibido solicitudes de beneficiarios para tus eventos activos."
            />
          ) : (
            <Table<Postulacion>
              headers={['Beneficiario', 'Evento / Jornada', 'Contacto', 'Fecha Postulación', 'Estado', 'Acciones']}
              data={beneficiarioPostulaciones}
              renderRow={(item) => (
                <tr key={item.id} className="hover:bg-neutral-50 text-xs">
                  <td className="px-5 py-3 font-bold text-neutral-900">
                    <UserLink
                      userId={item.usuarioId}
                      name={item.usuarioNombre || `Usuario #${item.usuarioId}`}
                      role="beneficiario"
                      size="sm"
                    />
                  </td>
                  <td className="px-5 py-3 font-bold text-emerald-800">
                    {item.eventoNombre || `Evento #${item.eventoId}`}
                  </td>
                  <td className="px-5 py-3 text-neutral-600">
                    <div>{item.usuarioCorreo}</div>
                    <div className="text-[10px] text-neutral-400">{item.usuarioTelefono}</div>
                  </td>
                  <td className="px-5 py-3 text-neutral-500 font-medium">
                    {formatDate(item.fechaPostulacion)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={
                      item.estadoPostulacion === 'aprobado' || item.estadoPostulacion === 'confirmado' ? 'success' :
                      item.estadoPostulacion === 'rechazado' ? 'danger' : 'warning'
                    }>
                      {item.estadoPostulacion}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-neutral-700 hover:bg-neutral-100 text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 font-semibold"
                        onClick={() => setSelectedBeneficiarioModal(item)}
                      >
                        <Eye className="w-3.5 h-3.5 text-neutral-500" />
                        Ver
                      </Button>

                      {item.estadoPostulacion === 'pendiente' && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            className="bg-emerald-700 hover:bg-emerald-800 text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 font-semibold"
                            onClick={() => handleUpdateStatus(item.id, 'aprobado')}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Aprobar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-amber-700 border-amber-300 hover:bg-amber-50 text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 font-semibold"
                            onClick={() => handleUpdateStatus(item.id, 'rechazado')}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Rechazar
                          </Button>
                        </>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 border-red-200 text-[11px] py-1 px-2.5 rounded-lg flex items-center gap-1 font-semibold"
                        onClick={() => setDeleteConfirmTarget({ type: 'beneficiario', item })}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            />
          )}
        </div>
      )}

      {/* Modal Detalles Voluntario */}
      {selectedVolunteerModal && (
        <Modal
          isOpen={!!selectedVolunteerModal}
          onClose={() => setSelectedVolunteerModal(null)}
          title="Detalles del Voluntario Vinculado"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-semibold">Nombre Completo:</span>
                <span className="font-bold text-neutral-900 text-sm">{selectedVolunteerModal.nombre}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-semibold">Rol / Tipo:</span>
                <Badge variant="info">Voluntario Inscrito</Badge>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-semibold">Campaña / Evento:</span>
                <span className="font-bold text-red-600">{selectedVolunteerModal.eventoNombre}</span>
              </div>
              <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                <span className="text-neutral-500 font-semibold">Correo Electrónico:</span>
                <span className="font-medium text-neutral-800">{selectedVolunteerModal.correo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-semibold">Teléfono de Contacto:</span>
                <span className="font-medium text-neutral-800">{selectedVolunteerModal.telefono}</span>
              </div>
            </div>

            {selectedVolunteerModal.observaciones && (
              <div className="p-3 bg-neutral-100 rounded-lg border border-neutral-200">
                <p className="font-bold text-neutral-700 mb-1">Observaciones:</p>
                <p className="text-neutral-600">{selectedVolunteerModal.observaciones}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 font-semibold"
                onClick={() => {
                  const item = selectedVolunteerModal;
                  setSelectedVolunteerModal(null);
                  setDeleteConfirmTarget({ type: 'voluntario', item });
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Eliminar Vinculación
              </Button>
              <Button variant="primary" size="sm" onClick={() => setSelectedVolunteerModal(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Detalles Beneficiario */}
      {selectedBeneficiarioModal && (
        <Modal
          isOpen={!!selectedBeneficiarioModal}
          onClose={() => setSelectedBeneficiarioModal(null)}
          title="Detalles de la Postulación de Beneficiario"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                <span className="text-neutral-500 font-semibold">Beneficiario:</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {selectedBeneficiarioModal.usuarioNombre || `Usuario #${selectedBeneficiarioModal.usuarioId}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                <span className="text-neutral-500 font-semibold">Evento / Jornada:</span>
                <span className="font-bold text-emerald-800">{selectedBeneficiarioModal.eventoNombre || `Evento #${selectedBeneficiarioModal.eventoId}`}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                <span className="text-neutral-500 font-semibold">Estado de la Solicitud:</span>
                <Badge variant={
                  selectedBeneficiarioModal.estadoPostulacion === 'aprobado' || selectedBeneficiarioModal.estadoPostulacion === 'confirmado' ? 'success' :
                  selectedBeneficiarioModal.estadoPostulacion === 'rechazado' ? 'danger' : 'warning'
                }>
                  {selectedBeneficiarioModal.estadoPostulacion}
                </Badge>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                <span className="text-neutral-500 font-semibold">Correo Electrónico:</span>
                <span className="font-medium text-neutral-800">{selectedBeneficiarioModal.usuarioCorreo || 'Sin correo registrado'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                <span className="text-neutral-500 font-semibold">Teléfono de Contacto:</span>
                <span className="font-medium text-neutral-800">{selectedBeneficiarioModal.usuarioTelefono || 'Sin teléfono registrado'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 font-semibold">Fecha de Postulación:</span>
                <span className="font-medium text-neutral-800">{formatDate(selectedBeneficiarioModal.fechaPostulacion)}</span>
              </div>
            </div>

            {selectedBeneficiarioModal.observaciones && (
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <p className="font-bold text-neutral-700 mb-1">Observaciones / Solicitud:</p>
                <p className="text-neutral-600">{selectedBeneficiarioModal.observaciones}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50 font-semibold"
                onClick={() => {
                  const item = selectedBeneficiarioModal;
                  setSelectedBeneficiarioModal(null);
                  setDeleteConfirmTarget({ type: 'beneficiario', item });
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Eliminar Postulación
              </Button>

              <div className="flex gap-2">
                {selectedBeneficiarioModal.estadoPostulacion === 'pendiente' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-700 hover:bg-emerald-800"
                      onClick={async () => {
                        await handleUpdateStatus(selectedBeneficiarioModal.id, 'aprobado');
                        setSelectedBeneficiarioModal(null);
                      }}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-amber-700 border-amber-300"
                      onClick={async () => {
                        await handleUpdateStatus(selectedBeneficiarioModal.id, 'rechazado');
                        setSelectedBeneficiarioModal(null);
                      }}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Rechazar
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => setSelectedBeneficiarioModal(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Diálogo de Confirmación de Eliminación */}
      {deleteConfirmTarget && (
        <ConfirmDialog
          isOpen={!!deleteConfirmTarget}
          onClose={() => setDeleteConfirmTarget(null)}
          onConfirm={handleDelete}
          title={deleteConfirmTarget.type === 'voluntario' ? "Eliminar Voluntario Vinculado" : "Eliminar Postulación de Beneficiario"}
          message={
            deleteConfirmTarget.type === 'voluntario'
              ? `¿Estás seguro de desvincular a "${(deleteConfirmTarget.item as VolunteerAssoc).nombre}" del evento "${(deleteConfirmTarget.item as VolunteerAssoc).eventoNombre}"?`
              : `¿Estás seguro de eliminar la postulación de "${(deleteConfirmTarget.item as Postulacion).usuarioNombre || 'este beneficiario'}"?`
          }
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />
      )}
    </div>
  );
};
