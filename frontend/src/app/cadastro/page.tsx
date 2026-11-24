import type { Metadata } from 'next';
import { Unavailable } from '@/components/v3/Unavailable';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { Authentication } from '@/components/v3/Authentication';

export const metadata: Metadata = { title: 'Cadastro' };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (apiEnabled) return <Authentication mode="register" next={(await searchParams).next} />;
  return (
    <Unavailable
      title="Cadastro"
      description="O cadastro de clientes será disponibilizado na operação comercial."
      demoLink={demoEnabled}
    />
  );
}
