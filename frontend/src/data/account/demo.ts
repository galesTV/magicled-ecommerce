import { demoEnabled } from '@/lib/data-mode';

export interface DemoOrder {
  id: string;
  date: string;
  status: 'Em preparação' | 'Entregue';
  items: ReadonlyArray<{
    slug: string;
    name: string;
    quantity: number;
    referencePriceCents: number;
  }>;
}

const orders: readonly DemoOrder[] = [
  {
    id: 'demo-102',
    date: '18 de novembro de 2026',
    status: 'Em preparação',
    items: [
      {
        slug: 'refletor-led-rgb-piscina-125-mm',
        name: 'Refletor LED RGB para piscina',
        quantity: 2,
        referencePriceCents: 7300,
      },
    ],
  },
  {
    id: 'demo-101',
    date: '12 de novembro de 2026',
    status: 'Entregue',
    items: [
      {
        slug: 'kit-6-luminarias-espeto-jardim',
        name: 'Kit 6 luminárias espeto para jardim',
        quantity: 1,
        referencePriceCents: 32243,
      },
    ],
  },
];

export const demoAccount = {
  profile: { name: 'Cliente de demonstração' },
  addresses: [{ label: 'Endereço de exemplo', location: 'São Paulo, SP', kind: 'Residencial' }],
  listOrders: () => (demoEnabled ? orders : []),
  findOrder: (id: string) => (demoEnabled ? orders.find((order) => order.id === id) : undefined),
};
