import Image from 'next/image';
import Link from 'next/link';

export function StoreFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <span className="footer-logo">
            <Image src="/magicled-logo.png" alt="Magic LED" width={150} height={99} />
          </span>
          <p>Iluminação para diferentes ambientes e projetos.</p>
          <Link className="footer-brand-link" href="/produtos">
            Explorar o catálogo <span aria-hidden>→</span>
          </Link>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/produtos">Produtos</Link>
          <Link href="/institucional/quem-somos">Quem somos</Link>
          <Link href="/institucional/contato">Contato</Link>
        </div>
        <div>
          <h2>Informações</h2>
          <Link href="/institucional/privacidade">Privacidade</Link>
          <Link href="/institucional/garantia">Garantia</Link>
          <Link href="/institucional/trocas-e-devolucoes">Trocas e devoluções</Link>
          <Link href="/institucional/pagamentos">Pagamentos</Link>
          <Link href="/institucional/prazos-e-envios">Prazos e envios</Link>
          <Link href="/institucional/termos">Termos de uso</Link>
        </div>
        <div>
          <h2>Atendimento</h2>
          <Link href="/contato">
            Canais oficiais da Magic LED <span aria-hidden>↗</span>
          </Link>
          <p>Encontre os canais de contato e atendimento da Magic LED.</p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© Magic LED</span>
        <span>Iluminação para diferentes ambientes e projetos.</span>
      </div>
    </footer>
  );
}
