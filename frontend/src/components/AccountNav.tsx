'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiMessage, sessionApi } from '@/lib/api';
import { useState } from 'react';

export function AccountNav() {
  const path = usePathname();
  const [error, setError] = useState('');
  async function logout() {
    try {
      await sessionApi<null>('logout');
      window.location.assign('/');
    } catch (cause) {
      setError(apiMessage(cause));
    }
  }
  return (
    <nav className="account-nav" aria-label="Minha conta">
      <Link href="/conta" aria-current={path === '/conta' ? 'page' : undefined}>
        Meu perfil
      </Link>
      <Link href="/conta/enderecos" aria-current={path === '/conta/enderecos' ? 'page' : undefined}>
        Endereços
      </Link>
      <Link
        href="/conta/pedidos"
        aria-current={path.startsWith('/conta/pedidos') ? 'page' : undefined}
      >
        Pedidos
      </Link>
      <button type="button" aria-label="Sair da conta" onClick={logout}>
        Sair
      </button>
      {error && <small role="alert">{error}</small>}
    </nav>
  );
}
