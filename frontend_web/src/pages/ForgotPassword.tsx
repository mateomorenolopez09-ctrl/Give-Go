import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { UserService } from '../services/db';
import { Button, Input, Card, Alert } from '../components/UI';
import { KeyRound, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotFormData {
  correo: string;
  nuevaPassword?: string;
  confirmarPassword?: string;
}

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [verifiedEmail, setVerifiedEmail] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ForgotFormData>({});

  const watchedPassword = watch('nuevaPassword');

  const handleStep1Submit = async (data: ForgotFormData) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await UserService.forgotPassword(data.correo);
      setVerifiedEmail(data.correo);
      setStep(2);
      setSuccessMsg('Correo electrónico verificado. Por favor, ingresa tu nueva contraseña.');
    } catch (err: any) {
      setErrorMsg(err.message || 'El correo electrónico no está registrado en el sistema.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (data: ForgotFormData) => {
    if (data.nuevaPassword !== data.confirmarPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await UserService.forgotPassword(verifiedEmail, data.nuevaPassword);
      setSuccessMsg('¡Contraseña actualizada con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al actualizar la contraseña. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <Card
        title="Recuperar Contraseña"
        subtitle={step === 1 ? "Ingresa tu correo registrado para iniciar el proceso" : "Establece tu nueva contraseña de acceso"}
      >
        <div className="mb-4">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-red-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al inicio de sesión
          </Link>
        </div>

        {errorMsg && (
          <Alert type="danger" message={errorMsg} />
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-xs text-green-700 rounded-xl font-medium flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit(handleStep1Submit)} className="space-y-4">
            <Input
              label="Correo Electrónico *"
              type="email"
              placeholder="ejemplo@giveandgo.com"
              error={errors.correo?.message}
              {...register('correo', { 
                required: 'El correo electrónico es requerido',
                pattern: { value: /^\S+@\S+$/i, message: 'Dirección de correo inválida' }
              })}
            />

            <Button 
              variant="primary" 
              type="submit" 
              isLoading={isLoading} 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
            >
              <Mail className="w-4 h-4 mr-2" />
              Verificar Correo
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(handleStep2Submit)} className="space-y-4">
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-150 text-xs text-neutral-600 font-medium">
              Restableciendo cuenta de: <span className="font-bold text-neutral-850">{verifiedEmail}</span>
            </div>

            <Input
              label="Nueva Contraseña *"
              type="password"
              placeholder="Mínimo 6 caracteres"
              error={errors.nuevaPassword?.message}
              {...register('nuevaPassword', { 
                required: 'La nueva contraseña es requerida',
                minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' }
              })}
            />

            <Input
              label="Confirmar Nueva Contraseña *"
              type="password"
              placeholder="Repite la contraseña"
              error={errors.confirmarPassword?.message}
              {...register('confirmarPassword', { 
                required: 'Debe confirmar la contraseña',
                validate: value => value === watchedPassword || 'Las contraseñas no coinciden'
              })}
            />

            <Button 
              variant="primary" 
              type="submit" 
              isLoading={isLoading} 
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs shadow-red-600/10"
            >
              <KeyRound className="w-4 h-4 mr-2" />
              Restablecer Contraseña
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
