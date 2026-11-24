'use client';

import { useEffect, useRef } from 'react';

export function MotionObserver() {
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-revealed', '');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );
    const observe = () => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')
        .forEach((element) => {
          if (element.getBoundingClientRect().top > window.innerHeight) observer.observe(element);
        });
    };
    observe();
    const mutations = new MutationObserver(observe);
    mutations.observe(document.getElementById('conteudo') ?? document.body, {
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);

  return null;
}

export function PointerSurface({
  children,
  className,
}: Readonly<{ children: React.ReactNode; className: string }>) {
  const surface = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = surface.current;
    if (!element) return;
    const pointer = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    let frame = 0;
    function reset() {
      cancelAnimationFrame(frame);
      element?.style.removeProperty('--pointer-x');
      element?.style.removeProperty('--pointer-y');
    }
    function move(event: PointerEvent) {
      if (!pointer.matches || event.pointerType !== 'mouse') return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bounds = element!.getBoundingClientRect();
        element!.style.setProperty(
          '--pointer-x',
          String((event.clientX - bounds.left) / bounds.width - 0.5),
        );
        element!.style.setProperty(
          '--pointer-y',
          String((event.clientY - bounds.top) / bounds.height - 0.5),
        );
      });
    }
    element.addEventListener('pointermove', move, { passive: true });
    element.addEventListener('pointerleave', reset);
    pointer.addEventListener('change', reset);
    return () => {
      reset();
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', reset);
      pointer.removeEventListener('change', reset);
    };
  }, []);

  return (
    <div className={className} ref={surface}>
      {children}
    </div>
  );
}
