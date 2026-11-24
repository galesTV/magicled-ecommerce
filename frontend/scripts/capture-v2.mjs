import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const output = new URL('../artifacts/screenshots/v2/', import.meta.url);
await mkdir(output, { recursive: true });

const widths = process.argv.slice(2).map(Number);
for (const width of widths.length ? widths : [320, 375, 768, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3001/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: fileURLToPath(new URL(`home-${width}.png`, output)),
    fullPage: true,
  });
  const report = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    inter: document.fonts.check('16px Inter'),
    manrope: document.fonts.check('16px Manrope'),
    loadedFonts: [...document.fonts]
      .filter((font) => font.status === 'loaded')
      .map((font) => font.family),
    heroHeight: Math.round(document.querySelector('.v2-hero')?.getBoundingClientRect().height ?? 0),
    brokenImages: [...document.images]
      .filter((image) => image.complete && !image.naturalWidth)
      .map((image) => image.src),
  }));
  console.log(`${width}: ${JSON.stringify(report)}`);
  if (width === 375) {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('navigation', { name: 'Navegação mobile' }).waitFor({ state: 'visible' });
    await page.waitForTimeout(250);
    await page.screenshot({ path: fileURLToPath(new URL('menu-375.png', output)) });
    await page.getByRole('button', { name: 'Fechar menu' }).click();
    await page.locator('#mobile-search').fill('piscina');
    await page.locator('.header-v2-mobile-search button').click();
    await page.waitForURL('**/produtos?q=piscina');
    console.log('375: menu e busca mobile funcionais');
  }
  await page.close();
}

await browser.close();
