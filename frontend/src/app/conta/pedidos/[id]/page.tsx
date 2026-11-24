import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { productHref } from '@/components/v3/navigation';
import { demoAccount } from '@/data/account/demo';
import { formatOrderDate, paymentLabels, statusLabels } from '@/data/account/orders';
import { formatReferencePrice } from '@/data/catalog/service';
import { moneyToCents } from '@/data/catalog/adapter';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { customerApi } from '@/lib/session-server';
import { ApiError } from '@/lib/api';
import { isBackendId } from '@/lib/server-api';
import type { Order } from '@/lib/types';

export const metadata: Metadata = { title: 'Detalhes do pedido' };

async function ApiOrder({ id }: { id: string }) {
  if (!isBackendId(id)) notFound();
  let order: Order;
  try {
    order = await customerApi<Order>('/orders/' + id, '/conta/pedidos/' + id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    if (error.status === 404) notFound();
    return (
      <section className="v3-panel" role="status">
        <h2>Pedido indisponível</h2>
        <p>{error.message}</p>
      </section>
    );
  }
  return (
    <section className="v3-account-shortcuts">
      <Link href="/conta/pedidos" className="v3-text-link">
        <ArrowLeft size={17} aria-hidden="true" /> Voltar aos pedidos
      </Link>
      <div className="v3-account-heading">
        <div>
          <h2>Pedido {order.id}</h2>
          <p>{formatOrderDate(order.dataCriacao)}</p>
        </div>
        <span className="v3-order-status">{statusLabels[order.status]}</span>
      </div>
      <div className="v3-panel">
        <h3>Itens do pedido</h3>
        <ul className="v3-cart-list">
          {order.itens.map((item) => (
            <li key={item.id} className="v3-checkout-line">
              <Link href={productHref(String(item.produtoId))}>
                {item.quantidade} × {item.produto.nome}
              </Link>
              <strong>
                {formatReferencePrice(moneyToCents(item.precoUnitario) * item.quantidade)}
              </strong>
            </li>
          ))}
        </ul>
        <p>
          Valor registrado do pedido{' '}
          <strong>{formatReferencePrice(moneyToCents(order.valorTotal))}</strong>
        </p>
        {order.pagamento && (
          <>
            <p>Status de pagamento registrado: {paymentLabels[order.pagamento.status]}</p>
            <p>A confirmação pelo provedor de pagamento ainda está indisponível.</p>
          </>
        )}
      </div>
      <div className="v3-panel">
        <h3>Entrega</h3>
        <p>
          {order.endereco.logradouro}, {order.endereco.numero} · {order.endereco.cidade} –{' '}
          {order.endereco.estado}
        </p>
        <p>
          {order.codigoRastreio
            ? 'Rastreio: ' + order.codigoRastreio
            : 'Rastreio ainda indisponível.'}
        </p>
      </div>
    </section>
  );
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (apiEnabled) return <ApiOrder id={id} />;
  if (!demoEnabled) return null;
  const order = demoAccount.findOrder(id);
  if (!order) notFound();

  return (
    <section>
      <Link href="/conta/pedidos" className="v3-text-link">
        <ArrowLeft size={17} aria-hidden="true" /> Voltar aos pedidos
      </Link>
      <div className="v3-account-heading">
        <div>
          <h2>Pedido {order.id.toUpperCase()}</h2>
          <p>Registro fictício · {order.date}</p>
        </div>
        <span className="v3-order-status">{order.status}</span>
      </div>
      <div className="v3-panel">
        <h3>Itens do exemplo</h3>
        <ul className="v3-cart-list">
          {order.items.map((item) => (
            <li key={item.slug} className="v3-checkout-line">
              <Link href={productHref(item.slug)}>
                {item.quantity} × {item.name}
              </Link>
              <strong>{formatReferencePrice(item.referencePriceCents * item.quantity)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
