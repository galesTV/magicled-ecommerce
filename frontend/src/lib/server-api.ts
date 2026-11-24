import 'server-only';
import { ApiError, decodeApi } from './api';

export function isBackendId(value: string) {
  return /^[1-9]\d*$/.test(value) && Number(value) <= 2_147_483_647;
}

export function backendRequest(path: string, init: RequestInit = {}) {
  const base = new URL(process.env.BACKEND_API_URL || 'http://127.0.0.1:3000');
  if (
    !['http:', 'https:'].includes(base.protocol) ||
    base.username ||
    base.password ||
    base.search ||
    base.hash
  )
    throw new ApiError('Endereço da API inválido.', 502);
  const url = base.href.replace(/\/+$/, '') + path;
  return fetch(url, {
    ...init,
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
  });
}

export async function publicApi<T>(path: string): Promise<T> {
  try {
    return await decodeApi<T>(await backendRequest(path));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('O catálogo está temporariamente indisponível.', 0);
  }
}
