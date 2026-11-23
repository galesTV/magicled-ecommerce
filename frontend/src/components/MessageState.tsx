import Link from 'next/link';
import { ArrowRight, CircleAlert, ShoppingBag } from 'lucide-react';

export function MessageState({
  title,
  children,
  href,
  action,
  kind = 'empty',
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
  action?: string;
  kind?: 'empty' | 'error';
}) {
  return (
    <div className="message-state v2-message-state" role={kind === 'error' ? 'alert' : 'status'}>
      <span className="message-icon" aria-hidden="true">
        {kind === 'error' ? (
          <CircleAlert size={25} strokeWidth={1.7} />
        ) : (
          <ShoppingBag size={25} strokeWidth={1.7} />
        )}
      </span>
      <h2>{title}</h2>
      <p>{children}</p>
      {href && (
        <Link className="button button-dark" href={href}>
          {action || 'Continuar'} <ArrowRight size={17} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
