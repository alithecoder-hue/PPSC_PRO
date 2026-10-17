import { API_BASE } from '@/lib/api';
import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../lib/authFetch';

const API_BASE_URL = API_BASE + '/api/admin';

export const useContent = () => {
  const [data, setData] = useState({ announcements: [], jobs: [], testimonials: [], faqs: [], activityLogs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/content`);
      if (!res.ok) throw new Error('Failed to fetch content data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, loading, error, refreshData: fetchData };
};
