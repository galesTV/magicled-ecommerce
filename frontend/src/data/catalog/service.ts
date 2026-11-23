import { catalogCategories } from './demo';
import type { CatalogFilters, CatalogProduct } from './types';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function formatReferencePrice(cents: number) {
  return currency.format(cents / 100);
}

export function categoryName(slug: string) {
  return catalogCategories.find((category) => category.slug === slug)?.name ?? 'Iluminação';
}

export function productCategoryName(product: CatalogProduct) {
  return product.categoryLabel ?? categoryName(product.category);
}

export function normalizeCatalogText(text: string) {
  return text
    .trim()
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

export function filterProducts(products: readonly CatalogProduct[], filters: CatalogFilters = {}) {
  const words = normalizeCatalogText(filters.query ?? '')
    .split(/\s+/)
    .filter(Boolean);
  const result = products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.minimum !== undefined && product.referencePriceCents < filters.minimum)
      return false;
    if (filters.maximum !== undefined && product.referencePriceCents > filters.maximum)
      return false;
    if (!words.length) return true;
    const terms = normalizeCatalogText(
      [
        product.name,
        product.description,
        productCategoryName(product),
        ...product.specifications.flat(),
      ].join(' '),
    );
    return words.every((word) => terms.includes(word));
  });
  if (filters.sort === 'price-asc')
    result.sort((a, b) => a.referencePriceCents - b.referencePriceCents);
  if (filters.sort === 'price-desc')
    result.sort((a, b) => b.referencePriceCents - a.referencePriceCents);
  return result;
}
