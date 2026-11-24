'use client';

import { createContext, useContext, useRef, useState } from 'react';
import { Check, CreditCard, Plus, X } from 'lucide-react';
import {
  demoPaymentMethods,
  initialPaymentMethods,
  type PaymentMethodsState,
  type PaymentMethodSummary,
} from '@/data/account/payment-methods';

const PreviewPayments = createContext<{
  state: PaymentMethodsState;
  setState: React.Dispatch<React.SetStateAction<PaymentMethodsState>>;
} | null>(null);

export function PreviewPaymentsProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, setState] = useState(initialPaymentMethods);
  return (
    <PreviewPayments.Provider value={{ state, setState }}>{children}</PreviewPayments.Provider>
  );
}

function label(method: PaymentMethodSummary) {
  return method.brand + ' final ' + method.lastFour;
}

export function PaymentMethods() {
  const payments = useContext(PreviewPayments);
  if (!payments) throw new Error('O perfil demonstrativo requer PreviewPaymentsProvider.');
  const { state, setState } = payments;
  const [feedback, setFeedback] = useState('');
  const [removeTarget, setRemoveTarget] = useState<PaymentMethodSummary | null>(null);
  const addDialog = useRef<HTMLDialogElement>(null);
  const removeDialog = useRef<HTMLDialogElement>(null);
  const addTrigger = useRef<HTMLButtonElement>(null);
  const available = demoPaymentMethods.listAvailable(state);

  return (
    <section>
      <div className="v3-account-heading">
        <div>
          <h2>Formas de pagamento</h2>
          <p>
            Cartões fictícios para testar a experiência. As mudanças duram enquanto você navega na
            conta.
          </p>
        </div>
        <button
          ref={addTrigger}
          type="button"
          disabled={!available.length}
          className="v3-button v3-button-dark"
          aria-haspopup="dialog"
          onClick={() => addDialog.current?.showModal()}
        >
          <Plus size={17} /> Adicionar cartão de teste
        </button>
      </div>
      <p className="v3-inline-status" role="status">
        {feedback}
      </p>
      {state.methods.length ? (
        <div className="v3-payments-grid" data-reveal="stagger">
          {state.methods.map((method) => {
            const preferred = state.preferredId === method.id;
            return (
              <article className="v3-payment-card" key={method.id}>
                <div className="v3-payment-visual" data-brand={method.brand.toLowerCase()}>
                  <div>
                    <CreditCard size={24} aria-hidden="true" />
                    <strong>{method.brand}</strong>
                  </div>
                  <p>
                    <span className="sr-only">Final </span>
                    <span aria-hidden="true">••••</span> {method.lastFour}
                  </p>
                  <div>
                    <span>Validade {method.expires}</span>
                    <span>Cartão de teste</span>
                  </div>
                </div>
                <div className="v3-payment-controls">
                  {preferred ? (
                    <span>
                      <Check size={17} aria-hidden="true" /> Preferencial
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setState((current) => demoPaymentMethods.setPreferred(current, method.id));
                        setFeedback(label(method) + ' definido como preferencial.');
                      }}
                    >
                      Definir como preferencial
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={'Remover ' + label(method)}
                    aria-haspopup="dialog"
                    onClick={() => {
                      setRemoveTarget(method);
                      removeDialog.current?.showModal();
                    }}
                  >
                    Remover
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="v3-panel">
          <h3>Nenhum cartão de teste</h3>
          <p>Adicione um dos exemplos para experimentar a interface.</p>
        </div>
      )}
      <dialog
        ref={addDialog}
        className="v3-dialog"
        aria-labelledby="add-payment-title"
        aria-describedby="add-payment-description"
      >
        <div className="v3-dialog-body">
          <h2 id="add-payment-title">Escolha um cartão de teste</h2>
          <p id="add-payment-description">Selecione um exemplo pronto para testar o perfil.</p>
          <form method="dialog">
            <button className="v3-dialog-close" aria-label="Fechar janela">
              <X />
            </button>
          </form>
          <div className="v3-payment-options">
            {available.map((method) => (
              <button
                type="button"
                className="v3-button v3-button-outline"
                key={method.id}
                onClick={() => {
                  setState((current) => demoPaymentMethods.add(current, method.id));
                  setFeedback(label(method) + ' adicionado.');
                  addDialog.current?.close();
                }}
              >
                <CreditCard size={18} /> {label(method)}
              </button>
            ))}
          </div>
        </div>
      </dialog>
      <dialog
        ref={removeDialog}
        className="v3-dialog"
        aria-labelledby="remove-payment-title"
        aria-describedby="remove-payment-description"
      >
        <div className="v3-dialog-body">
          <h2 id="remove-payment-title">Remover cartão de teste?</h2>
          <p id="remove-payment-description">{removeTarget ? label(removeTarget) : ''}</p>
          <form method="dialog" className="v3-dialog-actions">
            <button className="v3-button v3-button-outline">Cancelar</button>
            <button
              className="v3-button v3-button-dark"
              type="button"
              onClick={() => {
                if (!removeTarget) return;
                setState((current) => demoPaymentMethods.remove(current, removeTarget.id));
                setFeedback(label(removeTarget) + ' removido.');
                removeDialog.current?.close();
                requestAnimationFrame(() => addTrigger.current?.focus());
              }}
            >
              Remover cartão
            </button>
          </form>
        </div>
      </dialog>
    </section>
  );
}
