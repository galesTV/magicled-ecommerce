import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { CatalogProduct } from '@/data/catalog/types';
import { productCategoryName, formatReferencePrice } from '@/data/catalog/service';
import { CatalogMedia } from './CatalogMedia';
import { productHref } from './navigation';

export function CatalogCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="v3-product-card">
      <Link href={productHref(product.slug)}>
        <div className="v3-product-media">
          <CatalogMedia image={product.images[0]} decorative />
        </div>
        <div className="v3-product-copy">
          <p className="v3-eyebrow">{productCategoryName(product)}</p>
          <h3>{product.name}</h3>
          <p className="v3-product-price">{formatReferencePrice(product.referencePriceCents)}</p>
          <span className="v3-product-action" aria-hidden="true">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </Link>
    </article>
  );
}
