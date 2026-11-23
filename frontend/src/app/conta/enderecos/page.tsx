import type { Metadata } from 'next';
import { MapPin } from 'lucide-react';
import { demoAccount } from '@/data/account/demo';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { ApiError } from '@/lib/api';
import { customerApi } from '@/lib/session-server';
import type { Address } from '@/lib/types';
import { AccountAddresses } from '@/components/v3/AccountAddresses';

export const metadata: Metadata = { title: 'Endereços da conta' };

export default async function AddressesPage() {
  if (apiEnabled) {
    try {
      const addresses = await customerApi<Address[]>('/addresses', '/conta/enderecos');
      return (
        <section>
          <div className="v3-account-heading">
            <h2>Endereços</h2>
          </div>
          <AccountAddresses initial={addresses} />
        </section>
      );
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      return (
        <section className="v3-panel" role="status">
          <h2>Endereços indisponíveis</h2>
          <p>{error.message}</p>
        </section>
      );
    }
  }
  if (!demoEnabled) return null;

  return (
    <section>
      <div className="v3-account-heading">
        <div>
          <h2>Endereços</h2>
          <p>Registro fictício para visualizar a estrutura da conta.</p>
        </div>
      </div>
      {demoAccount.addresses.map((address) => (
        <article className="v3-panel v3-address-card" key={address.label}>
          <MapPin size={26} aria-hidden="true" />
          <div>
            <h3>{address.label}</h3>
            <p>
              {address.kind} · {address.location}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
