const rawApiBase = (import.meta.env.VITE_API_BASE || '').trim();

const normalizeApiBase = (base: string) => {
  if (!base || base === '/') return '';
  if (/^https?:\/\//i.test(base)) return base.replace(/\/$/, '');
  if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(?::|\/|$)/i.test(base)) {
    return `http://${base}`.replace(/\/$/, '');
  }
  return `https://${base}`.replace(/\/$/, '');
};

export const API_BASE = normalizeApiBase(rawApiBase);

export const apiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

const TOKEN_KEY = 'lostandfound_token';

export const getToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
};

export const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  message?: string;
}

// Central fetch wrapper: attaches JSON + auth headers and normalises errors.
export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...((options.headers as Record<string, string>) || {}),
    };
    const response = await fetch(apiUrl(path), { ...options, headers });
    let data: any = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
    return {
      ok: response.ok,
      status: response.status,
      data,
      message: data && typeof data === 'object' ? data.message : undefined,
    };
  } catch (error) {
    return { ok: false, status: 0, data: null, message: 'Network error. Please check your connection.' };
  }
}
