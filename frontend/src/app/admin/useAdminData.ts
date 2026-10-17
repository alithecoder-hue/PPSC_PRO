import { API_BASE } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { authFetch } from './lib/authFetch';

const API_BASE_URL = API_BASE + '/api/admin';

export const useAdminData = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        authFetch(`${API_BASE_URL}/stats`),
        authFetch(`${API_BASE_URL}/users`),
      ]);
      if (!statsRes.ok) throw new Error('Unauthorized');
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
    } catch (err) {
      setError('Failed to fetch admin data. Make sure you are logged in as ADMIN.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return { stats, users, loading, error, refreshData: fetchDashboardData };
};
