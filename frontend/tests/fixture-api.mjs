import http from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
const apiPort = Number(process.env.E2E_API_PORT || 3100);
const v3Contract = process.env.V3_CONTRACT_FIXTURE === 'true';

const category = { id: 1, nome: 'Iluminação para piscinas', _count: { produtos: 2 } };
const products = [
  {
    id: 2,
    categoriaId: 1,
    nome: 'Luminária LED para piscina 9 W',
    descricao: 'Luminária LED para aplicação em piscina.',
    especificacaoTecnica: 'Potência: 9 W | Alimentação: 12 V',
    preco: '77.50',
    estoque: 8,
    imagemUrl: null,
    status: true,
    categoria: category,
  },
  {
    id: 1,
    categoriaId: 1,
    nome: 'Refletor LED para piscina 6 W',
    descricao: 'Refletor para iluminação de piscina.',
    especificacaoTecnica: 'Potência: 6 W | Alimentação: 12 V',
    preco: '59.90',
    estoque: 0,
    imagemUrl: null,
    status: true,
    categoria: category,
  },
];
let cart;
let addresses;
let orders;
let galleryImage;
let catalogFailure;
let slowProduct;
function reset() {
  cart = { id: 1, clienteId: 5, itens: [], valorTotal: 0 };
  addresses = [];
  orders = v3Contract
    ? [
        {
          id: 17,
          clienteId: 5,
          enderecoId: 21,
          dataCriacao: '2026-11-18T15:00:00Z',
          valorTotal: '77.50',
          status: 'EM_TRANSPORTE',
          codigoRastreio: 'FIXTURE-17',
          itens: [
            { id: 1, produtoId: 2, quantidade: 1, precoUnitario: '77.50', produto: products[0] },
          ],
          endereco: {
            id: 21,
            clienteId: 5,
            logradouro: 'Rua da Fixture',
            numero: '1',
            cidade: 'São Paulo',
            estado: 'SP',
          },
          pagamento: { status: 'APROVADO' },
        },
      ]
    : [];
  galleryImage = false;
  catalogFailure = false;
  slowProduct = false;
  if (v3Contract) orders.push({ ...orders[0], id: 18, clienteId: 6, codigoRastreio: 'FIXTURE-18' });
}
reset();
const reply = (response, data, status = 200) => {
  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(
    JSON.stringify(
      status < 400 ? { success: true, data } : { statusCode: status, message: data, path: '' },
    ),
  );
};
const read = async (request) => {
  let body = '';
  for await (const chunk of request) body += chunk;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
};
const token = (request) => request.headers.authorization?.replace('Bearer ', '');
const user = (request) =>
  token(request) === 'fixture-admin'
    ? { id: 9, nome: 'Admin de teste', email: 'admin@teste.invalid', tipoUsuario: 'ADMIN' }
    : token(request) === 'fixture-client'
      ? { id: 5, nome: 'Cliente de teste', email: 'cliente@teste.invalid', tipoUsuario: 'CLIENTE' }
      : null;
const recalc = () => {
  cart.valorTotal = cart.itens.reduce(
    (sum, item) => sum + Number(item.precoUnitario) * item.quantidade,
    0,
  );
};

