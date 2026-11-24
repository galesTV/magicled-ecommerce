'use client';

import { useEffect, useRef, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { adaptProduct, moneyToCents } from '@/data/catalog/adapter';
import { ApiError, apiMessage, clientApi } from '@/lib/api';
import type { Cart } from '@/lib/types';
import { CartContext, maxCartQuantity, type StoreCartItem } from './CartStore';

type Access = 'customer' | 'guest' | 'expired' | 'restricted' | 'unavailable';
type View = { items: StoreCartItem[]; total: number };
type LoadState =
  { status: 'ready'; view: View } | { status: 'loading' | 'unavailable' | 'expired' };

function cartView(cart: Cart): View {
  return {
    total: moneyToCents(cart.valorTotal),
    items: cart.itens.map((item) => ({
      id: String(item.id),
      product: adaptProduct(item.produto),
      quantity: item.quantidade,
      unitCents: moneyToCents(item.precoUnitario),
    })),
  };
}

export function ApiCartProvider({
  access,
  children,
}: {
  access: Access;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [reload, setReload] = useState(0);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const mutating = useRef(false);

  useEffect(() => {
    if (access !== 'customer') return;
    const controller = new AbortController();
    clientApi<Cart>('/cart', { signal: controller.signal })
      .then(cartView)
      .then((view) => {
        if (!controller.signal.aborted) setState({ status: 'ready', view });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setState({
            status: error instanceof ApiError && error.status === 401 ? 'expired' : 'unavailable',
          });
        }
      });
    return () => controller.abort();
  }, [access, reload]);

  function retry() {
    if (access !== 'customer' || mutating.current) return;
    setNotice('');
    setState({ status: 'loading' });
    setReload((count) => count + 1);
  }

  async function mutate(
    path: string,
    method: 'POST' | 'PATCH' | 'DELETE',
    message: string,
    body?: unknown,
  ) {
    if (access !== 'customer' || state.status !== 'ready' || mutating.current) return;
    mutating.current = true;
    setBusy(true);
    setNotice('');
    try {
      const updated = await clientApi<Cart>(path, {
        method,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      setState({ status: 'ready', view: cartView(updated) });
      setNotice(message);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setState({ status: 'expired' });
        setNotice('Sua sessão expirou. Entre novamente para continuar.');
      } else if (!(error instanceof ApiError) || error.status === 0 || error.status >= 500) {
        setState({ status: 'unavailable' });
        setNotice(
          'Não foi possível confirmar a atualização. Consulte o carrinho antes de repetir.',
        );
      } else {
        setNotice(apiMessage(error));
      }
    } finally {
      mutating.current = false;
      setBusy(false);
    }
  }

  const items = access === 'customer' && state.status === 'ready' ? state.view.items : [];
  return (
    <CartContext.Provider
      value={{
        status: access === 'customer' ? state.status : access,
        demo: false,
        items,
        busy,
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        total: access === 'customer' && state.status === 'ready' ? state.view.total : 0,
        retry: access === 'customer' ? retry : undefined,
        add: (id, quantity) => {
          if (
            /^[1-9]\d*$/.test(id) &&
            Number.isSafeInteger(Number(id)) &&
            Number.isInteger(quantity) &&
            quantity > 0 &&
            quantity <= maxCartQuantity
          )
            void mutate('/cart/items', 'POST', 'Produto adicionado ao carrinho.', {
              produtoId: Number(id),
              quantidade: quantity,
            });
        },
        setQuantity: (id, quantity) => {
          if (items.some((item) => item.id === id) && Number.isInteger(quantity) && quantity > 0)
            void mutate('/cart/items/' + id, 'PATCH', 'Quantidade atualizada.', {
              quantidade: quantity,
            });
        },
        remove: (id) => {
          if (items.some((item) => item.id === id))
            void mutate('/cart/items/' + id, 'DELETE', 'Produto removido.');
        },
      }}
    >
      {children}
      <div className="v3-cart-feedback">
        <span className="sr-only" role="status">
          {notice}
        </span>
        {notice && (
          <div className="v3-toast">
            <ShoppingBag size={20} aria-hidden="true" />
            <span>{notice}</span>
            <button type="button" aria-label="Dispensar mensagem" onClick={() => setNotice('')}>
              <X size={17} />
            </button>
          </div>
        )}
      </div>
    </CartContext.Provider>
  );
}
