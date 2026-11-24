export function returnPath(value?: string | null) {
  if (typeof value !== 'string') return '/conta';
  if (
    value === '/carrinho' ||
    value === '/checkout' ||
    value === '/admin' ||
    value === '/conta' ||
    value === '/conta/enderecos' ||
    value === '/conta/pedidos' ||
    value === '/conta/formas-de-pagamento' ||
    /^\/(produtos|conta\/pedidos)\/\d+$/.test(value)
  )
    return value;
  return '/conta';
}

export function loginHref(next: string, expired = false) {
  const params = new URLSearchParams({ next: returnPath(next) });
  if (expired) params.set('sessao', 'expirada');
  return '/login?' + params;
}
