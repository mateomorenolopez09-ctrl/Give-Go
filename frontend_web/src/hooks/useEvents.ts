import { useState, useEffect } from 'react';
import { Evento } from '../types';
import { EventService } from '../services/db';

export function useEvents() {
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.getAll();
      setEvents(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { events, loading, error, refresh: fetchEvents };
}

export default useEvents;
