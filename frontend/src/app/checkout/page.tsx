import type { Metadata } from 'next';
import { Cart } from '@/components/v3/Cart';

export const metadata: Metadata = { title: 'Revisar carrinho' };

export default function CheckoutPage() {
  return <Cart checkout />;
}
