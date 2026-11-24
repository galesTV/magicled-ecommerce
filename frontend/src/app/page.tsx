import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Baby,
  CircleDot,
  Flower2,
  Lamp,
  Waves,
  Zap,
} from 'lucide-react';
import { CatalogCard } from '@/components/v3/CatalogCard';
import { CatalogMedia } from '@/components/v3/CatalogMedia';
import { readCatalog } from '@/data/catalog/server';
import { demoEnabled } from '@/lib/data-mode';
import { PointerSurface } from '@/components/v3/Motion';
import { categoryHref, environmentHref, productHref } from '@/components/v3/navigation';

export const metadata: Metadata = { title: 'Iluminação que muda o ambiente' };

const icons = [Waves, Flower2, Lamp, CircleDot, Baby, Zap];

const demoHighlights = [
  'kit-6-luminarias-espeto-jardim',
  'refletor-led-rgb-piscina-125-mm',
  'spot-deck-inox-led-8-w',
  'refletor-led-azul-piscina-80-mm',
  'giroled-automotivo-vermelho',
  'spot-base-jardim-12-w-branco',
];

export default async function HomePage() {
  const { categories, products, unavailable } = await readCatalog();
  const spotlight = demoEnabled
    ? products.find((product) => product.slug === 'refletor-led-rgb-piscina-125-mm')
    : products.find((product) => product.images.length > 0 && (product.stock ?? 0) > 0);
  const featured = demoEnabled
    ? demoHighlights.flatMap((slug) => products.filter((product) => product.slug === slug))
    : products.slice(0, 6);
  return (
    <>
      <section className="v3-wrap v3-home-hero" aria-labelledby="home-title">
        <PointerSurface className="v3-hero">
          <div className="v3-hero-media">
            <Image
              src="/v3/piscina-ao-anoitecer-hd.webp"
              fill
              alt=""
              sizes="100vw"
              preload
              unoptimized
            />
          </div>
          <div className="v3-hero-shade" />
          <div className="v3-hero-copy">
            <span className="v3-eyebrow v3-hero-eyebrow">
              <span /> Iluminação Magic LED
            </span>
            <h1 id="home-title">
              A luz muda
              <br /> <em>tudo.</em>
            </h1>
            <p>
              Iluminação LED para transformar piscinas, jardins e os espaços que fazem parte da sua
              vida.
            </p>
            <div className="v3-hero-actions">
              <Link href="/produtos" className="v3-button v3-button-lime">
                Explorar produtos <ArrowUpRight size={19} />
              </Link>
              <Link href="/#categorias" className="v3-hero-secondary">
                Ver categorias <ArrowDown size={17} />
              </Link>
            </div>
          </div>
          {spotlight && spotlight.images[0] && (
            <Link href={productHref(spotlight.slug)} className="v3-hero-spotlight">
              <span className="v3-spotlight-image">
                <CatalogMedia image={spotlight.images[0]} sizes="53px" decorative />
              </span>
              <span>
                <small>Em destaque</small>
                <strong>{spotlight.name}</strong>
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          )}
        </PointerSurface>
      </section>
      <section className="v3-wrap v3-section" id="categorias" aria-labelledby="category-title">
        <div className="v3-section-head" data-reveal="up">
          <div>
            <p className="v3-eyebrow">Encontre sua iluminação</p>
            <h2 id="category-title">Explore por ambiente.</h2>
          </div>
          <Link href="/produtos" className="v3-text-link">
            Ver catálogo <ArrowRight size={19} />
          </Link>
        </div>
        {categories.length ? (
          <div className="v3-category-grid" data-reveal="stagger">
            {categories.map((category, index) => {
              const Icon = icons[index % icons.length];
              return (
                <Link
                  key={category.slug}
                  href={categoryHref(category.slug)}
                  className="v3-category"
                >
                  <Icon size={26} strokeWidth={1.55} aria-hidden="true" />
                  <span>{category.name}</span>
                  <ArrowUpRight size={17} aria-hidden="true" />
                </Link>
              );
            })}
          </div>
        ) : (
          <p>
            {unavailable
              ? 'Catálogo temporariamente indisponível.'
              : 'Nenhuma categoria disponível.'}
          </p>
        )}
      </section>
      {featured.length > 0 && (
        <section className="v3-wrap v3-section" id="destaques" aria-labelledby="featured-title">
          <div className="v3-section-head" data-reveal="up">
            <div>
              <p className="v3-eyebrow">Seleção Magic LED</p>
              <h2 id="featured-title">Destaques do catálogo.</h2>
            </div>
            <Link href="/produtos" className="v3-text-link">
              Todos os produtos <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="v3-product-grid v3-featured-grid" data-reveal="stagger">
            {featured.map((product) => (
              <CatalogCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
      <section className="v3-wrap v3-section" aria-labelledby="editorial-title">
        <div className="v3-editorial" data-reveal="side">
          <PointerSurface className="v3-editorial-scene">
            <Image
              src="/v3/jardim-luz-quente-hd.webp"
              fill
              alt="Refletor de luz quente iluminando samambaias e um muro de pedra à noite"
              sizes="(max-width: 720px) 100vw, 48vw"
              unoptimized
            />
          </PointerSurface>
          <div className="v3-editorial-copy">
            <p className="v3-eyebrow">Descubra a Magic LED</p>
            <h2 id="editorial-title">O jardim ganha vida à noite.</h2>
            <p>Valorize caminhos, plantas e texturas com iluminação pensada para áreas externas.</p>
            <Link href={environmentHref(categories, 'jardins')} className="v3-text-link">
              Conhecer iluminação para jardins <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
