export interface CatalogCategory {
  slug: string;
  name: string;
}

export interface CatalogImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  aiTreatment?: 'restored' | 'generated';
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  category: CatalogCategory['slug'];
  categoryLabel?: string;
  stock?: number;
  referencePriceCents: number;
  description: string;
  specifications: ReadonlyArray<readonly [label: string, value: string]>;
  images: readonly CatalogImage[];
  source?: { storefrontUrl: string; listingUrl?: string; checkedOn: string };
  dataAvailability: 'storefront-verified' | 'listing-verified' | 'backend';
  backendId?: number;
}

export interface CatalogFilters {
  query?: string;
  category?: string;
  minimum?: number;
  maximum?: number;
  sort?: 'price-asc' | 'price-desc';
}
