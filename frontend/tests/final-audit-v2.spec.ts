import { mkdir, writeFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

const fixture = `http://127.0.0.1:${process.env.E2E_API_PORT || '3100'}`;
const output = 'artifacts/screenshots/v2-final';
const widths = [320, 375, 768, 1024, 1440, 1920];
const publicRoutes = [
  ['home', '/'],
  ['catalogo', '/produtos'],
  ['categoria', '/produtos?categoria=1'],
  ['busca', '/produtos?q=piscina'],
  ['produto', '/produtos/2'],
  ['login', '/login'],
  ['cadastro', '/cadastro'],
  ['recuperar-senha', '/recuperar-senha'],
  ['quem-somos', '/institucional/quem-somos'],
  ['contato', '/institucional/contato'],
  ['privacidade', '/institucional/privacidade'],
  ['garantia', '/institucional/garantia'],
  ['trocas', '/institucional/trocas-e-devolucoes'],
  ['pagamentos', '/institucional/pagamentos'],
  ['prazos', '/institucional/prazos-e-envios'],
  ['termos', '/institucional/termos'],
  ['404', '/pagina-inexistente-v2'],
] as const;

async function inspect(page: Page, name: string, width: number, capture = false) {
  await page
    .locator('.v2-catalog-loading, .v2-product-loading')
    .first()
    .waitFor({ state: 'hidden' });
  await page.locator('main .loading-state').first().waitFor({ state: 'hidden' });
  await expect(page.locator('main')).toBeVisible();
  const details = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    broken: [...document.querySelectorAll('img')]
      .filter((image) => image.complete && image.naturalWidth === 0)
      .map((image) => image.getAttribute('src')),
  }));
  expect(details.scrollWidth, `${name} em ${width}px`).toBeLessThanOrEqual(width);
  expect(details.broken, `${name} em ${width}px`).toEqual([]);
  if (capture) await page.screenshot({ path: `${output}/${name}-${width}.png`, fullPage: true });
}

test('navegação entre buscas atualiza o catálogo sem recarregar a página', async ({ page }) => {
  await page.goto('/produtos');
  await expect(page.getByText('2 produtos', { exact: true })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('link', { name: 'Jardins' })
    .click();
  await expect(page).toHaveURL(/q=jardim/);
  await expect(page.getByText('Nenhum produto encontrado')).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navegação principal' })
    .getByRole('link', { name: 'Piscinas' })
    .click();
  await expect(page).toHaveURL(/q=piscina/);
  await expect(page.getByText('2 produtos', { exact: true })).toBeVisible();
});

test('métricas locais de carregamento ficam registradas', async ({ page }) => {
  await page.addInitScript(() => {
    const metrics = { lcpMs: 0, cls: 0 };
    (window as typeof window & { __magicledMetrics: typeof metrics }).__magicledMetrics = metrics;
    if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) metrics.lcpMs = Math.round(last.startTime);
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    }
    if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const shift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
          if (!shift.hadRecentInput) metrics.cls += shift.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    }
  });
  const samples = [];
  for (const [name, route] of [
    ['home', '/'],
    ['catalogo', '/produtos'],
    ['produto', '/produtos/2'],
  ] as const) {
    await page.goto(route);
    await inspect(page, name, 1280);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    await page.waitForTimeout(200);
    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const paint = (
        window as typeof window & { __magicledMetrics: { lcpMs: number; cls: number } }
      ).__magicledMetrics;
      const brandFonts = [...document.fonts].filter(
        (font) => font.family === 'Inter' || font.family === 'Manrope',
      );
      return {
        responseEndMs: Math.round(nav.responseEnd),
        domContentLoadedMs: Math.round(nav.domContentLoadedEventEnd),
        loadEventMs: Math.round(nav.loadEventEnd),
        lcpMs: paint.lcpMs,
        cls: Number(paint.cls.toFixed(4)),
        fontFaceCount: brandFonts.length,
        fontsLoaded:
          brandFonts.length > 0 &&
          document.fonts.check('400 16px Inter') &&
          document.fonts.check('700 24px Manrope'),
        resourceCount: resources.length,
        transferredKB: Math.round(
          resources.reduce((sum, item) => sum + item.transferSize, 0) / 1024,
        ),
      };
    });
    samples.push({ page: name, ...metrics });
  }
  await writeFile('artifacts/performance-v2-final.json', JSON.stringify(samples, null, 2));
});

test('falha de sessão oferece nova tentativa', async ({ page }) => {
  await page.route('**/api/session/me', (route) =>
    route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: '{"message":"Serviço indisponível"}',
    }),
  );
  await page.goto('/conta');
  await expect(page.getByText('Não foi possível validar a sessão')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Tentar novamente' })).toHaveAttribute(
    'href',
    '/conta',
  );
});

