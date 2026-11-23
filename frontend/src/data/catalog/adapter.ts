import { ApiError } from '@/lib/api';
import type { Category, Money, Product } from '@/lib/types';
import type { CatalogCategory, CatalogProduct } from './types';

export function moneyToCents(value: Money) {
  const amount =
    typeof value === 'number' || (typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value))
      ? Number(value)
      : NaN;
  const cents = Math.round(amount * 100);
  if (!Number.isSafeInteger(cents) || cents < 0)
    throw new ApiError('Valor inválido recebido da API.', 502);
  return cents;
}

function imageUrl(value: string | null) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function adaptCategory(category: Category): CatalogCategory {
  return { slug: String(category.id), name: category.nome };
}

export function adaptProduct(product: Product): CatalogProduct {
  const id = String(product.id);
  const src = imageUrl(product.imagemUrl);
  return {
    id,
    slug: id,
    backendId: product.id,
    name: product.nome,
    description: product.descricao ?? '',
    category: String(product.categoriaId),
    categoryLabel: product.categoria?.nome,
    stock:
      product.status === true && Number.isSafeInteger(product.estoque)
        ? Math.max(0, product.estoque)
        : 0,
    referencePriceCents: moneyToCents(product.preco),
    specifications: product.especificacaoTecnica
      ? [['Especificação técnica', product.especificacaoTecnica]]
      : [],
    images: src ? [{ src, alt: product.nome, width: 600, height: 600 }] : [],
    dataAvailability: 'backend',
  };
}
