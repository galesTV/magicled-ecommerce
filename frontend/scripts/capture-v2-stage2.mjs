import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const output = new URL('../artifacts/screenshots/v2-stage2/', import.meta.url);
await mkdir(output, { recursive: true });
for (const width of [375, 768, 1440]) {
  for (const [name, path] of [
    ['catalogo', '/produtos'],
    ['produto', '/produtos/2'],
  ]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(`http://localhost:3001${path}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.locator('h1').waitFor();
    await page.evaluate(() =>
      Promise.all([...document.images].map((image) => image.decode().catch(() => null))),
    );
    await page.screenshot({
      path: fileURLToPath(new URL(`${name}-${width}.png`, output)),
      fullPage: true,
      caret: 'initial',
    });
    const report = await page.evaluate(() => ({
      viewport: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      brokenImages: [...document.images]
        .filter((image) => image.complete && !image.naturalWidth)
        .map((image) => image.src),
      heading: document.querySelector('h1')?.textContent,
      manrope: document.fonts.check('16px Manrope'),
      inter: document.fonts.check('16px Inter'),
    }));
    console.log(`${name}-${width}: ${JSON.stringify(report)}`);
    await page.close();
  }
}
await browser.close();
