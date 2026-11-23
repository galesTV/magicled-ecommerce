# Magic LED V3

## Executar com o back-end

O modo padrão é `api`. O Next.js carrega catálogo e categorias do NestJS, usa o BFF da própria origem para autenticação e carrinho e consulta dados privados com a sessão do cliente. Admin tem leitura de catálogo. Checkout permite apenas revisar o carrinho.

1. **PostgreSQL de desenvolvimento.** Identifique e obtenha autorização para um banco exclusivo para testes. O `docker-compose.yml` da raiz contém um serviço PostgreSQL 16 que pode ser iniciado com `docker compose up -d postgres` quando a porta configurada estiver livre e o volume for identificado como de desenvolvimento. Confirme a aplicação das migrations versionadas nesse banco antes de iniciar a API. O seed do repositório apaga registros.
2. **NestJS.** Em `backend/`, use um Node compatível com o lockfile, rode `npm.cmd ci` e configure `DATABASE_URL` e `JWT_SECRET` de forma privada. Gere o cliente com `npx.cmd prisma generate` e execute `npm.cmd run start:dev`. A porta padrão é 3000, configurável por `PORT`, com Swagger em `/api/docs`. A conexão deve apontar ao banco isolado. Esta etapa da V3 dispensa configuração de pagamento.
3. **Next.js.** Em `frontend/`, instale as dependências, crie `.env.local` a partir de `.env.example` e execute `npm.cmd run dev`. A aplicação fica em `http://127.0.0.1:3001`. `BACKEND_API_URL` fica no servidor e usa `http://127.0.0.1:3000` por padrão. Em produção, use HTTPS para a origem pública e preserve host e protocolo no proxy para que a verificação de origem das mutações corresponda à URL do navegador.

## Demonstração isolada

Defina `NEXT_PUBLIC_DATA_MODE=demo` para usar a prévia local em desenvolvimento. Em builds de demonstração, defina também `NEXT_PUBLIC_MAGICLED_PREVIEW=true`. O carrinho demonstrativo guarda slug e quantidade no navegador. Perfil, endereços, pedidos e métodos de pagamento são fictícios e ficam separados do modo API.

## Testes

Para verificar a integração HTTP contra a fixture isolada, use o modo API durante o build.

```powershell
$env:NEXT_PUBLIC_DATA_MODE = 'api'
npm.cmd run build
npm.cmd run typecheck
npm.cmd run test:e2e:api-fixture
```

Essa suíte sobe a fixture em `127.0.0.1:3314` e o Next em `127.0.0.1:3214`. Para a suíte visual da demonstração, faça um build com as duas flags de demo e rode `npm.cmd run test:e2e`. Use `V3_CAPTURE=true` para gerar capturas localmente e `V3_CAPTURE_DIR` para escolher o diretório. Instale o Chromium com `npm exec -- playwright install chromium` ou use `PLAYWRIGHT_BROWSERS_PATH` se ele já estiver em um cache local. As duas suítes verificam a V3 sem PostgreSQL ou Mercado Pago.

## Camadas de dados

- `src/data/catalog/server.ts` e `adapter.ts` adaptam produtos e categorias para a V3. Os links no modo API usam os IDs numéricos do banco. Imagens HTTPS vindas da API são carregadas pelo navegador, com fallback visual quando ausentes ou indisponíveis. O modo API sinaliza falhas do upstream sem recorrer aos registros demonstrativos.
- `src/lib/server-api.ts` centraliza o acesso ao NestJS. `session-server.ts` valida a sessão com `/auth/me`. O BFF mantém o JWT em cookie HttpOnly e valida origem e papel nas operações protegidas.
- `ApiCartStore.tsx` sincroniza as mutações e o subtotal com a API para clientes autenticados. O carrinho de demonstração não é importado após login. A API não oferece um merge atômico e idempotente para carrinhos de visitante.

Consulte o [mapa da API](../docs/FRONTEND_API_MAP.md) e o [acompanhamento da integração](../docs/FRONTEND_PROGRESS.md).
