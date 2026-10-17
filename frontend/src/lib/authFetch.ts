/**
 * Global authFetch utility — auto-attaches JWT token to all requests.
 * Use this anywhere outside the /admin directory.
 */
export const authFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};

export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('userName');
  if (!token) return null;
  return { token, role, name };
};

export const isPremium = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'PREMIUM' || user?.role === 'ADMIN';
};

export const isLoggedIn = (): boolean => {
  return !!getStoredUser();
};
