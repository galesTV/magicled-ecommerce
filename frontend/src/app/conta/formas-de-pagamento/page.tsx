import type { Metadata } from 'next';
import { PaymentMethods } from '@/components/v3/PaymentMethods';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { requireUser } from '@/lib/session-server';

export const metadata: Metadata = { title: 'Formas de pagamento da conta' };

export default async function PaymentMethodsPage() {
  if (demoEnabled) return <PaymentMethods />;
  if (!apiEnabled || !(await requireUser('CLIENTE', '/conta/formas-de-pagamento'))) return null;
  return (
    <section className="v3-panel">
      <h2>Formas de pagamento</h2>
      <p>Cadastro de cartões e cobrança ainda estão indisponíveis.</p>
    </section>
  );
}
