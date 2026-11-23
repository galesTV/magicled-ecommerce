import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Institutional } from '@/components/v3/Institutional';
import { findInstitutionalPage, institutionalPages } from '@/data/institutional';

type Props = { params: Promise<{ institutionalSlug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(institutionalPages).map((institutionalSlug) => ({ institutionalSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { institutionalSlug } = await params;
  const page = findInstitutionalPage(institutionalSlug);
  return page ? { title: page.title, description: page.intro } : {};
}

export default async function InstitutionalPage({ params }: Props) {
  const { institutionalSlug } = await params;
  const page = findInstitutionalPage(institutionalSlug);
  if (!page) notFound();
  return <Institutional slug={institutionalSlug} page={page} />;
}
