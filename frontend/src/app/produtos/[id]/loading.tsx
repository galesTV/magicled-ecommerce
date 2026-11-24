export default function ProductLoading() {
  return (
    <div className="v3-wrap v3-page" role="status">
      <p className="v3-eyebrow">Catálogo Magic LED</p>
      <p className="v3-loading-label">Carregando produto…</p>
      <div className="v3-product-detail" aria-hidden="true">
        <div className="v3-loading-block" />
      </div>
    </div>
  );
}
