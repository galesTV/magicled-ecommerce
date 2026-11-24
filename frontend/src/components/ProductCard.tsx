import Link from 'next/link';
import { currency, usableProductImage } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductCard({ product }: { product: Product }) {
  const image = usableProductImage(product.imagemUrl);
  return (
    <article className="product-card">
      <Link
        href={`/produtos/${product.id}`}
        className="product-card-image"
        aria-label={`Ver ${product.nome}`}
      >
        {image ? (
          <img src={image} alt={product.nome} loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <span className="image-missing">
            <strong>Magic LED</strong>
          </span>
        )}
      </Link>
      <div className="product-card-body">
        {product.categoria && <span className="eyebrow">{product.categoria.nome}</span>}
        <h3>
          <Link href={`/produtos/${product.id}`}>{product.nome}</Link>
        </h3>
        <div className="product-card-bottom">
          <div>
            <strong className="price">{currency(product.preco)}</strong>
            <span className={`stock ${product.status && product.estoque > 0 ? 'available' : ''}`}>
              {product.status && product.estoque > 0 ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
          <Link className="text-link" href={`/produtos/${product.id}`}>
            Ver detalhes <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
