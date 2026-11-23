import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const product = '/produtos/refletor-led-rgb-piscina-125-mm';
const widths = [320, 375, 390, 768, 1024, 1440, 1920];
const institutionalRoutes = [
  '/quem-somos',
  '/contato',
  '/prazos-e-envios',
  '/pagamentos',
  '/garantia-trocas-e-devolucoes',
  '/politica-de-privacidade',
  '/termos-de-uso',
];

test('home, movimento, menus e redução de movimento', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/A luz muda\s*tudo/);
  await expect(page.locator('.v3-featured-grid article')).toHaveCount(6);
  await expect(page.locator('.v3-hero-media img')).toHaveJSProperty('complete', true);
  await page.mouse.move(850, 340);
  await expect
    .poll(() =>
      page.locator('.v3-hero').evaluate((element) => element.style.getPropertyValue('--pointer-x')),
    )
    .not.toBe('');
  await page.locator('.v3-menu summary').click();
  await expect(page.locator('.v3-menu')).toHaveAttribute('open', '');
  await page.keyboard.press('Escape');
  await expect(page.locator('.v3-menu summary')).toBeFocused();
  await expect(page.locator('.v3-menu')).not.toHaveAttribute('open', '');
  await page.locator('.v3-editorial').scrollIntoViewIfNeeded();
  await expect(page.locator('.v3-editorial')).toHaveAttribute('data-revealed', '');
  await expect(page.locator('.v3-header')).toHaveAttribute('data-scrolled', 'true');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Abrir menu' });
  await toggle.click();
  await expect(
    page
      .getByRole('navigation', { name: 'Navegação móvel' })
      .getByRole('link', { name: 'Piscinas' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() =>
      page
        .locator('.v3-hero-media')
        .evaluate((node) => parseFloat(getComputedStyle(node).animationDuration)),
    )
    .toBeLessThan(0.001);
});

test('catálogo, busca acessível, filtros e galeria', async ({ page }) => {
  await page.goto('/produtos');
  await expect(page.locator('.v3-product-card')).toHaveCount(12);
  await page
    .getByRole('navigation', { name: 'Categorias do catálogo' })
    .getByRole('link', { name: 'Piscinas' })
    .click();
  await expect(page.locator('.v3-product-card')).toHaveCount(2);
  await page.getByLabel('Ordenar').selectOption('price-asc');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('.v3-product-card').first()).toContainText('Refletor LED azul');
  await page.getByLabel('Até (R$)').fill('70');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('.v3-product-card')).toHaveCount(1);

  const search = page.getByRole('combobox', { name: 'Buscar produtos' });
  await search.fill('giroled ambar');
  const suggestions = page.getByRole('listbox', { name: 'Sugestões de produtos' });
  await expect(suggestions.getByRole('option')).toHaveCount(1);
  await expect(suggestions.getByRole('option', { name: 'Giroled automotivo âmbar' })).toBeVisible();
  await search.press('ArrowDown');
  await search.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Giroled automotivo âmbar');
  const zoom = page.getByRole('button', { name: /Ampliar imagem/ });
  await zoom.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(zoom).toBeFocused();

  await search.fill('busca que nao existe');
  await expect(
    page.getByRole('status').filter({ hasText: 'Nenhum produto encontrado.' }),
  ).toBeVisible();
  await search.press('Enter');
  await expect(page.getByText('Nenhum produto corresponde aos filtros.')).toBeVisible();
});

test('carrinho consistente e checkout sem operação comercial', async ({ page, request }) => {
  const apiCalls: string[] = [];
  page.on('request', (outgoing) => {
    if (new URL(outgoing.url()).pathname.startsWith('/api/')) apiCalls.push(outgoing.url());
  });
  await page.goto(product);
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click();
  const add = page.getByRole('button', { name: 'Adicionar ao carrinho' });
  await add.click();
  const cart = page.getByRole('link', { name: 'Carrinho com 2 itens' });
  await expect(cart).toBeVisible();
  await page.getByRole('button', { name: 'Desfazer' }).click();
  await expect(page.getByRole('link', { name: 'Carrinho', exact: true })).toBeVisible();
  await add.click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('magicled-demo-cart-v3') ?? '{}')[
            'refletor-led-rgb-piscina-125-mm'
          ],
      ),
    )
    .toBe(2);
  await page.reload();
  await cart.click();
  await expect(page.getByRole('heading', { name: '2 itens' })).toBeVisible();
  await page.getByRole('button', { name: 'Remover Refletor LED RGB para piscina' }).click();
  await expect(page.getByRole('heading', { name: 'Sua seleção está vazia' })).toBeVisible();
  await page.getByRole('button', { name: 'Desfazer' }).click();
  await page.getByRole('link', { name: 'Revisar carrinho' }).click();
  await expect(
    page.getByRole('heading', { name: 'Finalização comercial indisponível' }),
  ).toBeVisible();
  await expect(page.locator('main form, main input')).toHaveCount(0);
  expect(apiCalls).toEqual([]);
  const upstream = await request.get('/api/backend/products');
  expect(upstream.status()).toBe(503);
  const session = await request.post('/api/session/register');
  expect(session.status()).toBe(503);
});

