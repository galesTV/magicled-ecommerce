import { Unavailable } from '@/components/v3/Unavailable';
import { CatalogCard } from '@/components/v3/CatalogCard';
import { SignOut } from '@/components/v3/Authentication';
import { readCatalog } from '@/data/catalog/server';
import { apiEnabled } from '@/lib/data-mode';
import { requireUser } from '@/lib/session-server';

export default async function AdminPage() {
  if (apiEnabled) {
    const user = await requireUser('ADMIN', '/admin');
    if (!user)
      return (
        <Unavailable
          title="Administração"
          description="O acesso está temporariamente indisponível."
        />
      );
    const { categories, products, unavailable } = await readCatalog();
    return (
      <div className="v3-wrap v3-page">
        <header className="v3-page-head">
          <p className="v3-eyebrow">Magic LED</p>
          <h1>Administração</h1>
          <p>{user.nome || user.email}</p>
          <SignOut />
        </header>
        {unavailable ? (
          <div className="v3-panel" role="status">
            Catálogo temporariamente indisponível.
          </div>
        ) : (
          <>
            <section className="v3-panel">
              <h2>Categorias</h2>
              {categories.length ? (
                <ul>
                  {categories.map((category) => (
                    <li key={category.slug}>{category.name}</li>
                  ))}
                </ul>
              ) : (
                <p>Nenhuma categoria disponível.</p>
              )}
            </section>
            <section className="v3-section">
              <div className="v3-section-head">
                <h2>Produtos ativos</h2>
              </div>
              {products.length ? (
                <div className="v3-product-grid" data-reveal="stagger">
                  {products.map((product) => (
                    <CatalogCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <p>Nenhum produto ativo.</p>
              )}
            </section>
          </>
        )}
        <section className="v3-section">
          <div className="v3-panel">
            <h2>Pedidos e alterações</h2>
            <p>
              A consulta de todos os pedidos e as alterações administrativas ainda estão
              indisponíveis.
            </p>
          </div>
        </section>
      </div>
    );
  }
  return (
    <Unavailable
      title="Administração"
      description="As operações administrativas dependem da integração comercial e estão desativadas na prévia."
    />
  );
}