http
  .createServer(async (request, response) => {
    const url = new URL(request.url, `http://127.0.0.1:${apiPort}`);
    const path = url.pathname;
    if (path === '/__health') return reply(response, { ready: true });
    if (path === '/__reset') {
      reset();
      return reply(response, null);
    }
    if (path === '/__gallery-image') {
      galleryImage = true;
      return reply(response, null);
    }
    if (v3Contract && path === '/__catalog-failure') {
      catalogFailure = true;
      return reply(response, null);
    }
    if (v3Contract && path === '/__slow-product') {
      slowProduct = true;
      return reply(response, null);
    }
    if (catalogFailure && (path.startsWith('/products') || path.startsWith('/categories')))
      return reply(response, 'Catálogo indisponível na fixture.', 503);
    if (path === '/categories' && request.method === 'GET') return reply(response, [category]);
    if (path === '/products' && request.method === 'GET')
      return reply(
        response,
        products.filter(
          (item) =>
            !url.searchParams.has('categoriaId') ||
            String(item.categoriaId) === url.searchParams.get('categoriaId'),
        ),
      );
    if (/^\/products\/\d+$/.test(path) && request.method === 'GET') {
      if (slowProduct) await delay(1400);
      const found = products.find((item) => String(item.id) === path.split('/')[2]);
      return found
        ? reply(
            response,
            galleryImage && found.id === 2
              ? { ...found, imagemUrl: 'https://gallery-fixture.magicled.invalid/product.svg' }
              : found,
          )
        : reply(response, 'Produto não encontrado.', 404);
    }
    if (path === '/auth/login' || path === '/auth/register') {
      const body = await read(request);
      if (v3Contract && (!body.email || body.senha !== 'senha-de-teste'))
        return reply(response, 'Credenciais inválidas.', 401);
      if (v3Contract && path === '/auth/register' && (!body.nome || !body.cpf))
        return reply(response, 'Cadastro incompleto.', 400);
      const isAdmin = body.email?.startsWith('admin') && (!v3Contract || path === '/auth/login');
      return reply(response, {
        accessToken: isAdmin ? 'fixture-admin' : 'fixture-client',
        usuario: {
          id: v3Contract && isAdmin ? 9 : 5,
          email: body.email,
          tipoUsuario: isAdmin ? 'ADMIN' : 'CLIENTE',
        },
      });
    }
    const currentUser = user(request);
    if (!currentUser) return reply(response, 'Token inválido.', 401);
    if (path === '/auth/me' && request.method === 'GET') return reply(response, currentUser);
    if (
      v3Contract &&
      currentUser.tipoUsuario !== 'CLIENTE' &&
      /^\/(cart|addresses|orders)(\/|$)/.test(path)
    )
      return reply(response, 'Perfil de cliente não encontrado.', 404);
    if (path === '/cart' && request.method === 'GET') return reply(response, cart);
    if (path === '/cart/items' && request.method === 'POST') {
      const body = await read(request);
      const product = products.find((item) => item.id === body.produtoId);
      if (!product || body.quantidade > product.estoque)
        return reply(response, 'Estoque insuficiente.', 400);
      cart.itens.push({
        id: cart.itens.length + 1,
        produtoId: product.id,
        quantidade: body.quantidade,
        precoUnitario: product.preco,
        produto: product,
      });
      recalc();
      return reply(response, cart, 201);
    }
    if (/^\/cart\/items\/\d+$/.test(path)) {
      const item = cart.itens.find((entry) => String(entry.id) === path.split('/')[3]);
      if (!item) return reply(response, 'Item não encontrado.', 404);
      if (request.method === 'PATCH') {
        const body = await read(request);
        if (body.quantidade > item.produto.estoque)
          return reply(response, 'Estoque insuficiente.', 400);
        item.quantidade = body.quantidade;
      } else if (request.method === 'DELETE')
        cart.itens = cart.itens.filter((entry) => entry.id !== item.id);
      recalc();
      return reply(response, cart);
    }
    if (path === '/cart' && request.method === 'DELETE') {
      cart.itens = [];
      recalc();
      return reply(response, cart);
    }
    if (path === '/addresses' && request.method === 'GET') return reply(response, addresses);
    if (path === '/addresses' && request.method === 'POST') {
      const body = await read(request);
      const address = { ...body, id: addresses.length + 1, clienteId: 5 };
      addresses.push(address);
      return reply(response, address, 201);
    }
    if (path === '/orders/checkout' && request.method === 'POST') {
      const body = await read(request);
      const address = addresses.find((entry) => entry.id === body.enderecoId);
      if (!address || !cart.itens.length)
        return reply(response, 'Endereço inválido ou carrinho vazio.', 400);
      const order = {
        id: orders.length + 1,
        clienteId: 5,
        enderecoId: address.id,
        dataCriacao: new Date().toISOString(),
        valorTotal: String(cart.valorTotal.toFixed(2)),
        status: 'PENDENTE',
        codigoRastreio: null,
        itens: cart.itens.map((item) => ({ ...item, id: item.id, pedidoId: orders.length + 1 })),
        endereco: address,
        pagamento: {
          id: orders.length + 1,
          pedidoId: orders.length + 1,
          metodo: body.metodoPagamento,
          valor: String(cart.valorTotal.toFixed(2)),
          status: 'PENDENTE',
          dataPagamento: null,
        },
      };
      orders.push(order);
      cart.itens = [];
      recalc();
      return reply(response, order, 201);
    }
    if (path === '/orders' && request.method === 'GET')
      return reply(
        response,
        orders.filter((order) => !v3Contract || order.clienteId === currentUser.id),
      );
    if (/^\/orders\/\d+$/.test(path) && request.method === 'GET') {
      const found = orders.find(
        (entry) =>
          String(entry.id) === path.split('/')[2] &&
          (!v3Contract || entry.clienteId === currentUser.id),
      );
      return found ? reply(response, found) : reply(response, 'Pedido não encontrado.', 404);
    }
    if (/^\/orders\/\d+\/status$/.test(path) && request.method === 'PATCH') {
      if (currentUser.tipoUsuario !== 'ADMIN') return reply(response, 'Acesso negado.', 403);
      const body = await read(request);
      return reply(response, { id: Number(path.split('/')[2]), status: body.status });
    }
    return reply(response, 'Rota inexistente.', 404);
  })
  .listen(apiPort, '127.0.0.1');
