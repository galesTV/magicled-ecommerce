import type { Metadata } from 'next';
import { Cart } from '@/components/v3/Cart';

export const metadata: Metadata = { title: 'Carrinho' };

export default function CartPage() {
  return <Cart />;
}
