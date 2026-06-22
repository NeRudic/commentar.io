const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(`API Error ${status}: ${message}`);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text);
  }
  return res.json() as Promise<T>;
}

export function get<T>(path: string): Promise<T> {
  return fetch(`${BASE_URL}${path}`).then(handleResponse<T>);
}

export function post<T>(path: string, body: unknown): Promise<T> {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(handleResponse<T>);
}
