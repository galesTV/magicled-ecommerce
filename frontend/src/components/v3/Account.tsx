'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, CreditCard, MapPin, Package, UserRound } from 'lucide-react';

const links = [
  { href: '/conta', title: 'Visão geral', icon: UserRound },
  { href: '/conta/pedidos', title: 'Pedidos', icon: Package },
  { href: '/conta/enderecos', title: 'Endereços', icon: MapPin },
  { href: '/conta/formas-de-pagamento', title: 'Formas de pagamento', icon: CreditCard },
];

export function AccountNavigation() {
  const pathname = usePathname();
  return (
    <nav className="v3-account-nav v3-panel" aria-label="Minha conta">
      {links.map(({ href, title, icon: Icon }) => {
        const active = pathname === href || (href !== '/conta' && pathname.startsWith(href + '/'));
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}>
            <Icon size={19} aria-hidden="true" />
            {title}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        );
      })}
    </nav>
  );
}
