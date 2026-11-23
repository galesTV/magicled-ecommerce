import { mkdir } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const api = `http://127.0.0.1:${process.env.E2E_API_PORT || '3100'}`;
const output = 'artifacts/screenshots/v2-stage3';

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('cliente@teste.invalid');
  await page.getByLabel('Senha').fill('senha123');
  await page.getByRole('button', { name: 'Entrar na minha conta' }).click();
  await expect(page).toHaveURL(/\/conta$/);
}

async function noOverflow(page: Page, width: number) {
  const actual = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(actual, `Overflow em ${page.url()} com ${width}px`).toBeLessThanOrEqual(width);
}

test.beforeEach(async ({ request }) => {
  await request.get(`${api}/__reset`);
  await mkdir(output, { recursive: true });
});

test('login e cadastro validam campos e permitem ver a senha', async ({ page }) => {
  await page.goto('/conta');
  await expect(page.getByText('Sua sessão terminou')).toBeVisible();
  await page.goto('/cadastro');
  await page.getByRole('button', { name: 'Criar conta' }).click();
  await expect(page.getByText('Informe seu nome.')).toBeVisible();
  await page.getByLabel('Senha').fill('abc123');
  await page.getByRole('button', { name: 'Exibir caracteres' }).click();
  await expect(page.getByLabel('Senha')).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ocultar caracteres' }).click();
  await expect(page.getByLabel('Senha')).toHaveAttribute('type', 'password');
  await page.goto('/recuperar-senha');
  await expect(page.getByRole('link', { name: /Ver canais de atendimento/ })).toBeVisible();
});

test('carrinho, endereço e checkout bloqueado preservam dados reais', async ({ page }) => {
  await login(page);
  await page.goto('/produtos/2');
  await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
  await page.goto('/carrinho');
  await expect(page.getByText('R$ 77,50').first()).toBeVisible();
  await page.getByLabel('Quantidade').selectOption('2');
  await expect(page.getByText('R$ 155,00').first()).toBeVisible();
  await page.goto('/conta/enderecos');
  await page.getByLabel('CEP').fill('abc');
  await page.getByRole('button', { name: 'Salvar endereço' }).click();
  await expect(page.getByText('Informe um CEP de 8 dígitos.')).toBeVisible();
  await page.getByLabel('CEP').fill('01001-000');
  await page.getByLabel('Logradouro').fill('Rua de teste');
  await page.getByLabel('Número').fill('10');
  await page.getByLabel('Bairro').fill('Centro');
  await page.getByLabel('Cidade').fill('São Paulo');
  await page.getByLabel('UF').fill('SP');
  await page.getByRole('button', { name: 'Salvar endereço' }).click();
  await expect(page.getByText('Endereço salvo.')).toBeVisible();
  await page.goto('/checkout');
  await expect(page.getByText('Checkout em validação')).toBeVisible();
  await expect(page.getByText('R$ 155,00').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Finalização indisponível' })).toBeDisabled();
  await expect(page.getByText('Rua de teste, 10')).toBeVisible();
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.goto('/carrinho');
  await page.getByRole('button', { name: 'Remover' }).click();
  await expect(page.getByText('Seu carrinho está vazio')).toBeVisible();
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`fluxos internos sem overflow em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/login');
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/login-${width}.png`, fullPage: true });
    await login(page);
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/conta-${width}.png`, fullPage: true });
    await page.goto('/produtos/2');
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.goto('/carrinho');
    await expect(page.getByText('R$ 77,50').first()).toBeVisible();
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/carrinho-${width}.png`, fullPage: true });
    await page.goto('/checkout');
    await expect(page.getByText('Checkout em validação')).toBeVisible();
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/checkout-${width}.png`, fullPage: true });
    await page.goto('/conta/enderecos');
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/enderecos-${width}.png`, fullPage: true });
    await page.goto('/conta/pedidos');
    await noOverflow(page, width);
    if ([375, 768, 1440].includes(width))
      await page.screenshot({ path: `${output}/pedidos-${width}.png`, fullPage: true });
  });
}
