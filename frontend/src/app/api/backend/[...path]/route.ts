import { legacyApiEnabled } from '@/lib/legacy-api-mode';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { testCheckoutEnabled } from '@/lib/test-checkout';
import { apiEnabled } from '@/lib/data-mode';
import { backendRequest } from '@/lib/server-api';
import { readSession, sessionCookie } from '@/lib/session-server';
import { permitsMutation } from '@/lib/request-origin';

type Context = { params: Promise<{ path: string[] }> };

function permitted(method: string, path: string, legacy: boolean): boolean {
  if (method === 'GET')
    return /^(products(?:\/\d+)?|categories(?:\/\d+)?|cart|addresses|orders(?:\/\d+)?)$/.test(path);
  if (method === 'POST')
    return path === 'cart/items' || path === 'addresses' || (legacy && path === 'orders/checkout');
  if (method === 'PATCH')
    return /^cart\/items\/\d+$/.test(path) || (legacy && /^orders\/\d+\/status$/.test(path));
  if (method === 'DELETE') return path === 'cart' || /^cart\/items\/\d+$/.test(path);
  return false;
}

async function proxy(request: NextRequest, context: Context) {
  const legacy = legacyApiEnabled();
  if (!apiEnabled && !legacy)
    return NextResponse.json({ message: 'Integração desativada nesta versão.' }, { status: 503 });
  const { path: parts } = await context.params;
  const path = parts.join('/');
  if (!permitted(request.method, path, legacy))
    return NextResponse.json({ message: 'Operação indisponível.' }, { status: 404 });
  if (request.method !== 'GET' && !permitsMutation(request, legacy))
    return NextResponse.json({ message: 'Origem não permitida.' }, { status: 403 });
  if (path === 'orders/checkout' && !testCheckoutEnabled()) {
    return NextResponse.json(
      {
        message:
          'Checkout indisponível até a validação do ambiente de testes e das regras comerciais.',
      },
      { status: 409 },
    );
  }
  if (request.method === 'PATCH' && /^orders\/\d+\/status$/.test(path)) {
    const payload = await request
      .clone()
      .json()
      .catch(() => null);
    if (payload?.status === 'PAGO') {
      return NextResponse.json(
        { message: 'Aprovação de pagamento exige confirmação confiável do provedor.' },
        { status: 409 },
      );
    }
  }
  const token = (await cookies()).get(sessionCookie)?.value;
  const isPublic =
    request.method === 'GET' && (path.startsWith('products') || path.startsWith('categories'));
  if (!isPublic && !token)
    return NextResponse.json({ message: 'Entre na sua conta para continuar.' }, { status: 401 });
  if (apiEnabled && !isPublic) {
    const session = await readSession(token);
    if (session.kind === 'expired') {
      const response = NextResponse.json({ message: 'Sessão expirada.' }, { status: 401 });
      response.cookies.delete(sessionCookie);
      return response;
    }
    if (session.kind !== 'authenticated')
      return NextResponse.json({ message: 'Não foi possível validar a sessão.' }, { status: 502 });
    if (session.user.tipoUsuario !== 'CLIENTE')
      return NextResponse.json({ message: 'Operação restrita a clientes.' }, { status: 403 });
  }
  try {
    const upstream = await backendRequest(`/${path}${request.nextUrl.search}`, {
      method: request.method,
      headers: {
        ...(!isPublic && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(request.method !== 'GET' ? { 'Content-Type': 'application/json' } : {}),
      },
      body: request.method === 'GET' ? undefined : await request.text(),
    });
    const response = new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
    if (!isPublic && upstream.status === 401) response.cookies.delete(sessionCookie);
    return response;
  } catch {
    return NextResponse.json({ message: 'Não foi possível conectar à API.' }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
