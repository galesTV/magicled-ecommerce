import Link from 'next/link';
import { ArrowUpRight, CreditCard, MapPin, Package } from 'lucide-react';
import { demoAccount } from '@/data/account/demo';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { requireUser } from '@/lib/session-server';

const shortcuts = [
  {
    title: 'Pedidos',
    description: 'Acompanhe os exemplos e consulte seus detalhes.',
    liveDescription: 'Acompanhe o status e os detalhes dos seus pedidos.',
    href: '/conta/pedidos',
    icon: Package,
  },
  {
    title: 'Endereços',
    description: 'Veja como um endereço aparece na conta.',
    liveDescription: 'Consulte e cadastre endereços de entrega.',
    href: '/conta/enderecos',
    icon: MapPin,
  },
  {
    title: 'Formas de pagamento',
    description: 'Experimente adicionar e gerenciar cartões de teste.',
    liveDescription: 'Consulte a disponibilidade de pagamentos.',
    href: '/conta/formas-de-pagamento',
    icon: CreditCard,
  },
];

export default async function AccountPage() {
  const user = apiEnabled ? await requireUser('CLIENTE', '/conta') : null;
  if (!demoEnabled && !user) return null;

  return (
    <>
      <div className="v3-account-heading">
        <div>
          <h2>
            Olá,{' '}
            {user ? user.nome || user.email : demoAccount.profile.name.toLocaleLowerCase('pt-BR')}.
          </h2>
          <p>{user ? user.email : 'Escolha o que você quer explorar.'}</p>
        </div>
      </div>
      <div className="v3-account-shortcuts" data-reveal="stagger">
        {shortcuts.map(({ title, description, liveDescription, href, icon: Icon }) => (
          <Link key={href} href={href} className="v3-panel v3-account-shortcut">
            <Icon size={25} aria-hidden="true" />
            <div>
              <h3>{title}</h3>
              <p>{user ? liveDescription : description}</p>
            </div>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </>
  );
}
