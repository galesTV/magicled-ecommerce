import type { Metadata } from 'next';
import { readCatalog } from '@/data/catalog/server';
import { DemoCartProvider } from '@/components/v3/CartStore';
import { ApiCartProvider } from '@/components/v3/ApiCartStore';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { getSession } from '@/lib/session-server';
import { Header } from '@/components/v3/Header';
import { MotionObserver } from '@/components/v3/Motion';
import { Footer } from '@/components/v3/Footer';
import './globals.css';
import './flows.css';
import './refined.css';
import './v3.css';
import './catalog-v3.css';
import './institutional-v3.css';
import './account-v3.css';

export const metadata: Metadata = {
  title: { default: 'Magic LED | Iluminação para seus projetos', template: '%s | Magic LED' },
  description: 'Explore iluminação LED para piscinas, jardins, decoração e projetos na Magic LED.',
  robots: { index: false, follow: false },
};

async function StoreHeader() {
  const catalog = await readCatalog();
  return <Header {...catalog} />;
}

async function StoreState({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!apiEnabled) return <DemoCartProvider enabled={demoEnabled}>{children}</DemoCartProvider>;
  const session = await getSession();
  const access =
    session.kind === 'authenticated'
      ? session.user.tipoUsuario === 'CLIENTE'
        ? 'customer'
        : 'restricted'
      : session.kind;
  return (
    <ApiCartProvider
      key={session.kind === 'authenticated' ? session.user.id : access}
      access={access}
    >
      {children}
    </ApiCartProvider>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="v3">
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <StoreState>
          <StoreHeader />
          <main id="conteudo" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </StoreState>
        <MotionObserver />
      </body>
    </html>
  );
}
