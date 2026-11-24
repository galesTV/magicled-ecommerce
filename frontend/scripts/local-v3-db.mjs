import { execFileSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const backend = fileURLToPath(new URL('../../backend/', import.meta.url));
const backendRequire = createRequire(resolve(backend, 'package.json'));
const container = 'magicled_postgres_v3_dev';
const project = 'magicled-v3-dev';
const databaseNames = { demo: 'magicled_v3_demo', qa: 'magicled_v3_qa' };

async function databaseConnection() {
  const [info] = JSON.parse(
    execFileSync('docker', ['inspect', '--type=container', container], {
      encoding: 'utf8',
    }),
  );
  const [port] = info.NetworkSettings.Ports['5432/tcp'] ?? [];
  const volume = info.Mounts.find(({ Destination }) => Destination === '/var/lib/postgresql/data');
  if (
    info.Config.Labels?.['com.docker.compose.project'] !== project ||
    info.Config.Labels?.['com.docker.compose.service'] !== 'postgres' ||
    info.NetworkSettings.Ports['5432/tcp']?.length !== 1 ||
    port?.HostIp !== '127.0.0.1' ||
    port.HostPort !== '55432' ||
    volume?.Type !== 'volume' ||
    volume.Name !== project + '_postgres_data'
  ) {
    throw new Error('O container não corresponde ao PostgreSQL local isolado da Magic LED.');
  }

  const settings = Object.fromEntries(
    info.Config.Env.map((entry) => {
      const separator = entry.indexOf('=');
      return [entry.slice(0, separator), entry.slice(separator + 1)];
    }),
  );
  const { POSTGRES_USER: username, POSTGRES_PASSWORD: password } = settings;
  if (!username || !password)
    throw new Error('O Compose local não forneceu credenciais do PostgreSQL.');

  const identifier = execFileSync(
    'docker',
    [
      'exec',
      container,
      'psql',
      '-X',
      '-v',
      'ON_ERROR_STOP=1',
      '-U',
      username,
      '-d',
      'postgres',
      '-Atc',
      'SELECT system_identifier FROM pg_control_system()',
    ],
    { encoding: 'utf8' },
  ).trim();

  const url = new URL('postgresql://127.0.0.1:55432/postgres');
  url.username = username;
  url.password = password;
  return { url, identifier };
}

export async function prepareLocalDatabase(mode) {
  if (mode !== 'demo' && mode !== 'qa') throw new Error('Modo inválido para o banco local.');
  const database = databaseNames[mode];
  const marker = project + ':' + mode;
  const { Client } = backendRequire('pg');
  const { url, identifier } = await databaseConnection();
  const maintenance = new Client({ connectionString: url.href });
  await maintenance.connect();
  try {
    const {
      rows: [server],
    } = await maintenance.query(
      "SELECT current_setting('server_version_num') AS version, system_identifier FROM pg_control_system()",
    );
    if (
      Math.trunc(Number(server.version) / 10000) !== 16 ||
      server.system_identifier !== identifier
    ) {
      throw new Error('A conexão TCP não aponta para o PostgreSQL 16 do container validado.');
    }

    await maintenance.query("SELECT pg_advisory_lock(hashtext('magicled-v3-local-databases'))");
    const {
      rows: [existing],
    } = await maintenance.query(
      "SELECT shobj_description(oid, 'pg_database') AS marker FROM pg_database WHERE datname = $1",
      [database],
    );
    if (existing && existing.marker !== marker) {
      throw new Error('O banco ' + database + ' já existe sem a identificação deste ambiente.');
    }
    if (!existing) {
      await maintenance.query('CREATE DATABASE ' + database);
      await maintenance.query('COMMENT ON DATABASE ' + database + " IS '" + marker + "'");
    }
  } finally {
    await maintenance.end();
  }

  url.pathname = '/' + database;
  const connectionString = url.href;
  execFileSync(
    process.execPath,
    [resolve(backend, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'],
    {
      cwd: backend,
      env: { ...process.env, DATABASE_URL: connectionString },
      stdio: 'inherit',
    },
  );

  if (mode === 'demo') {
    const catalog = await readFile(new URL('../local/catalogo-demo.sql', import.meta.url), 'utf8');
    const demo = new Client({ connectionString });
    await demo.connect();
    try {
      await demo.query(catalog);
    } finally {
      await demo.end();
    }
  }
  return connectionString;
}

export function startLocalApi(connectionString, port) {
  return spawn(process.execPath, [resolve(backend, 'dist/src/main.js')], {
    cwd: backend,
    env: {
      ...process.env,
      DATABASE_URL: connectionString,
      JWT_SECRET: randomBytes(48).toString('base64url'),
      MERCADOPAGO_ACCESS_TOKEN: '',
      PORT: String(port),
    },
    stdio: 'inherit',
    windowsHide: true,
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] !== 'demo') {
    throw new Error('Use node scripts/local-v3-db.mjs demo para iniciar a API de apresentação.');
  }
  const connectionString = await prepareLocalDatabase('demo');
  if (process.argv[3] !== '--prepare-only') {
    const api = startLocalApi(connectionString, 3000);
    for (const signal of ['SIGINT', 'SIGTERM']) {
      process.once(signal, () => api.kill());
    }
    api.once('exit', (code) => {
      process.exitCode = code ?? 0;
    });
  }
}
