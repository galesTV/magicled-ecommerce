import { test, expect } from '@playwright/test';

async function overflowDetails(page: import('@playwright/test').Page) {
  return page.evaluate(() => ({
    width: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll<HTMLElement>('body *')]
      .filter((element) => element.getBoundingClientRect().right > window.innerWidth + 1)
      .sort((a, b) => b.getBoundingClientRect().right - a.getBoundingClientRect().right)
      .slice(0, 8)
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        text: element.textContent?.trim().slice(0, 40),
        left: Math.round(element.getBoundingClientRect().left),
        right: Math.round(element.getBoundingClientRect().right),
      })),
  }));
}

test.beforeEach(async ({ request }) => {
  await request.get(`http://127.0.0.1:${process.env.E2E_API_PORT || '3100'}/__reset`);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`home e catálogo sem overflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'A luz certa muda tudo.' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Explorar jardins no catálogo' })).toBeVisible();
    await expect(page.getByText('Luminária LED para piscina 9 W')).toBeVisible();
    const homeOverflow = await overflowDetails(page);
    expect(homeOverflow.scrollWidth, JSON.stringify(homeOverflow)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `artifacts/screenshots/home-${width}.png`, fullPage: true });
    await page.goto('/produtos');
    await expect(page.getByRole('heading', { name: 'Encontre a luz certa.' })).toBeVisible();
    const catalogOverflow = await overflowDetails(page);
    expect(catalogOverflow.scrollWidth, JSON.stringify(catalogOverflow)).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `artifacts/screenshots/catalogo-${width}.png`, fullPage: true });
  });
}

test('busca, filtros e produto indisponível', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/produtos');
  await page.getByText('Filtrar e ordenar').click();
  await page.getByLabel('Buscar neste catálogo').fill('9 W');
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page.getByText('1 produto', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Ver Luminária LED para piscina 9 W' }).click();
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeEnabled();
  await page.screenshot({ path: 'artifacts/screenshots/produto-375.png', fullPage: true });
  await page.goto('/produtos/1');
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
});

test('login, carrinho, endereço e histórico', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/login');
  await page.screenshot({ path: 'artifacts/screenshots/login-375.png', fullPage: true });
  await page.getByLabel('E-mail').fill('cliente@teste.invalid');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(/\/conta$/);
  await expect(page.getByText('Cliente de teste')).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/conta-375.png', fullPage: true });
  expect(
    (await page.context().cookies()).find((cookie) => cookie.name === 'magicled_session')?.httpOnly,
  ).toBeTruthy();
  await page.goto('/produtos/2');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByText('Produto adicionado ao carrinho.')).toBeVisible();
  await page.goto('/carrinho');
  await expect(page.getByText('R$ 77,50').first()).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/carrinho-375.png', fullPage: true });
  await page.getByLabel('Quantidade').selectOption('2');
  await expect(page.getByText('R$ 155,00').first()).toBeVisible();
  await page.goto('/conta/enderecos');
  await page.getByLabel('CEP').fill('01001-000');
  await page.getByLabel('Logradouro').fill('Rua de teste');
  await page.getByLabel('Número').fill('10');
  await page.getByLabel('Bairro').fill('Centro');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByLabel('UF').fill('SP');
  await page.getByRole('button', { name: 'Salvar endereço' }).click();
  await expect(page.getByText('Endereço salvo.')).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/enderecos-375.png', fullPage: true });
  await page.goto('/checkout');
  await expect(
    page.getByText(
      process.env.E2E_ENABLE_TEST_CHECKOUT === 'true'
        ? 'Ambiente de desenvolvimento'
        : 'Checkout em validação',
    ),
  ).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/checkout-375.png', fullPage: true });
  await page.goto('/conta/pedidos');
  await expect(page.getByText('Nenhum pedido por enquanto')).toBeVisible();
});

test('administração exige papel e rota administrativa é protegida', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('cliente@teste.invalid');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(/\/conta$/);
  await page.goto('/admin');
  await expect(page.getByText('Acesso negado')).toBeVisible();
  const response = await page.request.patch('/api/backend/orders/1/status', {
    data: { status: 'EM_TRANSPORTE' },
  });
  expect(response.status()).toBe(403);
});

test('cadastro, logout e acesso administrativo autenticado', async ({ page }) => {
  await page.goto('/cadastro');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByText('Informe seu nome.')).toBeVisible();
  await page.getByLabel('Nome completo').fill('Pessoa de teste');
  await page.getByLabel('E-mail').fill('cliente@teste.invalid');
  await page.getByLabel('CPF').fill('12345678900');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page).toHaveURL(/\/conta$/);
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(`http://127.0.0.1:${process.env.E2E_WEB_PORT || '3001'}/`);
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@teste.invalid');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Atualizar status de pedido' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/admin-1440.png', fullPage: true });
  await page.getByLabel('ID do pedido').fill('42');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Atualizar pedido' }).click();
  await expect(page.getByText('Pedido #42 atualizado')).toBeVisible();
  const paidResponse = await page.request.patch('/api/backend/orders/42/status', {
    data: { status: 'PAGO' },
  });
  expect(paidResponse.status()).toBe(409);
});

test('rotas inexistentes e simulações bloqueadas', async ({ page }) => {
  await page.goto('/pagina-que-nao-existe');
  await expect(page.getByText('Página não encontrada')).toBeVisible();
  const response = await page.request.post('/api/backend/payments/webhook/simulate-approval/1');
  expect(response.status()).toBe(404);
});

test('pedido de teste registra status pendente sem processar pagamento', async ({ page }) => {
  test.skip(
    process.env.E2E_ENABLE_TEST_CHECKOUT !== 'true',
    'Executar somente com E2E_ENABLE_TEST_CHECKOUT=true.',
  );
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('cliente@teste.invalid');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(/\/conta$/);
  await page.goto('/produtos/2');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await expect(page.getByText('Produto adicionado ao carrinho.')).toBeVisible();
  await page.goto('/conta/enderecos');
  await page.getByLabel('CEP').fill('01001-000');
  await page.getByLabel('Logradouro').fill('Rua de teste');
  await page.getByLabel('Número').fill('10');
  await page.getByLabel('Bairro').fill('Centro');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByLabel('UF').fill('SP');
  await page.getByRole('button', { name: 'Salvar endereço' }).click();
  await expect(page.getByText('Endereço salvo.')).toBeVisible();
  await page.goto('/checkout');
  await expect(page.getByText('Ambiente de desenvolvimento')).toBeVisible();
  await page.screenshot({ path: 'artifacts/screenshots/checkout-teste-375.png', fullPage: true });
  await page.getByRole('button', { name: 'Criar pedido de teste' }).click();
  await expect(page.getByText('Pedido #1 criado')).toBeVisible();
  await expect(page.getByText('Aguardando pagamento')).toBeVisible();
  await page.goto('/conta/pedidos/1');
  await expect(page.getByText('Pedido #1')).toBeVisible();
});
