import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Clock3, Instagram, Mail, MessageCircle } from 'lucide-react';
import { readCatalog } from '@/data/catalog/server';
import { contact, type EditorialPage } from '@/data/institutional';
import { PointerSurface } from './Motion';
import { categoryHref } from './navigation';

const principles = [
  ['Qualidade', 'Valorizar produtos e informações que ajudem você a escolher a solução adequada.'],
  ['Preço justo', 'Buscar boas opções comerciais com transparência nas informações.'],
  ['Informação', 'Facilitar a compreensão das características e das aplicações dos produtos.'],
  ['Respeito', 'Oferecer atendimento atencioso, claro e responsável.'],
] as const;

async function AboutSections() {
  const { categories } = await readCatalog();
  return (
    <>
      <section className="v3-about-intro v3-panel" data-reveal="up">
        <h2>Iluminação para diferentes projetos</h2>
        <p>
          Nosso trabalho é aproximar você de soluções de iluminação LED para diferentes
          necessidades, de projetos residenciais e decorativos a aplicações externas, piscinas,
          jardins e sinalização.
        </p>
        <p>
          Queremos tornar a escolha da iluminação uma experiência simples, clara e confiável. Por
          isso, valorizamos informações acessíveis, atendimento cuidadoso e uma relação de respeito
          com cada cliente.
        </p>
        {!!categories.length && (
          <nav className="v3-chips" aria-label="Aplicações da Magic LED">
            {categories.map((category) => (
              <Link key={category.slug} href={categoryHref(category.slug)}>
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </section>
      <section className="v3-about-principles">
        <div className="v3-section-head" data-reveal="up">
          <h2>Nosso compromisso.</h2>
        </div>
        <div className="v3-principles" data-reveal="stagger">
          {principles.map(([title, text]) => (
            <article key={title} className="v3-panel">
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="v3-panel v3-contact-callout" data-reveal="side">
        <div>
          <h2>Estamos aqui para ajudar.</h2>
          <p>
            A equipe Magic LED pode orientar você sobre características técnicas, compatibilidade e
            aplicação.
          </p>
        </div>
        <Link href="/contato" className="v3-button v3-button-lime">
          Falar com a equipe <ArrowRight size={17} />
        </Link>
      </section>
    </>
  );
}

function ContactSections() {
  return (
    <>
      <div className="v3-contact-grid" data-reveal="stagger">
        <a className="v3-panel v3-contact-card" href={contact.whatsapp}>
          <MessageCircle size={25} aria-hidden="true" />
          <h2>WhatsApp</h2>
          <p>{contact.phoneDisplay}</p>
          <ArrowUpRight size={19} aria-hidden="true" />
        </a>
        <a className="v3-panel v3-contact-card" href={'mailto:' + contact.email}>
          <Mail size={25} aria-hidden="true" />
          <h2>E-mail</h2>
          <p>{contact.email}</p>
          <ArrowUpRight size={19} aria-hidden="true" />
        </a>
        <a className="v3-panel v3-contact-card" href={contact.instagram}>
          <Instagram size={25} aria-hidden="true" />
          <h2>Instagram</h2>
          <p>{contact.instagramHandle}</p>
          <ArrowUpRight size={19} aria-hidden="true" />
        </a>
        <div className="v3-panel v3-contact-card">
          <Clock3 size={25} aria-hidden="true" />
          <h2>Horário de atendimento</h2>
          <p>{contact.hours}</p>
        </div>
      </div>
      <section className="v3-panel v3-help" id="central-de-ajuda" data-reveal="up">
        <h2>Central de ajuda</h2>
        <p>Consulte as orientações sobre compras ou fale com a equipe pelos canais acima.</p>
        <div className="v3-chips">
          <Link href="/prazos-e-envios">Prazos e envios</Link>
          <Link href="/garantia-trocas-e-devolucoes">Garantia, trocas e devoluções</Link>
          <Link href="/pagamentos">Formas de pagamento</Link>
        </div>
      </section>
    </>
  );
}

export function Institutional({ slug, page }: { slug: string; page: EditorialPage }) {
  const about = slug === 'quem-somos';
  const isContact = slug === 'contato';
  return (
    <article className="v3-wrap v3-page v3-institutional">
      <nav className="v3-crumbs" aria-label="Caminho de navegação">
        <Link href="/">Início</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{page.title}</span>
      </nav>
      {about ? (
        <header className="v3-about-hero">
          <div className="v3-page-head">
            <p className="v3-eyebrow">Magic LED</p>
            <h1>{page.title}</h1>
            <h2>{page.headline}</h2>
            <p>{page.intro}</p>
          </div>
          <PointerSurface className="v3-editorial-scene">
            <Image
              src="/v3/jardim-ao-anoitecer-hd.webp"
              fill
              alt="Iluminação de jardim realça plantas e o caminho de pedra"
              sizes="(max-width: 720px) 100vw, 50vw"
              unoptimized
            />
          </PointerSurface>
        </header>
      ) : (
        <header className="v3-page-head v3-institutional-head">
          <p className="v3-eyebrow">Magic LED</p>
          <h1>{page.title}</h1>
          <h2>{page.headline}</h2>
          <p>{page.intro}</p>
        </header>
      )}
      {about && <AboutSections />}
      {isContact && <ContactSections />}
      {page.review && <aside className="v3-review">{page.review}</aside>}
      {page.sections && (
        <div className="v3-information">
          {page.sections.map(([heading, content, id]) => (
            <section key={heading} id={id} className="v3-panel" data-reveal="up">
              <h2>{heading}</h2>
              <p>{content}</p>
            </section>
          ))}
          <Link href="/contato" className="v3-text-link">
            Falar com a Magic LED <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </article>
  );
}
