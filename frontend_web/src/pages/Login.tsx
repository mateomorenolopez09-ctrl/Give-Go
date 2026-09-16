import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Alert } from '../components/UI';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Heart, 
  Users, 
  Building2, 
  ShieldCheck, 
  Wrench,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LoginFormData {
  correo: string;
  password?: string;
}

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormData>({});

  const handleLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg(null);

    const result = await login(data.correo, data.password || '');
    if (result.success) {
      // Redirigir a la página pública de inicio (Home)
      navigate('/');
    } else {
      setErrorMsg(result.error || 'Correo o contraseña incorrectos.');
      setIsLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setValue('correo', 'admin@giveandgo.com');
    setValue('password', 'Admin123*');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* =========================================================
            COLUMNA IZQUIERDA - Branding & Motivación
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
              Bienvenido nuevamente.
            </h1>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed font-normal">
              Inicia sesión y continúa ayudando a construir una comunidad más solidaria e inclusiva.
            </p>
          </div>

          {/* Composición Visual e Ilustrativa */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-500/10 via-neutral-100 to-amber-500/10 border border-neutral-200/80 p-6 sm:p-8 shadow-xs">
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-brand/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-4 my-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-white shadow-md flex items-center justify-center border border-red-100 text-brand">
                  <Heart className="w-10 h-10 fill-brand/20 text-brand" />
                </div>
                {/* Badges Flotantes */}
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
                  Ecosistema Give&amp;Go
                </span>
                <p className="text-xs text-neutral-600 font-medium mt-2 max-w-xs mx-auto">
                  Accede a tu panel personalizado para gestionar tus donaciones, eventos y voluntariados en tiempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Beneficios */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ventajas de tu cuenta</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-red-50 text-red-600 shrink-0 font-bold">❤️</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Participa en eventos solidarios</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Súmate a actividades comunitarias y apoya directamente a causas activas.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 font-bold">🤝</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Conecta con organizaciones</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Gestión transparente y segura con instituciones y fundaciones aliadas.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 font-bold">🛡️</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Plataforma segura y confiable</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Tus credenciales y datos personales están protegidos de extremo a extremo.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-2xl bg-white border border-neutral-150 shadow-2xs hover:border-red-200 transition-colors">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0 font-bold">⚡</div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">Accede rápidamente a tu cuenta</h4>
                  <p className="text-[11px] text-neutral-500 leading-normal">Consulta tus certificados, solicitudes e historial en un solo lugar.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            COLUMNA DERECHA - Tarjeta de Formulario de Login
           ========================================================= */}
        <div className="lg:col-span-7 xl:col-span-7">
          <div className="bg-white border border-neutral-200/80 rounded-3xl shadow-xl shadow-neutral-200/40 p-6 sm:p-8 md:p-10 relative">
            
            {/* Header Formulario */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-red-50 text-brand flex items-center justify-center border border-red-100 shadow-2xs">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">Iniciar sesión</h2>
                  <p className="text-xs text-neutral-500 font-medium">Accede a tu cuenta y continúa generando impacto con Give&amp;Go.</p>
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6">
                <Alert type="danger" message={errorMsg} />
              </div>
            )}

            <form onSubmit={handleSubmit(handleLoginSubmit)} className="space-y-4">
              {/* Campo Correo Electrónico */}
              <div>
                <Input
                  label="Correo Electrónico"
                  type="email"
                  placeholder="ejemplo@giveandgo.com"
                  error={errors.correo?.message}
                  {...register('correo', { 
                    required: 'El correo electrónico es requerido',
                    pattern: { value: /^\S+@\S+$/i, message: 'Dirección de correo inválida' }
                  })}
                />
              </div>

              {/* Campo Contraseña con Botón Ocultar/Mostrar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider select-none">
                    Contraseña
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-semibold text-neutral-500 hover:text-brand transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full pl-4 pr-11 py-3 border text-sm rounded-xl bg-white text-neutral-950 placeholder-neutral-400 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand transition-all duration-150 ${
                      errors.password ? 'border-brand-error focus:ring-brand-error/10' : 'border-neutral-200 hover:border-neutral-300'
                    }`}
                    {...register('password', { 
                      required: 'La contraseña es requerida',
                      minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
                    })}
                  />
                  
                  {/* Botón Ojo Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
                    title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-brand-error font-medium">{errors.password.message}</p>
                )}
              </div>

              {/* Botón Principal Iniciar Sesión */}
              <Button 
                variant="primary" 
                type="submit" 
                isLoading={isLoading} 
                disabled={isLoading}
                className="w-full py-3 mt-2 text-sm font-bold rounded-2xl shadow-md shadow-brand/20 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar sesión</span>
              </Button>

              {/* Tarjeta Secundaria: Acceso Rápido para Desarrollo */}
              <div className="mt-6 pt-5 border-t border-neutral-150">
                <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/80 space-y-3">
                  <div className="flex items-center gap-2 text-neutral-700">
                    <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-neutral-800">Acceso rápido para desarrollo</span>
                  </div>

                  <button
                    type="button"
                    onClick={fillAdminCredentials}
                    className="w-full py-2.5 px-4 bg-white hover:bg-neutral-100 border border-neutral-200/90 rounded-xl text-xs font-bold text-neutral-700 flex items-center justify-center gap-2 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand" />
                    <span>Cargar cuenta Administrador</span>
                  </button>

                  <p className="text-[11px] text-neutral-400 text-center font-normal">
                    Disponible únicamente durante el desarrollo.
                  </p>
                </div>
              </div>

              {/* Redirección a Registro */}
              <div className="text-center text-xs text-neutral-500 pt-3">
                ¿No tienes una cuenta?{' '}
                <Link to="/register" className="text-brand font-bold hover:underline inline-flex items-center gap-1">
                  <span>Crear cuenta</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

