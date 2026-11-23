import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { CatalogCard } from '@/components/v3/CatalogCard';
import { filterProducts } from '@/data/catalog/service';
import { readCatalog } from '@/data/catalog/server';

export const metadata: Metadata = { title: 'Catálogo de iluminação' };

type Query = Record<string, string | string[] | undefined>;
const stringParam = (value: Query[string]) => (typeof value === 'string' ? value : '');
function cents(value: string) {
  return value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0
    ? Math.round(Number(value) * 100)
    : undefined;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Query> }) {
  const params = await searchParams;
  const { products: allProducts, categories, unavailable } = await readCatalog();
  const query = stringParam(params.q);
  const category =
    categories.find((item) => item.slug === stringParam(params.categoria))?.slug ?? '';
  const rawSort = stringParam(params.ordem);
  const sort = rawSort === 'price-asc' || rawSort === 'price-desc' ? rawSort : undefined;
  const minimum = stringParam(params.minimo);
  const maximum = stringParam(params.maximo);
  const products = filterProducts(allProducts, {
    query,
    category,
    sort,
    minimum: cents(minimum),
    maximum: cents(maximum),
  });
  function categoryUrl(slug?: string) {
    const search = new URLSearchParams();
    if (query) search.set('q', query);
    if (sort) search.set('ordem', sort);
    if (minimum) search.set('minimo', minimum);
    if (maximum) search.set('maximo', maximum);
    if (slug) search.set('categoria', slug);
    return '/produtos' + (search.size ? '?' + search.toString() : '');
  }

  return (
    <div className="v3-wrap v3-page">
      <header className="v3-page-head">
        <p className="v3-eyebrow">Catálogo Magic LED</p>
        <h1>Encontre a luz certa.</h1>
      </header>
      {unavailable ? (
        <div className="v3-panel" role="status">
          <h2>Catálogo temporariamente indisponível.</h2>
          <Link href="/produtos" className="v3-text-link">
            Tentar novamente <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <nav className="v3-chips" aria-label="Categorias do catálogo">
            <Link href={categoryUrl()} aria-current={!category ? 'page' : undefined}>
              Todos
            </Link>
            {categories.map((item) => (
              <Link
                key={item.slug}
                href={categoryUrl(item.slug)}
                aria-current={category === item.slug ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <form
            className="v3-filter"
            action="/produtos"
            key={[query, category, minimum, maximum, sort].join('|')}
          >
            {category && <input type="hidden" name="categoria" value={category} />}
            <label>
              Buscar
              <input name="q" defaultValue={query} placeholder="Nome, aplicação, potência" />
            </label>
            <label>
              De (R$)
              <input
                type="number"
                min="0"
                step=".01"
                name="minimo"
                defaultValue={minimum}
                placeholder="0"
              />
            </label>
            <label>
              Até (R$)
              <input
                type="number"
                min="0"
                step=".01"
                name="maximo"
                defaultValue={maximum}
                placeholder="Sem limite"
              />
            </label>
            <label>
              Ordenar
              <select name="ordem" defaultValue={sort ?? ''}>
                <option value="">Destaques</option>
                <option value="price-asc">Menor preço</option>
                <option value="price-desc">Maior preço</option>
              </select>
            </label>
            <button type="submit" className="v3-button v3-button-dark">
              Aplicar <Search size={16} />
            </button>
          </form>
          <div className="v3-results">
            <h2>{query ? 'Resultados para “' + query + '”' : 'Produtos'}</h2>
            <p>
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </p>
          </div>
          {products.length ? (
            <div className="v3-product-grid" data-reveal="stagger">
              {products.map((product) => (
                <CatalogCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="v3-panel">
              <h3>Nenhum produto corresponde aos filtros.</h3>
              <Link className="v3-text-link" href="/produtos">
                Limpar filtros <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
