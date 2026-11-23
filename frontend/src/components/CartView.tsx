'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiMessage, clientApi } from '@/lib/api';
import { currency, usableProductImage } from '@/lib/format';
import type { Cart } from '@/lib/types';
import { MessageState } from './MessageState';
import { ArrowRight, Trash2 } from 'lucide-react';

export function CartView() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [mutationError, setMutationError] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  useEffect(() => {
    clientApi<Cart>('/cart')
      .then(setCart)
      .catch((cause) => setError(apiMessage(cause)));
  }, []);
  async function mutate(path: string, method: 'PATCH' | 'DELETE', itemId: number, body?: object) {
    setBusyId(itemId);
    setMessage('');
    setMutationError(false);
    try {
      const updated = await clientApi<Cart>(path, {
        method,
        body: body ? JSON.stringify(body) : undefined,
      });
      setCart(updated);
      window.dispatchEvent(new Event('magicled:cart-updated'));
      setMessage(method === 'DELETE' ? 'Item removido do carrinho.' : 'Quantidade atualizada.');
    } catch (cause) {
      setMutationError(true);
      setMessage(apiMessage(cause));
    } finally {
      setBusyId(null);
    }
  }
  async function clear() {
    if (!window.confirm('Esvaziar todo o carrinho?')) return;
    setBusyId(-1);
    setMessage('');
    setMutationError(false);
    try {
      setCart(await clientApi<Cart>('/cart', { method: 'DELETE' }));
      window.dispatchEvent(new Event('magicled:cart-updated'));
      setMessage('Carrinho esvaziado.');
    } catch (cause) {
      setMutationError(true);
      setMessage(apiMessage(cause));
    } finally {
      setBusyId(null);
    }
  }
  if (error)
    return (
      <MessageState
        kind="error"
        title="Não foi possível carregar o carrinho"
        href="/carrinho"
        action="Tentar novamente"
      >
        {error}
      </MessageState>
    );
  if (!cart)
    return (
      <div className="loading-state" role="status">
        <span className="loading-spinner" aria-hidden="true" /> Carregando carrinho…
      </div>
    );
  if (!cart.itens.length)
    return (
      <MessageState title="Seu carrinho está vazio" href="/produtos" action="Ver produtos">
        Explore o catálogo e encontre a luz certa para o seu projeto.
      </MessageState>
    );
  return (
    <>
      <div className="cart-layout">
        <div className="cart-items">
          <div className="cart-items-heading">
            <h2>Produtos selecionados</h2>
            <span>
              {cart.itens.reduce((count, item) => count + item.quantidade, 0)}{' '}
              {cart.itens.reduce((count, item) => count + item.quantidade, 0) === 1
                ? 'item'
                : 'itens'}
            </span>
          </div>
          {cart.itens.map((item) => {
            const photo = usableProductImage(item.produto.imagemUrl);
            return (
              <article className="cart-row" key={item.id}>
                <Link className="cart-photo" href={`/produtos/${item.produtoId}`}>
                  {photo ? (
                    <img src={photo} alt={item.produto.nome} referrerPolicy="no-referrer" />
                  ) : (
                    <span>Magic LED</span>
                  )}
                </Link>
                <div className="cart-row-info">
                  <h2>
                    <Link href={`/produtos/${item.produtoId}`}>{item.produto.nome}</Link>
                  </h2>
                  <span className="muted">Valor unitário · {currency(item.precoUnitario)}</span>
                  <div className="cart-controls">
                    <label htmlFor={`cart-qty-${item.id}`}>Quantidade</label>
                    <select
                      id={`cart-qty-${item.id}`}
                      value={item.quantidade}
                      disabled={busyId !== null}
                      onChange={(event) =>
                        mutate(`/cart/items/${item.id}`, 'PATCH', item.id, {
                          quantidade: Number(event.target.value),
                        })
                      }
                    >
                      {Array.from(
                        { length: Math.min(99, Math.max(1, item.produto.estoque)) },
                        (_, index) => index + 1,
                      ).map((number) => (
                        <option value={number} key={number}>
                          {number}
                        </option>
                      ))}
                      {item.quantidade > 99 && (
                        <option value={item.quantidade}>{item.quantidade}</option>
                      )}
                      {item.quantidade > item.produto.estoque && item.quantidade <= 99 && (
                        <option value={item.quantidade}>
                          {item.quantidade} (acima do estoque)
                        </option>
                      )}
                    </select>
                    <button
                      type="button"
                      disabled={busyId !== null}
                      onClick={() => mutate(`/cart/items/${item.id}`, 'DELETE', item.id)}
                    >
                      <Trash2 size={15} aria-hidden="true" /> Remover
                    </button>
                  </div>
                </div>
                <strong className="cart-line-total">
                  {currency(Number(item.precoUnitario) * item.quantidade)}
                </strong>
              </article>
            );
          })}
          <button
            className="subtle-button"
            type="button"
            onClick={clear}
            disabled={busyId !== null}
          >
            Esvaziar carrinho
          </button>
        </div>
        <aside className="cart-summary">
          <span className="eyebrow">SEU PEDIDO</span>
          <h2>Resumo da compra</h2>
          <div>
            <span>Subtotal dos produtos</span>
            <strong>{currency(cart.valorTotal)}</strong>
          </div>
          <p>O valor de entrega não está incluído. Confira os dados antes de continuar.</p>
          <Link className="button button-orange" href="/checkout">
            Revisar pedido <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link className="subtle-link" href="/produtos">
            Continuar comprando
          </Link>
        </aside>
      </div>
      {message && (
        <p
          className={mutationError ? 'form-error cart-feedback' : 'form-message cart-feedback'}
          role={mutationError ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </>
  );
}
