'use client';

import { createContext, useContext, useEffect, useReducer } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { demoCatalog } from '@/data/catalog/demo';
import type { CatalogProduct } from '@/data/catalog/types';

function findDemoProduct(slug: string) {
  return demoCatalog.find((product) => product.slug === slug);
}

const storageKey = 'magicled-demo-cart-v3';
export const maxCartQuantity = 99;

type Cart = Record<string, number>;
type Notice = { message: string; slug: string; delta: number };
type State = { cart: Cart; restored: boolean; notice: Notice | null };
type Action =
  | { type: 'restore'; cart: Cart }
  | { type: 'add'; slug: string; amount: number }
  | { type: 'set'; slug: string; amount: number }
  | { type: 'remove'; slug: string }
  | { type: 'undo' }
  | { type: 'dismiss' };

function restoreCart(value: string | null): Cart {
  try {
    const data: unknown = JSON.parse(value ?? '{}');
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter(
        ([slug, qty]) =>
          Boolean(findDemoProduct(slug)) &&
          Number.isInteger(qty) &&
          qty > 0 &&
          qty <= maxCartQuantity,
      ),
    );
  } catch {
    return {};
  }
}

function withQuantity(cart: Cart, slug: string, qty: number) {
  const next = { ...cart };
  if (qty > 0) next[slug] = qty;
  else delete next[slug];
  return next;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'restore':
      return { cart: action.cart, restored: true, notice: null };
    case 'dismiss':
      return { ...state, notice: null };
    case 'undo': {
      if (!state.notice) return state;
      const { slug, delta } = state.notice;
      const quantity = Math.min(maxCartQuantity, (state.cart[slug] ?? 0) - delta);
      return { ...state, cart: withQuantity(state.cart, slug, quantity), notice: null };
    }
    case 'set': {
      return {
        ...state,
        cart: withQuantity(
          state.cart,
          action.slug,
          Math.min(maxCartQuantity, Math.max(0, action.amount)),
        ),
      };
    }
    case 'remove': {
      const quantity = state.cart[action.slug] ?? 0;
      if (!quantity) return state;
      return {
        ...state,
        cart: withQuantity(state.cart, action.slug, 0),
        notice: { slug: action.slug, delta: -quantity, message: 'Produto removido.' },
      };
    }
    case 'add': {
      if (!state.restored || !findDemoProduct(action.slug)) return state;
      const previous = state.cart[action.slug] ?? 0;
      const quantity = Math.min(previous + action.amount, maxCartQuantity);
      if (quantity === previous) {
        return {
          ...state,
          notice: { slug: action.slug, delta: 0, message: 'Limite de unidades alcançado.' },
        };
      }
      return {
        ...state,
        cart: withQuantity(state.cart, action.slug, quantity),
        notice: {
          slug: action.slug,
          delta: quantity - previous,
          message:
            quantity - previous === 1
              ? '1 item adicionado ao carrinho.'
              : quantity - previous + ' itens adicionados ao carrinho.',
        },
      };
    }
  }
}

export type StoreCartItem = {
  id: string;
  product: CatalogProduct;
  quantity: number;
  unitCents: number;
};

export type CartContextValue = {
  status: 'disabled' | 'loading' | 'ready' | 'guest' | 'expired' | 'restricted' | 'unavailable';
  demo: boolean;
  busy?: boolean;
  items: readonly StoreCartItem[];
  total: number;
  count: number;
  add: (slug: string, amount: number) => void;
  setQuantity: (itemId: string, amount: number) => void;
  remove: (itemId: string) => void;
  retry?: () => void;
};

export const CartContext = createContext<CartContextValue | null>(null);

export function useStoreCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('Carrinho indisponível fora do contexto da loja.');
  return value;
}

export function DemoCartProvider({
  enabled,
  children,
}: Readonly<{ enabled: boolean; children: React.ReactNode }>) {
  const [state, dispatch] = useReducer(reducer, { cart: {}, restored: false, notice: null });

  useEffect(() => {
    if (!enabled) return;
    try {
      dispatch({ type: 'restore', cart: restoreCart(window.localStorage.getItem(storageKey)) });
    } catch {
      dispatch({ type: 'restore', cart: {} });
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null)
        dispatch({ type: 'restore', cart: restoreCart(event.newValue) });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !state.restored) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state.cart));
    } catch {
      /* The cart remains available for the current visit. */
    }
  }, [enabled, state.cart, state.restored]);

  useEffect(() => {
    const notice = state.notice;
    if (!notice || notice.delta) return;
    const timeout = window.setTimeout(() => dispatch({ type: 'dismiss' }), 4500);
    return () => window.clearTimeout(timeout);
  }, [state.notice]);

  const items = Object.entries(state.cart).flatMap(([id, quantity]) => {
    const product = findDemoProduct(id);
    return product ? [{ id, product, quantity, unitCents: product.referencePriceCents }] : [];
  });
  const value: CartContextValue = {
    status: !enabled ? 'disabled' : state.restored ? 'ready' : 'loading',
    demo: enabled,
    items,
    total: items.reduce((sum, item) => sum + item.unitCents * item.quantity, 0),
    count: Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0),
    add: (slug, amount) => {
      if (enabled && Number.isInteger(amount) && amount > 0)
        dispatch({ type: 'add', slug, amount });
    },
    setQuantity: (slug, amount) => {
      if (enabled && state.restored && Number.isInteger(amount) && findDemoProduct(slug))
        dispatch({ type: 'set', slug, amount });
    },
    remove: (slug) => {
      if (enabled && state.restored) dispatch({ type: 'remove', slug });
    },
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {enabled && (
        <div className="v3-cart-feedback">
          <span className="sr-only" role="status">
            {state.notice?.message ?? ''}
          </span>
          {state.notice && (
            <div className="v3-toast">
              <ShoppingBag size={20} aria-hidden="true" />
              <span>{state.notice.message}</span>
              {state.notice.delta !== 0 && (
                <button type="button" onClick={() => dispatch({ type: 'undo' })}>
                  Desfazer
                </button>
              )}
              <button
                type="button"
                aria-label="Dispensar confirmação"
                onClick={() => dispatch({ type: 'dismiss' })}
              >
                <X size={17} />
              </button>
            </div>
          )}
        </div>
      )}
    </CartContext.Provider>
  );
}
