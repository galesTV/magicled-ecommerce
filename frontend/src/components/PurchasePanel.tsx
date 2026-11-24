'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, apiMessage, clientApi } from '@/lib/api';
import type { Cart, Product } from '@/lib/types';

export function PurchasePanel({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const available = product.status && product.estoque > 0;
  async function add() {
    setBusy(true);
    setMessage('');
    try {
      await clientApi<Cart>('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ produtoId: product.id, quantidade: quantity }),
      });
      setMessage('Produto adicionado ao carrinho.');
      window.dispatchEvent(new Event('magicled:cart-updated'));
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/produtos/${product.id}`)}`);
        return;
      }
      setMessage(apiMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="purchase-panel">
      <p className={`availability ${available ? 'available' : ''}`}>
        {available ? `${product.estoque} em estoque` : 'Produto indisponível'}
      </p>
      <div className="purchase-actions">
        <label htmlFor="quantity">Quantidade</label>
        <div className="quantity-control">
          <button
            type="button"
            aria-label="Diminuir quantidade"
            disabled={quantity <= 1 || !available}
            onClick={() => setQuantity(quantity - 1)}
          >
            −
          </button>
          <input
            id="quantity"
            type="number"
            min="1"
            max={product.estoque}
            value={quantity}
            onChange={(event) =>
              setQuantity(Math.min(product.estoque, Math.max(1, Number(event.target.value) || 1)))
            }
            disabled={!available}
          />
          <button
            type="button"
            aria-label="Aumentar quantidade"
            disabled={quantity >= product.estoque || !available}
            onClick={() => setQuantity(quantity + 1)}
          >
            +
          </button>
        </div>
        <button
          className="button button-orange"
          type="button"
          disabled={!available || busy}
          onClick={add}
        >
          {busy ? 'Adicionando…' : 'Adicionar ao carrinho'}
        </button>
      </div>
      {message && (
        <p role="status" className="form-message">
          {message}
        </p>
      )}
    </div>
  );
}
