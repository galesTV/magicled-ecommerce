import 'server-only';
import { cache } from 'react';
import { ApiError } from '@/lib/api';
import { apiEnabled, demoEnabled } from '@/lib/data-mode';
import { isBackendId, publicApi } from '@/lib/server-api';
import type { Category, Product } from '@/lib/types';
import { adaptCategory, adaptProduct } from './adapter';
import { catalogCategories, demoCatalog } from './demo';
import type { CatalogCategory, CatalogProduct } from './types';

type CatalogSnapshot = {
  categories: readonly CatalogCategory[];
  products: readonly CatalogProduct[];
  unavailable: boolean;
};

export const readCatalog = cache(async (): Promise<CatalogSnapshot> => {
  if (demoEnabled)
    return { categories: catalogCategories, products: demoCatalog, unavailable: false };
  if (!apiEnabled) return { categories: [], products: [], unavailable: true };
  try {
    const [products, categories] = await Promise.all([
      publicApi<Product[]>('/products'),
      publicApi<Category[]>('/categories'),
    ]);
    return {
      products: products.filter((product) => product.status === true).map(adaptProduct),
      categories: categories.map(adaptCategory),
      unavailable: false,
    };
  } catch {
    return { categories: [], products: [], unavailable: true };
  }
});

export const readProduct = cache(async (id: string) => {
  if (demoEnabled) return { product: demoCatalog.find((product) => product.slug === id) };
  if (!apiEnabled || !isBackendId(id)) return { product: undefined };
  try {
    const product = await publicApi<Product>('/products/' + id);
    return { product: product.status === true ? adaptProduct(product) : undefined };
  } catch (error) {
    return {
      product: undefined,
      unavailable: !(error instanceof ApiError && error.status === 404),
    };
  }
});
