import { test, expect } from '@playwright/test';

test.beforeEach(async ({ request }) => {
  await request.get(`http://127.0.0.1:${process.env.E2E_API_PORT || '3100'}/__reset`);
});

test('catálogo combina busca, faixa de preço, categoria e ordenação', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/produtos');
  await page.getByText('Filtrar e ordenar').click();
  await page.getByLabel('Buscar neste catálogo').fill('piscina');
  await page.getByLabel('Preço mínimo').fill('70');
  await page.getByLabel('Categoria', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: /Aplicar filtros/ }).click();
  await expect(page.getByText('1 produto', { exact: true })).toBeVisible();
  await expect(page.getByText('Luminária LED para piscina 9 W')).toBeVisible();
  await expect(page.getByText('Refletor LED para piscina 6 W')).toHaveCount(0);
  await expect(page).toHaveURL(/minimo=70/);
  await page.getByRole('button', { name: /Limpar tudo/ }).click();
  await expect(page.getByText('2 produtos', { exact: true })).toBeVisible();
  await page.getByLabel('Ordenar produtos').selectOption('preco-asc');
  await expect(page.locator('.catalog-results .product-card h3').first()).toHaveText(
    'Refletor LED para piscina 6 W',
  );
});

test('cards respondem ao hover e detalhe preserva quantidade e indisponibilidade', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/produtos');
  const card = page.locator('.catalog-results .product-card').first();
  const before = await card.evaluate((element) => getComputedStyle(element).transform);
  await card.hover();
  await expect
    .poll(() => card.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(before);
  await page.goto('/produtos/2');
  await expect(page.getByText('Fotografia do produto em atualização')).toBeVisible();
  await expect(page.getByRole('button', { name: /Ampliar imagem/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Aumentar quantidade' }).click();
  await expect(page.getByRole('spinbutton', { name: 'Quantidade' })).toHaveValue('2');
  await page.goto('/produtos/1');
  await expect(page.getByRole('button', { name: 'Adicionar ao carrinho' })).toBeDisabled();
});

test('galeria amplia a imagem quando a API fornece uma fotografia verificada', async ({
  page,
  request,
}) => {
  await request.get(`http://127.0.0.1:${process.env.E2E_API_PORT || '3100'}/__gallery-image`);
  await page.route('https://gallery-fixture.magicled.invalid/product.svg', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600"><rect width="600" height="600" fill="#ecf5f2"/><circle cx="300" cy="300" r="150" fill="#007f75"/></svg>',
    }),
  );
  await page.goto('/produtos/2');
  await expect(page.locator('.v2-gallery-stage img')).toBeVisible();
  await page.getByRole('button', { name: /Ampliar imagem/ }).click();
  await expect(page.getByRole('dialog', { name: /Imagem ampliada/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: /Imagem ampliada/ })).not.toBeVisible();
});
