import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../services/admin.service';
import { AdminStats, AdminUserItem, AdminAuditItem } from '../models/admin.models';

export function useAdminController() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalDonations: 0,
    pendingVerifications: 0,
  });
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [audits, setAudits] = useState<AdminAuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes, auditsRes] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getAllUsers(),
        AdminService.getRecentAudits(),
      ]);
      setStats(statsRes);
      setUsers(usersRes);
      setAudits(auditsRes);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  return {
    stats,
    users,
    audits,
    isLoading,
    refreshing,
    onRefresh,
  };
}

export default useAdminController;
