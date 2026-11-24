import type { NextRequest } from 'next/server';

export function permitsMutation(request: NextRequest, legacy: boolean) {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none') return false;
  if (!origin) return legacy;
  const host = request.headers.get('host');
  return Boolean(host && origin === request.nextUrl.protocol + '//' + host);
}
