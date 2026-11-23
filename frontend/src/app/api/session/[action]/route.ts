import { legacyApiEnabled } from '@/lib/legacy-api-mode';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { decodeApi } from '@/lib/api';
import { apiEnabled } from '@/lib/data-mode';
import { backendRequest } from '@/lib/server-api';
import { readSession, sessionCookie, sessionUser } from '@/lib/session-server';
import { permitsMutation } from '@/lib/request-origin';
import type { AuthResponse } from '@/lib/types';

const noStore = { 'Cache-Control': 'no-store' };

export async function POST(request: NextRequest, context: { params: Promise<{ action: string }> }) {
  const legacy = legacyApiEnabled();
  if (!apiEnabled && !legacy)
    return NextResponse.json({ message: 'Integração desativada nesta versão.' }, { status: 503 });
  const { action } = await context.params;
  if (!permitsMutation(request, legacy))
    return NextResponse.json({ message: 'Origem não permitida.' }, { status: 403 });
  if (action === 'logout') {
    const response = NextResponse.json({ success: true, data: null }, { headers: noStore });
    response.cookies.delete(sessionCookie);
    return response;
  }
  if (action !== 'login' && action !== 'register')
    return NextResponse.json({ message: 'Rota inexistente.' }, { status: 404 });
  try {
    const body = await request.text();
    const upstream = await backendRequest(`/auth/${action}`, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    if (!upstream.ok)
      return new NextResponse(await upstream.text(), {
        status: upstream.status,
        headers: { 'Content-Type': 'application/json', ...noStore },
      });
    const result = await decodeApi<AuthResponse>(upstream);
    const user = sessionUser(result?.usuario);
    if (!user || typeof result.accessToken !== 'string' || !result.accessToken)
      return NextResponse.json({ message: 'Resposta de autenticação inválida.' }, { status: 502 });
    const response = NextResponse.json({ success: true, data: user }, { headers: noStore });
    response.cookies.set(sessionCookie, result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch {
    return NextResponse.json({ message: 'Não foi possível conectar à API.' }, { status: 502 });
  }
}

export async function GET(_request: NextRequest, context: { params: Promise<{ action: string }> }) {
  if (!apiEnabled && !legacyApiEnabled())
    return NextResponse.json({ message: 'Integração desativada nesta versão.' }, { status: 503 });
  const { action } = await context.params;
  if (action !== 'me') return NextResponse.json({ message: 'Rota inexistente.' }, { status: 404 });
  const session = await readSession((await cookies()).get(sessionCookie)?.value);
  if (session.kind === 'unavailable') {
    return NextResponse.json(
      { message: 'Não foi possível validar a sessão.' },
      {
        status: 502,
        headers: noStore,
      },
    );
  }
  if (session.kind === 'authenticated')
    return NextResponse.json({ success: true, data: session.user }, { headers: noStore });
  const response = NextResponse.json(
    {
      message: session.kind === 'expired' ? 'Sessão expirada.' : 'Sessão não encontrada.',
    },
    { status: 401, headers: noStore },
  );
  if (session.kind === 'expired') response.cookies.delete(sessionCookie);
  return response;
}
