import type { Metadata } from 'next';
import { Unavailable } from '@/components/v3/Unavailable';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { Authentication } from '@/components/v3/Authentication';

export const metadata: Metadata = { title: 'Entrar' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sessao?: string }>;
}) {
  if (apiEnabled) {
    const { next, sessao } = await searchParams;
    return <Authentication mode="login" next={next} expired={sessao === 'expirada'} />;
  }
  return (
    <Unavailable
      title="Entrar"
      description="A autenticação será disponibilizada na operação comercial."
      demoLink={demoEnabled}
    />
  );
}
