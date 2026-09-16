import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Alert } from '../components/UI';
import { 
  UserPlus, 
  Heart, 
  HeartHandshake, 
  Building2, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Check,
  Sparkles,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import { LocationPicker } from '../components/LocationPicker';

interface RegisterFormData {
  rol: 'voluntario' | 'beneficiario' | 'organizacion';
  // Campos de persona
  nombre1: string;
  nombre2?: string;
  apellido1: string;
  apellido2?: string;
  telefono: string;
  correo: string;
  password?: string;
  // Campos de organización
  orgNombre?: string;
  orgDireccion?: string;
}

export const Register: React.FC = () => {
  const { register, registerOrg } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State: 'select' (ver tarjetas de roles) or 'form' (ver formulario del rol elegido)
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [selectedRole, setSelectedRole] = useState<'voluntario' | 'beneficiario' | 'organizacion'>('voluntario');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States for Organization Coordinates
  const [orgLat, setOrgLat] = useState<number | null>(null);
  const [orgLng, setOrgLng] = useState<number | null>(null);
  const [orgGeoDetails, setOrgGeoDetails] = useState<any>(null);

  const { register: formRegister, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: {
      rol: 'voluntario',
    }
  });

  const formRole = watch('rol');
  const watchedOrgDireccion = watch('orgDireccion');

  useEffect(() => {
    if (formRole) {
      setSelectedRole(formRole);
    }
  }, [formRole]);

  useEffect(() => {
    // Sincronizar parámetro query ?role=
    const roleParam = searchParams.get('role');
    if (roleParam === 'vol') {
      setValue('rol', 'voluntario');
      setSelectedRole('voluntario');
      setStep('form');
    } else if (roleParam === 'ben') {
      setValue('rol', 'beneficiario');
      setSelectedRole('beneficiario');
      setStep('form');
    } else if (roleParam === 'org') {
      setValue('rol', 'organizacion');
      setSelectedRole('organizacion');
      setStep('form');
    }
  }, [searchParams, setValue]);

  const handleSelectRole = (role: 'voluntario' | 'beneficiario' | 'organizacion') => {
    setSelectedRole(role);
    setValue('rol', role);
    setErrorMsg(null);
    setStep('form');
  };

  const handleRegisterSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (data.rol === 'organizacion') {
        let lat = orgLat;
        let lng = orgLng;
        let details = orgGeoDetails || {};

        if (!lat || !lng) {
          try {
            const query = `${data.orgDireccion}, Bogotá, Colombia`;
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`);
            if (res.ok) {
              const results = await res.json();
              if (results && results.length > 0) {
                const place = results[0];
                lat = parseFloat(place.lat);
                lng = parseFloat(place.lon);
                
                const addr = place.address || {};
                details = {
                  barrio: addr.neighbourhood || addr.suburb || addr.village || addr.residential || '',
                  localidad: addr.suburb || addr.city_district || 'Kennedy',
                  ciudad: addr.city || addr.town || addr.municipality || 'Bogotá',
                  departamento: addr.state || 'Bogotá D.C.',
                  pais: addr.country || 'Colombia'
                };
              }
            }
          } catch (err) {
            console.error("Auto-geocoding fallback failed", err);
          }
        }

        const result = await registerOrg(
          data.orgNombre || '',
          data.orgDireccion || '',
          data.correo,
          data.password || '',
          lat,
          lng,
          details.barrio || '',
          details.localidad || '',
          details.ciudad || 'Bogotá',
          details.departamento || 'Bogotá D.C.',
          details.pais || 'Colombia'
        );

        if (result.success) {
          navigate('/');
        } else {
          setErrorMsg(result.error || 'Error al registrar organización');
        }
      } else {
        const result = await register({
          rol: data.rol,
          nombre1: data.nombre1,
          nombre2: data.nombre2 || '',
          apellido1: data.apellido1,
          apellido2: data.apellido2 || '',
          telefono: data.telefono,
          correo: data.correo,
          password: data.password || ''
        });

        if (result.success) {
          navigate('/');
        } else {
          setErrorMsg(result.error || 'Error al registrar usuario');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado durante el registro.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    {
      id: 'voluntario' as const,
      title: 'Voluntario',
      badge: 'Persona / Voluntariado',
      description: 'Ayuda participando en eventos solidarios y apoyando diferentes causas.',
      icon: Heart,
      accentBg: 'bg-red-50 text-red-600 border-red-100',
      hoverBorder: 'hover:border-red-500 hover:shadow-red-500/10',
    },
    {
      id: 'beneficiario' as const,
      title: 'Beneficiario',
      badge: 'Solicitante de ayuda',
      description: 'Postúlate a eventos organizados por organizaciones para recibir apoyo o acceder a sus servicios.',
      icon: HeartHandshake,
      accentBg: 'bg-amber-50 text-amber-600 border-amber-100',
      hoverBorder: 'hover:border-amber-500 hover:shadow-amber-500/10',
    },
    {
      id: 'organizacion' as const,
      title: 'Organización',
      badge: 'Fundación / ONG',
      description: 'Crea eventos solidarios, administra voluntarios y beneficiarios y genera impacto en tu comunidad.',
      icon: Building2,
      accentBg: 'bg-blue-50 text-blue-600 border-blue-100',
      hoverBorder: 'hover:border-blue-500 hover:shadow-blue-500/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* =========================================================
            COLUMNA IZQUIERDA - Inspiración y Beneficios
           ========================================================= */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-6">
          {/* Logo Branding */}
          <div>
            <Link to="/" className="inline-flex items-center space-x-2 group mb-4">
              <span className="text-3xl font-black text-neutral-950 tracking-tight flex items-center gap-2">
                <span className="text-brand">❤️</span> Give<span className="text-brand">&amp;Go</span>
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 leading-tight tracking-tight mt-2">
              Crea tu cuenta y comienza a generar impacto.
            </h1>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-normal">
              Únete a la comunidad de voluntariado y solidaridad más activa. Conectamos personas, causas y organizaciones para transformar vidas juntos.
            </p>
          </div>

          {/* Tarjeta con Ilustración / Composición Visual */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/10 via-neutral-100 to-amber-500/10 border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Ilustración de Red Social Solidaria */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 my-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center border border-red-100 text-brand">
                  <Heart className="w-10 h-10 fill-brand/20 text-brand" />
                </div>
                {/* Micro badges flotantes */}
                <div className="absolute -top-2 -right-6 bg-white border border-neutral-200 rounded-full px-2.5 py-1 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-neutral-800">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>+1,200 Voluntarios</span>
                </div>
                <div className="absolute -bottom-2 -left-6 bg-white border border-neutral-200 rounded-full px-2.5 py-1 shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-neutral-800">
                  <Building2 className="w-3.5 h-3.5 text-red-600" />
                  <span>85 Fundaciones</span>
                </div>
              </div>

              <div className="pt-3">
                <span className="text-xs font-bold text-brand uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100">
                  Plataforma Solidaria
                </span>
                <p className="text-xs text-neutral-600 font-medium mt-2 max-w-xs mx-auto">
                  Gestiona eventos, realiza donaciones transparentes y conecta directamente con quien lo necesita.
                </p>
              </div>
            </div>
          </div>

          {/* Lista de Beneficios */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">¿Por qué registrarte en Give&amp;Go?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0 font-bold">❤️</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Genera un impacto positivo</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Transforma tu entorno participando en iniciativas de alto valor social.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 font-bold">🤝</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Conecta con organizaciones</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Accede a fundaciones e instituciones verificadas cerca de ti.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 font-bold">🛡️</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Plataforma segura y confiable</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Tus datos están protegidos y la trazabilidad de ayudas es transparente.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0 font-bold">⚡</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Registro rápido y sencillo</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Elige tu rol e inicia tu experiencia en menos de un minuto.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            COLUMNA DERECHA - Tarjeta Principal (Selección / Formulario)
           ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-7">
          <div className="bg-white border border-neutral-200/80 rounded-3xl shadow-xl shadow-neutral-200/40 p-6 sm:p-8 md:p-10 relative">
            
            {/* Header de la tarjeta principal */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-brand flex items-center justify-center border border-red-100 shadow-2xs">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Crear cuenta</h2>
                  <p className="text-xs text-neutral-500 font-medium">Selecciona cómo deseas formar parte de Give&amp;Go.</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6">
                <Alert type="danger" message={errorMsg} />
              </div>
            )}

            {/* ---------------------------------------------------------
                PASO 1: Selección de Tipo de Cuenta (3 Tarjetas)
               --------------------------------------------------------- */}
            {step === 'select' ? (
              <div
                key="step-select"
                className="space-y-4 transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2"
              >
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                    ¿Cuál es tu propósito principal?
                  </p>

                  <div className="space-y-3.5">
                    {roleOptions.map((item) => {
                      const IconComp = item.icon;
                      const isSelected = selectedRole === item.id;

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectRole(item.id)}
                          className={`group relative p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                            isSelected
                              ? 'border-brand bg-red-50/30 shadow-md shadow-brand/10'
                              : 'border-neutral-200/80 bg-white hover:border-brand/40 hover:bg-neutral-50/60 hover:shadow-md hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="flex items-start gap-4 flex-1">
                            {/* Icono del Rol */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${item.accentBg} transition-transform group-hover:scale-105`}>
                              <IconComp className="w-6 h-6" />
                            </div>

                            {/* Detalle */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-neutral-900 group-hover:text-brand transition-colors">
                                  {item.title}
                                </h3>
                                <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-wider border border-neutral-200">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          {/* Indicador de Selección / Flecha */}
                          <div className="shrink-0 flex items-center justify-center">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                              isSelected
                                ? 'bg-brand text-white shadow-xs'
                                : 'bg-neutral-100 text-neutral-400 group-hover:bg-brand group-hover:text-white group-hover:shadow-xs'
                            }`}>
                              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-6 border-t border-neutral-100 text-center text-xs text-neutral-500">
                    ¿Ya tienes una cuenta registrada?{' '}
                    <Link to="/login" className="text-brand font-bold hover:underline">
                      Iniciar Sesión
                    </Link>
                  </div>
                </div>
              ) : (
                /* ---------------------------------------------------------
                   PASO 2: Formulario de Registro para el Rol Seleccionado
                  --------------------------------------------------------- */
                <div
                  key="step-form"
                  className="transition-all duration-300 ease-in-out animate-in fade-in slide-in-from-bottom-2"
                >
                  {/* Banner indicador de rol seleccionado con botón para cambiar */}
                  <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                        selectedRole === 'voluntario' ? 'bg-brand' :
                        selectedRole === 'beneficiario' ? 'bg-amber-600' : 'bg-blue-600'
                      }`}>
                        {selectedRole === 'voluntario' && <Heart className="w-4 h-4 fill-white/20" />}
                        {selectedRole === 'beneficiario' && <HeartHandshake className="w-4 h-4" />}
                        {selectedRole === 'organizacion' && <Building2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-neutral-400 tracking-wider block">Registrándote como</span>
                        <span className="text-xs font-bold text-neutral-900 capitalize">
                          {selectedRole === 'voluntario' ? 'Voluntario (Participar y Donar)' :
                           selectedRole === 'beneficiario' ? 'Beneficiario (Solicitar Apoyo)' :
                           'Organización (Gestionar Eventos)'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setStep('select')}
                      className="text-xs font-bold text-neutral-700 hover:text-brand flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 hover:border-red-200 shadow-xs transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Cambiar tipo</span>
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(handleRegisterSubmit)} className="space-y-4">
                    {/* Campo oculto de rol para el formulario */}
                    <input type="hidden" {...formRegister('rol')} value={selectedRole} />

                    {/* Formulario Dinámico para Organización */}
                    {selectedRole === 'organizacion' ? (
                      <div className="space-y-4">
                        <div className="bg-blue-50/80 p-3.5 rounded-2xl border border-blue-200 text-xs text-blue-900 font-medium flex items-center gap-2.5">
                          <Building2 className="w-5 h-5 text-blue-600 shrink-0" />
                          <span>Registra tu asociación civil, fundación u ONG oficial para crear campañas y coordinar voluntarios.</span>
                        </div>
                        
                        <Input
                          label="Nombre de la Organización"
                          placeholder="Ej: Fundación Manos por Kennedy"
                          error={errors.orgNombre?.message}
                          {...formRegister('orgNombre', { 
                            required: selectedRole === 'organizacion' ? 'El nombre de la organización es obligatorio' : false,
                            minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' }
                          })}
                        />

                        <Input
                          label="Dirección Física de la Sede"
                          placeholder="Calle 38 Sur # 78-45, Kennedy, Bogotá D.C."
                          error={errors.orgDireccion?.message}
                          {...formRegister('orgDireccion', { 
                            required: selectedRole === 'organizacion' ? 'La dirección de la sede es requerida' : false 
                          })}
                        />

                        <div className="bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200">
                          <LocationPicker
                            lat={orgLat}
                            lng={orgLng}
                            initialSearchTerm={watchedOrgDireccion}
                            onChange={(coords) => {
                              setOrgLat(coords.lat);
                              setOrgLng(coords.lng);
                              setValue('orgDireccion', coords.direccion || '');
                              setOrgGeoDetails(coords);
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Formulario Dinámico para Voluntario o Beneficiario */
                      <div className="space-y-4">
                        {selectedRole === 'voluntario' && (
                          <div className="bg-red-50/80 p-3.5 rounded-2xl border border-red-200 text-xs text-red-900 font-medium flex items-center gap-2.5">
                            <Heart className="w-4 h-4 text-brand shrink-0" />
                            <span>Como voluntario podrás sumarte a jornadas solidarias y coordinar donaciones directas.</span>
                          </div>
                        )}

                        {selectedRole === 'beneficiario' && (
                          <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2.5">
                            <HeartHandshake className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Como beneficiario podrás postularte a jornadas sociales de alimentos, salud y apoyo comunitario.</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Primer Nombre"
                            placeholder="Carlos"
                            error={errors.nombre1?.message}
                            {...formRegister('nombre1', { required: 'El primer nombre es obligatorio' })}
                          />
                          <Input
                            label="Segundo Nombre (Opcional)"
                            placeholder="Andrés"
                            {...formRegister('nombre2')}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Primer Apellido"
                            placeholder="Mendoza"
                            error={errors.apellido1?.message}
                            {...formRegister('apellido1', { required: 'El primer apellido es obligatorio' })}
                          />
                          <Input
                            label="Segundo Apellido (Opcional)"
                            placeholder="Castro"
                            {...formRegister('apellido2')}
                          />
                        </div>

                        <Input
                          label="Número de Teléfono"
                          placeholder="Ej: +57 300 123 4567"
                          error={errors.telefono?.message}
                          {...formRegister('telefono', { required: 'El número de teléfono es obligatorio' })}
                        />
                      </div>
                    )}

                    {/* Campos Comunes de Acceso */}
                    <div className="border-t border-neutral-150 pt-4 space-y-4 mt-2">
                      <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Credenciales de Acceso</span>
                      
                      <Input
                        label="Correo Electrónico"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        error={errors.correo?.message}
                        {...formRegister('correo', { 
                          required: 'El correo electrónico es obligatorio',
                          pattern: { value: /^\S+@\S+$/i, message: 'Formato de correo inválida' }
                        })}
                      />

                      <Input
                        label="Establecer Contraseña"
                        type="password"
                        placeholder="Min. 6 caracteres"
                        error={errors.password?.message}
                        {...formRegister('password', { 
                          required: 'La contraseña es requerida',
                          minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                        })}
                      />
                    </div>

                    <Button 
                      variant="primary" 
                      type="submit" 
                      isLoading={isLoading} 
                      className="w-full mt-4 py-3 text-sm font-bold rounded-2xl shadow-md shadow-brand/20"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Crear Cuenta y Acceder
                    </Button>

                    <div className="text-center text-xs text-neutral-500 pt-2">
                      ¿Ya tienes una cuenta registrada?{' '}
                      <Link to="/login" className="text-brand font-bold hover:underline">
                        Iniciar Sesión
                      </Link>
                    </div>
                  </form>
                </div>
              )}
          </div>
        </div>

      </div>
    </div>
  );
};

