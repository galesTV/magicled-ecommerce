export default function ProductsLoading() {
  return (
    <div className="v3-wrap v3-page" role="status">
      <p className="v3-eyebrow">Catálogo Magic LED</p>
      <p className="v3-loading-label">Carregando produtos…</p>
      <div className="v3-product-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="v3-loading-block" key={index} />
        ))}
      </div>
    </div>
  );
}
