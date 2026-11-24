import type { Money, OrderStatus } from './types';

export const currency = (value: Money) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
export const orderStatus: Record<OrderStatus, string> = {
  PENDENTE: 'Aguardando pagamento',
  PAGO: 'Pagamento registrado',
  EM_TRANSPORTE: 'Em transporte',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export function usableProductImage(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // O seed contém imagens genéricas que não foram verificadas contra os produtos.
    if (parsed.hostname === 'images.unsplash.com') return null;
    return parsed.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}
