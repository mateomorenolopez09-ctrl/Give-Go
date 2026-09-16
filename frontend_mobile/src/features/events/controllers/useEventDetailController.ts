import { useState, useEffect } from 'react';
import { Evento } from '../models/event.models';
import { eventFeatureService } from '../services/event.service';
import { useAuth } from '../../../store/auth/AuthContext';

export const useEventDetailController = (navigation: any, eventId: number) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<Evento | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const data = await eventFeatureService.getById(eventId);
      setEvent(data);
    } catch (e: any) {
      setErrorMessage(e.message || 'Error al cargar el evento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (tipo: 'voluntario' | 'beneficiario') => {
    if (!event) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await eventFeatureService.registerParticipant(event.id_evento, tipo);
      if (res.success) {
        setSuccessMessage('¡Inscripción registrada con éxito!');
        fetchEvent(); // Refresh slots
      } else {
        setErrorMessage(res.message || 'No se pudo completar la inscripción.');
      }
    } catch (e: any) {
      setErrorMessage(e.response?.data?.message || e.message || 'Error al inscribirse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return {
    user,
    event,
    isLoading,
    isSubmitting,
    successMessage,
    errorMessage,
    handleRegister,
    goBack,
  };
};

export default useEventDetailController;
