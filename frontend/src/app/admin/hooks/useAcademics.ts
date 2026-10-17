import { API_BASE } from '@/lib/api';
import { useState, useEffect } from 'react';
import { authFetch } from '../lib/authFetch';

const API_BASE_URL = API_BASE + '/api/admin';

export const useAcademics = () => {
  const [data, setData] = useState({ subjects: [], mcqs: [], pastPapers: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/academics`);
      if (!res.ok) throw new Error('Failed to fetch academics data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { ...data, loading, error, refreshData: fetchData };
};
