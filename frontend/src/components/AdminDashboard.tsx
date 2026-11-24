'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  ClipboardList,
  Layers3,
  Search,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import { apiMessage, clientApi } from '@/lib/api';
import { currency } from '@/lib/format';
import type { Category, Product } from '@/lib/types';
import { AdminOrderStatus } from './AdminOrderStatus';
import { MessageState } from './MessageState';

export function AdminDashboard() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    Promise.all([clientApi<Product[]>('/products'), clientApi<Category[]>('/categories')])
      .then(([loadedProducts, loadedCategories]) => {
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      })
      .catch((cause) => setLoadError(apiMessage(cause)));
  }, []);

  const visibleProducts = useMemo(() => {
    if (!products) return [];
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    return products.filter(
      (product) =>
        (!categoryId || String(product.categoriaId) === categoryId) &&
        (!normalized ||
          `${product.nome} ${product.id}`.toLocaleLowerCase('pt-BR').includes(normalized)),
    );
  }, [products, query, categoryId]);

  return (
    <div className="shell admin-workspace">
      <header className="admin-heading">
        <div>
          <span className="eyebrow">OPERAÇÃO MAGIC LED</span>
          <h1>Administração</h1>
          <p>Consulte o catálogo e atualize pedidos dentro das permissões disponíveis.</p>
        </div>
        <span className="admin-role">
          <ShieldCheck size={17} aria-hidden="true" /> Acesso administrativo
        </span>
      </header>
      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Seções administrativas">
          <span className="admin-nav-label">PAINEL</span>
          <a href="#visao-geral">Visão geral</a>
          <a href="#produtos">Produtos ativos</a>
          <a href="#categorias">Categorias</a>
          <a href="#pedidos">Pedidos</a>
          <a href="#usuarios">Usuários</a>
        </nav>
        <div className="admin-main">
          <section
            id="visao-geral"
            className="admin-overview"
            aria-labelledby="admin-overview-title"
          >
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">VISÃO GERAL</span>
                <h2 id="admin-overview-title">Ferramentas disponíveis</h2>
              </div>
              <p>Acesso rápido às operações e consultas existentes.</p>
            </div>
            <div className="admin-action-grid">
              <a href="#produtos" className="admin-action-card">
                <Boxes size={22} aria-hidden="true" />
                <strong>Consultar produtos</strong>
                <span>Veja preços e estoque dos itens ativos.</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#categorias" className="admin-action-card">
                <Layers3 size={22} aria-hidden="true" />
                <strong>Ver categorias</strong>
                <span>Consulte as categorias retornadas pela API.</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
              <a href="#pedidos" className="admin-action-card">
                <ClipboardList size={22} aria-hidden="true" />
                <strong>Atualizar pedido</strong>
                <span>Altere o status usando um ID confirmado.</span>
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>
          </section>

          <section id="produtos" className="admin-panel" aria-labelledby="admin-products-title">
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">CATÁLOGO</span>
                <h2 id="admin-products-title">Produtos ativos</h2>
              </div>
              <p>
                Preços e estoque recebidos da API. Itens inativos não fazem parte desta consulta.
              </p>
            </div>
            {loadError ? (
              <MessageState
                kind="error"
                title="Catálogo indisponível"
                href="/admin"
                action="Tentar novamente"
              >
                {loadError}
              </MessageState>
            ) : products === null || categories === null ? (
              <div className="loading-state" role="status">
                <span className="loading-spinner" aria-hidden="true" /> Carregando catálogo…
              </div>
            ) : (
              <>
                <div className="admin-filters">
                  <div className="form-field admin-search">
                    <label htmlFor="admin-product-search">Buscar produto ou ID</label>
                    <span>
                      <Search size={18} aria-hidden="true" />
                      <input
                        id="admin-product-search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Nome ou ID"
                      />
                    </span>
                  </div>
                  <div className="form-field">
                    <label htmlFor="admin-product-category">Categoria</label>
                    <select
                      id="admin-product-category"
                      value={categoryId}
                      onChange={(event) => setCategoryId(event.target.value)}
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {visibleProducts.length ? (
                  <div className="admin-table-wrap">
                    <table className="admin-product-table">
                      <thead>
                        <tr>
                          <th scope="col">Produto</th>
                          <th scope="col">Categoria</th>
                          <th scope="col">Preço</th>
                          <th scope="col">Estoque</th>
                          <th scope="col">Consulta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleProducts.map((product) => (
                          <tr key={product.id}>
                            <td data-label="Produto">
                              <strong>{product.nome}</strong>
                              <small>ID {product.id}</small>
                            </td>
                            <td data-label="Categoria">
                              {product.categoria?.nome ||
                                categories.find((category) => category.id === product.categoriaId)
                                  ?.nome ||
                                'Sem categoria'}
                            </td>
                            <td data-label="Preço">{currency(product.preco)}</td>
                            <td data-label="Estoque">
                              <span
                                className={
                                  product.estoque > 0 ? 'admin-stock' : 'admin-stock is-empty'
                                }
                              >
                                {product.estoque > 0 ? `${product.estoque} un.` : 'Esgotado'}
                              </span>
                            </td>
                            <td data-label="Consulta">
                              <Link
                                href={`/produtos/${product.id}`}
                                aria-label={`Ver ${product.nome} no catálogo`}
                              >
                                Ver produto <ArrowRight size={15} aria-hidden="true" />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <MessageState
                    title={products.length ? 'Nenhum produto encontrado' : 'Nenhum produto ativo'}
                    href="/admin#produtos"
                    action="Limpar visualização"
                  >
                    {products.length
                      ? 'Ajuste a busca ou a categoria para ver outros produtos.'
                      : 'Os itens ativos aparecerão aqui quando forem disponibilizados.'}
                  </MessageState>
                )}
              </>
            )}
          </section>

          <section id="categorias" className="admin-panel" aria-labelledby="admin-categories-title">
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">ORGANIZAÇÃO</span>
                <h2 id="admin-categories-title">Categorias</h2>
              </div>
              <p>Estrutura de categorias disponível para consulta.</p>
            </div>
            {loadError ? (
              <MessageState
                kind="error"
                title="Categorias indisponíveis"
                href="/admin"
                action="Tentar novamente"
              >
                {loadError}
              </MessageState>
            ) : categories === null ? (
              <div className="loading-state" role="status">
                <span className="loading-spinner" aria-hidden="true" /> Carregando categorias…
              </div>
            ) : categories.length ? (
              <div className="admin-category-list">
                {categories.map((category) => (
                  <div key={category.id}>
                    <span className="admin-category-icon">
                      <Layers3 size={19} aria-hidden="true" />
                    </span>
                    <strong>{category.nome}</strong>
                    <small>ID {category.id}</small>
                  </div>
                ))}
              </div>
            ) : (
              <MessageState
                title="Nenhuma categoria disponível"
                href="/admin"
                action="Atualizar página"
              >
                As categorias aparecerão aqui quando estiverem cadastradas.
              </MessageState>
            )}
          </section>

          <section id="pedidos" className="admin-panel" aria-labelledby="admin-orders-title">
            <AdminOrderStatus />
          </section>

          <section
            id="usuarios"
            className="admin-panel admin-limited"
            aria-labelledby="admin-users-title"
          >
            <div className="admin-section-heading">
              <div>
                <span className="eyebrow">ACESSOS</span>
                <h2 id="admin-users-title">Usuários</h2>
              </div>
            </div>
            <div className="admin-limited-body">
              <UsersRound size={24} aria-hidden="true" />
              <div>
                <h3>Consulta de usuários indisponível</h3>
                <p>
                  A API atual não fornece uma lista administrativa de usuários. O gerenciamento de
                  acessos depende de um contrato autorizado no servidor.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
