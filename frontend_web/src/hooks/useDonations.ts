import { useState, useEffect } from 'react';
import { DonacionCompleta, DonationService } from '../services/db';

export function useDonations() {
  const [donations, setDonations] = useState<DonacionCompleta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const data = await DonationService.getAll();
      setDonations(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error al cargar donaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return { donations, loading, error, refresh: fetchDonations };
}

export default useDonations;
