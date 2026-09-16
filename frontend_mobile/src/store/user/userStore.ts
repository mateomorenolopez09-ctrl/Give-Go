import { useState, useCallback } from 'react';
import { User } from '../auth/types';
import { apiClient } from '../../config/api';

export const useUserStore = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/profile');
      if (res.data.success) {
        setProfile(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener perfil');
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, fetchProfile };
};

export default useUserStore;
