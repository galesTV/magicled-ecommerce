'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiMessage, clientApi } from '@/lib/api';
import { currency, orderStatus } from '@/lib/format';
import type { Order } from '@/lib/types';
import { MessageState } from './MessageState';

export function OrderDetailView({ id }: { id: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    clientApi<Order>(`/orders/${id}`)
      .then(setOrder)
      .catch((cause) => setError(apiMessage(cause)));
  }, [id]);
  if (error)
    return (
      <MessageState
        kind="error"
        title="Não foi possível carregar o pedido"
        href="/conta/pedidos"
        action="Ver meus pedidos"
      >
        {error}
      </MessageState>
    );
  if (!order)
    return (
      <div className="loading-state" role="status">
        <span className="loading-spinner" aria-hidden="true" /> Carregando pedido…
      </div>
    );
  return (
    <section className="account-section">
      <Link className="subtle-link" href="/conta/pedidos">
        ← Voltar aos pedidos
      </Link>
      <div className="account-section-heading">
        <div>
          <span className="eyebrow">DETALHES DO PEDIDO</span>
          <h2>Pedido #{order.id}</h2>
        </div>
        <p>Registrado em {new Date(order.dataCriacao).toLocaleDateString('pt-BR')}</p>
      </div>
      <div className="order-status">
        <span>Situação do pedido</span>
        <strong>{orderStatus[order.status]}</strong>
        <span>Pagamento</span>
        <strong>
          {order.pagamento?.status === 'PENDENTE'
            ? 'Pendente'
            : order.pagamento?.status === 'APROVADO'
              ? 'Aprovação registrada no pedido'
              : order.pagamento?.status === 'RECUSADO'
                ? 'Recusado'
                : order.pagamento?.status === 'ESTORNADO'
                  ? 'Estornado'
                  : 'Sem informação'}
        </strong>
        {order.pagamento && (
          <>
            <span>Método registrado</span>
            <strong>
              {order.pagamento.metodo === 'CARTAO_CREDITO'
                ? 'Cartão de crédito'
                : order.pagamento.metodo === 'BOLETO'
                  ? 'Boleto'
                  : 'Pix'}
            </strong>
          </>
        )}
        {order.codigoRastreio && (
          <>
            <span>Código de rastreio</span>
            <strong>{order.codigoRastreio}</strong>
          </>
        )}
      </div>
      <h3>Produtos do pedido</h3>
      <div className="order-lines">
        {order.itens.map((item) => (
          <div key={item.id}>
            <span>
              {item.quantidade} × {item.produto.nome}
            </span>
            <strong>{currency(Number(item.precoUnitario) * item.quantidade)}</strong>
          </div>
        ))}
      </div>
      <div className="order-subtotal">
        <span>Subtotal dos produtos</span>
        <strong>{currency(order.valorTotal)}</strong>
      </div>
      <p className="context-note">
        Entrega não está incluída. A situação do pagamento é a registrada no pedido e não confirma,
        por si só, que a cobrança foi concluída.
      </p>
      <h3>Endereço informado</h3>
      <p>
        {order.endereco.logradouro}, {order.endereco.numero}
        <br />
        {order.endereco.bairro} · {order.endereco.cidade}/{order.endereco.estado} ·{' '}
        {order.endereco.cep}
      </p>
    </section>
  );
}
