import { useState, useEffect } from 'react';
import { Donacion } from '../models/donation.models';
import { donationFeatureService } from '../services/donation.service';

export const useDonationsController = (navigation: any) => {
  const [donations, setDonations] = useState<Donacion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchDonations = async () => {
    try {
      const data = await donationFeatureService.getAll();
      setDonations(data);
    } catch (e) {
      console.warn('Error al cargar donaciones:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDonations();
  };

  const navigateToCreate = () => {
    navigation.navigate('CreateDonation');
  };

  return {
    donations,
    isLoading,
    isRefreshing,
    handleRefresh,
    navigateToCreate,
  };
};

export default useDonationsController;
