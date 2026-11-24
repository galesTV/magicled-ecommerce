'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiMessage, sessionApi } from '@/lib/api';
import type { User } from '@/lib/types';
import { Eye, EyeOff } from 'lucide-react';

import { loginSchema, registerSchema } from '@/lib/form-schemas';

export function AuthForm({ mode, next }: { mode: 'login' | 'register'; next?: string }) {
  const [values, setValues] = useState({ nome: '', email: '', senha: '', cpf: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = (mode === 'login' ? loginSchema : registerSchema).safeParse(values);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }
    setErrors({});
    setMessage('');
    setBusy(true);
    try {
      const body = mode === 'login' ? { email: values.email, senha: values.senha } : values;
      const authenticated = await sessionApi<User>(mode, body);
      window.location.assign(
        next && next.startsWith('/') && !next.startsWith('//')
          ? next
          : authenticated.tipoUsuario === 'ADMIN'
            ? '/admin'
            : '/conta',
      );
    } catch (error) {
      setMessage(apiMessage(error));
      setBusy(false);
    }
  }
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <div className="auth-form-heading">
        <span className="eyebrow">{mode === 'login' ? 'ACESSO À CONTA' : 'SEUS DADOS'}</span>
        <h2>{mode === 'login' ? 'Entre na sua conta' : 'Crie sua conta'}</h2>
        <p>
          {mode === 'login'
            ? 'Seus pedidos e endereços em um só lugar.'
            : 'Preencha seus dados para começar.'}
        </p>
      </div>
      {mode === 'register' && (
        <div className="form-field">
          <label htmlFor="auth-name">Nome completo</label>
          <input
            id="auth-name"
            autoComplete="name"
            value={values.nome}
            onChange={(e) => setValues({ ...values, nome: e.target.value })}
            aria-invalid={!!errors.nome}
          />
          {errors.nome && <small role="alert">{errors.nome}</small>}
        </div>
      )}
      <div className="form-field">
        <label htmlFor="auth-email">E-mail</label>
        <input
          id="auth-email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues({ ...values, email: e.target.value })}
          aria-invalid={!!errors.email}
        />
        {errors.email && <small role="alert">{errors.email}</small>}
      </div>
      {mode === 'register' && (
        <div className="form-field">
          <label htmlFor="auth-cpf">CPF</label>
          <input
            id="auth-cpf"
            inputMode="numeric"
            autoComplete="off"
            value={values.cpf}
            onChange={(e) => setValues({ ...values, cpf: e.target.value })}
            aria-invalid={!!errors.cpf}
          />
          {errors.cpf && <small role="alert">{errors.cpf}</small>}
        </div>
      )}
      <div className="form-field">
        <label htmlFor="auth-password">Senha</label>
        <div className="password-field">
          <input
            id="auth-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={values.senha}
            onChange={(e) => setValues({ ...values, senha: e.target.value })}
            aria-invalid={!!errors.senha}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar caracteres' : 'Exibir caracteres'}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
        {errors.senha && <small role="alert">{errors.senha}</small>}
      </div>
      {mode === 'login' && (
        <Link className="subtle-link" href="/recuperar-senha">
          Esqueceu sua senha?
        </Link>
      )}
      {message && (
        <p role="alert" className="form-error">
          {message}
        </p>
      )}
      <button className="button button-dark" type="submit" disabled={busy}>
        {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar na minha conta' : 'Criar conta'}
      </button>
      <p className="auth-switch">
        {mode === 'login' ? (
          <>
            Ainda não tem conta? <Link href="/cadastro">Cadastre-se</Link>
          </>
        ) : (
          <>
            Já tem conta? <Link href="/login">Entrar</Link>
          </>
        )}
      </p>
    </form>
  );
}
