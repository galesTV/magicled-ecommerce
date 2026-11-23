import { mkdir } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const api = `http://127.0.0.1:${process.env.E2E_API_PORT || '3100'}`;
const output = 'artifacts/screenshots/v2-stage4';

async function login(page: Page, email: string) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(email);
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(email.startsWith('admin') ? /\/admin$/ : /\/conta$/);
}

async function noOverflow(page: Page, width: number) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `${page.url()} em ${width}px`).toBeLessThanOrEqual(width);
}

test.beforeEach(async ({ request }) => {
  await request.get(`${api}/__reset`);
  await mkdir(output, { recursive: true });
});

test('administração exige papel e mutações inseguras seguem bloqueadas', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByText('Sua sessão terminou')).toBeVisible();
  await login(page, 'cliente@teste.invalid');
  await page.goto('/admin');
  await expect(page.getByText('Acesso negado')).toBeVisible();
  expect((await page.request.post('/api/backend/products', { data: {} })).status()).toBe(404);
  expect((await page.request.post('/api/backend/categories', { data: {} })).status()).toBe(404);
  expect(
    (
      await page.request.patch('/api/backend/orders/42/status', {
        data: { status: 'EM_TRANSPORTE' },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await page.request.patch('/api/backend/orders/42/status', { data: { status: 'PAGO' } })
    ).status(),
  ).toBe(409);
});

test('painel consulta catálogo e confirma atualização autorizada', async ({ page }) => {
  await login(page, 'admin@teste.invalid');
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('heading', { name: 'Produtos ativos' })).toBeVisible();
  await expect(page.getByText('Luminária LED para piscina 9 W')).toBeVisible();
  await page.getByLabel('Buscar produto ou ID').fill('9 W');
  await expect(page.getByText('Refletor LED para piscina 6 W')).toHaveCount(0);
  await page.getByLabel('Buscar produto ou ID').fill('sem resultado');
  await expect(page.getByText('Nenhum produto encontrado')).toBeVisible();
  await page.getByLabel('Buscar produto ou ID').fill('');
  await page.getByLabel('Categoria', { exact: true }).selectOption('1');
  await expect(page.locator('.admin-product-table tbody tr')).toHaveCount(2);
  await page.getByLabel('ID do pedido').fill('42');
  await page.getByLabel('Novo status').selectOption('CANCELADO');
  page.once('dialog', async (dialog) => {
    expect(dialog.message()).toContain('pedido #42');
    await dialog.accept();
  });
  await page.getByRole('button', { name: 'Atualizar pedido' }).click();
  await expect(page.getByText('Pedido #42 atualizado')).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

const routes = [
  ['quem-somos', 'Quem somos'],
  ['contato', 'Contato'],
  ['privacidade', 'Política de privacidade'],
  ['garantia', 'Garantia'],
  ['trocas-e-devolucoes', 'Trocas e devoluções'],
  ['pagamentos', 'Pagamentos'],
  ['prazos-e-envios', 'Prazos e envios'],
  ['termos', 'Termos de uso'],
] as const;

test('oito páginas institucionais têm navegação e fonte apropriada', async ({ page }) => {
  for (const [slug, title] of routes) {
    await page.goto(`/institucional/${slug}`);
    await expect(page.getByRole('heading', { name: title, exact: true, level: 1 })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Páginas institucionais' })).toBeVisible();
    if (slug === 'termos') {
      await expect(page.getByRole('link', { name: /Ver canais de contato/ })).toBeVisible();
    } else {
      await expect(
        page.getByRole('link', {
          name: /Ler política|Conhecer a Magic LED|Acessar canais|Ver informações/,
        }),
      ).toHaveAttribute('href', /^https:\/\/www\.magicled\.com\.br\//);
    }
  }
  await page.goto('/institucional/garantia-e-trocas');
  await expect(page).toHaveURL(/\/institucional\/garantia$/);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`revisão visual de admin e institucional em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await login(page, 'admin@teste.invalid');
    await expect(page.getByRole('heading', { name: 'Produtos ativos' })).toBeVisible();
    await expect(page.getByText('Luminária LED para piscina 9 W')).toBeVisible();
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/admin-${width}.png`, fullPage: true });
    await page.goto('/institucional/quem-somos');
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/quem-somos-${width}.png`, fullPage: true });
    await page.goto('/institucional/privacidade');
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/privacidade-${width}.png`, fullPage: true });
    const images = await page
      .locator('img')
      .evaluateAll(
        (nodes) =>
          nodes.filter(
            (node) =>
              !(node as HTMLImageElement).complete || (node as HTMLImageElement).naturalWidth === 0,
          ).length,
      );
    expect(images).toBe(0);
    if ([375, 768, 1440].includes(width)) {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    }
  });
}
