'use client';

import { useState } from 'react';
import { z } from 'zod';
import { apiMessage, clientApi } from '@/lib/api';
import { orderStatus } from '@/lib/format';
import type { Order, OrderStatus } from '@/lib/types';
import { ShieldCheck } from 'lucide-react';

type EditableStatus = Exclude<OrderStatus, 'PAGO'>;

const schema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(['PENDENTE', 'EM_TRANSPORTE', 'ENTREGUE', 'CANCELADO']),
  codigoRastreio: z.string(),
});

export function AdminOrderStatus() {
  const [id, setId] = useState('');
  const [status, setStatus] = useState<EditableStatus>('EM_TRANSPORTE');
  const [tracking, setTracking] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  async function update(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse({ id, status, codigoRastreio: tracking });
    if (!parsed.success) {
      setMessage('Informe um ID de pedido válido.');
      setIsError(true);
      return;
    }
    if (!window.confirm(`Confirmar alteração do pedido #${id} para “${orderStatus[status]}”?`))
      return;
    setBusy(true);
    setMessage('');
    setIsError(false);
    try {
      const order = await clientApi<Order>(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...(tracking ? { codigoRastreio: tracking } : {}) }),
      });
      setMessage(`Pedido #${order.id} atualizado para “${orderStatus[order.status]}”.`);
    } catch (cause) {
      setIsError(true);
      setMessage(apiMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="admin-order-section">
      <div className="admin-section-heading">
        <div>
          <span className="eyebrow">OPERAÇÃO AUTORIZADA</span>
          <h2 id="admin-orders-title">Atualizar status de pedido</h2>
        </div>
        <p>Informe um ID de pedido confirmado para registrar a mudança.</p>
      </div>
      <div className="admin-order-note">
        <ShieldCheck size={19} aria-hidden="true" />
        <p>
          Esta operação exige perfil de administrador no servidor. Não há consulta prévia nem lista
          administrativa de pedidos; confirme o ID antes de alterar.
        </p>
      </div>
      <form className="admin-form" onSubmit={update}>
        <div className="form-field">
          <label htmlFor="admin-order-id">ID do pedido</label>
          <input
            id="admin-order-id"
            type="number"
            min="1"
            required
            value={id}
            onChange={(event) => setId(event.target.value)}
            aria-invalid={isError && !id ? true : undefined}
          />
        </div>
        <div className="form-field">
          <label htmlFor="admin-order-status">Novo status</label>
          <select
            id="admin-order-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as EditableStatus)}
          >
            {(Object.keys(orderStatus) as OrderStatus[])
              .filter((key): key is EditableStatus => key !== 'PAGO')
              .map((key) => (
                <option value={key} key={key}>
                  {orderStatus[key]}
                </option>
              ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="admin-tracking">Código de rastreio (opcional)</label>
          <input
            id="admin-tracking"
            value={tracking}
            onChange={(event) => setTracking(event.target.value)}
          />
        </div>
        <button className="button button-dark" type="submit" disabled={busy}>
          {busy ? 'Atualizando…' : 'Atualizar pedido'}
        </button>
      </form>
      {message && (
        <p
          className={isError ? 'form-error admin-feedback' : 'form-message admin-feedback'}
          role={isError ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </div>
  );
}
