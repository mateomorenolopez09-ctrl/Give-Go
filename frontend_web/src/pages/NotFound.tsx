import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';
import { ShieldAlert } from 'lucide-react';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center">
        <ShieldAlert className="w-8 h-8 text-red-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black text-neutral-950 uppercase tracking-wider">Error 404</h1>
        <p className="text-sm text-neutral-500 font-medium">Página no encontrada</p>
      </div>
      <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
        El enlace al que intenta acceder no existe, ha sido modificado o la ruta de acceso requiere de privilegios de inicio de sesión diferentes.
      </p>
      <Button variant="primary" size="sm" onClick={() => navigate('/')}>
        Regresar al Inicio
      </Button>
    </div>
  );
};
