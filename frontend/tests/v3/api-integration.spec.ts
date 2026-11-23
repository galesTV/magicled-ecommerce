import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const fixture = 'http://127.0.0.1:3314';
const clientEmail = 'cliente@teste.invalid';
const product = 'Luminária LED para piscina 9 W';

async function login(page: Page, email = clientEmail) {
  await page.getByLabel('E-mail', { exact: true }).fill(email);
  await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

test.beforeEach(async ({ request }) => {
  expect((await request.get(fixture + '/__reset')).ok()).toBeTruthy();
});

test('catálogo HTTP, busca, filtros, disponibilidade e falha sem demonstração', async ({
  page,
  request,
}) => {
  await page.goto('/produtos?categoria=1&ordem=price-asc');
  const cards = page.locator('.v3-product-card');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText('59,90');
  await expect(cards.last()).toContainText('77,50');
  const search = page.getByRole('combobox', { name: 'Buscar produtos' });
  await search.fill('luminaria');
  await expect(page.getByRole('option', { name: product })).toBeVisible();
  await page.getByRole('option', { name: product }).click();
  await expect(page).toHaveURL(/\/produtos\/2$/);
  await expect(page.getByText('Em estoque', { exact: true })).toBeVisible();
  await expect(page.getByText('Potência: 9 W | Alimentação: 12 V')).toBeVisible();
  await page.goto('/produtos/1');
  await expect(page.getByText('Sem estoque', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Entrar para adicionar' })).toHaveCount(0);
  await page.goto('/produtos?q=sem-correspondencia');
  await expect(page.getByText('Nenhum produto corresponde aos filtros.')).toBeVisible();
  await request.get(fixture + '/__catalog-failure');
  await page.goto('/produtos');
  await expect(
    page.getByRole('heading', { name: 'Catálogo temporariamente indisponível.' }),
  ).toBeVisible();
  await expect(cards).toHaveCount(0);
});

test('cadastro, cookie HttpOnly, logout e sessão expirada', async ({ page, request, baseURL }) => {
  await page.goto('/conta');
  await expect(page).toHaveURL(/\/login\?/);
  await page.getByRole('link', { name: 'Criar uma conta' }).click();
  await page.getByLabel('Nome completo').fill('Cliente de teste');
  await page.getByLabel('E-mail', { exact: true }).fill(clientEmail);
  await page.getByLabel('Senha', { exact: true }).fill('senha-de-teste');
  await page.getByLabel('CPF').fill('00000000000');
  const responsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/session/register'),
  );
  await page.getByRole('button', { name: 'Criar conta' }).click();
  const registered = await responsePromise;
  expect(registered.ok()).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Olá, Cliente de teste.' })).toBeVisible();
  expect(
    (await page.context().cookies()).find((cookie) => cookie.name === 'magicled_session'),
  ).toMatchObject({
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
  });
  expect(await page.evaluate(() => document.cookie)).not.toContain('magicled_session');
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('fixture-client');
  const csrf = await request.post('/api/session/login', {
    headers: { Origin: 'https://externo.invalid' },
    data: { email: clientEmail, senha: 'senha-de-teste' },
  });
  expect(csrf.status()).toBe(403);
  const sessionResponse = await request.post('/api/session/login', {
    headers: { Origin: baseURL! },
    data: { email: clientEmail, senha: 'senha-de-teste' },
  });
  expect(sessionResponse.ok()).toBeTruthy();
  expect(await sessionResponse.json()).not.toHaveProperty('data.accessToken');
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (await page.context().cookies()).some((cookie) => cookie.name === 'magicled_session'),
  ).toBe(false);
  await page.getByLabel('E-mail').fill(clientEmail);
  await page.getByLabel('Senha').fill('senha-invalida');
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page.locator('main').getByRole('alert')).toContainText('Credenciais inválidas.');
  await login(page);
  await expect(page).toHaveURL(/\/conta$/);
  await page.context().addCookies([
    {
      url: baseURL!,
      name: 'magicled_session',
      value: 'fixture-invalid',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ]);
  await page.goto('/conta/pedidos/17');
  await expect(page).toHaveURL(/\/login\?.*sessao=expirada/);
  expect(new URL(page.url()).searchParams.get('next')).toBe('/conta/pedidos/17');
  await expect(page.getByText('Sua sessão expirou. Entre novamente para continuar.')).toBeVisible();
});

test('foto externa indisponível tem alternativa e desativa a ampliação', async ({
  page,
  request,
}) => {
  await page.route('https://gallery-fixture.magicled.invalid/**', (route) => route.abort());
  expect((await request.get(fixture + '/__gallery-image')).ok()).toBeTruthy();
  await page.goto('/produtos/2');
  await expect(
    page.locator('.v3-gallery-empty').getByText('Imagem do produto indisponível', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /Ampliar imagem/ })).toHaveCount(0);
});

