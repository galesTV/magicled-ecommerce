'use client';

import { useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';

export function ProductGallery({ name, image }: { name: string; image: string | null }) {
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  function open() {
    dialog.current?.showModal();
    setZoomed(true);
  }
  function close() {
    dialog.current?.close();
    setZoomed(false);
  }
  return (
    <div className="v2-gallery">
      <div className={`v2-gallery-stage${image ? ' has-image' : ''}`}>
        {image ? (
          <>
            <img src={image} alt={name} referrerPolicy="no-referrer" />
            <button
              type="button"
              className="v2-gallery-zoom"
              onClick={open}
              aria-label={`Ampliar imagem de ${name}`}
            >
              <Maximize2 size={18} aria-hidden="true" /> Ampliar imagem
            </button>
          </>
        ) : (
          <div className="v2-gallery-placeholder">
            <span className="v2-gallery-glow" aria-hidden="true" />
            <span className="v2-gallery-mark">
              MAGIC <em>LED</em>
            </span>
            <span className="v2-gallery-placeholder-caption">
              Fotografia do produto em atualização
            </span>
          </div>
        )}
      </div>
      {image && (
        <div className="v2-gallery-thumbs" aria-label="Imagens do produto">
          <span className="v2-gallery-thumb active">
            <img src={image} alt="" referrerPolicy="no-referrer" />
          </span>
          <span className="v2-gallery-count">01 / 01</span>
        </div>
      )}
      {image && (
        <dialog
          ref={dialog}
          className="v2-gallery-dialog"
          onClose={() => setZoomed(false)}
          aria-label={`Imagem ampliada de ${name}`}
        >
          <button type="button" onClick={close} aria-label="Fechar imagem ampliada">
            <X size={22} />
          </button>
          {zoomed && <img src={image} alt={name} referrerPolicy="no-referrer" />}
        </dialog>
      )}
    </div>
  );
}
