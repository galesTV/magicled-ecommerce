'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole } from 'lucide-react';
import { apiMessage, clientApi } from '@/lib/api';
import { currency, orderStatus, usableProductImage } from '@/lib/format';
import type { Address, Cart, Order, PaymentMethod, User } from '@/lib/types';
import { MessageState } from './MessageState';

export function CheckoutView({ user, allowCreate }: { user: User; allowCreate: boolean }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [addressId, setAddressId] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('PIX');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([clientApi<Cart>('/cart'), clientApi<Address[]>('/addresses')])
      .then(([loadedCart, loadedAddresses]) => {
        setCart(loadedCart);
        setAddresses(loadedAddresses);
        if (loadedAddresses.length) setAddressId(String(loadedAddresses[0].id));
      })
      .catch((cause) => setError(apiMessage(cause)));
  }, []);
  async function createOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!allowCreate || !addressId || busy) return;
    setError('');
    setBusy(true);
    try {
      const created = await clientApi<Order>('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ enderecoId: Number(addressId), metodoPagamento: method }),
      });
      setOrder(created);
      setCart(null);
    } catch (cause) {
      setError(apiMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  if (order)
    return (
      <section className="checkout-result" role="status">
        <span className="message-icon">
          <Check size={25} aria-hidden="true" />
        </span>
        <span className="eyebrow">PEDIDO REGISTRADO EM TESTE</span>
        <h2>Pedido #{order.id} criado</h2>
        <p>
          Status registrado: <strong>{orderStatus[order.status]}</strong>. Nenhuma aprovação de
          pagamento foi simulada.
        </p>
        <p>
          Subtotal dos produtos: <strong>{currency(order.valorTotal)}</strong>. Entrega não
          incluída.
        </p>
        <Link className="button button-dark" href={`/conta/pedidos/${order.id}`}>
          Ver detalhes do pedido <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    );
  if (!cart || !addresses)
    return error ? (
      <MessageState
        kind="error"
        title="Não foi possível preparar o pedido"
        href="/checkout"
        action="Tentar novamente"
      >
        {error}
      </MessageState>
    ) : (
      <div className="loading-state" role="status">
        <span className="loading-spinner" aria-hidden="true" /> Carregando carrinho e endereços…
      </div>
    );
  if (!cart.itens.length)
    return (
      <MessageState title="Seu carrinho está vazio" href="/produtos" action="Explorar produtos">
        Adicione um produto para preparar seu pedido.
      </MessageState>
    );
  const selected = addresses.find((address) => String(address.id) === addressId);
  const itemCount = cart.itens.reduce((sum, item) => sum + item.quantidade, 0);
  return (
    <div className="checkout-grid">
      <form onSubmit={createOrder} className="checkout-form">
        <ol className="checkout-progress" aria-label="Etapas do pedido">
          <li className="is-complete">
            <span>1</span> Identificação
          </li>
          <li className={selected ? 'is-complete' : ''}>
            <span>2</span> Endereço
          </li>
          <li className="is-current">
            <span>3</span> Revisão
          </li>
          <li>
            <span>4</span> Pagamento
          </li>
        </ol>
        <section className="checkout-step">
          <div className="step-heading">
            <span className="step-number">01</span>
            <div>
              <h2>Identificação</h2>
              <p>Dados vinculados à sua conta.</p>
            </div>
          </div>
          <div className="checkout-identity">
            <strong>{user.nome || 'Cliente Magic LED'}</strong>
            <span>{user.email}</span>
          </div>
        </section>
        <section className="checkout-step">
          <div className="step-heading">
            <span className="step-number">02</span>
            <div>
              <h2>Endereço</h2>
              <p>Selecione onde o pedido será entregue.</p>
            </div>
          </div>
          {addresses.length ? (
            <div className="address-choice-list" role="radiogroup" aria-label="Endereço de entrega">
              {addresses.map((address) => (
                <label className="address-choice" key={address.id}>
                  <input
                    type="radio"
                    name="checkout-address"
                    value={address.id}
                    checked={addressId === String(address.id)}
                    onChange={(event) => setAddressId(event.target.value)}
                  />
                  <span>
                    <strong>
                      {address.logradouro}, {address.numero}
                    </strong>
                    <small>
                      {address.bairro} · {address.cidade}/{address.estado} · {address.cep}
                    </small>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <MessageState
              title="Cadastre um endereço"
              href="/conta/enderecos"
              action="Adicionar endereço"
            >
              Você precisa de um endereço para preparar o pedido.
            </MessageState>
          )}
          {addresses.length > 0 && (
            <Link className="subtle-link" href="/conta/enderecos">
              Adicionar outro endereço
            </Link>
          )}
        </section>
        <section className="checkout-step">
          <div className="step-heading">
            <span className="step-number">03</span>
            <div>
              <h2>Revisão dos produtos</h2>
              <p>Confira as quantidades e os valores antes de continuar.</p>
            </div>
          </div>
          <div className="checkout-products">
            {cart.itens.map((item) => {
              const photo = usableProductImage(item.produto.imagemUrl);
              return (
                <div className="checkout-product" key={item.id}>
                  <span className="checkout-product-photo">
                    {photo ? (
                      <img src={photo} alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <span>Magic LED</span>
                    )}
                  </span>
                  <span>
                    <strong>{item.produto.nome}</strong>
                    <small>
                      {item.quantidade} × {currency(item.precoUnitario)}
                    </small>
                  </span>
                  <strong>{currency(Number(item.precoUnitario) * item.quantidade)}</strong>
                </div>
              );
            })}
          </div>
          <Link className="subtle-link" href="/carrinho">
            Editar carrinho
          </Link>
        </section>
        <section className="checkout-step">
          <div className="step-heading">
            <span className="step-number">04</span>
            <div>
              <h2>Pagamento</h2>
              <p>A cobrança permanece indisponível nesta etapa.</p>
            </div>
          </div>
          {allowCreate ? (
            <>
              <div className="test-banner">
                <strong>Ambiente de desenvolvimento</strong>
                <p>
                  A criação do pedido debita estoque no banco de teste. Nenhum pagamento será
                  processado.
                </p>
              </div>
              <div className="form-field">
                <label htmlFor="checkout-method">Método registrado no pedido</label>
                <select
                  id="checkout-method"
                  value={method}
                  onChange={(event) => setMethod(event.target.value as PaymentMethod)}
                >
                  <option value="PIX">Pix</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="CARTAO_CREDITO">Cartão de crédito</option>
                </select>
              </div>
            </>
          ) : (
            <div className="checkout-lock">
              <LockKeyhole size={21} aria-hidden="true" />
              <div>
                <strong>Checkout em validação</strong>
                <p>
                  Estamos concluindo as regras de entrega e a confirmação segura de pagamentos.
                  Ainda não é possível finalizar uma compra.
                </p>
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <button
            className="button button-dark"
            type="submit"
            disabled={!allowCreate || !selected || busy}
          >
            {busy
              ? 'Criando pedido…'
              : allowCreate
                ? 'Criar pedido de teste'
                : 'Finalização indisponível'}
          </button>
        </section>
      </form>
      <aside className="cart-summary checkout-summary" aria-label="Resumo do pedido">
        <span className="eyebrow">VISÃO GERAL</span>
        <h2>Resumo do pedido</h2>
        <div>
          <span>
            {itemCount} {itemCount === 1 ? 'item' : 'itens'}
          </span>
          <strong>{currency(cart.valorTotal)}</strong>
        </div>
        <div className="summary-total">
          <span>Subtotal dos produtos</span>
          <strong>{currency(cart.valorTotal)}</strong>
        </div>
        <p>
          O valor de entrega não está incluído. Este subtotal não representa o total final da
          compra.
        </p>
        <Link className="subtle-link" href="/carrinho">
          Voltar ao carrinho
        </Link>
      </aside>
    </div>
  );
}
