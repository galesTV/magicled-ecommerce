'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiMessage, sessionApi } from '@/lib/api';
import { returnPath } from '@/lib/auth-navigation';
import { loginSchema, registerSchema } from '@/lib/form-schemas';
import type { User } from '@/lib/types';

export function Authentication({
  mode,
  next,
  expired = false,
}: {
  mode: 'login' | 'register';
  next?: string;
  expired?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const register = mode === 'register';
  const target = returnPath(next);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (register ? registerSchema : loginSchema).safeParse(fields);
    if (!parsed.success) {
      setMessage(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const user = await sessionApi<User>(mode, parsed.data);
      window.location.replace(user.tipoUsuario === 'ADMIN' ? '/admin' : target);
    } catch (error) {
      setMessage(apiMessage(error));
      setBusy(false);
    }
  }

  return (
    <div className="v3-wrap v3-page">
      <header className="v3-page-head">
        <p className="v3-eyebrow">Minha conta</p>
        <h1>{register ? 'Cadastro' : 'Entrar'}</h1>
        {expired && <p role="status">Sua sessão expirou. Entre novamente para continuar.</p>}
      </header>
      <form className="v3-panel v3-form v3-auth-form" method="post" onSubmit={submit}>
        {register && (
          <label>
            Nome completo
            <input name="nome" autoComplete="name" maxLength={150} required />
          </label>
        )}
        <label>
          E-mail
          <input type="email" name="email" autoComplete="email" maxLength={150} required />
        </label>
        <label>
          Senha
          <input
            name="senha"
            type="password"
            autoComplete={register ? 'new-password' : 'current-password'}
            minLength={register ? 6 : undefined}
            required
          />
        </label>
        {register && (
          <label>
            CPF
            <input name="cpf" inputMode="numeric" maxLength={14} required />
          </label>
        )}
        {message && (
          <p className="v3-inline-status" role="alert">
            {message}
          </p>
        )}
        <button className="v3-button v3-button-dark" type="submit" disabled={busy}>
          {busy ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar'}
        </button>
        <Link
          className="v3-text-link"
          href={{
            pathname: register ? '/login' : '/cadastro',
            query: { next: target },
          }}
        >
          {register ? 'Já tenho conta' : 'Criar uma conta'}
        </Link>
      </form>
    </div>
  );
}

export function SignOut() {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    setMessage('');
    try {
      await sessionApi<null>('logout');
      window.location.replace('/login');
    } catch (error) {
      setMessage(apiMessage(error));
      setBusy(false);
    }
  }
  return (
    <div>
      <button
        className="v3-button v3-button-outline"
        type="button"
        onClick={logout}
        disabled={busy}
      >
        Sair da conta
      </button>
      {message && (
        <p className="v3-inline-status" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
