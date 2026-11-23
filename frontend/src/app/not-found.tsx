import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="v3-wrap v3-page">
      <header className="v3-page-head">
        <p className="v3-eyebrow">Erro 404</p>
        <h1>Página indisponível.</h1>
        <p>Confira o endereço ou volte ao catálogo para continuar.</p>
      </header>
      <Link className="v3-button v3-button-dark" href="/produtos">
        Ver catálogo <ArrowRight size={17} />
      </Link>
    </div>
  );
}
