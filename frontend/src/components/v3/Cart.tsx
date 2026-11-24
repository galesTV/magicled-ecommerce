'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, LockKeyhole, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { formatReferencePrice } from '@/data/catalog/service';
import type { CatalogProduct } from '@/data/catalog/types';
import { loginHref } from '@/lib/auth-navigation';
import { CatalogMedia } from './CatalogMedia';
import { maxCartQuantity, useStoreCart, type StoreCartItem } from './CartStore';
import { productHref } from './navigation';

function Quantity({
  label,
  value,
  onChange,
  maximum = maxCartQuantity,
  busy,
}: {
  label: string;
  value: number;
  onChange: (number: number) => void;
  maximum?: number;
  busy?: boolean;
}) {
  return (
    <div className="v3-quantity" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Diminuir quantidade"
        disabled={busy || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <Minus size={16} />
      </button>
      <span aria-live="polite" aria-atomic="true">
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar quantidade"
        disabled={busy || value >= maximum}
        onClick={() => onChange(value + 1)}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

export function AddToCart({ product }: { product: CatalogProduct }) {
  const [quantity, setQuantity] = useState(1);
  const { status, busy, add, items, retry } = useStoreCart();
  if (status === 'disabled' || status === 'restricted' || product.stock === 0) return null;
  if (status === 'guest' || status === 'expired')
    return (
      <div className="v3-add-to-cart">
        <Link
          href={loginHref(productHref(product.slug), status === 'expired')}
          className="v3-button v3-button-dark"
        >
          <ShoppingBag size={19} aria-hidden="true" /> Entrar para adicionar
        </Link>
      </div>
    );
  if (status === 'unavailable')
    return (
      <div className="v3-add-to-cart">
        <p role="status">Carrinho temporariamente indisponível.</p>
        <button
          className="v3-button v3-button-outline"
          type="button"
          onClick={retry ?? (() => window.location.reload())}
        >
          Tentar novamente
        </button>
      </div>
    );
  const alreadyInCart = items.reduce(
    (sum, item) => (item.product.id === product.id ? sum + item.quantity : sum),
    0,
  );
  const maximum =
    product.stock === undefined
      ? maxCartQuantity
      : Math.min(maxCartQuantity, product.stock - alreadyInCart);
  const amount = Math.max(1, Math.min(maximum, quantity));
  return (
    <div className="v3-add-to-cart">
      <Quantity
        label="Quantidade para adicionar"
        value={amount}
        onChange={setQuantity}
        maximum={maximum}
        busy={busy}
      />
      <button
        type="button"
        className="v3-button v3-button-dark"
        disabled={status !== 'ready' || busy || maximum < 1}
        onClick={() => add(product.slug, amount)}
      >
        <ShoppingBag size={19} aria-hidden="true" />{' '}
        {status === 'loading'
          ? 'Carregando carrinho…'
          : busy
            ? 'Adicionando…'
            : 'Adicionar ao carrinho'}
      </button>
      {maximum < 1 && <p role="status">A quantidade disponível já está no carrinho.</p>}
    </div>
  );
}

function CartEntry({ item: { id, product, quantity, unitCents } }: { item: StoreCartItem }) {
  const { setQuantity, remove, busy } = useStoreCart();
  return (
    <li className="v3-cart-item">
      <Link href={productHref(product.slug)} className="v3-cart-image" aria-label={product.name}>
        <CatalogMedia image={product.images[0]} sizes="65px" decorative />
      </Link>
      <div className="v3-cart-item-title">
        <Link href={productHref(product.slug)}>{product.name}</Link>
        <span>{formatReferencePrice(unitCents)} por unidade</span>
        {product.stock !== undefined && product.stock < quantity && (
          <span>Quantidade indisponível no estoque.</span>
        )}
      </div>
      <Quantity
        label={'Quantidade de ' + product.name}
        value={quantity}
        onChange={(value) => setQuantity(id, value)}
        maximum={Math.min(maxCartQuantity, product.stock ?? maxCartQuantity)}
        busy={busy}
      />
      <strong>{formatReferencePrice(unitCents * quantity)}</strong>
      <button
        type="button"
        className="v3-icon-button"
        aria-label={'Remover ' + product.name}
        onClick={() => remove(id)}
        disabled={busy}
      >
        <Trash2 size={17} />
      </button>
    </li>
  );
}

export function Cart({ checkout = false }: { checkout?: boolean }) {
  const { status, demo, items, count, total, retry } = useStoreCart();
  const signIn = status === 'guest' || status === 'expired';
  const emptyTitle = {
    disabled: 'Carrinho indisponível',
    guest: 'Entre para acessar seu carrinho',
    expired: 'Sua sessão expirou',
    restricted: 'Carrinho disponível para clientes',
    ready: 'Sua seleção está vazia',
    loading: 'Carregando sua seleção',
    unavailable: 'Carrinho temporariamente indisponível',
  }[status];
  return (
    <div className="v3-wrap v3-page">
      <header className="v3-page-head">
        <p className="v3-eyebrow">Sua seleção</p>
        <h1>{checkout ? 'Revisar carrinho' : 'Carrinho'}</h1>
      </header>
      {checkout && (
        <section className="v3-panel v3-checkout-status">
          <LockKeyhole size={27} aria-hidden="true" />
          <div>
            <h2>Finalização comercial indisponível</h2>
            <p>
              {demo
                ? 'Esta prévia permite revisar a seleção. Pagamentos, pedidos, frete e coleta de dados estão desativados.'
                : 'Você pode revisar os produtos do carrinho. Criação de pedidos, frete e pagamento ainda estão indisponíveis.'}
            </p>
          </div>
        </section>
      )}
      {status === 'ready' && count > 0 ? (
        <div className="v3-cart-layout">
          <section className="v3-panel">
            <h2>{count === 1 ? '1 item' : count + ' itens'}</h2>
            <ul className="v3-cart-list">
              {items.map((item) => {
                const { id, product, quantity, unitCents } = item;
                return checkout ? (
                  <li key={id} className="v3-checkout-line">
                    <Link href={productHref(product.slug)}>
                      {quantity} × {product.name}
                    </Link>
                    <strong>{formatReferencePrice(unitCents * quantity)}</strong>
                  </li>
                ) : (
                  <CartEntry key={id} item={item} />
                );
              })}
            </ul>
          </section>
          <aside className="v3-panel v3-cart-summary">
            <h2>Resumo</h2>
            <p>
              <span>{demo ? 'Subtotal de referência' : 'Subtotal dos produtos'}</span>
              <strong>{formatReferencePrice(total)}</strong>
            </p>
            <Link href={checkout ? '/carrinho' : '/checkout'} className="v3-button v3-button-dark">
              {checkout ? 'Voltar ao carrinho' : 'Revisar carrinho'} <ArrowRight size={18} />
            </Link>
          </aside>
        </div>
      ) : (
        <section className="v3-panel v3-cart-empty">
          <ShoppingBag size={36} aria-hidden="true" />
          <h2>{status === 'loading' ? <span role="status">{emptyTitle}</span> : emptyTitle}</h2>
          {status === 'loading' ? null : signIn ? (
            <Link
              className="v3-button v3-button-dark"
              href={loginHref(checkout ? '/checkout' : '/carrinho', status === 'expired')}
            >
              Entrar <ArrowRight size={18} />
            </Link>
          ) : status === 'unavailable' ? (
            <button
              className="v3-button v3-button-dark"
              type="button"
              onClick={retry ?? (() => window.location.reload())}
            >
              Tentar novamente
            </button>
          ) : (
            <Link href="/produtos" className="v3-button v3-button-dark">
              Ver produtos <ArrowRight size={18} />
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
