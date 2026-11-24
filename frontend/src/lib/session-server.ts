import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { ApiError, decodeApi } from './api';
import { loginHref } from './auth-navigation';
import { backendRequest } from './server-api';
import type { User, UserRole } from './types';

export const sessionCookie = 'magicled_session';

type Session =
  { kind: 'authenticated'; user: User } | { kind: 'guest' | 'expired' | 'unavailable' };

export function sessionUser(value: unknown): User | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const { id, email, tipoUsuario, nome } = value as Partial<User>;
  if (
    typeof id !== 'number' ||
    !Number.isSafeInteger(id) ||
    id < 1 ||
    typeof email !== 'string' ||
    (tipoUsuario !== 'CLIENTE' && tipoUsuario !== 'ADMIN') ||
    (nome !== undefined && typeof nome !== 'string')
  )
    return undefined;
  return { id, email, tipoUsuario, nome };
}

export async function readSession(token: string | undefined): Promise<Session> {
  if (!token) return { kind: 'guest' };
  try {
    const response = await backendRequest('/auth/me', {
      headers: { Authorization: 'Bearer ' + token },
    });
    if (response.status === 401) return { kind: 'expired' };
    const user = sessionUser(await decodeApi<unknown>(response));
    return user ? { kind: 'authenticated', user } : { kind: 'unavailable' };
  } catch {
    return { kind: 'unavailable' };
  }
}

export const getSession = cache(async () =>
  readSession((await cookies()).get(sessionCookie)?.value),
);

export async function requireUser(role: UserRole, next: string): Promise<User | null> {
  const session = await getSession();
  if (session.kind === 'unavailable') return null;
  if (session.kind !== 'authenticated') redirect(loginHref(next, session.kind === 'expired'));
  if (session.user.tipoUsuario !== role) {
    if (role === 'CLIENTE') redirect('/admin');
    notFound();
  }
  return session.user;
}

export async function customerApi<T>(path: string, next: string): Promise<T> {
  if (!(await requireUser('CLIENTE', next)))
    throw new ApiError('Não foi possível validar sua sessão.', 502);
  const token = (await cookies()).get(sessionCookie)?.value;
  const response = await backendRequest(path, {
    headers: { Authorization: 'Bearer ' + token },
  }).catch(() => {
    throw new ApiError('Não foi possível conectar à API.', 502);
  });
  if (response.status === 401) redirect(loginHref(next, true));
  return decodeApi<T>(response);
}
