import { useState } from 'react';
import { eventFeatureService } from '../services/event.service';
import { useAuth } from '../../../store/auth/AuthContext';

export const useCreateEventController = (navigation: any) => {
  const { user } = useAuth();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [idCategoria, setIdCategoria] = useState<number>(1);
  const [fechaInicio, setFechaInicio] = useState('');
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [cupoMaximo, setCupoMaximo] = useState('20');
  const [direccion, setDireccion] = useState('');
  const [barrio, setBarrio] = useState('');
  const [localidad, setLocalidad] = useState('Kennedy');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreate = async () => {
    if (!titulo.trim() || !descripcion.trim() || !fechaInicio.trim()) {
      setErrorMessage('Por favor completa los campos requeridos (*).');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await eventFeatureService.create({
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        id_categoria: idCategoria,
        fecha_inicio: fechaInicio.trim(),
        hora_inicio: horaInicio.trim(),
        cupo_maximo: parseInt(cupoMaximo, 10) || 20,
        direccion: direccion.trim() || undefined,
        barrio: barrio.trim() || undefined,
        localidad: localidad.trim(),
        estado: 'activo',
      });
      navigation.goBack();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || err.message || 'Error al crear evento.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    titulo,
    setTitulo,
    descripcion,
    setDescripcion,
    idCategoria,
    setIdCategoria,
    fechaInicio,
    setFechaInicio,
    horaInicio,
    setHoraInicio,
    cupoMaximo,
    setCupoMaximo,
    direccion,
    setDireccion,
    barrio,
    setBarrio,
    localidad,
    setLocalidad,
    isLoading,
    errorMessage,
    handleCreate,
    goBack: () => navigation.goBack(),
  };
};

export default useCreateEventController;
