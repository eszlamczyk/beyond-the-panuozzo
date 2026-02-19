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

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (body && typeof body === 'object' && 'message' in body) {
      const msg = (body as { message: unknown }).message;
      if (typeof msg === 'string') return msg;
      if (Array.isArray(msg) && typeof msg[0] === 'string') return msg[0];
    }
  } catch {
    // no parseable body
  }
  return response.statusText;
}

async function fetchWithRetry(
  path: string,
  init: RequestInit | undefined,
  token: string | null,
): Promise<Response> {
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

  const response = await doFetch(token);

  if (response.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) return doFetch(newToken);
  }

  return response;
}

export async function apiFetch(path: string, init?: RequestInit): Promise<void>;
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T>;
export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T | void> {
  const { token } = useAuthStore.getState();
  const response = await fetchWithRetry(path, init, token);

  if (response.status === 401) {
    useAuthStore.getState().clearToken();
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined;
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
