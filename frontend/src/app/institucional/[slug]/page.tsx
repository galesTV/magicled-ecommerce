import { notFound, permanentRedirect } from 'next/navigation';
import { institutionalRedirect } from '@/data/institutional';

export default async function LegacyInstitutionalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = institutionalRedirect(slug);
  if (!target) notFound();
  permanentRedirect(target);
}
