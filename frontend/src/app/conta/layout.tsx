import Link from 'next/link';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AccountNavigation } from '@/components/v3/Account';
import { SignOut } from '@/components/v3/Authentication';
import { PreviewPaymentsProvider } from '@/components/v3/PaymentMethods';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { getSession } from '@/lib/session-server';

export const metadata: Metadata = { title: 'Minha conta' };

export default async function AccountLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = apiEnabled ? await getSession() : null;
  // Each protected page uses its own path when redirecting to login.
  if (session?.kind === 'guest' || session?.kind === 'expired') return children;
  const user = session?.kind === 'authenticated' ? session.user : null;
  if (user?.tipoUsuario === 'ADMIN') redirect('/admin');
  return (
    <div className="v3-wrap v3-page">
      <header className="v3-page-head">
        <p className="v3-eyebrow">{demoEnabled ? 'Conta de demonstração' : 'Área do cliente'}</p>
        <h1>Minha conta</h1>
        {demoEnabled && <p>Experimente a área do cliente com dados fictícios.</p>}
        {user && <SignOut />}
      </header>
      {demoEnabled || user ? (
        <div className="v3-account-layout">
          <AccountNavigation />
          <div className="v3-account-content">
            {demoEnabled ? <PreviewPaymentsProvider>{children}</PreviewPaymentsProvider> : children}
          </div>
        </div>
      ) : (
        <div className="v3-panel" role="status">
          <h2>
            {apiEnabled
              ? 'Sua conta está temporariamente indisponível.'
              : 'Área do cliente indisponível.'}
          </h2>
          <Link className="v3-text-link" href={apiEnabled ? '/conta' : '/contato'}>
            {apiEnabled ? 'Tentar novamente' : 'Ajuda com sua conta'}
          </Link>
        </div>
      )}
    </div>
  );
}
