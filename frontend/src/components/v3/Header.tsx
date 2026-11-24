'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronDown, Menu, ShoppingBag, UserRound, X } from 'lucide-react';
import { useStoreCart } from './CartStore';
import { CatalogSearch } from './CatalogSearch';
import { categoryHref, environmentHref } from './navigation';
import type { CatalogCategory, CatalogProduct } from '@/data/catalog/types';

export function Header({
  categories: categoryLinks,
  products,
  unavailable,
}: {
  categories: readonly CatalogCategory[];
  products: readonly CatalogProduct[];
  unavailable?: boolean;
}) {
  const { count } = useStoreCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const header = useRef<HTMLElement>(null);
  const categories = useRef<HTMLDetailsElement>(null);
  const mobileToggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onOutside = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setMobileOpen(false);
      if (categories.current && !categories.current.contains(event.target as Node)) {
        categories.current.open = false;
      }
    };
    window.addEventListener('pointerdown', onOutside);
    return () => window.removeEventListener('pointerdown', onOutside);
  }, []);

  function closeNavigation() {
    if (categories.current) categories.current.open = false;
    setMobileOpen(false);
  }

  return (
    <header
      ref={header}
      className="v3-header"
      data-scrolled={scrolled}
      onBlur={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
          closeNavigation();
        }
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Escape') return;
        if (mobileOpen) {
          setMobileOpen(false);
          mobileToggle.current?.focus();
        } else if (categories.current?.open) {
          categories.current.open = false;
          categories.current.querySelector('summary')?.focus();
        }
      }}
    >
      <div className="v3-wrap v3-header-inner">
        <Link
          href="/"
          className="v3-logo"
          aria-label="Magic LED, página inicial"
          onClick={closeNavigation}
        >
          <Image
            src="/magicled-logo.png"
            alt="Magic LED"
            width={150}
            height={100}
            loading="eager"
          />
        </Link>
        <nav className="v3-main-nav" aria-label="Navegação principal">
          <details
            ref={categories}
            className="v3-menu"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                event.currentTarget.open = false;
            }}
          >
            <summary>
              Explore <ChevronDown size={14} aria-hidden="true" />
            </summary>
            <div className="v3-dropdown">
              <Link href="/produtos" onClick={closeNavigation}>
                Todos os produtos <ArrowUpRight size={17} />
              </Link>
              {categoryLinks.map((category) => (
                <Link
                  key={category.slug}
                  href={categoryHref(category.slug)}
                  onClick={closeNavigation}
                >
                  {category.name} <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </details>
          <Link href={environmentHref(categoryLinks, 'piscinas')} onClick={closeNavigation}>
            Piscinas
          </Link>
          <Link href={environmentHref(categoryLinks, 'jardins')} onClick={closeNavigation}>
            Jardins
          </Link>
          <Link href="/quem-somos" onClick={closeNavigation}>
            A Magic LED
          </Link>
        </nav>
        <CatalogSearch onNavigate={closeNavigation} products={products} unavailable={unavailable} />
        <div className="v3-header-actions">
          <Link href="/conta" aria-label="Minha conta" onClick={closeNavigation}>
            <UserRound size={22} aria-hidden="true" />
          </Link>
          <Link
            href="/carrinho"
            className="v3-bag"
            onClick={closeNavigation}
            aria-label={
              count > 0 ? 'Carrinho com ' + count + (count === 1 ? ' item' : ' itens') : 'Carrinho'
            }
          >
            <ShoppingBag size={22} aria-hidden="true" />
            {count > 0 && (
              <span className="v3-bag-count" key={count} aria-hidden="true">
                {count}
              </span>
            )}
          </Link>
          <button
            ref={mobileToggle}
            className="v3-mobile-toggle"
            type="button"
            aria-controls="mobile-navigation"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X size={24} aria-hidden="true" />
            ) : (
              <Menu size={24} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
      <div className="v3-mobile" id="mobile-navigation" data-open={mobileOpen} inert={!mobileOpen}>
        <div>
          <nav className="v3-wrap" aria-label="Navegação móvel">
            <Link href="/produtos" onClick={closeNavigation}>
              Todos os produtos <ArrowUpRight size={18} />
            </Link>
            {categoryLinks.map((category) => (
              <Link
                key={category.slug}
                href={categoryHref(category.slug)}
                onClick={closeNavigation}
              >
                {category.name} <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
            <Link href="/quem-somos" onClick={closeNavigation}>
              A Magic LED <ArrowUpRight size={18} />
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
