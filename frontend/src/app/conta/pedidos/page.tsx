import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { demoAccount } from '@/data/account/demo';
import { formatOrderDate, statusLabels } from '@/data/account/orders';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { customerApi } from '@/lib/session-server';
import { ApiError } from '@/lib/api';
import type { Order } from '@/lib/types';

export const metadata: Metadata = { title: 'Pedidos da conta' };

export default async function OrdersPage() {
  if (!demoEnabled && !apiEnabled) return null;
  let orders: readonly { id: string; date: string; status: string }[] = demoAccount.listOrders();
  if (apiEnabled) {
    try {
      const result = await customerApi<Order[]>('/orders', '/conta/pedidos');
      orders = result.map((order) => ({
        id: String(order.id),
        date: formatOrderDate(order.dataCriacao),
        status: statusLabels[order.status],
      }));
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      return (
        <section className="v3-panel" role="status">
          <h2>Pedidos indisponíveis</h2>
          <p>{error.message}</p>
        </section>
      );
    }
  }

  return (
    <section>
      <div className="v3-account-heading">
        <div>
          <h2>Pedidos</h2>
          {demoEnabled && <p>Exemplos fictícios de acompanhamento.</p>}
        </div>
      </div>
      <div className="v3-account-shortcuts" data-reveal="stagger">
        {!orders.length && <p>Nenhum pedido encontrado.</p>}
        {orders.map((order) => (
          <Link
            className="v3-panel v3-account-shortcut v3-order-card"
            href={'/conta/pedidos/' + order.id}
            key={order.id}
          >
            <div>
              <h3>Pedido {order.id.toUpperCase()}</h3>
              <p>{order.date}</p>
            </div>
            <span className="v3-order-status">{order.status}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