test('prévia visual usa imagens otimizadas e navegação mobile funcional', async ({
  page,
  request,
}) => {
  for (const image of [
    'piscinas',
    'jardim-piscina',
    'jardim-infantil-piscina',
    'infantil-sinalizacao-piscina',
  ]) {
    const response = await request.get(`/exemplares/${image}.webp`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/webp');
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Navegação mobile' })
    .getByRole('link', { name: /Todos os produtos/ })
    .click();
  await expect(page).toHaveURL(/\/produtos$/);
  await expect(page.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
});

test('mutações de outra origem são bloqueadas no BFF', async ({ request }) => {
  const response = await request.post('/api/backend/cart/items', {
    headers: { Origin: 'https://origem-invalida.invalid' },
    data: { produtoId: 2, quantidade: 1 },
  });
  expect(response.status()).toBe(403);
  if (process.env.E2E_ENABLE_TEST_CHECKOUT !== 'true') {
    const checkout = await request.post('/api/backend/orders/checkout', {
      data: { enderecoId: 1, metodoPagamento: 'PIX' },
    });
    expect(checkout.status()).toBe(409);
  }
});

test.beforeEach(async ({ request }) => {
  await request.get(`${fixture}/__reset`);
  await mkdir(output, { recursive: true });
});

for (const width of widths) {
  test(`auditoria de rotas e responsividade em ${width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    await page.setViewportSize({ width, height: 900 });
    const captureAll = width === 375 || width === 1440;
    const captureKey = [320, 768, 1024, 1920].includes(width);
    for (const [name, route] of publicRoutes) {
      await page.goto(route);
      await inspect(
        page,
        name,
        width,
        captureAll ||
          (captureKey && ['home', 'catalogo', 'produto', 'login', '404'].includes(name)),
      );
      if (name === 'catalogo' && width <= 375) {
        const categoriesFit = await page
          .locator('.catalog-category-nav button')
          .evaluateAll((buttons) =>
            buttons.every((button) => button.getBoundingClientRect().right <= innerWidth),
          );
        expect(categoriesFit, `Categorias visíveis em ${width}px`).toBeTruthy();
      }
      if (name === 'catalogo' && width === 375) {
        const sameLine = await page
          .locator('.catalog-results .product-card h3 a')
          .first()
          .evaluate((element) => {
            const node = element.firstChild;
            if (!node?.textContent) return false;
            const value = node.textContent;
            const number = value.lastIndexOf('9');
            const unit = value.lastIndexOf('W');
            const range = document.createRange();
            range.setStart(node, number);
            range.setEnd(node, number + 1);
            const numberTop = range.getBoundingClientRect().top;
            range.setStart(node, unit);
            range.setEnd(node, unit + 1);
            return Math.abs(numberTop - range.getBoundingClientRect().top) < 2;
          });
        expect(sameLine, 'A unidade W não deve ficar sozinha em uma linha').toBeTruthy();
      }
    }

    const login = await page.request.post('/api/session/login', {
      data: { email: 'cliente@teste.invalid', senha: 'senha123' },
    });
    expect(login.ok()).toBeTruthy();
    await page.request.post('/api/backend/cart/items', { data: { produtoId: 2, quantidade: 1 } });
    for (const [name, route] of [
      ['conta', '/conta'],
      ['enderecos-vazio', '/conta/enderecos'],
      ['pedidos-vazio', '/conta/pedidos'],
      ['carrinho', '/carrinho'],
      ['checkout', '/checkout'],
    ] as const) {
      await page.goto(route);
      await inspect(page, name, width, captureAll || captureKey);
      if (name === 'checkout') {
        await expect(page.getByText('1 item', { exact: true })).toBeVisible();
        const progressFits = await page
          .locator('.checkout-progress li')
          .evaluateAll((steps) => steps.every((step) => step.scrollWidth <= step.clientWidth + 1));
        expect(progressFits, `Etapas do checkout em ${width}px`).toBeTruthy();
      }
    }
    const address = await page.request.post('/api/backend/addresses', {
      data: {
        cep: '01001000',
        logradouro: 'Rua de teste',
        numero: '10',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
      },
    });
    expect(address.ok()).toBeTruthy();
    await page.goto('/conta/enderecos');
    await inspect(page, 'enderecos', width, captureAll);
    const order = await page.request.post(`${fixture}/orders/checkout`, {
      headers: { Authorization: 'Bearer fixture-client' },
      data: { enderecoId: 1, metodoPagamento: 'PIX' },
    });
    expect(order.ok()).toBeTruthy();
    for (const [name, route] of [
      ['pedidos', '/conta/pedidos'],
      ['pedido', '/conta/pedidos/1'],
    ] as const) {
      await page.goto(route);
      await inspect(page, name, width, captureAll || captureKey);
    }
    await page.request.post('/api/session/logout');
    const adminLogin = await page.request.post('/api/session/login', {
      data: { email: 'admin@teste.invalid', senha: 'senha123' },
    });
    expect(adminLogin.ok()).toBeTruthy();
    await page.goto('/admin');
    await inspect(page, 'admin', width, captureAll || captureKey);
  });
}
