'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Search, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { MessageState } from './MessageState';
import type { Category, Product } from '@/lib/types';

type Filters = { q: string; categoria: string; minimo: string; maximo: string; ordem: string };
const empty: Filters = { q: '', categoria: '', minimo: '', maximo: '', ordem: 'recentes' };

export function CatalogView({
  products,
  categories,
  initial,
}: {
  products: Product[];
  categories: Category[];
  initial: Filters;
}) {
  const [draft, setDraft] = useState(initial);
  const [filters, setFilters] = useState(initial);
  const [error, setError] = useState('');
  const panel = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    if (panel.current) panel.current.open = window.innerWidth >= 900;
  }, []);
  const shown = useMemo(() => {
    const query = filters.q.trim().toLocaleLowerCase('pt-BR');
    const min = filters.minimo === '' ? -Infinity : Number(filters.minimo);
    const max = filters.maximo === '' ? Infinity : Number(filters.maximo);
    return products
      .filter(
        (item) =>
          (!filters.categoria || item.categoriaId === Number(filters.categoria)) &&
          (!query ||
            `${item.nome} ${item.descricao || ''} ${item.especificacaoTecnica || ''}`
              .toLocaleLowerCase('pt-BR')
              .includes(query)) &&
          Number(item.preco) >= min &&
          Number(item.preco) <= max,
      )
      .sort((a, b) =>
        filters.ordem === 'preco-asc'
          ? Number(a.preco) - Number(b.preco)
          : filters.ordem === 'preco-desc'
            ? Number(b.preco) - Number(a.preco)
            : filters.ordem === 'nome'
              ? a.nome.localeCompare(b.nome, 'pt-BR')
              : b.id - a.id,
      );
  }, [products, filters]);

  function commit(next: Filters) {
    setFilters(next);
    setDraft(next);
    setError('');
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value && !(key === 'ordem' && value === 'recentes')) params.set(key, value);
    });
    window.history.replaceState(null, '', `/produtos${params.size ? `?${params}` : ''}`);
  }
  function apply(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.minimo && draft.maximo && Number(draft.minimo) > Number(draft.maximo)) {
      setError('O preço mínimo deve ser menor ou igual ao máximo.');
      return;
    }
    commit({ ...draft });
    if (window.innerWidth < 900 && panel.current) panel.current.open = false;
  }
  const active = [filters.q, filters.categoria, filters.minimo, filters.maximo].filter(
    Boolean,
  ).length;
  return (
    <div className="catalog-layout shell">
      <aside className="catalog-filters" aria-label="Filtros de produtos">
        <details ref={panel}>
          <summary>
            <SlidersHorizontal size={18} aria-hidden="true" /> Filtrar e ordenar{' '}
            {active > 0 && <span className="catalog-filter-count">{active}</span>}
          </summary>
          <form onSubmit={apply} className="filter-form">
            <div className="catalog-filter-heading">
              <strong>Refine sua escolha</strong>
              <span>Encontre a luz para seu projeto.</span>
            </div>
            <label htmlFor="filter-q">Buscar neste catálogo</label>
            <div className="catalog-search-field">
              <Search size={18} aria-hidden="true" />
              <input
                id="filter-q"
                value={draft.q}
                onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                placeholder="Nome ou detalhe"
              />
            </div>
            <label htmlFor="filter-category">Categoria</label>
            <select
              id="filter-category"
              value={draft.categoria}
              onChange={(e) => setDraft({ ...draft, categoria: e.target.value })}
            >
              <option value="">Todas as categorias</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.nome}
                </option>
              ))}
            </select>
            <fieldset className="catalog-price-fields">
              <legend>Faixa de preço</legend>
              <div className="price-range">
                <input
                  aria-label="Preço mínimo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="De"
                  value={draft.minimo}
                  onChange={(e) => setDraft({ ...draft, minimo: e.target.value })}
                />
                <input
                  aria-label="Preço máximo"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Até"
                  value={draft.maximo}
                  onChange={(e) => setDraft({ ...draft, maximo: e.target.value })}
                />
              </div>
            </fieldset>
            <label htmlFor="filter-order">Ordenar por</label>
            <select
              id="filter-order"
              value={draft.ordem}
              onChange={(e) => setDraft({ ...draft, ordem: e.target.value })}
            >
              <option value="recentes">Mais recentes</option>
              <option value="preco-asc">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
              <option value="nome">Nome de A a Z</option>
            </select>
            {error && (
              <p className="catalog-filter-error" role="alert">
                {error}
              </p>
            )}
            <button className="button button-dark" type="submit">
              Aplicar filtros <ArrowRight size={16} aria-hidden="true" />
            </button>
            <button className="button button-quiet" type="button" onClick={() => commit(empty)}>
              Limpar filtros
            </button>
          </form>
        </details>
      </aside>
      <div className="catalog-results">
        {categories.length > 0 && (
          <nav className="catalog-category-nav" aria-label="Categorias de produtos">
            <button
              type="button"
              className={!filters.categoria ? 'selected' : ''}
              onClick={() => commit({ ...filters, categoria: '' })}
            >
              Todos os produtos
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={filters.categoria === String(category.id) ? 'selected' : ''}
                onClick={() => commit({ ...filters, categoria: String(category.id) })}
              >
                {category.nome}
              </button>
            ))}
          </nav>
        )}
        <div className="result-meta">
          <span>
            <strong>
              {shown.length} {shown.length === 1 ? 'produto' : 'produtos'}
            </strong>{' '}
            encontrados
          </span>
          <label>
            Ordenar{' '}
            <select
              aria-label="Ordenar produtos"
              value={filters.ordem}
              onChange={(e) => commit({ ...filters, ordem: e.target.value })}
            >
              <option value="recentes">Mais recentes</option>
              <option value="preco-asc">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
              <option value="nome">Nome de A a Z</option>
            </select>
          </label>
        </div>
        {active > 0 && (
          <div className="catalog-active-filters">
            <span>
              {active} {active === 1 ? 'filtro ativo' : 'filtros ativos'}
            </span>
            <button type="button" onClick={() => commit(empty)}>
              Limpar tudo ×
            </button>
          </div>
        )}
        {shown.length ? (
          <div className="product-grid">
            {shown.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <MessageState
            title="Nenhum produto encontrado"
            href="/produtos"
            action="Ver todos os produtos"
          >
            Tente outro termo ou ajuste os filtros.
          </MessageState>
        )}
      </div>
    </div>
  );
}