test('pagamentos fictícios sem formulário de cartão e pedidos de exemplo', async ({ page }) => {
  await page.goto('/conta/formas-de-pagamento');
  const trigger = page.getByRole('button', { name: 'Adicionar cartão de teste' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Escolha um cartão de teste' });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('input')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Mastercard final 5555' }).click();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Definir como preferencial' }).click();
  await expect(
    page
      .getByRole('status')
      .filter({ hasText: 'Mastercard final 5555 definido como preferencial.' }),
  ).toBeVisible();

  const menu = page.getByRole('navigation', { name: 'Minha conta' });
  await menu.getByRole('link', { name: 'Pedidos' }).click();
  await page.getByRole('link', { name: /Pedido DEMO-102/ }).click();
  await expect(page.getByText(/Registro fictício/)).toBeVisible();
  await menu.getByRole('link', { name: 'Formas de pagamento' }).click();
  await expect(page.getByRole('button', { name: 'Remover Mastercard final 5555' })).toBeVisible();
  for (const card of ['Mastercard final 5555', 'Visa final 4242']) {
    await page.getByRole('button', { name: 'Remover ' + card }).click();
    await page
      .getByRole('dialog', { name: 'Remover cartão de teste?' })
      .getByRole('button', { name: 'Remover cartão' })
      .click();
  }
  await expect(page.getByRole('heading', { name: 'Nenhum cartão de teste' })).toBeVisible();
  expect(
    await page.evaluate(() => Object.keys(localStorage).filter((key) => !key.startsWith('__'))),
  ).toEqual(['magicled-demo-cart-v3']);
});

test('rotas institucionais, contato e navegação interna', async ({ page, baseURL, request }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('footer a')
    .evaluateAll((links: HTMLAnchorElement[]) => links.map((link) => link.getAttribute('href')));
  const routes = new Set([
    ...institutionalRoutes,
    ...hrefs.filter((href): href is string => Boolean(href?.startsWith('/'))),
  ]);
  for (const route of routes) {
    const response = await request.get(route.split('#')[0]);
    expect(response.status(), route).toBe(200);
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const fragment = new URL(route, baseURL).hash;
    if (fragment) await expect(page.locator(fragment)).toBeVisible();
    await expect(page.locator('a[href="#"], a[href*="www.magicled.com.br"]')).toHaveCount(0);
  }
  await page.goto('/contato');
  await expect(page.locator('a[href="mailto:ledshoppingdistribuidora@gmail.com"]')).toBeVisible();
  await expect(page.locator('main form')).toHaveCount(0);
  await page.goto('/prazos-e-envios');
  await expect(page.getByText(/prazos de postagem serão informados/)).toBeVisible();
  await page.goto('/institucional/privacidade');
  await expect(page).toHaveURL(/\/politica-de-privacidade$/);
});

test('larguras de 320 a 1920 px sem rolagem horizontal', async ({ page }) => {
  const routes = [
    '/',
    '/produtos',
    product,
    '/carrinho',
    '/checkout',
    '/conta/formas-de-pagamento',
    '/quem-somos',
    '/contato',
  ];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      const dimensions = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        window.innerWidth,
      ]);
      expect(dimensions[0], route + ' @ ' + width).toBeLessThanOrEqual(dimensions[1]);
    }
  }
});

test('verificações axe nas rotas V3', async ({ page }) => {
  for (const route of [
    '/',
    '/produtos',
    product,
    '/conta/formas-de-pagamento',
    '/contato',
    '/checkout',
  ]) {
    await page.goto(route);
    const scan = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.map((violation) => ({
        id: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
      route,
    ).toEqual([]);
  }
  await page.getByRole('combobox', { name: 'Buscar produtos' }).fill('piscina');
  await expect(page.getByRole('listbox', { name: 'Sugestões de produtos' })).toBeVisible();
  const searchScan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(searchScan.violations.map((violation) => violation.id)).toEqual([]);
});

test('conteúdo renderizado sem JavaScript e imagens editoriais locais', async ({
  browser,
  request,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('.v3-featured-grid article')).toHaveCount(6);
    await page.getByRole('link', { name: 'Explorar produtos' }).click();
    await expect(page.locator('.v3-product-card')).toHaveCount(12);
    for (const asset of [
      '/v3/piscina-ao-anoitecer-hd.webp',
      '/v3/jardim-ao-anoitecer-hd.webp',
      '/v3/jardim-luz-quente-hd.webp',
    ]) {
      const response = await request.get(asset);
      expect(response.ok()).toBeTruthy();
      expect(response.headers()['content-type']).toContain('image/webp');
      expect((await response.body()).byteLength).toBeLessThan(250 * 1024);
    }
  } finally {
    await context.close();
  }
});

test('capturas V3', async ({ page }) => {
  test.skip(process.env.V3_CAPTURE !== 'true', 'Capturas somente quando solicitadas.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const directory = resolve(process.env.V3_CAPTURE_DIR || 'artifacts/screenshots/v3');
  mkdirSync(directory, { recursive: true });
  const screens: Array<[string, string, number[]]> = [
    ['home', '/', widths],
    ['catalogo', '/produtos', [390, 1440]],
    ['produto', product, [390, 1440]],
    ['quem-somos', '/quem-somos', [390, 1440]],
    ['contato', '/contato', [390]],
    ['pagamentos-conta', '/conta/formas-de-pagamento', [390, 1440]],
  ];
  for (const [name, route, sizes] of screens) {
    for (const width of sizes) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await page.getByRole('heading', { level: 1 }).waitFor();
      await page.screenshot({
        path: resolve(directory, name + '-' + width + '.jpg'),
        fullPage: true,
        animations: 'disabled',
        quality: 85,
      });
    }
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(product);
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.getByRole('button', { name: 'Dispensar confirmação' }).click();
  for (const route of ['carrinho', 'checkout']) {
    await page.goto('/' + route);
    await expect(page.getByRole('heading', { name: '1 item' })).toBeVisible();
    await page.screenshot({
      path: resolve(directory, route + '-390.jpg'),
      fullPage: true,
      animations: 'disabled',
      quality: 85,
    });
  }
});
