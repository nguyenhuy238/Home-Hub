const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export async function adminApi<T>(path: string, options?: RequestInit): Promise<T> {
  const isMultipart = typeof FormData !== 'undefined' && options?.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
      ...(options?.headers ?? {}),
    },
  });

  if (response.status === 401) throw new Error('unauthorized');
  if (response.status === 403) throw new Error('forbidden');

  const body = await response.json().catch(() => null) as { data?: T; message?: string } | null;
  if (!response.ok) throw new Error(body?.message ?? 'request-failed');
  return body && 'data' in body ? body.data as T : body as T;
}
