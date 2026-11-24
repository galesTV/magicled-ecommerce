'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { filterProducts, normalizeCatalogText } from '@/data/catalog/service';
import type { CatalogProduct } from '@/data/catalog/types';
import { CatalogMedia } from './CatalogMedia';
import { productHref } from './navigation';

export function CatalogSearch({
  onNavigate,
  products,
  unavailable,
}: {
  onNavigate: () => void;
  products: readonly CatalogProduct[];
  unavailable?: boolean;
}) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState(-1);
  const listbox = useRef<HTMLUListElement>(null);
  const { push } = useRouter();
  const hasQuery = normalizeCatalogText(query).length >= 2;
  const suggestions = hasQuery ? filterProducts(products, { query }).slice(0, 5) : [];
  const show = expanded && hasQuery;
  const hasOptions = show && suggestions.length > 0;

  useEffect(() => {
    if (active >= 0)
      listbox.current?.children[active]?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [active]);

  function close() {
    setExpanded(false);
    setActive(-1);
  }

  return (
    <form
      className="v3-search"
      action="/produtos"
      role="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      onSubmit={(event) => {
        event.preventDefault();
        const result = hasOptions && active >= 0 ? suggestions[active] : undefined;
        close();
        onNavigate();
        push(result ? productHref(result.slug) : '/produtos?q=' + encodeURIComponent(query.trim()));
      }}
    >
      <Search size={18} aria-hidden="true" />
      <label className="sr-only" htmlFor="store-search">
        Buscar produtos
      </label>
      <input
        id="store-search"
        name="q"
        autoComplete="off"
        placeholder="Buscar iluminação"
        value={query}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={hasOptions}
        aria-controls={hasOptions ? 'search-suggestions' : undefined}
        aria-activedescendant={hasOptions && active >= 0 ? 'search-option-' + active : undefined}
        onFocus={() => setExpanded(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setExpanded(true);
          setActive(-1);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && show) {
            event.stopPropagation();
            close();
          }
          if (!suggestions.length || !['ArrowDown', 'ArrowUp'].includes(event.key)) return;
          event.preventDefault();
          setExpanded(true);
          const last = suggestions.length - 1;
          setActive((index) =>
            event.key === 'ArrowDown'
              ? index >= last
                ? 0
                : index + 1
              : index <= 0
                ? last
                : index - 1,
          );
        }}
      />
      <button type="submit" aria-label="Buscar produtos">
        <ArrowUpRight size={17} aria-hidden="true" />
      </button>
      {hasOptions && (
        <ul
          ref={listbox}
          className="v3-suggestions"
          id="search-suggestions"
          role="listbox"
          aria-label="Sugestões de produtos"
        >
          {suggestions.map((product, index) => (
            <li key={product.id} role="presentation">
              <Link
                role="option"
                id={'search-option-' + index}
                aria-selected={active === index}
                tabIndex={-1}
                href={productHref(product.slug)}
                onClick={() => {
                  close();
                  onNavigate();
                }}
              >
                <span className="v3-suggestion-image">
                  <CatalogMedia image={product.images[0]} sizes="35px" decorative />
                </span>
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {show && !hasOptions && (
        <p className="v3-suggestions v3-search-empty" role="status">
          {unavailable ? 'Sugestões indisponíveis no momento.' : 'Nenhum produto encontrado.'}
        </p>
      )}
    </form>
  );
}
