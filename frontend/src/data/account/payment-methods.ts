export interface PaymentMethodSummary {
  id: string;
  brand: 'Visa' | 'Mastercard' | 'Elo';
  lastFour: string;
  expires: string;
}

export type PaymentMethodsState = Readonly<{
  methods: readonly PaymentMethodSummary[];
  preferredId: string | null;
}>;

export interface PaymentMethodsService {
  listAvailable(state: PaymentMethodsState): readonly PaymentMethodSummary[];
  add(state: PaymentMethodsState, id: string): PaymentMethodsState;
  remove(state: PaymentMethodsState, id: string): PaymentMethodsState;
  setPreferred(state: PaymentMethodsState, id: string): PaymentMethodsState;
}

const fixtures: readonly PaymentMethodSummary[] = [
  { id: 'visa-test', brand: 'Visa', lastFour: '4242', expires: '12/29' },
  { id: 'mastercard-test', brand: 'Mastercard', lastFour: '5555', expires: '08/30' },
  { id: 'elo-test', brand: 'Elo', lastFour: '0123', expires: '10/30' },
];

export const initialPaymentMethods: PaymentMethodsState = {
  methods: [fixtures[0]],
  preferredId: fixtures[0].id,
};

export const demoPaymentMethods: PaymentMethodsService = {
  listAvailable(state) {
    return fixtures.filter((fixture) => !state.methods.some((method) => method.id === fixture.id));
  },
  add(state, id) {
    const fixture = fixtures.find((item) => item.id === id);
    if (!fixture || state.methods.some((method) => method.id === id)) return state;
    return { methods: [...state.methods, fixture], preferredId: state.preferredId ?? id };
  },
  remove(state, id) {
    const methods = state.methods.filter((method) => method.id !== id);
    return {
      methods,
      preferredId: state.preferredId === id ? (methods[0]?.id ?? null) : state.preferredId,
    };
  },
  setPreferred(state, id) {
    return state.methods.some((method) => method.id === id) ? { ...state, preferredId: id } : state;
  },
};
