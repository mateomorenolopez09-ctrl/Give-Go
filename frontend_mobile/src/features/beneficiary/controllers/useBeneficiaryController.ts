import { useState, useEffect } from 'react';
import { SolicitudAyuda } from '../models/beneficiary.models';
import { beneficiaryFeatureService } from '../services/beneficiary.service';

export const useBeneficiaryController = (navigation: any) => {
  const [requests, setRequests] = useState<SolicitudAyuda[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchRequests = async () => {
    try {
      const data = await beneficiaryFeatureService.getMyRequests();
      setRequests(data);
    } catch (e) {
      console.warn('Error al cargar solicitudes:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchRequests();
  };

  const navigateToCreate = () => {
    navigation.navigate('CreateRequest');
  };

  return {
    requests,
    isLoading,
    isRefreshing,
    handleRefresh,
    navigateToCreate,
  };
};

export default useBeneficiaryController;
