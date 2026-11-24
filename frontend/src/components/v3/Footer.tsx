import Image from 'next/image';
import Link from 'next/link';
import { Instagram, MessageCircle } from 'lucide-react';
import { contact } from '@/data/institutional';
import { demoEnabled } from '@/lib/data-mode';

const columns = [
  {
    heading: 'Explore',
    links: [
      ['Início', '/'],
      ['Todos os produtos', '/produtos'],
      ['Categorias', '/#categorias'],
      ...(demoEnabled ? [['Destaques', '/#destaques']] : []),
      ['Quem somos', '/quem-somos'],
    ],
  },
  {
    heading: 'Atendimento',
    highlighted: true,
    links: [
      ['Contato', '/contato'],
      ['Central de ajuda', '/contato#central-de-ajuda'],
      ['Pedidos', '/conta/pedidos'],
      ['Prazos e envios', '/prazos-e-envios'],
      ['Trocas e devoluções', '/garantia-trocas-e-devolucoes#trocas-e-devolucoes'],
    ],
  },
  {
    heading: 'Informações',
    highlighted: true,
    links: [
      ['Política de privacidade', '/politica-de-privacidade'],
      ['Garantia', '/garantia-trocas-e-devolucoes#garantia'],
      ['Formas de pagamento', '/pagamentos'],
      ['Termos de uso', '/termos-de-uso'],
    ],
  },
];

export function Footer() {
  return (
    <footer className="v3-footer">
      <div className="v3-wrap v3-footer-grid">
        <div className="v3-footer-brand">
          <Link href="/" aria-label="Magic LED, página inicial">
            <Image src="/magicled-logo.png" alt="Magic LED" width={150} height={100} />
          </Link>
          <p>
            Soluções de iluminação LED para piscinas, jardins e projetos que pedem uma luz
            diferente.
          </p>
          <div className="v3-socials">
            <a href={contact.instagram} aria-label="Instagram da Magic LED">
              <Instagram size={20} aria-hidden="true" />
            </a>
            <a href={contact.whatsapp} aria-label="WhatsApp da Magic LED">
              <MessageCircle size={20} aria-hidden="true" />
            </a>
          </div>
        </div>
        {columns.map((column) => (
          <nav
            key={column.heading}
            aria-label={column.heading}
            className={column.highlighted ? 'v3-footer-highlight' : undefined}
          >
            <h2>{column.heading}</h2>
            {column.links.map(([label, url]) => (
              <Link key={label} href={url}>
                {label}
              </Link>
            ))}
          </nav>
        ))}
      </div>
      <div className="v3-wrap v3-footer-bottom">
        <span>© Magic LED. Todos os direitos reservados.</span>
        <span>CNPJ {contact.cnpj}</span>
      </div>
    </footer>
  );
}
