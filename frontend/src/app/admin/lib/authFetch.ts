/**
 * A thin wrapper around fetch() that automatically attaches the
 * JWT token from localStorage to every request.
 * Used exclusively by admin hooks so all API calls are authenticated.
 */
export const authFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};
