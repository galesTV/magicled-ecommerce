import type { Metadata } from 'next';
import { Unavailable } from '@/components/v3/Unavailable';

export const metadata: Metadata = { title: 'Recuperar senha' };

export default function PasswordPage() {
  return (
    <Unavailable
      title="Recuperar senha"
      description="A recuperação de senha está indisponível nesta demonstração."
    />
  );
}
