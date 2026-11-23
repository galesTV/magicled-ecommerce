import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const useFixture = process.argv[2] === '--api-fixture';
const testArgs = process.argv.slice(useFixture ? 3 : 2);
const port = useFixture ? '3214' : process.env.V3_TEST_PORT || '3213';
const existing = useFixture ? undefined : process.env.V3_BASE_URL;
const baseUrl = existing || 'http://127.0.0.1:' + port;
const fixtureUrl = 'http://127.0.0.1:3314';
const root = process.cwd();

async function responds(url) {
  try {
    return (await fetch(url, { signal: AbortSignal.timeout(1000) })).ok;
  } catch {
    return false;
  }
}

async function waitForServer(server, url) {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null)
      throw new Error('O servidor em ' + url + ' encerrou com código ' + server.exitCode);
    if (await responds(url)) return;
    await delay(200);
  }
  throw new Error('O servidor não respondeu em ' + url);
}

let server;
let fixture;
try {
  if (!existing && (await responds(baseUrl)))
    throw new Error('A porta ' + port + ' está em uso. Defina V3_TEST_PORT para escolher outra.');
  if (useFixture) {
    if (await responds(fixtureUrl + '/__health'))
      throw new Error('A porta reservada para a fixture V3 já está em uso.');
    fixture = spawn(process.execPath, [resolve(root, 'tests/fixture-api.mjs')], {
      cwd: root,
      stdio: 'ignore',
      windowsHide: true,
      env: { ...process.env, E2E_API_PORT: '3314', V3_CONTRACT_FIXTURE: 'true' },
    });
    await waitForServer(fixture, fixtureUrl + '/__health');
  }
  if (!existing) {
    server = spawn(
      process.execPath,
      [
        resolve(root, 'node_modules/next/dist/bin/next'),
        'start',
        '--hostname',
        '127.0.0.1',
        '--port',
        port,
      ],
      {
        cwd: root,
        stdio: 'ignore',
        windowsHide: true,
        ...(useFixture
          ? {
              env: { ...process.env, NEXT_PUBLIC_DATA_MODE: 'api', BACKEND_API_URL: fixtureUrl },
            }
          : {}),
      },
    );
    await waitForServer(server, baseUrl);
  }
  const tests = spawn(
    process.execPath,
    [
      resolve(root, 'node_modules/@playwright/test/cli.js'),
      'test',
      '--config',
      useFixture ? 'playwright.v3-api.config.ts' : 'playwright.v3.config.ts',
      ...testArgs,
    ],
    {
      cwd: root,
      stdio: 'inherit',
      windowsHide: true,
      env: { ...process.env, V3_BASE_URL: baseUrl },
    },
  );
  process.exitCode = await new Promise((done, reject) => {
    tests.once('error', reject);
    tests.once('exit', (code) => done(code ?? 1));
  });
} finally {
  server?.kill();
  fixture?.kill();
}
