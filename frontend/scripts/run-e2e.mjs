import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const root = process.cwd();
const apiPort = process.env.E2E_API_PORT || '3100';
const webPort = process.env.E2E_WEB_PORT || '3001';
const apiUrl = `http://127.0.0.1:${apiPort}`;
const webUrl = `http://127.0.0.1:${webPort}`;
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
async function available(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}
async function waitFor(url, child) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null)
      throw new Error(`Servidor de teste encerrou com código ${child.exitCode}.`);
    if (await available(url)) return;
    await pause(500);
  }
  throw new Error(`Servidor de teste não iniciou: ${url}`);
}

if ((await available(`${apiUrl}/__health`)) || (await available(`${webUrl}/`))) {
  throw new Error(
    `Portas ${apiPort} ou ${webPort} já estão em uso. Escolha portas de teste livres.`,
  );
}

const api = spawn(process.execPath, [resolve(root, 'tests/fixture-api.mjs')], {
  cwd: root,
  stdio: 'ignore',
  windowsHide: true,
});
let frontend;
try {
  await waitFor(`${apiUrl}/__health`, api);
  frontend = spawn(
    process.execPath,
    [
      resolve(root, 'node_modules/next/dist/bin/next'),
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      webPort,
    ],
    {
      cwd: root,
      stdio: 'ignore',
      windowsHide: true,
      env: {
        ...process.env,
        BACKEND_API_URL: apiUrl,
        ENABLE_TEST_CHECKOUT: process.env.E2E_ENABLE_TEST_CHECKOUT === 'true' ? 'true' : 'false',
      },
    },
  );
  await waitFor(`${webUrl}/`, frontend);
  const playwright = spawn(
    process.execPath,
    [resolve(root, 'node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)],
    { cwd: root, stdio: 'inherit', windowsHide: true },
  );
  const code = await new Promise((done, reject) => {
    playwright.on('error', reject);
    playwright.on('close', done);
  });
  process.exitCode = code ?? 1;
} finally {
  frontend?.kill();
  api.kill();
}
