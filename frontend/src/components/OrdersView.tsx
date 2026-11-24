'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiMessage, clientApi } from '@/lib/api';
import { currency, orderStatus } from '@/lib/format';
import type { Order } from '@/lib/types';
import { MessageState } from './MessageState';

export function OrdersView() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    clientApi<Order[]>('/orders')
      .then(setOrders)
      .catch((cause) => setError(apiMessage(cause)));
  }, []);
  if (error)
    return (
      <MessageState
        kind="error"
        title="Não foi possível carregar os pedidos"
        href="/conta/pedidos"
        action="Tentar novamente"
      >
        {error}
      </MessageState>
    );
  if (!orders)
    return (
      <div className="loading-state" role="status">
        <span className="loading-spinner" aria-hidden="true" /> Carregando pedidos…
      </div>
    );
  return (
    <section className="account-section">
      <div className="account-section-heading">
        <div>
          <span className="eyebrow">HISTÓRICO</span>
          <h2>Meus pedidos</h2>
        </div>
        <p>Acompanhe os pedidos registrados na sua conta.</p>
      </div>
      {orders.length ? (
        <div className="order-list">
          {orders.map((order) => (
            <Link href={`/conta/pedidos/${order.id}`} key={order.id}>
              <span>
                <strong>Pedido #{order.id}</strong>
                <small>{new Date(order.dataCriacao).toLocaleDateString('pt-BR')}</small>
              </span>
              <span>{orderStatus[order.status]}</span>
              <strong>{currency(order.valorTotal)}</strong>
              <span aria-hidden>→</span>
            </Link>
          ))}
        </div>
      ) : (
        <MessageState
          title="Nenhum pedido por enquanto"
          href="/produtos"
          action="Explorar produtos"
        >
          Seu histórico aparecerá aqui após a criação de um pedido.
        </MessageState>
      )}
      <p className="context-note">
        Valores exibidos correspondem aos produtos do pedido. Entrega não está incluída.
      </p>
    </section>
  );
}
