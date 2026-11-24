import Link from 'next/link';

export function Unavailable({
  title,
  description,
  demoLink = false,
}: {
  title: string;
  description: string;
  demoLink?: boolean;
}) {
  return (
    <div className="v3-wrap v3-page">
      <header className="v3-page-head">
        <p className="v3-eyebrow">Magic LED</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>
      <Link className="v3-button v3-button-dark" href={demoLink ? '/conta' : '/contato'}>
        {demoLink ? 'Explorar conta demonstrativa' : 'Falar com a Magic LED'}
      </Link>
    </div>
  );
}
