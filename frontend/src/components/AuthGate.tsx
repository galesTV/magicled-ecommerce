'use client';

import { useEffect, useState } from 'react';
import { ApiError, apiMessage, sessionApi } from '@/lib/api';
import type { User, UserRole } from '@/lib/types';
import { MessageState } from './MessageState';

export function AuthGate({
  children,
  role,
}: {
  children: (user: User) => React.ReactNode;
  role?: UserRole;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    sessionApi<User>('me').then(setUser).catch(setError);
  }, []);
  if (!user && !error)
    return (
      <div className="shell page-space loading-state" role="status">
        <span className="loading-spinner" aria-hidden="true" /> Validando sua sessão…
      </div>
    );
  if (error)
    return (
      <div className="shell page-space">
        <MessageState
          kind="error"
          title={
            error instanceof ApiError && error.status === 401
              ? 'Sua sessão terminou'
              : 'Não foi possível validar a sessão'
          }
          href={
            error instanceof ApiError && error.status === 401
              ? `/login?next=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/conta')}`
              : typeof window !== 'undefined'
                ? window.location.pathname
                : '/conta'
          }
          action={
            error instanceof ApiError && error.status === 401
              ? 'Entrar novamente'
              : 'Tentar novamente'
          }
        >
          {error instanceof ApiError && error.status === 401
            ? 'Este conteúdo é reservado a usuários autenticados.'
            : apiMessage(error)}
        </MessageState>
      </div>
    );
  if (role && user?.tipoUsuario !== role)
    return (
      <div className="shell page-space">
        <MessageState title="Acesso negado">
          Sua conta não tem permissão para esta área.
        </MessageState>
      </div>
    );
  return <>{children(user!)}</>;
}
