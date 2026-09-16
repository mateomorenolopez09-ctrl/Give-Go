// Give&Go Web API client
export const API_BASE_URL = '/api';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('gg_token') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data?.message || 'Error en la petición al servidor');
  }

  return data.data !== undefined ? data.data : data;
}

export default apiClient;
