import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, Input, Button, Alert, Select, Textarea } from '../components/UI';
import { 
  User, 
  Shield, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  Building2, 
  Upload, 
  Calendar, 
  FileText, 
  Check, 
  Globe, 
  Share2, 
  AtSign, 
  Briefcase, 
  Eye, 
  Sparkles, 
  CheckCircle2,
  ExternalLink,
  Camera,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  X
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para Modal de Eliminación de Cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isOrg = user?.rol === 'organizacion';
  const initialTab = searchParams.get('tab') || (isOrg ? 'perfil_publico' : 'principal');
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const [fotoBase64, setFotoBase64] = useState<string>(user?.foto || '');
  const [logoBase64, setLogoBase64] = useState<string>(user?.logo || '');
  const [portadaBase64, setPortadaBase64] = useState<string>(user?.fotoPortada || user?.foto_portada || '');

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm<any>({
    defaultValues: {
      nombre1: user?.nombre1 || '',
      nombre2: user?.nombre2 || '',
      apellido1: user?.apellido1 || '',
      apellido2: user?.apellido2 || '',
      telefono: user?.telefono || '',
      correo: user?.correo || '',
      password: '',
      confirmPassword: '',
      // Campos de contacto / residencia
      tipo_documento: user?.tipo_documento || '',
      num_documento: user?.num_documento || '',
      fecha_nacimiento: user?.fecha_nacimiento || '',
      direccion: user?.direccion || '',
      barrio: user?.barrio || '',
      localidad: user?.localidad || '',
      ciudad: user?.ciudad || 'Bogotá',
      departamento: user?.departamento || 'Bogotá D.C.',
      pais: user?.pais || 'Colombia',
      codigo_postal: user?.codigo_postal || '',
      // Campos de organización
      nit: user?.nit || '',
      representante_legal: user?.representante_legal || '',
      descripcion: user?.descripcion || '',
      categoria: user?.categoria || '',
      // Perfil Público
      biografia: user?.biografia || user?.descripcion || '',
      mision: user?.mision || '',
      vision: user?.vision || '',
      sitioWeb: user?.sitioWeb || '',
      redes_facebook: user?.redesSociales?.facebook || '',
      redes_twitter: user?.redesSociales?.twitter || '',
      redes_instagram: user?.redesSociales?.instagram || '',
      redes_linkedin: user?.redesSociales?.linkedin || '',
      // Privacidad
      mostrarCorreo: user?.privacidad?.mostrarCorreo !== false,
      mostrarTelefono: !!user?.privacidad?.mostrarTelefono,
      mostrarUbicacion: user?.privacidad?.mostrarUbicacion !== false,
      mostrarBiografia: user?.privacidad?.mostrarBiografia !== false,
      mostrarEstadisticas: user?.privacidad?.mostrarEstadisticas !== false,
    }
  });

  const watchPassword = watch('password');
  const watchNombre1 = watch('nombre1');
  const watchCategoria = watch('categoria');
  const watchBiografia = watch('biografia');
  const watchMision = watch('mision');
  const watchSitioWeb = watch('sitioWeb');
  const watchFacebook = watch('redes_facebook');
  const watchInstagram = watch('redes_instagram');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'foto' | 'logo' | 'portada') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('El archivo excede el tamaño máximo permitido de 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (type === 'foto') {
            setFotoBase64(reader.result);
          } else if (type === 'logo') {
            setLogoBase64(reader.result);
          } else if (type === 'portada') {
            setPortadaBase64(reader.result);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    // Filtrar contraseña vacía
    const updatePayload: any = { ...data };
    if (!updatePayload.password || updatePayload.password.trim() === '') {
      delete updatePayload.password;
      delete updatePayload.confirmPassword;
    } else {
      if (updatePayload.password !== updatePayload.confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden.');
        setIsLoading(false);
        return;
      }
    }

    // Adjuntar imágenes y objetos estructurados
    if (isOrg) {
      updatePayload.logo = logoBase64;
      updatePayload.fotoPortada = portadaBase64;
      updatePayload.nombre1 = data.nombre1;
      updatePayload.biografia = data.biografia;
      updatePayload.mision = data.mision;
      updatePayload.vision = data.vision;
      updatePayload.sitioWeb = data.sitioWeb;
      updatePayload.redesSociales = {
        facebook: data.redes_facebook || '',
        twitter: data.redes_twitter || '',
        instagram: data.redes_instagram || '',
        linkedin: data.redes_linkedin || ''
      };
      updatePayload.privacidad = {
        mostrarCorreo: data.mostrarCorreo,
        mostrarTelefono: data.mostrarTelefono,
        mostrarUbicacion: data.mostrarUbicacion,
        mostrarBiografia: data.mostrarBiografia,
        mostrarEstadisticas: data.mostrarEstadisticas
      };
    } else {
      updatePayload.foto = fotoBase64;
    }

    const result = await updateProfile(updatePayload);
    if (result.success) {
      setSuccessMsg('¡Tu perfil y la configuración de tu perfil público han sido guardados con éxito!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMsg(result.error || 'Ocurrió un error al actualizar el perfil.');
    }
    setIsLoading(false);
  };

  const canDeleteProfile = user?.rol === 'organizacion' || user?.rol === 'voluntario' || user?.rol === 'beneficiario';

  const handleDeleteAccount = async () => {
    if (confirmText.trim().toUpperCase() !== 'ELIMINAR') {
      setDeleteError('Por favor escribe "ELIMINAR" para confirmar la cancelación de tu cuenta.');
      return;
    }
    setIsDeleting(true);
    setDeleteError(null);
    const res = await deleteAccount();
    if (res.success) {
      setShowDeleteModal(false);
      navigate('/', { replace: true });
    } else {
      setDeleteError(res.error || 'Ocurrió un error al intentar eliminar la cuenta.');
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500 italic">
        Inicia sesión para visualizar y modificar tu perfil.
      </div>
    );
  }

  const publicProfileId = user.organizacionId || (user.id.startsWith('org_') ? user.id : `org_${user.id}`);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header del Perfil */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="relative group shrink-0">
            {isOrg ? (
              <div className="w-20 h-20 rounded-2xl border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center relative shadow-xs">
                {logoBase64 ? (
                  <img src={logoBase64} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-9 h-9 text-neutral-400" />
                )}
                <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[9px] font-bold uppercase tracking-wider">
                  <Upload className="w-4 h-4 mb-1" />
                  Cambiar Logo
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full border border-neutral-200 bg-neutral-50 overflow-hidden flex items-center justify-center relative shadow-xs">
                {fotoBase64 ? (
                  <img src={fotoBase64} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-9 h-9 text-neutral-400" />
                )}
                <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[9px] font-bold uppercase tracking-wider">
                  <Upload className="w-4 h-4 mb-1" />
                  Subir Foto
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'foto')} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-black text-neutral-950 uppercase tracking-wider">
                {isOrg ? user.nombre1 : `${user.nombre1} ${user.apellido1}`}
              </h1>
              <span className="self-center sm:self-start text-[9px] font-extrabold uppercase tracking-widest bg-red-50 text-red-600 px-2.5 py-0.5 rounded-full border border-red-100 flex items-center gap-1">
                {isOrg && <CheckCircle2 className="w-3 h-3 text-red-600" />}
                {user.rol === 'organizacion' ? 'Organización Verificada' : user.rol}
              </span>
            </div>
            <p className="text-xs text-neutral-500 font-medium">{user.correo}</p>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
              ID de Registro: <span className="font-mono text-neutral-600">{user.id}</span>
            </p>
          </div>
        </div>

        {isOrg && (
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Link to={`/perfil/${publicProfileId}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="w-full sm:w-auto text-xs font-bold py-2 border-neutral-300">
                <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                Ver Perfil Público
              </Button>
            </Link>
          </div>
        )}
      </div>

      {successMsg && <Alert type="success" message={successMsg} />}
      {errorMsg && <Alert type="danger" message={errorMsg} />}

      {/* Tabs de Navegación del Perfil */}
      <div className="flex flex-wrap border-b border-neutral-200 bg-white p-1 rounded-xl border shadow-2xs gap-1">
        {isOrg && (
          <button
            onClick={() => handleTabChange('perfil_publico')}
            className={`flex-1 min-w-[140px] py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'perfil_publico'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            Perfil Público
          </button>
        )}

        <button
          onClick={() => handleTabChange('principal')}
          className={`flex-1 min-w-[140px] py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'principal'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          {isOrg ? <Building2 className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
          {isOrg ? 'Datos Institucionales' : 'Información Personal'}
        </button>

        <button
          onClick={() => handleTabChange('ubicacion')}
          className={`flex-1 min-w-[140px] py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'ubicacion'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Contacto & Ubicación
        </button>

        <button
          onClick={() => handleTabChange('seguridad')}
          className={`flex-1 min-w-[140px] py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'seguridad'
              ? 'bg-red-600 text-white shadow-xs'
              : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          Seguridad
        </button>
      </div>

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* TAB 0: Personalización de Perfil Público (Exclusivo para Organizaciones) */}
        {isOrg && activeTab === 'perfil_publico' && (
          <div className="space-y-6">
            {/* Banner de Bienvenida e Instrucciones */}
            <div className="p-5 bg-gradient-to-r from-red-900 via-neutral-900 to-black text-white rounded-2xl shadow-sm border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Personalización de la Página Pública
                </div>
                <span className="text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Página Visible a Voluntarios y Donantes
                </span>
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider text-white">
                Construye una Presencia Institucional Confiable
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-2xl">
                La información configurada en esta pestaña se mostrará directamente a toda la comunidad en la URL de tu perfil público (<span className="text-white font-mono font-bold">/perfil/{publicProfileId}</span>).
              </p>
              <div className="pt-1 flex gap-3">
                <Link to={`/perfil/${publicProfileId}`} target="_blank" rel="noopener noreferrer">
                  <button type="button" className="bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-black px-4 py-2 rounded-xl border border-white shadow-xs flex items-center justify-center cursor-pointer transition-all">
                    <Eye className="w-3.5 h-3.5 mr-1.5 text-red-600 shrink-0" />
                    <span className="text-neutral-950 font-black">Abrir mi Perfil Público</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Configuración de Imagen de Portada (Banner) */}
            <Card title="1. Imagen de Portada Principal">
              <div className="space-y-4">
                <p className="text-xs text-neutral-500">
                  Sube una foto representativa en alta resolución (proporción panorámica 16:9). Se mostrará en el encabezado de tu página pública.
                </p>

                <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-900 group shadow-inner">
                  {portadaBase64 ? (
                    <img
                      src={portadaBase64}
                      alt="Portada de la Organización"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-neutral-800 via-neutral-900 to-black flex flex-col items-center justify-center text-white p-6 text-center">
                      <Camera className="w-10 h-10 mb-2 text-neutral-500" />
                      <p className="text-xs font-bold text-neutral-300">Aún no has configurado una imagen de portada personalizada</p>
                      <p className="text-[10px] text-neutral-500 mt-1">Se utilizará el banner institucional estándar por defecto</p>
                    </div>
                  )}

                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer p-4 text-center">
                    <Upload className="w-8 h-8 mb-2 text-red-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider">Subir Nueva Foto de Portada</span>
                    <span className="text-[10px] text-neutral-300 mt-1">Formatos JPG, PNG, WEBP (Máx. 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'portada')}
                      className="hidden"
                    />
                  </label>

                  {portadaBase64 && (
                    <button
                      type="button"
                      onClick={() => setPortadaBase64('')}
                      className="absolute top-3 right-3 bg-neutral-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/20 hover:bg-red-600 transition-colors z-10"
                    >
                      Quitar Portada
                    </button>
                  )}
                </div>
              </div>
            </Card>

            {/* Presentación, Biografía y Filosofía */}
            <Card title="2. Presentación e Identidad Institucional">
              <div className="space-y-4">
                <Textarea
                  label="Presentación General / Biografía Pública"
                  placeholder="Escribe una breve reseña de la fundación, su historia, grupos a los que atiende y logros destacados..."
                  rows={4}
                  {...register('biografia')}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label="Misión Institucional"
                    placeholder="Escribe la misión de tu organización..."
                    rows={4}
                    {...register('mision')}
                  />
                  <Textarea
                    label="Visión Institucional"
                    placeholder="Escribe la visión a futuro de tu organización..."
                    rows={4}
                    {...register('vision')}
                  />
                </div>
              </div>
            </Card>

            {/* Presencia Digital & Redes Sociales */}
            <Card title="3. Presencia Digital y Enlaces Oficiales">
              <div className="space-y-4">
                <Input
                  label="Sitio Web Oficial"
                  placeholder="https://www.tuorganización.org"
                  icon={<Globe className="w-4 h-4 text-neutral-400" />}
                  {...register('sitioWeb')}
                />

                <p className="text-xs font-bold text-neutral-800 uppercase tracking-wider pt-2">
                  Redes Sociales Institucionales
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Facebook"
                    placeholder="https://facebook.com/tuorganizacion"
                    icon={<Share2 className="w-4 h-4 text-blue-600" />}
                    {...register('redes_facebook')}
                  />
                  <Input
                    label="Instagram"
                    placeholder="https://instagram.com/tuorganizacion"
                    icon={<Camera className="w-4 h-4 text-pink-600" />}
                    {...register('redes_instagram')}
                  />
                  <Input
                    label="Twitter / X"
                    placeholder="https://twitter.com/tuorganizacion"
                    icon={<AtSign className="w-4 h-4 text-sky-500" />}
                    {...register('redes_twitter')}
                  />
                  <Input
                    label="LinkedIn"
                    placeholder="https://linkedin.com/company/tuorganizacion"
                    icon={<Briefcase className="w-4 h-4 text-blue-700" />}
                    {...register('redes_linkedin')}
                  />
                </div>
              </div>
            </Card>

            {/* Privacidad y Configuración de Visibilidad */}
            <Card title="4. Visibilidad de Datos en el Perfil Público">
              <div className="space-y-3">
                <p className="text-xs text-neutral-500 mb-2">
                  Selecciona qué información adicional deseas mostrar abiertamente a los visitantes en tu perfil público:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      {...register('mostrarCorreo')}
                    />
                    <div className="text-xs">
                      <p className="font-bold text-neutral-900">Mostrar Correo Electrónico</p>
                      <p className="text-[10px] text-neutral-500">Permite recepción de consultas por e-mail</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      {...register('mostrarTelefono')}
                    />
                    <div className="text-xs">
                      <p className="font-bold text-neutral-900">Mostrar Teléfono de Contacto</p>
                      <p className="text-[10px] text-neutral-500">Visibilidad de número telefónico público</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      {...register('mostrarUbicacion')}
                    />
                    <div className="text-xs">
                      <p className="font-bold text-neutral-900">Mostrar Dirección Física</p>
                      <p className="text-[10px] text-neutral-500">Muestra barrio, localidad y ciudad</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200 cursor-pointer hover:bg-neutral-100 transition-colors">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                      {...register('mostrarEstadisticas')}
                    />
                    <div className="text-xs">
                      <p className="font-bold text-neutral-900">Mostrar Métricas de Impacto</p>
                      <p className="text-[10px] text-neutral-500">Muestra causas, voluntarios y donaciones</p>
                    </div>
                  </label>
                </div>
              </div>
            </Card>

            {/* Vista Previa en Tiempo Real de la Tarjeta Pública */}
            <Card title="5. Vista Previa de tu Tarjeta Pública">
              <div className="p-4 bg-neutral-100 rounded-2xl border border-neutral-200 space-y-4">
                <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                  {/* Banner Preview */}
                  <div className="h-32 bg-gradient-to-r from-red-900 via-neutral-900 to-black relative">
                    {portadaBase64 && (
                      <img src={portadaBase64} alt="Portada" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-80" />
                    )}
                    <div className="absolute -bottom-6 left-6 flex items-end gap-3">
                      <div className="w-16 h-16 rounded-xl border-2 border-white bg-white overflow-hidden shadow-md flex items-center justify-center">
                        {logoBase64 ? (
                          <img src={logoBase64} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <Building2 className="w-8 h-8 text-neutral-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Body Preview */}
                  <div className="pt-8 p-6 space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-neutral-950 uppercase tracking-wider">
                          {watchNombre1 || user.nombre1}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
                      </div>
                      <p className="text-xs font-bold text-red-600">
                        Organización {watchCategoria ? `• ${watchCategoria}` : ''}
                      </p>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                      {watchBiografia || watchMision || 'Esta organización aún está completando su biografía pública en la plataforma Give&Go.'}
                    </p>

                    <div className="pt-2 flex flex-wrap gap-2 items-center justify-between border-t border-neutral-100 text-xs text-neutral-500">
                      <div className="flex items-center gap-2">
                        {watchSitioWeb && (
                          <span className="flex items-center gap-1 font-semibold text-neutral-700">
                            <Globe className="w-3.5 h-3.5 text-neutral-400" />
                            Sitio Web Configurado
                          </span>
                        )}
                        {watchFacebook && <Share2 className="w-3.5 h-3.5 text-blue-600" />}
                        {watchInstagram && <Camera className="w-3.5 h-3.5 text-pink-600" />}
                      </div>

                      <Link to={`/perfil/${publicProfileId}`} target="_blank" rel="noopener noreferrer">
                        <span className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                          Ver Perfil Completo <ExternalLink className="w-3 h-3" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 1: Información Institucional / Identidad */}
        {activeTab === 'principal' && (
          <Card title={isOrg ? "Detalles Institucionales" : "Detalles de Identidad"}>
            {isOrg ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre de la Organización"
                    error={errors.nombre1?.message}
                    {...register('nombre1', { required: 'El nombre de la organización es obligatorio' })}
                  />
                  <Input
                    label="NIT (Identificación Tributaria)"
                    placeholder="e.g. 900.123.456-7"
                    error={errors.nit?.message}
                    {...register('nit', { required: 'El NIT es obligatorio para organizaciones' })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Representante Legal"
                    error={errors.representante_legal?.message}
                    {...register('representante_legal', { required: 'El representante legal es obligatorio' })}
                  />
                  <Select
                    label="Categoría de Enfoque"
                    options={[
                      { value: '', label: 'Seleccionar categoría...' },
                      { value: 'Alimentos', label: 'Alimentos / Nutrición' },
                      { value: 'Salud', label: 'Salud & Medicina' },
                      { value: 'Educacion', label: 'Educación & Capacitación' },
                      { value: 'Ecologico', label: 'Ecología & Medio Ambiente' },
                      { value: 'Derechos', label: 'Derechos Humanos & Social' },
                      { value: 'Otros', label: 'Otros Servicios' },
                    ]}
                    error={errors.categoria?.message}
                    {...register('categoria', { required: 'La categoría es requerida' })}
                  />
                </div>

                <Textarea
                  label="Descripción Resumida"
                  placeholder="Describe brevemente la misión y actividades de la organización..."
                  rows={4}
                  {...register('descripcion')}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primer Nombre"
                    error={errors.nombre1?.message}
                    {...register('nombre1', { required: 'El primer nombre es obligatorio' })}
                  />
                  <Input
                    label="Segundo Nombre (Opcional)"
                    {...register('nombre2')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Primer Apellido"
                    error={errors.apellido1?.message}
                    {...register('apellido1', { required: 'El primer apellido es obligatorio' })}
                  />
                  <Input
                    label="Segundo Apellido (Opcional)"
                    {...register('apellido2')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Select
                    label="Tipo de Documento"
                    options={[
                      { value: '', label: 'Seleccionar...' },
                      { value: 'CC', label: 'Cédula de Ciudadanía' },
                      { value: 'CE', label: 'Cédula de Extranjería' },
                      { value: 'TI', label: 'Tarjeta de Identidad' },
                      { value: 'PAS', label: 'Pasaporte' },
                    ]}
                    error={errors.tipo_documento?.message}
                    {...register('tipo_documento', { required: 'El tipo de documento es obligatorio' })}
                  />
                  <Input
                    label="Número de Documento"
                    error={errors.num_documento?.message}
                    {...register('num_documento', { required: 'El número de documento es obligatorio' })}
                  />
                  <Input
                    label="Fecha de Nacimiento"
                    type="date"
                    error={errors.fecha_nacimiento?.message}
                    {...register('fecha_nacimiento', { required: 'La fecha de nacimiento es obligatoria' })}
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* TAB 2: Ubicación y Contacto */}
        {activeTab === 'ubicacion' && (
          <Card title="Datos de Contacto y Ubicación Física">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Número de Teléfono"
                  icon={<Phone className="w-4 h-4 text-neutral-400" />}
                  error={errors.telefono?.message}
                  {...register('telefono', { required: 'El teléfono de contacto es obligatorio' })}
                />
                <Input
                  label="Dirección Física"
                  icon={<MapPin className="w-4 h-4 text-neutral-400" />}
                  error={errors.direccion?.message}
                  {...register('direccion', { required: 'La dirección es obligatoria' })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Barrio"
                  error={errors.barrio?.message}
                  {...register('barrio', { required: 'El barrio es obligatorio' })}
                />
                <Input
                  label="Localidad / Zona"
                  error={errors.localidad?.message}
                  {...register('localidad', { required: 'La localidad es obligatoria' })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Ciudad"
                  error={errors.ciudad?.message}
                  {...register('ciudad', { required: 'La ciudad es obligatoria' })}
                />
                <Input
                  label="Departamento"
                  error={errors.departamento?.message}
                  {...register('departamento', { required: 'El departamento es obligatorio' })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="País"
                  error={errors.pais?.message}
                  {...register('pais', { required: 'El país es obligatorio' })}
                />
                <Input
                  label="Código Postal (Opcional)"
                  {...register('codigo_postal')}
                />
              </div>
            </div>
          </Card>
        )}

        {/* TAB 3: Seguridad */}
        {activeTab === 'seguridad' && (
          <div className="space-y-6">
            <Card title="Credenciales de Acceso y Seguridad">
              <div className="space-y-4">
                <Input
                  label="Dirección de Correo Electrónico"
                  type="email"
                  icon={<Mail className="w-4 h-4 text-neutral-400" />}
                  error={errors.correo?.message}
                  {...register('correo', { required: 'El correo electrónico es requerido' })}
                />

                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-neutral-800 tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-red-600" />
                    Cambio de Contraseña (Opcional)
                  </h4>
                  <p className="text-[10px] text-neutral-500 leading-normal">
                    Completa estos campos únicamente si deseas actualizar tu clave actual.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Input
                      label="Nueva Contraseña"
                      type="password"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <Input
                      label="Confirmar Nueva Contraseña"
                      type="password"
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword', {
                        validate: val => {
                          if (watchPassword && val !== watchPassword) {
                            return 'Las contraseñas no coinciden';
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {canDeleteProfile && (
              <Card title="Zona de Peligro — Administración de Cuenta">
                <div className="p-4 bg-red-50/70 border border-red-200/80 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-red-700 font-extrabold text-xs uppercase tracking-wider">
                    <ShieldAlert className="w-4.5 h-4.5 text-red-600" />
                    Eliminación Permanente del Perfil
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      Eliminar mi cuenta de Give&Go
                    </h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                      Si ya no deseas formar parte de la plataforma Give&Go, puedes darte de baja. Se eliminarán permanentemente tus datos de perfil, publicaciones e historial. Esta acción es definitiva y no se puede deshacer.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        setShowDeleteModal(true);
                        setConfirmText('');
                        setDeleteError(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Perfil Definitivamente
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Botón de Envío Global */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs gap-4">
          <div>
            <p className="text-xs font-bold text-neutral-900">
              {isOrg && activeTab === 'perfil_publico' ? 'Guardar Configuración del Perfil Público' : 'Actualizar Perfil'}
            </p>
            <p className="text-[10px] text-neutral-500">
              Los cambios guardados se reflejan inmediatamente en toda la plataforma.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 font-bold px-6 py-2.5 text-xs rounded-xl"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      </form>

      {/* Modal de Confirmación de Eliminación de Cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-neutral-200 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-wider">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Eliminar Perfil de Usuario
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar la cuenta de <strong className="text-neutral-900">{isOrg ? user.nombre1 : `${user.nombre1} ${user.apellido1}`}</strong> ({user.rol})?
              Se borrarán todos tus datos personales, tu perfil público y tus registros. Esta acción es <strong className="text-red-600">permanente e irreversible</strong>.
            </p>

            {deleteError && (
              <Alert type="danger" message={deleteError} />
            )}

            <div className="space-y-2 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <label className="text-[11px] font-bold text-neutral-700 block">
                Escribe <span className="text-red-600 font-mono font-black">ELIMINAR</span> para confirmar:
              </label>
              <Input
                type="text"
                placeholder="ELIMINAR"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="bg-white uppercase font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="text-xs font-bold border-neutral-300"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteAccount}
                isLoading={isDeleting}
                disabled={confirmText.trim().toUpperCase() !== 'ELIMINAR'}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Sí, Eliminar Perfil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
