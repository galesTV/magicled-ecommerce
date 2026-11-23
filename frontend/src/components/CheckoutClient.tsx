'use client';

import { AuthGate } from './AuthGate';
import { CheckoutView } from './CheckoutView';

export function CheckoutClient({ allowCreate }: { allowCreate: boolean }) {
  return (
    <AuthGate role="CLIENTE">
      {(user) => <CheckoutView user={user} allowCreate={allowCreate} />}
    </AuthGate>
  );
}
