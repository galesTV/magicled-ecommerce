'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { clientApi, sessionApi } from '@/lib/api';
import type { Cart, Category, User } from '@/lib/types';

export function StoreHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    clientApi<Category[]>('/categories')
      .then(setCategories)
      .catch(() => undefined);
    sessionApi<User>('me')
      .then(setUser)
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!user) return;
    const refreshCart = () => {
      clientApi<Cart>('/cart')
        .then((cart) =>
          setCartCount(cart.itens.reduce((total, item) => total + item.quantidade, 0)),
        )
        .catch(() => setCartCount(0));
    };
    refreshCart();
    window.addEventListener('magicled:cart-updated', refreshCart);
    return () => window.removeEventListener('magicled:cart-updated', refreshCart);
  }, [user]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header header-v2">
      <div className="shell header-v2-main">
        <Link
          href="/"
          className="header-v2-brand"
          aria-label="Magic LED, página inicial"
          onClick={closeMenu}
        >
          <Image src="/magicled-logo.png" alt="Magic LED" width={150} height={100} priority />
        </Link>
        <nav className="header-v2-nav" aria-label="Navegação principal">
          <Link href="/produtos">Produtos</Link>
          <Link href="/produtos?q=piscina">Piscinas</Link>
          <Link href="/produtos?q=jardim">Jardins</Link>
          <Link href="/institucional/quem-somos">A Magic LED</Link>
        </nav>
        <form className="header-v2-search" action="/produtos" role="search">
          <label className="sr-only" htmlFor="site-search">
            Buscar produtos
          </label>
          <Search size={18} aria-hidden="true" />
          <input id="site-search" name="q" placeholder="O que você procura?" />
          <button type="submit" aria-label="Buscar produtos">
            <ArrowUpRight size={17} />
          </button>
        </form>
        <div className="header-v2-actions">
          <Link
            href={user?.tipoUsuario === 'ADMIN' ? '/admin' : user ? '/conta' : '/login'}
            aria-label={user ? 'Minha conta' : 'Entrar'}
          >
            <UserRound size={21} strokeWidth={1.8} />
          </Link>
          <Link
            href="/carrinho"
            aria-label={cartCount ? `Carrinho com ${cartCount} itens` : 'Carrinho'}
            className="header-v2-cart"
          >
            <ShoppingBag size={21} strokeWidth={1.8} />
            {cartCount > 0 && <span className="header-v2-count">{cartCount}</span>}
          </Link>
          <button
            className="header-v2-menu-button"
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>
      <form className="shell header-v2-mobile-search" action="/produtos" role="search">
        <Search size={19} aria-hidden="true" />
        <label className="sr-only" htmlFor="mobile-search">
          Buscar produtos
        </label>
        <input id="mobile-search" name="q" placeholder="Buscar iluminação" />
        <button type="submit" aria-label="Buscar produtos">
          <ArrowUpRight size={18} />
        </button>
      </form>
      <div
        className={`header-v2-mobile ${menuOpen ? 'is-open' : ''}`}
        id="mobile-navigation"
        inert={!menuOpen}
      >
        <div className="shell header-v2-mobile-inner">
          <nav aria-label="Navegação mobile">
            <Link href="/produtos" onClick={closeMenu}>
              Todos os produtos <ArrowUpRight size={18} />
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/produtos?categoria=${category.id}`}
                onClick={closeMenu}
              >
                {category.nome} <ArrowUpRight size={18} />
              </Link>
            ))}
            {!categories.some((category) =>
              category.nome.toLocaleLowerCase('pt-BR').includes('piscina'),
            ) && (
              <Link href="/produtos?q=piscina" onClick={closeMenu}>
                Piscinas <ArrowUpRight size={18} />
              </Link>
            )}
            {!categories.some((category) =>
              category.nome.toLocaleLowerCase('pt-BR').includes('jardim'),
            ) && (
              <Link href="/produtos?q=jardim" onClick={closeMenu}>
                Jardins <ArrowUpRight size={18} />
              </Link>
            )}
            <Link href="/institucional/quem-somos" onClick={closeMenu}>
              A Magic LED <ArrowUpRight size={18} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
