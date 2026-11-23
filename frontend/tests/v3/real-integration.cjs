const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { randomBytes, randomInt } = require('node:crypto');
const { once } = require('node:events');
const { createRequire } = require('node:module');
const { createServer } = require('node:net');
const { resolve } = require('node:path');
const { before, after, test } = require('node:test');
const { setTimeout: delay } = require('node:timers/promises');

const repo = resolve(__dirname, '../../..');
const frontend = createRequire(resolve(repo, 'frontend/package.json'));
const backend = createRequire(resolve(repo, 'backend/package.json'));
const { chromium } = frontend('playwright');
const { expect } = frontend('@playwright/test');
const { Client } = backend('pg');
const { hash } = backend('bcrypt');
let base;
let api;
const runId = randomBytes(4).toString('hex');
const password = randomBytes(16).toString('hex');
const categoryName = 'Piscina QA ' + runId;
const inStockName = 'Luminária QA Azul ' + runId;
const outOfStockName = 'Refletor QA Âmbar ' + runId;
const inactiveName = 'Fita QA inativa ' + runId;
const admin = { email: 'admin-' + runId + '@teste.invalid', senha: password };
let db;
let apiProcess;
let frontendProcess;
let browser;
let category;
let product;
let outOfStock;
let inactive;
let adminToken;

function account(label) {
  return {
    nome: 'Cliente QA ' + label,
    email: label + '-' + runId + '@teste.invalid',
    senha: password,
    cpf: String(randomInt(10000000000, 99999999999)),
  };
}

