import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserService } from '../services/db';
import { PublicProfileData, Evento } from '../types';
import { Card, Button, Badge } from '../components/UI';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { 
  Shield, 
  Building2, 
  Heart, 
  HeartHandshake, 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Phone, 
  Award, 
  CheckCircle2, 
  Star, 
  Edit3, 
  Share2, 
  ExternalLink, 
  AtSign, 
  Briefcase, 
  Code2, 
  Sparkles, 
  Users, 
  Clock, 
  FileText, 
  Lock, 
  Eye, 
  Check, 
  X, 
  Camera
} from 'lucide-react';

export const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile } = useAuth();

  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'actividad' | 'eventos' | 'logros' | 'info'>('actividad');

  // Modal para editar perfil rápido / portada / privacidad si es dueño
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [bioInput, setBioInput] = useState('');
  const [portadaInput, setPortadaInput] = useState('');
  const [sitioWebInput, setSitioWebInput] = useState('');
  const [redesInput, setRedesInput] = useState({ facebook: '', twitter: '', instagram: '', linkedin: '', github: '' });
  const [privacidadInput, setPrivacidadInput] = useState({
    mostrarCorreo: true,
    mostrarTelefono: false,
    mostrarUbicacion: true,
    mostrarBiografia: true,
    mostrarEstadisticas: true
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.getPublicProfile(id);
        if (isMounted) {
          if (data && data.user) {
            setProfileData(data);
            setBioInput(data.user.biografia || '');
            setPortadaInput(data.user.fotoPortada || '');
            setSitioWebInput(data.user.sitioWeb || '');
            setRedesInput({
              facebook: data.user.redesSociales?.facebook || '',
              twitter: data.user.redesSociales?.twitter || '',
              instagram: data.user.redesSociales?.instagram || '',
              linkedin: data.user.redesSociales?.linkedin || '',
              github: data.user.redesSociales?.github || ''
            });
            if (data.user.privacidad) {
              setPrivacidadInput({
                mostrarCorreo: data.user.privacidad.mostrarCorreo !== false,
                mostrarTelefono: !!data.user.privacidad.mostrarTelefono,
                mostrarUbicacion: data.user.privacidad.mostrarUbicacion !== false,
                mostrarBiografia: data.user.privacidad.mostrarBiografia !== false,
                mostrarEstadisticas: data.user.privacidad.mostrarEstadisticas !== false
              });
            }
          } else {
            setError('No se encontró el perfil solicitado.');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError('Error al cargar la información del perfil.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-600 font-medium text-sm">Cargando perfil público de Give&Go...</p>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
          <X className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Perfil No Encontrado</h2>
        <p className="text-neutral-600 mb-6">{error || 'El usuario especificado no existe o la cuenta no se encuentra disponible.'}</p>
        <Button onClick={() => navigate('/')} variant="primary">
          Volver al Inicio
        </Button>
      </div>
    );
  }

  const { user, organization, stats, actividadReciente, eventosRelacionados, insignias } = profileData;

  // Los perfiles públicos son únicamente para Organizaciones
  if (user && user.rol !== 'organizacion') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-200 shadow-sm">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-neutral-950 uppercase tracking-wider mb-3">
          Perfil Público Exclusivo para Organizaciones
        </h2>
        <p className="text-sm text-neutral-600 leading-relaxed mb-6 max-w-lg mx-auto">
          En <strong className="text-neutral-900">Give&Go</strong>, los perfiles públicos están habilitados de manera exclusiva para <strong className="text-neutral-900">Organizaciones Sociales y Fundaciones verificadas</strong> para garantizar la transparencia, verificación institucional y la visibilidad de sus convocatorias de voluntariado.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/events')} variant="primary" className="text-xs font-bold py-2.5 px-5">
            Explorar Eventos de Organizaciones
          </Button>
          <Button onClick={() => navigate('/')} variant="outline" className="text-xs font-bold py-2.5 px-5">
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  // Verificar si el usuario actual está viendo su propio perfil
  const isOwnProfile = currentUser && (
    String(currentUser.id) === String(user.id) || 
    (currentUser.organizacionId && currentUser.organizacionId === user.id) ||
    (user.correo && currentUser.correo.toLowerCase() === user.correo.toLowerCase())
  );

  const role = user.rol;

  // Helper de badges y estilos por rol
  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return {
          label: 'Administrador',
          bg: 'bg-red-600 text-white shadow-xs',
          border: 'border-red-500',
          icon: Shield,
          colorText: 'text-red-700 bg-red-50 border-red-200'
        };
      case 'organizacion':
        return {
          label: 'Organización Social',
          bg: 'bg-blue-600 text-white shadow-xs',
          border: 'border-blue-500',
          icon: Building2,
          colorText: 'text-blue-700 bg-blue-50 border-blue-200'
        };
      case 'voluntario':
        return {
          label: 'Voluntario Solidario',
          bg: 'bg-emerald-600 text-white shadow-xs',
          border: 'border-emerald-500',
          icon: Heart,
          colorText: 'text-emerald-700 bg-emerald-50 border-emerald-200'
        };
      case 'beneficiario':
        return {
          label: 'Beneficiario Acreditado',
          bg: 'bg-amber-600 text-white shadow-xs',
          border: 'border-amber-500',
          icon: HeartHandshake,
          colorText: 'text-amber-700 bg-amber-50 border-amber-200'
        };
      default:
        return {
          label: 'Miembro',
          bg: 'bg-neutral-800 text-white',
          border: 'border-neutral-500',
          icon: Sparkles,
          colorText: 'text-neutral-700 bg-neutral-100 border-neutral-200'
        };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleBadgeIcon = roleBadge.icon;

  const fullName = role === 'organizacion' && organization?.nombre
    ? organization.nombre
    : `${user.nombre1} ${user.nombre2 || ''} ${user.apellido1} ${user.apellido2 || ''}`.trim();

  // Portada predeterminada si no tiene
  const coverImage = user.fotoPortada || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1600&q=80';

  const handleSaveProfileEdit = async () => {
    setSavingEdit(true);
    setSaveSuccess(false);

    const updatePayload = {
      biografia: bioInput,
      fotoPortada: portadaInput,
      sitioWeb: sitioWebInput,
      redesSociales: redesInput,
      privacidad: privacidadInput
    };

    const res = await updateProfile(updatePayload);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveSuccess(false);
        // Recargar perfil
        window.location.reload();
      }, 1000);
    }
    setSavingEdit(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* PORTADA Y FOTO DE PERFIL */}
      <div className="relative bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        {/* Banner de Portada */}
        <div className="h-48 sm:h-64 md:h-80 w-full relative bg-neutral-900">
          <img
            src={coverImage}
            alt="Portada"
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Botón de Cambiar Portada para Dueño */}
          {isOwnProfile && (
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white text-neutral-800 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Camera className="w-4 h-4 text-neutral-600" />
              <span>Editar Portada</span>
            </button>
          )}

          {/* Tag flotante de Give&Go */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Give&Go Community
            </span>
          </div>
        </div>

        {/* Sección de Encabezado de Usuario */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 sm:-mt-20 md:-mt-24 mb-4 gap-4">
            
            {/* Foto de Perfil Grande con borde */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white relative">
                {user.foto ? (
                  <img src={user.foto} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-500 to-rose-700 text-white font-extrabold text-4xl sm:text-5xl flex items-center justify-center">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Insignia visual del Rol en la foto */}
              <div className={`absolute bottom-2 right-2 p-2 rounded-full border-2 border-white shadow-md ${roleBadge.bg}`} title={roleBadge.label}>
                <RoleBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Acciones e Interacción */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0">
              {isOwnProfile ? (
                <>
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    variant="outline"
                    className="flex items-center gap-2 border-neutral-300 hover:bg-neutral-50 text-neutral-800"
                  >
                    <Edit3 className="w-4 h-4 text-neutral-600" />
                    <span>Personalizar Perfil & Privacidad</span>
                  </Button>
                  <Link to="/profile">
                    <Button variant="secondary" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Configuración Completa</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {role === 'organizacion' && (
                    <Link to="/donations">
                      <Button variant="primary" className="flex items-center gap-2 shadow-xs">
                        <Heart className="w-4 h-4 fill-white" />
                        <span>Donar a esta Organización</span>
                      </Button>
                    </Link>
                  )}
                  {role === 'voluntario' && (
                    <Button variant="outline" className="flex items-center gap-2 border-neutral-300">
                      <Sparkles className="w-4 h-4 text-red-600" />
                      <span>Invitar a Evento</span>
                    </Button>
                  )}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('¡Enlace del perfil copiado al portapapeles!');
                    }}
                    className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg transition-colors border border-neutral-200"
                    title="Compartir perfil"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Detalles Principales del Perfil */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                {fullName}
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${roleBadge.colorText}`}>
                <RoleBadgeIcon className="w-3.5 h-3.5" />
                {roleBadge.label}
              </span>
              {role === 'organizacion' && (organization?.verificada || user.verificada) && (
                <VerifiedBadge showText size="sm" />
              )}
            </div>

            {/* Ubicación y Registro */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-neutral-600">
              {user.ciudad && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                  {user.ciudad}{user.departamento ? `, ${user.departamento}` : ''}{user.pais ? `, ${user.pais}` : ''}
                </span>
              )}
              {user.fechaRegistro && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                  Miembro desde {new Date(user.fechaRegistro).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </span>
              )}
              {user.sitioWeb && (
                <a
                  href={user.sitioWeb.startsWith('http') ? user.sitioWeb : `https://${user.sitioWeb}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-red-600 hover:underline font-medium"
                >
                  <Globe className="w-4 h-4 shrink-0" />
                  {user.sitioWeb.replace(/^https?:\/\//, '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Biografía */}
            {user.biografia && (
              <p className="text-sm text-neutral-700 max-w-3xl leading-relaxed pt-1">
                {user.biografia}
              </p>
            )}

            {/* Redes Sociales Links */}
            {user.redesSociales && Object.values(user.redesSociales).some(Boolean) && (
              <div className="flex items-center gap-2 pt-2">
                {user.redesSociales.facebook && (
                  <a href={user.redesSociales.facebook} target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Facebook">
                    <Share2 className="w-4 h-4" />
                  </a>
                )}
                {user.redesSociales.twitter && (
                  <a href={user.redesSociales.twitter} target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-500 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all" title="Twitter / X">
                    <AtSign className="w-4 h-4" />
                  </a>
                )}
                {user.redesSociales.instagram && (
                  <a href={user.redesSociales.instagram} target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all" title="Instagram">
                    <Camera className="w-4 h-4" />
                  </a>
                )}
                {user.redesSociales.linkedin && (
                  <a href={user.redesSociales.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all" title="LinkedIn">
                    <Briefcase className="w-4 h-4" />
                  </a>
                )}
                {user.redesSociales.github && (
                  <a href={user.redesSociales.github} target="_blank" rel="noopener noreferrer" className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all" title="GitHub">
                    <Code2 className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS POR ROL */}
      {stats && Object.keys(stats).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {role === 'admin' && (
            <>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-red-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.usuariosAdministrados || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Usuarios Administrados</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.organizacionesVerificadas || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Organizaciones Verificadas</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.eventosAdministrados || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Eventos Supervisados</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">100%</p>
                    <p className="text-xs font-medium text-neutral-500">Estado de Seguridad</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'organizacion' && (
            <>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.eventosCreados || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Eventos Creados</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.beneficiariosAtendidos || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Beneficiarios Atendidos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.voluntariosRegistrados || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Voluntarios Registrados</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-red-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.donacionesRecibidas || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Donaciones Recibidas</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'voluntario' && (
            <>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.eventosParticipados || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Eventos Participados</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.horasVoluntariado || 0} hrs</p>
                    <p className="text-xs font-medium text-neutral-500">Horas de Voluntariado</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.certificados || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Certificados Obtenidos</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-red-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.donacionesRealizadas || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Donaciones Aportadas</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {role === 'beneficiario' && (
            <>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-amber-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.eventosAyudaRecibida || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Eventos de Apoyo</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-emerald-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.ayudasRecibidas || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Jornadas Recibidas</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-blue-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">{stats.organizacionesApoyo || 0}</p>
                    <p className="text-xs font-medium text-neutral-500">Organizaciones Aliadas</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-2xs hover:border-red-300 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-neutral-900">Protegido</p>
                    <p className="text-xs font-medium text-neutral-500">Privacidad Restringida</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* NAVEGACIÓN POR PESTAÑAS */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-2 shadow-2xs">
        <div className="flex border-b border-neutral-200 overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('actividad')}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'actividad'
                ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Actividad Reciente ({actividadReciente.length})
          </button>
          <button
            onClick={() => setActiveTab('eventos')}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'eventos'
                ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Eventos ({eventosRelacionados.length})
          </button>
          <button
            onClick={() => setActiveTab('logros')}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'logros'
                ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Logros e Insignias ({insignias.length})
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'info'
                ? 'border-red-600 text-red-600 bg-red-50/50 rounded-t-lg'
                : 'border-transparent text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            Información & Privacidad
          </button>
        </div>

        {/* CONTENIDO DE PESTAÑAS */}
        <div className="p-4 sm:p-6">
          {/* PESTAÑA: ACTIVIDAD RECIENTE */}
          {activeTab === 'actividad' && (
            <div className="space-y-4">
              {actividadReciente.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <Sparkles className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No hay publicaciones ni actividades recientes aún.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-neutral-200 ml-4 space-y-6">
                  {actividadReciente.map((act) => (
                    <div key={act.id} className="relative pl-6 group">
                      {/* Punto en la línea de tiempo */}
                      <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white border-2 border-red-500 group-hover:scale-125 transition-transform shadow-2xs" />
                      
                      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 hover:bg-white hover:border-neutral-300 hover:shadow-2xs transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-neutral-900">{act.titulo}</h4>
                          <span className="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(act.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-600">{act.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: EVENTOS */}
          {activeTab === 'eventos' && (
            <div className="space-y-4">
              {eventosRelacionados.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <Calendar className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">No hay eventos registrados en este momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventosRelacionados.map((e) => (
                    <div key={e.id} className="bg-white border border-neutral-200 rounded-xl p-4 hover:border-red-300 hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                            {e.categoria}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${e.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-700'}`}>
                            {e.estado.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-neutral-900 mb-1">{e.nombre}</h4>
                        <p className="text-xs text-neutral-600 line-clamp-2 mb-3">{e.descripcion}</p>
                      </div>

                      <div className="border-t border-neutral-100 pt-3 flex items-center justify-between text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                          {new Date(e.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <Link to="/events" className="text-red-600 font-semibold hover:underline flex items-center gap-1">
                          Ver evento <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA: LOGROS E INSIGNIAS */}
          {activeTab === 'logros' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {insignias.map((ins) => (
                  <div key={ins.id} className="bg-gradient-to-br from-white to-red-50/30 border border-neutral-200 rounded-xl p-4 hover:border-red-300 hover:shadow-xs transition-all flex items-start gap-3">
                    <div className="p-3 bg-red-100 text-red-600 rounded-full shrink-0 border border-red-200">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900">{ins.nombre}</h4>
                      <p className="text-xs text-neutral-600 mt-0.5">{ins.descripcion}</p>
                      <span className="inline-block mt-2 text-[10px] text-neutral-500 font-medium">
                        Concedida: {ins.fechaObtencion}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA: INFORMACIÓN GENERAL & PRIVACIDAD */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Información de Contacto / Privacidad */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-4">
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-neutral-500" />
                  Datos de Contacto Permitidos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="p-3 bg-white border border-neutral-200 rounded-lg">
                    <span className="text-neutral-500 font-medium block text-xs">Correo Electrónico</span>
                    <span className="font-semibold text-neutral-800">
                      {user.correo ? user.correo : '(Protegido por configuración de privacidad)'}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-neutral-200 rounded-lg">
                    <span className="text-neutral-500 font-medium block text-xs">Teléfono Móvil</span>
                    <span className="font-semibold text-neutral-800">
                      {user.telefono ? user.telefono : '(Protegido por configuración de privacidad)'}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-neutral-200 rounded-lg">
                    <span className="text-neutral-500 font-medium block text-xs">Ubicación Registrada</span>
                    <span className="font-semibold text-neutral-800">
                      {user.direccion ? user.direccion : `${user.ciudad || 'Bogotá D.C.'}, Colombia`}
                    </span>
                  </div>

                  <div className="p-3 bg-white border border-neutral-200 rounded-lg">
                    <span className="text-neutral-500 font-medium block text-xs">Estado de Cuenta</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Activa & Verificada
                    </span>
                  </div>
                </div>
              </div>

              {/* Si es Organización, mostrar Misión y Visión */}
              {role === 'organizacion' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                    <h4 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" /> Misión Organizacional
                    </h4>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      {user.mision || organization?.descripcion || 'Promover el bienestar de las comunidades vulnerables mediante voluntariado activo y gestión transparente de donaciones.'}
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
                    <h4 className="text-sm font-bold text-emerald-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" /> Visión y Metas
                    </h4>
                    <p className="text-xs text-neutral-700 leading-relaxed">
                      {user.vision || 'Expandir la red de ayuda social en Colombia, reduciendo brechas de desigualdad y fomentando la solidaridad sostenible.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE PERSONALIZACIÓN Y PRIVACIDAD (PARA PROPIETARIO DEL PERFIL) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-red-600" />
                Personalizar Mi Perfil Público
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" /> ¡Perfil actualizado con éxito! Recargando...
              </div>
            )}

            <div className="space-y-4 text-xs sm:text-sm max-h-[65vh] overflow-y-auto pr-1">
              {/* URL Foto de Portada */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">URL de Imagen de Portada</label>
                <input
                  type="text"
                  value={portadaInput}
                  onChange={(e) => setPortadaInput(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Biografía */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Biografía / Presentación</label>
                <textarea
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Escribe una breve descripción sobre tu compromiso social o motivación..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Sitio Web */}
              <div>
                <label className="block font-semibold text-neutral-700 mb-1">Sitio Web Personal u Organizacional</label>
                <input
                  type="text"
                  value={sitioWebInput}
                  onChange={(e) => setSitioWebInput(e.target.value)}
                  placeholder="https://micomunidad.org"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              {/* Redes Sociales */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <label className="block font-bold text-neutral-800">Redes Sociales (Opcional)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="LinkedIn URL"
                    value={redesInput.linkedin}
                    onChange={(e) => setRedesInput({ ...redesInput, linkedin: e.target.value })}
                    className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Instagram URL"
                    value={redesInput.instagram}
                    onChange={(e) => setRedesInput({ ...redesInput, instagram: e.target.value })}
                    className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Facebook URL"
                    value={redesInput.facebook}
                    onChange={(e) => setRedesInput({ ...redesInput, facebook: e.target.value })}
                    className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Twitter/X URL"
                    value={redesInput.twitter}
                    onChange={(e) => setRedesInput({ ...redesInput, twitter: e.target.value })}
                    className="px-3 py-1.5 text-xs border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Configuración de Privacidad */}
              <div className="space-y-2 pt-3 border-t border-neutral-200">
                <label className="block font-bold text-neutral-800 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-red-600" /> Opciones de Visibilidad & Privacidad
                </label>
                <div className="space-y-2 bg-neutral-50 p-3 rounded-lg border border-neutral-200 text-xs">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-neutral-700">Mostrar correo electrónico públicamente</span>
                    <input
                      type="checkbox"
                      checked={privacidadInput.mostrarCorreo}
                      onChange={(e) => setPrivacidadInput({ ...privacidadInput, mostrarCorreo: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-neutral-700">Mostrar número de teléfono</span>
                    <input
                      type="checkbox"
                      checked={privacidadInput.mostrarTelefono}
                      onChange={(e) => setPrivacidadInput({ ...privacidadInput, mostrarTelefono: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-neutral-700">Mostrar ubicación / ciudad</span>
                    <input
                      type="checkbox"
                      checked={privacidadInput.mostrarUbicacion}
                      onChange={(e) => setPrivacidadInput({ ...privacidadInput, mostrarUbicacion: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-neutral-700">Mostrar biografía</span>
                    <input
                      type="checkbox"
                      checked={privacidadInput.mostrarBiografia}
                      onChange={(e) => setPrivacidadInput({ ...privacidadInput, mostrarBiografia: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-neutral-700">Mostrar tarjetas de estadísticas</span>
                    <input
                      type="checkbox"
                      checked={privacidadInput.mostrarEstadisticas}
                      onChange={(e) => setPrivacidadInput({ ...privacidadInput, mostrarEstadisticas: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSaveProfileEdit} disabled={savingEdit}>
                {savingEdit ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
