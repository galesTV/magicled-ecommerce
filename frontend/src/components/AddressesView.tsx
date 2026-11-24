'use client';

import { useEffect, useState } from 'react';
import type { z } from 'zod';
import { apiMessage, clientApi } from '@/lib/api';
import type { Address } from '@/lib/types';
import { MessageState } from './MessageState';

import { addressSchema as schema } from '@/lib/form-schemas';
type AddressForm = z.infer<typeof schema>;
const empty: AddressForm = {
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
};
const labels: Record<keyof AddressForm, string> = {
  cep: 'CEP',
  logradouro: 'Logradouro',
  numero: 'Número',
  complemento: 'Complemento (opcional)',
  bairro: 'Bairro',
  cidade: 'Cidade',
  estado: 'UF',
};

export function AddressesView() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [values, setValues] = useState<AddressForm>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    clientApi<Address[]>('/addresses')
      .then(setAddresses)
      .catch((cause) => setLoadError(apiMessage(cause)));
  }, []);
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
        ),
      );
      return;
    }
    setErrors({});
    setMessage('');
    setSaveError(false);
    setBusy(true);
    try {
      await clientApi<Address>('/addresses', {
        method: 'POST',
        body: JSON.stringify({
          ...values,
          complemento: values.complemento || undefined,
          estado: values.estado.toUpperCase(),
        }),
      });
      setValues(empty);
      setAddresses(await clientApi<Address[]>('/addresses'));
      setMessage('Endereço salvo.');
    } catch (cause) {
      setSaveError(true);
      setMessage(apiMessage(cause));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="account-section">
      <div className="account-section-heading">
        <div>
          <span className="eyebrow">ENTREGA</span>
          <h2>Seus endereços</h2>
        </div>
        <p>Escolha um endereço no checkout quando seu pedido estiver pronto.</p>
      </div>
      {loadError ? (
        <MessageState
          kind="error"
          title="Não foi possível carregar os endereços"
          href="/conta/enderecos"
          action="Tentar novamente"
        >
          {loadError}
        </MessageState>
      ) : addresses === null ? (
        <div className="loading-state" role="status">
          <span className="loading-spinner" aria-hidden="true" /> Carregando endereços…
        </div>
      ) : addresses.length ? (
        <div className="address-list">
          {addresses.map((address) => (
            <article key={address.id}>
              <strong>
                {address.logradouro}, {address.numero}
              </strong>
              <p>
                {address.complemento && `${address.complemento} · `}
                {address.bairro}
                <br />
                {address.cidade} / {address.estado} · {address.cep}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <MessageState
          title="Nenhum endereço cadastrado"
          href="#novo-endereco"
          action="Adicionar endereço"
        >
          Salve um endereço para usar na preparação dos pedidos.
        </MessageState>
      )}
      <h3 id="novo-endereco">Novo endereço</h3>
      <form className="address-form" onSubmit={save} noValidate>
        {(Object.keys(labels) as (keyof AddressForm)[]).map((key) => (
          <div className={`form-field field-${key}`} key={key}>
            <label htmlFor={`address-${key}`}>{labels[key]}</label>
            <input
              id={`address-${key}`}
              value={values[key]}
              onChange={(event) =>
                setValues({
                  ...values,
                  [key]: key === 'estado' ? event.target.value.toUpperCase() : event.target.value,
                })
              }
              maxLength={key === 'estado' ? 2 : undefined}
              inputMode={key === 'cep' || key === 'numero' ? 'numeric' : undefined}
              aria-invalid={!!errors[key]}
              autoComplete={
                key === 'cep'
                  ? 'postal-code'
                  : key === 'logradouro'
                    ? 'address-line1'
                    : key === 'cidade'
                      ? 'address-level2'
                      : key === 'estado'
                        ? 'address-level1'
                        : undefined
              }
            />
            {errors[key] && <small role="alert">{errors[key]}</small>}
          </div>
        ))}
        <div className="form-actions">
          <button className="button button-dark" type="submit" disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar endereço'}
          </button>
        </div>
      </form>
      {message && (
        <p
          className={saveError ? 'form-error' : 'form-message'}
          role={saveError ? 'alert' : 'status'}
        >
          {message}
        </p>
      )}
    </section>
  );
}
