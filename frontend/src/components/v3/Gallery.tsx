'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import type { CatalogImage } from '@/data/catalog/types';
import { CatalogMedia } from './CatalogMedia';

const illustrationCaptions = {
  restored: 'Imagem ilustrativa restaurada com IA.',
  generated: 'Imagem ilustrativa gerada com IA.',
};
const unavailableImageText = 'Imagem do produto indisponível';

export function Gallery({ images }: { images: readonly CatalogImage[] }) {
  const [active, setActive] = useState(0);
  const [unavailableSources, setUnavailableSources] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number>(0);

  const placeholder = (
    <div className="v3-gallery-empty">
      <CatalogMedia />
      <p>{unavailableImageText}</p>
    </div>
  );
  if (!images.length) return placeholder;

  const image = images[active];
  const unavailable = unavailableSources.includes(image.src);
  function markUnavailable() {
    setUnavailableSources((sources) =>
      sources.includes(image.src) ? sources : [...sources, image.src],
    );
  }

  function change(step: number) {
    setActive((index) => (index + step + images.length) % images.length);
  }

  function arrows() {
    return (
      images.length > 1 && (
        <div className="v3-gallery-actions">
          <button type="button" aria-label="Imagem anterior" onClick={() => change(-1)}>
            <ChevronLeft />
          </button>
          <span aria-live="polite">
            {active + 1} de {images.length}
          </span>
          <button type="button" aria-label="Próxima imagem" onClick={() => change(1)}>
            <ChevronRight />
          </button>
        </div>
      )
    );
  }

  return (
    <div
      className="v3-gallery"
      onKeyDown={(event) => {
        if (images.length > 1 && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault();
          change(event.key === 'ArrowLeft' ? -1 : 1);
        }
      }}
    >
      {unavailable ? (
        placeholder
      ) : (
        <button
          className="v3-gallery-preview"
          type="button"
          aria-label={'Ampliar imagem: ' + image.alt}
          aria-haspopup="dialog"
          onClick={() => dialog.current?.showModal()}
          onTouchStart={(event) => {
            touch.current = event.changedTouches[0].clientX;
          }}
          onTouchEnd={(event) => {
            const delta = event.changedTouches[0].clientX - touch.current;
            if (Math.abs(delta) <= 44 || images.length < 2) return;
            event.preventDefault();
            change(delta < 0 ? 1 : -1);
          }}
        >
          <span className="v3-gallery-photo" key={active}>
            <CatalogMedia
              image={image}
              sizes="(max-width: 480px) 90vw, 435px"
              decorative
              onUnavailable={markUnavailable}
            />
          </span>
          <span className="v3-gallery-zoom" aria-hidden="true">
            <ZoomIn size={20} />
          </span>
        </button>
      )}
      {!unavailable && image.aiTreatment && (
        <p className="v3-gallery-caption">{illustrationCaptions[image.aiTreatment]}</p>
      )}
      {images.length > 1 && (
        <div className="v3-gallery-thumbnails" aria-label="Miniaturas do produto">
          {images.map((thumbnail, index) => (
            <button
              type="button"
              key={index}
              aria-label={'Imagem ' + (index + 1)}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
            >
              <CatalogMedia image={thumbnail} sizes="56px" decorative />
            </button>
          ))}
        </div>
      )}
      {arrows()}
      <dialog
        ref={dialog}
        className="v3-dialog v3-zoom-dialog"
        aria-labelledby="zoom-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="v3-dialog-body">
          <h2 id="zoom-title">Imagem do produto</h2>
          <form method="dialog">
            <button className="v3-dialog-close" aria-label="Fechar imagem">
              <X />
            </button>
          </form>
          <div className="v3-zoom-photo">
            {unavailable ? (
              <p role="status">{unavailableImageText}</p>
            ) : (
              <CatalogMedia
                image={image}
                sizes="(max-width: 700px) 87vw, 620px"
                onUnavailable={markUnavailable}
              />
            )}
          </div>
          {arrows()}
        </div>
      </dialog>
    </div>
  );
}
