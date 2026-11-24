import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { AddToCart } from '@/components/v3/Cart';
import { CatalogCard } from '@/components/v3/CatalogCard';
import { Gallery } from '@/components/v3/Gallery';
import { categoryHref } from '@/components/v3/navigation';
import { productCategoryName, formatReferencePrice } from '@/data/catalog/service';
import { readCatalog, readProduct } from '@/data/catalog/server';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { product } = await readProduct(id);
  return product
    ? { title: product.name, description: product.description }
    : { title: 'Produto indisponível' };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const { product, unavailable } = await readProduct(id);
  if (unavailable)
    return (
      <div className="v3-wrap v3-page">
        <div className="v3-panel" role="status">
          <h1>Produto temporariamente indisponível.</h1>
          <Link href="/produtos" className="v3-text-link">
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  if (!product) notFound();
  const { products } = await readCatalog();
  const related = [
    ...products.filter((item) => item.category === product.category),
    ...products.filter((item) => item.category !== product.category),
  ]
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return (
    <div className="v3-wrap v3-page">
      <nav className="v3-crumbs" aria-label="Caminho de navegação">
        <Link href="/">Início</Link>
        <ChevronRight size={15} />
        <Link href="/produtos">Produtos</Link>
        <ChevronRight size={15} />
        <Link href={categoryHref(product.category)}>{productCategoryName(product)}</Link>
      </nav>
      <section className="v3-product-detail" aria-labelledby="product-title">
        <Gallery key={product.id} images={product.images} />
        <div className="v3-detail-copy">
          <p className="v3-eyebrow">{productCategoryName(product)}</p>
          <h1 id="product-title">{product.name}</h1>
          {product.description && <p>{product.description}</p>}
          <p className="v3-detail-price">{formatReferencePrice(product.referencePriceCents)}</p>
          {product.stock !== undefined && <p>{product.stock > 0 ? 'Em estoque' : 'Sem estoque'}</p>}
          <AddToCart product={product} />
          <Link className="v3-text-link" href={categoryHref(product.category)}>
            Explorar categoria <ArrowUpRight size={17} />
          </Link>
          {!!product.specifications.length && (
            <>
              <h2>Especificações</h2>
              <dl className="v3-specs">
                {product.specifications.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </section>
      {!!related.length && (
        <section className="v3-section" aria-labelledby="related">
          <div className="v3-section-head" data-reveal="up">
            <h2 id="related">Você também pode gostar.</h2>
          </div>
          <div className="v3-product-grid" data-reveal="stagger">
            {related.map((item) => (
              <CatalogCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