async function request(url, { method = 'GET', token, body, headers = {}, status = 200 } = {}) {
  const response = await fetch(url, {
    method,
    signal: AbortSignal.timeout(10000),
    headers: {
      ...headers,
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload = await response.json();
  assert.equal(response.status, status, method + ' ' + url + ': ' + (payload.message || ''));
  if (status < 400) assert.equal(payload.success, true, method + ' ' + url);
  return payload;
}

async function loginApi(credentials) {
  const { email, senha } = credentials;
  return (
    await request(api + '/auth/login', { method: 'POST', body: { email, senha }, status: 201 })
  ).data;
}

async function registerApi(data) {
  return (await request(api + '/auth/register', { method: 'POST', body: data, status: 201 })).data;
}

async function loginPage(page, credentials) {
  await page.getByLabel('E-mail', { exact: true }).fill(credentials.email);
  await page.getByLabel('Senha', { exact: true }).fill(credentials.senha);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

async function withPage(t, callback, options = {}) {
  const context = await browser.newContext({ baseURL: base, ...options });
  const page = await context.newPage();
  page.on('pageerror', (error) => t.diagnostic('Erro de execução no navegador: ' + error.message));
  try {
    await callback(page, context);
  } catch (error) {
    t.diagnostic('URL no momento da falha: ' + page.url());
    t.diagnostic(
      (
        await page
          .locator('main')
          .innerText({ timeout: 1500 })
          .catch(() => '')
      ).slice(0, 1400),
    );
    throw error;
  } finally {
    await context.close();
  }
}

function addProduct(nome, preco, estoque, status = true) {
  return request(api + '/products', {
    method: 'POST',
    token: adminToken,
    body: {
      categoriaId: category.id,
      nome,
      preco,
      estoque,
      status,
      descricao: 'Produto fictício para validação da integração.',
      especificacaoTecnica: 'Alimentação 12 V',
    },
    status: 201,
  }).then(({ data }) => data);
}

async function selectPorts() {
  const servers = [createServer(), createServer()];
  try {
    await Promise.all(
      servers.map((server) => {
        server.listen(0, '127.0.0.1');
        return once(server, 'listening');
      }),
    );
    const ports = servers.map((server) => server.address().port);
    assert.ok(ports.every((port) => ![3000, 3001, 5432, 55432].includes(port)));
    return ports;
  } finally {
    await Promise.all(servers.map((server) => new Promise((done) => server.close(done))));
  }
}

async function waitForServer(process, url) {
  let spawnError;
  process.once('error', (error) => {
    spawnError = error;
  });
  for (let attempt = 0; attempt < 50; attempt++) {
    if (spawnError) throw spawnError;
    assert.equal(process.exitCode, null, 'Processo de QA encerrado em ' + url);
    if ((await fetch(url, { signal: AbortSignal.timeout(1000) }).catch(() => null))?.ok) return;
    await delay(200);
  }
  throw new Error('Serviço de QA não respondeu em ' + url);
}

async function stopServer(process) {
  if (!process?.pid || process.exitCode !== null || process.signalCode !== null) return;
  const exited = once(process, 'exit');
  process.kill();
  await exited;
}

before(async () => {
  const { prepareLocalDatabase, startLocalApi } = await import('../../scripts/local-v3-db.mjs');
  const connectionString = await prepareLocalDatabase('qa');
  const target = new URL(connectionString);
  assert.equal(target.hostname, '127.0.0.1');
  assert.equal(target.port, '55432');
  assert.equal(target.pathname, '/magicled_v3_qa');
  db = new Client({ connectionString });
  await db.connect();
  const {
    rows: [server],
  } = await db.query(
    "SELECT datname AS db, current_setting('server_version_num') AS version, shobj_description(oid, 'pg_database') AS marker FROM pg_database WHERE datname = current_database()",
  );
  assert.equal(server.db, 'magicled_v3_qa');
  assert.equal(Math.trunc(Number(server.version) / 10000), 16);
  assert.equal(server.marker, 'magicled-v3-dev:qa');
  const { rows } = await db.query(
    'SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name',
  );
  assert.deepEqual(
    rows.map((row) => row.migration_name),
    ['20261102233759_init', '20261107233344_add_imagem_url_to_produtos'],
  );
  const [frontendPort, backendPort] = await selectPorts();
  base = 'http://127.0.0.1:' + frontendPort;
  api = 'http://127.0.0.1:' + backendPort;
  console.log('Serviços exclusivos de QA: Next ' + base + ' e NestJS ' + api + '.');
  apiProcess = startLocalApi(connectionString, backendPort);
  await waitForServer(apiProcess, api + '/api/docs-json');
  frontendProcess = spawn(
    process.execPath,
    [
      resolve(repo, 'frontend/node_modules/next/dist/bin/next'),
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(frontendPort),
    ],
    {
      cwd: resolve(repo, 'frontend'),
      env: {
        ...process.env,
        NEXT_PUBLIC_DATA_MODE: 'api',
        NEXT_PUBLIC_MAGICLED_PREVIEW: 'false',
        MAGICLED_ENABLE_LEGACY_API: 'false',
        BACKEND_API_URL: api,
      },
      stdio: 'inherit',
      windowsHide: true,
    },
  );
  await waitForServer(frontendProcess, base + '/api/backend/products');
  browser = await chromium.launch({ headless: true });
  const createdAdmin = await db.query(
    "WITH qa_admin AS (INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario) VALUES ($1, $2, $3, 'ADMIN') RETURNING id) INSERT INTO administradores (usuario_id, nivel_acesso) SELECT id, 'QA_LOCAL' FROM qa_admin RETURNING usuario_id",
    ['Administrador QA', admin.email, await hash(password, 10)],
  );
  const authenticatedAdmin = await loginApi(admin);
  assert.equal(authenticatedAdmin.usuario.id, createdAdmin.rows[0].usuario_id);
  const { data: frontendAdmin } = await request(base + '/api/session/login', {
    method: 'POST',
    headers: { Origin: base },
    body: admin,
  });
  assert.equal(frontendAdmin.id, createdAdmin.rows[0].usuario_id);
  adminToken = authenticatedAdmin.accessToken;
  category = (
    await request(api + '/categories', {
      method: 'POST',
      token: adminToken,
      body: { nome: categoryName },
      status: 201,
    })
  ).data;
  product = await addProduct(inStockName, 77.5, 8);
  outOfStock = await addProduct(outOfStockName, 59.9, 0);
  inactive = await addProduct(inactiveName, 20, 4, false);
  console.log('Dados fictícios da rodada ' + runId + ', com categoria #' + category.id + '.');
});

after(async () => {
  await Promise.all([
    browser?.close(),
    db?.end(),
    stopServer(frontendProcess),
    stopServer(apiProcess),
  ]);
});

test('catálogo real: categoria, preço, busca, detalhe, estoque e publicação', async (t) => {
  const { data } = await request(api + '/products?categoriaId=' + category.id);
  const ids = data.map(({ id }) => id);
  assert.ok(ids.includes(product.id) && ids.includes(outOfStock.id));
  assert.ok(!ids.includes(inactive.id));
  await withPage(t, async (page) => {
    await page.goto('/produtos?categoria=' + category.id + '&ordem=price-asc');
    const cards = page.locator('.v3-product-card');
    await expect(cards).toHaveCount(2);
    await expect(cards.first()).toContainText(outOfStockName);
    await expect(cards.first()).toContainText('59,90');
    await expect(cards.last()).toContainText(inStockName);
    await expect(cards.last()).toContainText('77,50');
    const search = page.getByRole('combobox', { name: 'Buscar produtos' });
    await search.fill('luminaria qa azul ' + runId);
    await page.getByRole('option', { name: inStockName }).click();
    await expect(page).toHaveURL(new RegExp('/produtos/' + product.id + '$'));
    await expect(page.getByText('Em estoque', { exact: true })).toBeVisible();
    await expect(page.getByText('Alimentação 12 V')).toBeVisible();
    await page.goto('/produtos/' + outOfStock.id);
    await expect(page.getByText('Sem estoque', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Entrar para adicionar' })).toHaveCount(0);
    await page.goto('/produtos/' + inactive.id);
    await expect(page.getByRole('heading', { name: 'Página indisponível.' })).toBeVisible();
    await page.goto('/produtos?q=sem-correspondencia-' + runId);
    await expect(page.getByText('Nenhum produto corresponde aos filtros.')).toBeVisible();
  });
});

test('cadastro, duplicidade, login errado/correto, cookie HttpOnly e logout', async (t) => {
  const customer = account('cadastro');
  await withPage(t, async (page, context) => {
    await page.goto('/conta');
    await expect(page).toHaveURL(/\/login\?/);
    await page.getByRole('link', { name: 'Criar uma conta' }).click();
    await page.getByLabel('Nome completo').fill(customer.nome);
    await page.getByLabel('E-mail', { exact: true }).fill(customer.email);
    await page.getByLabel('Senha', { exact: true }).fill(customer.senha);
    await page.getByLabel('CPF').fill(customer.cpf);
    const responsePromise = page.waitForResponse((response) =>
      response.url().endsWith('/api/session/register'),
    );
    await page.getByRole('button', { name: 'Criar conta' }).click();
    const response = await responsePromise;
    assert.equal(response.status(), 200);
    await expect(page.getByRole('heading', { name: 'Olá, ' + customer.nome + '.' })).toBeVisible();
    const cookie = (await context.cookies()).find(({ name }) => name === 'magicled_session');
    assert.ok(cookie?.httpOnly && cookie?.secure);
    assert.equal(cookie.sameSite, 'Lax');
    assert.ok(!(await page.evaluate(() => document.cookie)).includes('magicled_session'));
    assert.ok(!(await page.evaluate(() => JSON.stringify(localStorage))).includes(cookie.value));
    const { rows } = await db.query(
      'SELECT u.tipo_usuario, c.cpf FROM usuarios u JOIN clientes c ON c.usuario_id = u.id WHERE u.email = $1',
      [customer.email],
    );
    assert.deepEqual(rows, [{ tipo_usuario: 'CLIENTE', cpf: customer.cpf }]);
    const currentSession = await page.request.get('/api/session/me');
    assert.equal(currentSession.status(), 200);
    const { data } = await currentSession.json();
    assert.equal(data.email, customer.email);
    assert.equal(data.tipoUsuario, 'CLIENTE');
    const login = await request(base + '/api/session/login', {
      method: 'POST',
      headers: { Origin: base },
      body: { email: customer.email, senha: customer.senha },
    });
    assert.ok(!Object.hasOwn(login.data, 'accessToken'));
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Olá, ' + customer.nome + '.' })).toBeVisible();
    await request(base + '/api/session/register', {
      method: 'POST',
      headers: { Origin: base },
      body: customer,
      status: 409,
    });
    await request(base + '/api/session/login', {
      method: 'POST',
      headers: { Origin: 'https://externo.invalid' },
      body: { email: customer.email, senha: customer.senha },
      status: 403,
    });
    await page.getByRole('button', { name: 'Sair da conta' }).click();
    await expect(page).toHaveURL(/\/login$/);
    assert.ok(!(await context.cookies()).some(({ name }) => name === 'magicled_session'));
    assert.equal((await page.request.get('/api/session/me')).status(), 401);
    await page.getByLabel('E-mail', { exact: true }).fill(customer.email);
    await page.getByLabel('Senha', { exact: true }).fill('senha-incorreta');
    await page.getByRole('button', { name: 'Entrar', exact: true }).click();
    await expect(page.locator('main').getByRole('alert')).toContainText('Credenciais inválidas.');
    await loginPage(page, customer);
    await expect(page).toHaveURL(/\/conta$/);
    await context.addCookies([
      {
        url: base,
        name: 'magicled_session',
        value: 'qa-invalid-session',
        httpOnly: true,
        secure: true,
        sameSite: 'Lax',
      },
    ]);
    await page.goto('/conta/pedidos');
    await expect(page).toHaveURL(/\/login\?.*sessao=expirada/);
    assert.equal(new URL(page.url()).searchParams.get('next'), '/conta/pedidos');
    await expect(
      page.getByText('Sua sessão expirou. Entre novamente para continuar.'),
    ).toBeVisible();
  });
});

test('carrinho real: autenticação, persistência, quantidade, remoção e revisão', async (t) => {
  const customer = account('carrinho');
  const { accessToken: token } = await registerApi(customer);
  await request(api + '/cart', { status: 401 });
  await withPage(t, async (page) => {
    await page.goto('/produtos/' + product.id);
    await page.getByRole('link', { name: 'Entrar para adicionar' }).click();
    await loginPage(page, customer);
    await expect(page).toHaveURL(new RegExp('/produtos/' + product.id + '$'));
    await page.getByRole('button', { name: 'Adicionar ao carrinho' }).click();
    await page.getByRole('link', { name: 'Carrinho com 1 item' }).click();
    const item = page.locator('.v3-cart-item');
    await expect(item).toContainText(inStockName);
    await item.getByRole('button', { name: 'Aumentar quantidade' }).click();
    await expect(page.locator('.v3-cart-summary')).toContainText('155,00');
    const { data: cart } = await request(api + '/cart', { token });
    assert.equal(cart.valorTotal, 155);
    assert.equal(cart.itens[0].quantidade, 2);
    assert.equal(cart.itens[0].produtoId, product.id);
    const { rows } = await db.query('SELECT quantidade FROM itens_carrinho WHERE id = $1', [
      cart.itens[0].id,
    ]);
    assert.deepEqual(rows, [{ quantidade: 2 }]);
    await page.reload();
    await expect(page.locator('.v3-cart-summary')).toContainText('155,00');
    await page.getByRole('link', { name: 'Revisar carrinho' }).click();
    await expect(page.getByText('Finalização comercial indisponível')).toBeVisible();
    await expect(page.locator('.v3-cart-summary')).toContainText('Subtotal dos produtos');
    for (const path of ['/orders/checkout', '/payments/process', '/shipping/calculate']) {
      await request(base + '/api/backend' + path, {
        method: 'POST',
        headers: { Origin: base },
        body: {},
        status: 404,
      });
    }
    await page.getByRole('link', { name: 'Voltar ao carrinho' }).click();
    await item.getByRole('button', { name: 'Remover ' + inStockName }).click();
    await expect(page.getByText('Sua seleção está vazia')).toBeVisible();
    assert.deepEqual((await request(api + '/cart', { token })).data.itens, []);
  });
});

test('endereços reais: cadastro pela V3, normalização, persistência e isolamento', async (t) => {
  const customer = account('endereco');
  const { accessToken: token, usuario } = await registerApi(customer);
  const { accessToken: otherToken } = await registerApi(account('vizinho'));
  await withPage(t, async (page) => {
    await page.goto('/conta/enderecos');
    await loginPage(page, customer);
    await expect(page).toHaveURL(/\/conta\/enderecos$/);
    await expect(page.getByText('Nenhum endereço cadastrado.')).toBeVisible();
    for (const [label, value] of Object.entries({
      CEP: '01001-000',
      Logradouro: 'Rua QA',
      Número: '15',
      Bairro: 'Centro',
      Cidade: 'São Paulo',
      UF: 'sp',
    })) {
      await page.getByLabel(label, { exact: true }).fill(value);
    }
    await page.getByRole('button', { name: 'Salvar endereço' }).click();
    await expect(page.getByText('Endereço cadastrado.', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Rua QA, 15' })).toBeVisible();
    const { data: addresses } = await request(api + '/addresses', { token });
    assert.equal(addresses.length, 1);
    assert.equal(addresses[0].estado, 'SP');
    const { rows } = await db.query('SELECT cliente_id, estado FROM enderecos WHERE id = $1', [
      addresses[0].id,
    ]);
    assert.deepEqual(rows, [{ cliente_id: usuario.id, estado: 'SP' }]);
    const proxyData = await page.request.get('/api/backend/addresses');
    assert.equal(proxyData.status(), 200);
    assert.equal((await proxyData.json()).data[0]?.id, addresses[0].id);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Rua QA, 15' })).toBeVisible();
    await expect(page.getByText('São Paulo – SP · CEP 01001-000')).toBeVisible();
    assert.deepEqual((await request(api + '/addresses', { token: otherToken })).data, []);
  });
});

test('pedidos e papéis reais: checkout local, histórico, detalhe e autorização', async (t) => {
  const customer = account('pedido');
  const { accessToken: token, usuario } = await registerApi(customer);
  const other = account('outro');
  const { accessToken: otherToken } = await registerApi(other);
  const { data: address } = await request(api + '/addresses', {
    method: 'POST',
    token,
    status: 201,
    body: {
      cep: '01001-000',
      logradouro: 'Rua Simulada',
      numero: '22',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
    },
  });
  const stockBefore = (await request(api + '/products/' + product.id)).data.estoque;
  await request(api + '/cart/items', {
    method: 'POST',
    token,
    body: { produtoId: product.id, quantidade: 2 },
    status: 201,
  });
  const checkout = { method: 'POST', body: { enderecoId: address.id, metodoPagamento: 'BOLETO' } };
  await request(api + '/orders/checkout', { ...checkout, token: otherToken, status: 404 });
  const { data: order } = await request(api + '/orders/checkout', {
    ...checkout,
    token,
    status: 201,
  });
  assert.equal(order.status, 'PENDENTE');
  assert.equal(Number(order.valorTotal), 155);
  assert.equal(order.pagamento.status, 'PENDENTE');
  assert.equal(order.itens[0].quantidade, 2);
  assert.deepEqual((await request(api + '/cart', { token })).data.itens, []);
  assert.equal((await request(api + '/products/' + product.id)).data.estoque, stockBefore - 2);
  assert.deepEqual(
    (await request(api + '/orders', { token })).data.map(({ id }) => id),
    [order.id],
  );
  assert.deepEqual((await request(api + '/orders', { token: otherToken })).data, []);
  await request(api + '/orders/' + order.id, { token: otherToken, status: 404 });
  const change = {
    method: 'PATCH',
    body: { status: 'EM_TRANSPORTE', codigoRastreio: 'QA-' + runId },
  };
  await request(api + '/orders/' + order.id + '/status', { ...change, status: 401 });
  await request(api + '/orders/' + order.id + '/status', { ...change, token, status: 403 });
  const { data: changed } = await request(api + '/orders/' + order.id + '/status', {
    ...change,
    token: adminToken,
  });
  assert.equal(changed.status, 'EM_TRANSPORTE');
  const { rows } = await db.query(
    'SELECT p.cliente_id, p.status, p.codigo_rastreio, pg.status AS pagamento FROM pedidos p JOIN pagamentos pg ON pg.pedido_id = p.id WHERE p.id = $1',
    [order.id],
  );
  assert.deepEqual(rows, [
    {
      cliente_id: usuario.id,
      status: 'EM_TRANSPORTE',
      codigo_rastreio: 'QA-' + runId,
      pagamento: 'PENDENTE',
    },
  ]);
  t.diagnostic(
    'Pedido de teste #' + order.id + ', pagamento PENDENTE, nenhuma chamada ao provedor.',
  );

  await withPage(t, async (page) => {
    await page.goto('/conta/pedidos');
    await loginPage(page, customer);
    await expect(page).toHaveURL(/\/conta\/pedidos$/);
    await page.getByRole('link', { name: new RegExp('Pedido ' + order.id + '(?!\\d)') }).click();
    await expect(page.getByRole('heading', { name: 'Pedido ' + order.id })).toBeVisible();
    await expect(page.getByText('Rastreio: QA-' + runId)).toBeVisible();
    await expect(page.getByText('Status de pagamento registrado: Pendente')).toBeVisible();
    await expect(page.getByText('Em transporte', { exact: true })).toBeVisible();
    await expect(page.getByText('2 × ' + inStockName)).toBeVisible();
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: 'Página indisponível.' })).toBeVisible();
  });
  await withPage(t, async (page) => {
    await page.goto('/conta/pedidos');
    await loginPage(page, other);
    await expect(page.getByText('Nenhum pedido encontrado.')).toBeVisible();
    await page.goto('/conta/pedidos/' + order.id);
    await expect(page.getByRole('heading', { name: 'Página indisponível.' })).toBeVisible();
    assert.equal((await page.request.get('/api/backend/orders/' + order.id)).status(), 404);
  });
  await withPage(t, async (page) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login\?/);
    await loginPage(page, admin);
    await expect(page.getByRole('heading', { name: 'Administração' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Produtos ativos' })).toBeVisible();
    await expect(page.getByText(inStockName, { exact: true }).first()).toBeVisible();
    assert.equal((await page.request.get('/api/backend/orders')).status(), 403);
    assert.equal(
      (
        await page.request.patch('/api/backend/orders/' + order.id + '/status', {
          headers: { Origin: base },
          data: { status: 'ENTREGUE' },
        })
      ).status(),
      404,
    );
  });
});

test('V3 em viewport móvel: catálogo, detalhe, login e cadastro sem rolagem lateral', async (t) => {
  await withPage(
    t,
    async (page) => {
      for (const path of ['/produtos', '/produtos/' + product.id, '/login', '/cadastro']) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= 390), path);
      }
    },
    { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
  );
});
