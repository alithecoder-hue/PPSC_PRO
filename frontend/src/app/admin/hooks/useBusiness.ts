import { API_BASE } from '@/lib/api';
import { useState, useEffect } from 'react';
import { authFetch } from '../lib/authFetch';

const API_BASE_URL = API_BASE + '/api/admin';

export const useBusiness = () => {
  const [data, setData] = useState({ subscriptions: [], coupons: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await authFetch(`${API_BASE_URL}/business`);
        if (!res.ok) throw new Error('Failed to fetch business data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { ...data, loading, error };
};
