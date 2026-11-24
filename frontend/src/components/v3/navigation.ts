import { normalizeCatalogText } from '@/data/catalog/service';
import type { CatalogCategory } from '@/data/catalog/types';

export function categoryHref(slug: string) {
  return '/produtos?categoria=' + encodeURIComponent(slug);
}

export function environmentHref(
  categories: readonly CatalogCategory[],
  environment: 'piscinas' | 'jardins',
) {
  const pattern = environment === 'piscinas' ? /\bpiscinas?\b/ : /\b(jardim|jardins)\b/;
  const category = categories.find((item) => pattern.test(normalizeCatalogText(item.name)));
  return category ? categoryHref(category.slug) : '/produtos?q=' + environment;
}
export function productHref(slug: string) {
  return '/produtos/' + encodeURIComponent(slug);
}