test('carregamento da ficha usa V3 e o cabeçalho é único', async ({ page, request }) => {
  expect((await request.get(fixture + '/__slow-product')).ok()).toBeTruthy();
  await page.goto('/produtos/2', { waitUntil: 'commit' });
  await expect(page.getByText('Carregando produto…', { exact: true })).toBeVisible();
  await expect(page.locator('.v3-header')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: product, level: 1 })).toBeVisible();
});

test('carrinho do cliente e revisão sem pedido ou cobrança', async ({ page, request, baseURL }) => {
  await page.goto('/produtos/2');
  await page.getByRole('link', { name: 'Entrar para adicionar' }).click();
  await login(page);
  await expect(page).toHaveURL(/\/produtos\/2$/);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('link', { name: 'Carrinho com 1 item' }).click();
  const item = page.locator('.v3-cart-item');
  await expect(item).toContainText(product);
  await item.getByRole('button', { name: 'Aumentar quantidade' }).click();
  await expect(page.locator('.v3-cart-summary')).toContainText('155,00');
  await page.reload();
  await expect(page.locator('.v3-cart-summary')).toContainText('155,00');
  await page.getByRole('link', { name: 'Revisar carrinho' }).click();
  await expect(page.getByText('Finalização comercial indisponível')).toBeVisible();
  await expect(page.locator('.v3-cart-summary')).toContainText('Subtotal dos produtos');
  for (const path of ['/orders/checkout', '/payments/process', '/shipping/calculate']) {
    expect(
      (
        await request.post('/api/backend' + path, { headers: { Origin: baseURL! }, data: {} })
      ).status(),
    ).toBe(404);
  }
  await page.getByRole('link', { name: 'Voltar ao carrinho' }).click();
  await item.getByRole('button', { name: 'Remover ' + product }).click();
  await expect(page.getByText('Sua seleção está vazia')).toBeVisible();
});

test('endereços persistidos na fixture e histórico associado à sessão', async ({ page }) => {
  await page.goto('/conta/enderecos');
  await login(page);
  await expect(page).toHaveURL(/\/conta\/enderecos$/);
  await expect(page.getByText('Nenhum endereço cadastrado.')).toBeVisible();
  for (const [label, value] of [
    ['CEP', '01001-000'],
    ['Logradouro', 'Rua de Teste'],
    ['Número', '15'],
    ['Bairro', 'Centro'],
    ['Cidade', 'São Paulo'],
    ['UF', 'sp'],
  ]) {
    await page.getByLabel(label, { exact: true }).fill(value);
  }
  await page.getByRole('button', { name: 'Salvar endereço' }).click();
  await expect(page.getByText('Endereço cadastrado.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Rua de Teste, 15' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Minha conta' })
    .getByRole('link', { name: 'Pedidos' })
    .click();
  await expect(page.getByRole('link', { name: /Pedido 18/ })).toHaveCount(0);
  await page.getByRole('link', { name: /Pedido 17/ }).click();
  await expect(page.getByText('Rastreio: FIXTURE-17')).toBeVisible();
  await expect(page.getByText('Status de pagamento registrado: Aprovado')).toBeVisible();
  await page.goto('/conta/pedidos/18');
  await expect(page.getByRole('heading', { name: 'Página indisponível.' })).toBeVisible();
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Página indisponível.' })).toBeVisible();
});

test('admin autorizado lê catálogo e as mutações ficam bloqueadas', async ({ page, baseURL }) => {
  await page.goto('/admin');
  await login(page, 'admin@teste.invalid');
  await expect(page.getByRole('heading', { name: 'Administração' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Produtos ativos' })).toBeVisible();
  await expect(page.getByText(product, { exact: true }).first()).toBeVisible();
  const patch = await page.request.patch('/api/backend/orders/17/status', {
    headers: { Origin: baseURL! },
    data: { status: 'EM_TRANSPORTE' },
  });
  expect(patch.status()).toBe(404);
  expect((await page.request.get('/api/backend/orders')).status()).toBe(403);
});

test('páginas integradas no celular, sem rolagem lateral e com verificações Axe', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/produtos', '/produtos/2', '/login', '/cadastro']) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      390,
    );
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      violations.map(({ id }) => id),
      path,
    ).toEqual([]);
  }
});
