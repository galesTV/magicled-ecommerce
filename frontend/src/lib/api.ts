import type { ApiEnvelope, ApiErrorBody } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function decodeApi<T>(response: Response): Promise<T> {
  let payload: ApiEnvelope<T> | ApiErrorBody | null = null;
  try {
    const json: unknown = await response.json();
    if (json && typeof json === 'object' && !Array.isArray(json))
      payload = json as ApiEnvelope<T> | ApiErrorBody;
  } catch {
    /* resposta sem JSON */
  }
  if (!response.ok) {
    const message = payload && 'message' in payload ? payload.message : undefined;
    const description = Array.isArray(message) ? message.join(' · ') : message;
    throw new ApiError(
      description ||
        (response.status === 401
          ? 'Sessão expirada. Entre novamente.'
          : `Falha na requisição (${response.status}).`),
      response.status,
    );
  }
  if (!payload || !('success' in payload) || payload.success !== true || !('data' in payload)) {
    throw new ApiError('Resposta inesperada da API.', 502);
  }
  return payload.data;
}

export function apiMessage(error: unknown): string {
  if (error instanceof ApiError || error instanceof Error) return error.message;
  return 'Não foi possível concluir a operação. Tente novamente.';
}

export async function clientApi<T>(path: string, init: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`/api/backend${path}`, {
      ...init,
      credentials: 'same-origin',
      headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), ...init.headers },
    });
    return await decodeApi<T>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Sem conexão com o serviço. Tente novamente.', 0);
  }
}

export async function sessionApi<T>(
  action: 'login' | 'register' | 'logout' | 'me',
  body?: unknown,
): Promise<T> {
  try {
    const response = await fetch(`/api/session/${action}`, {
      method: action === 'me' ? 'GET' : 'POST',
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    return await decodeApi<T>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Sem conexão com o serviço. Tente novamente.', 0);
  }
}
