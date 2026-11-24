'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import type { CatalogImage } from '@/data/catalog/types';

export function CatalogMedia({
  image,
  decorative = false,
  sizes = '(max-width: 720px) 50vw, (max-width: 1536px) 23vw, 350px',
  onUnavailable,
}: {
  image?: CatalogImage;
  decorative?: boolean;
  sizes?: string;
  onUnavailable?: () => void;
}) {
  const [failedSource, setFailedSource] = useState<string>();
  if (!image || failedSource === image.src) {
    return (
      <span className="v3-media-fallback" aria-hidden="true">
        <Lightbulb size={40} strokeWidth={1.25} />
      </span>
    );
  }

  return (
    <Image
      className="v3-media-image"
      src={image.src}
      alt={decorative ? '' : image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      quality={85}
      unoptimized={image.src.startsWith('https://')}
      referrerPolicy="no-referrer"
      onError={() => {
        setFailedSource(image.src);
        onUnavailable?.();
      }}
    />
  );
}
