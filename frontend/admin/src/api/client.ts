import { useAuthStore } from '@/auth/auth-store';

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL environment variable is required');
}

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string;

async function refreshAccessToken(): Promise<string | null> {
  const { setToken, clearToken } = useAuthStore.getState();

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      clearToken();
      return null;
    }

    const data = (await response.json()) as { token: string };
    setToken(data.token);
    return data.token;
  } catch {
    clearToken();
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const { token } = useAuthStore.getState();

  const doFetch = (accessToken: string | null) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init?.headers,
      },
    });

  let response = await doFetch(token);

  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await doFetch(newToken);
    }
  }

  if (response.status === 401) {
    useAuthStore.getState().clearToken();
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(`API error: ${status} ${message}`);
    this.name = 'ApiError';
    this.status = status;
  }
}
