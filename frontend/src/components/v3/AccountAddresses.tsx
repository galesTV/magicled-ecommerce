'use client';

import { useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { ApiError, apiMessage, clientApi } from '@/lib/api';
import { loginHref } from '@/lib/auth-navigation';
import { addressSchema } from '@/lib/form-schemas';
import type { Address } from '@/lib/types';

const fields = [
  { name: 'cep', label: 'CEP', length: 9, autoComplete: 'postal-code' },
  { name: 'logradouro', label: 'Logradouro', length: 200, autoComplete: 'address-line1' },
  { name: 'numero', label: 'Número', length: 20 },
  {
    name: 'complemento',
    label: 'Complemento (opcional)',
    length: 100,
    autoComplete: 'address-line2',
  },
  { name: 'bairro', label: 'Bairro', length: 100 },
  { name: 'cidade', label: 'Cidade', length: 100, autoComplete: 'address-level2' },
  { name: 'estado', label: 'UF', length: 2, autoComplete: 'address-level1' },
];

export function AccountAddresses({ initial }: { initial: Address[] }) {
  const [addresses, setAddresses] = useState(initial);
  const [notice, setNotice] = useState<{ message: string; failure?: boolean }>();
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const saving = useRef(false);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current || uncertain) return;
    const form = event.currentTarget;
    const parsed = addressSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      setNotice({ message: parsed.error.issues[0].message, failure: true });
      return;
    }
    saving.current = true;
    setBusy(true);
    setNotice(undefined);
    const data = parsed.data;
    try {
      const created = await clientApi<Address>('/addresses', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          complemento: data.complemento || undefined,
          estado: data.estado.toUpperCase(),
        }),
      });
      setAddresses((current) => [created, ...current]);
      form.reset();
      setNotice({ message: 'Endereço cadastrado.' });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        window.location.replace(loginHref('/conta/enderecos', true));
      } else if (error instanceof ApiError && (error.status === 0 || error.status >= 500)) {
        setUncertain(true);
        setNotice({
          message:
            'Não foi possível confirmar o cadastro. Atualize a lista antes de tentar novamente.',
          failure: true,
        });
      } else {
        setNotice({ message: apiMessage(error), failure: true });
      }
    } finally {
      saving.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="v3-account-shortcuts">
      {!addresses.length && <p>Nenhum endereço cadastrado.</p>}
      {addresses.map((address) => (
        <article className="v3-panel v3-address-card" key={address.id}>
          <MapPin size={26} aria-hidden="true" />
          <div>
            <h3>
              {address.logradouro}, {address.numero}
            </h3>
            <p>
              {address.complemento && address.complemento + ' · '}
              {address.bairro}
            </p>
            <p>
              {address.cidade} – {address.estado} · CEP {address.cep}
            </p>
          </div>
        </article>
      ))}
      <form className="v3-panel v3-form" method="post" onSubmit={save}>
        <h3>Cadastrar endereço</h3>
        {fields.map((field) => (
          <label key={field.name}>
            {field.label}
            <input
              name={field.name}
              maxLength={field.length}
              autoComplete={field.autoComplete}
              inputMode={field.name === 'cep' ? 'numeric' : undefined}
              required={field.name !== 'complemento'}
            />
          </label>
        ))}
        {notice && (
          <p className="v3-inline-status" role={notice.failure ? 'alert' : 'status'}>
            {notice.message}
          </p>
        )}
        {uncertain ? (
          <button
            className="v3-button v3-button-outline"
            type="button"
            onClick={() => window.location.reload()}
          >
            Atualizar endereços
          </button>
        ) : (
          <button className="v3-button v3-button-dark" type="submit" disabled={busy}>
            {busy ? 'Salvando…' : 'Salvar endereço'}
          </button>
        )}
      </form>
    </div>
  );
}
