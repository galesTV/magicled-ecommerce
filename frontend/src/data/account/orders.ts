import type { OrderStatus, PaymentStatus } from '@/lib/types';

export const statusLabels: Record<OrderStatus, string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  EM_TRANSPORTE: 'Em transporte',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const paymentLabels: Record<PaymentStatus, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  ESTORNADO: 'Estornado',
};

const orderDate = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' });
export function formatOrderDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : orderDate.format(parsed);
}
