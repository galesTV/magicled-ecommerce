# Inventário da API para o frontend

O mapa foi elaborado a partir dos controllers, services, DTOs e `schema.prisma` da branch `dev` no commit `31f334a`. Os fluxos expostos na V3 foram depois verificados com NestJS, Prisma e PostgreSQL 16 em um ambiente local isolado. O Swagger fica em `http://localhost:3000/api/docs` na configuração padrão. [Resumo da validação](FRONTEND_PROGRESS.md)

## Formato e sessão

- Porta: `PORT` ou 3000. Não há prefixo global. CORS aberto via `app.enableCors()`.
- Sucesso: `{ "success": true, "data": T }`. Erro: `{ statusCode, timestamp, path, message, error? }`, onde `message` pode ser texto ou lista.
- JWT Bearer. `POST /auth/register` e `POST /auth/login` retornam `{ accessToken, usuario: { id, email, tipoUsuario } }`. `GET /auth/me` retorna `{ id, email, tipoUsuario, nome }`.
- `RegisterDto`: `nome`, `email`, `senha` (mínimo 6), `cpf` (texto não vazio). `LoginDto`: `email`, `senha`.
- O frontend usa uma camada Next.js para guardar o JWT em cookie HttpOnly, encaminhando apenas rotas autorizadas à API. Isso não substitui a autorização do NestJS.

## Uso na V3 integrada

O modo padrão `api` usa `BACKEND_API_URL` somente no servidor. Catálogo usa GET de produtos e categorias e detalhe por ID. Busca, faixa de preço e ordenação operam sobre os dados retornados. Links em modo API usam IDs inteiros e valores `Decimal` são convertidos para centavos na apresentação.

- **Sessão.** O BFF Next encaminha cadastro, login e consulta de sessão ao NestJS. Logout apaga o cookie da V3. O cookie usa HttpOnly, SameSite Lax e Secure em produção. Mutações exigem origem da aplicação. As páginas privadas validam sessão e papel no servidor com `GET /auth/me`.
- **Cliente.** O BFF oferece carrinho, endereços e pedidos. A conta liga listagem e criação de endereços e consulta lista e detalhe de pedidos. Edição e remoção de endereço dependem de contrato novo.
- **Admin.** O painel valida papel no servidor e mostra categorias e produtos ativos. Listagem administrativa de pedidos e ações de escrita ficam indisponíveis.
- **Compra.** O checkout V3 revisa o subtotal dos produtos que veio do carrinho. O modo API bloqueia pelo BFF a criação de pedidos, alteração de status, frete e pagamentos. O modo legado continua explícito para o histórico de testes, sem uso pelas páginas V3.
- **Evidência.** A suíte `test:e2e:api-fixture` verifica os contratos HTTP com um servidor local controlado. NestJS, PostgreSQL e o gateway não participaram dessa suíte.

## Rotas disponíveis

| Método e rota | Entrada | Saída relevante | Acesso |
|---|---|---|---|
| `GET /categories` | — | `Categoria[]` com `_count.produtos` | público |
| `GET /categories/:id` | id numérico | `Categoria` | público |
| `POST /categories` | `{ nome }` | `Categoria` | JWT; **sem AdminGuard** |
| `GET /products` | `categoriaId?` | produtos ativos com `categoria` | público |
| `GET /products/:id` | id numérico | produto com `categoria`; pode estar inativo | público |
| `POST /products` | `{ categoriaId, nome, descricao?, especificacaoTecnica?, preco, estoque, imagemUrl?, status? }` | `Produto` | JWT; **sem AdminGuard** |
| `GET /cart` | — | carrinho e `valorTotal` numérico | cliente JWT |
| `POST /cart/items` | `{ produtoId, quantidade }` | carrinho atualizado | cliente JWT |
| `PATCH /cart/items/:id` | `{ quantidade }` | carrinho atualizado | cliente JWT |
| `DELETE /cart/items/:id` | — | carrinho atualizado | cliente JWT |
| `DELETE /cart` | — | carrinho vazio | cliente JWT |
| `GET /addresses` | — | endereços do cliente | cliente JWT |
| `POST /addresses` | `{ cep, logradouro, numero, complemento?, bairro, cidade, estado }` | endereço criado | cliente JWT |
| `POST /orders/checkout` | `{ enderecoId, metodoPagamento }` | pedido com itens, endereço e pagamento | cliente JWT |
| `GET /orders` | — | pedidos do cliente | cliente JWT |
| `GET /orders/:id` | id | pedido pertencente ao cliente | cliente JWT |
| `PATCH /orders/:id/status` | `{ status, codigoRastreio? }` | pedido atualizado | JWT + AdminGuard |
| `POST /payments/process` | `{ pedidoId, metodo }` | Pix real **ou simulado**; demais métodos pendentes | cliente JWT |
| `POST /payments/webhook/simulate-approval/:pedidoId` | id | aprova pagamento artificialmente | JWT; inseguro e excluído do frontend |
| `POST /shipping/calculate` | `{ cepDestino }` | valores regionais simulados | público; **RF07 fora do escopo** |

## Dados e limitações

- `Produto`: `id`, `categoriaId`, `nome`, `descricao?`, `especificacaoTecnica?`, `preco` (Decimal JSON), `estoque`, `imagemUrl?`, `status`, `categoria` nas leituras. Apenas uma URL de imagem; sem galeria. Não há marca, data de cadastro de produto, vendas agregadas ou parcelamento.
- `StatusPedido`: `PENDENTE`, `PAGO`, `EM_TRANSPORTE`, `ENTREGUE`, `CANCELADO`. `MetodoPagamento`: `PIX`, `BOLETO`, `CARTAO_CREDITO`. `StatusPagamento`: `PENDENTE`, `APROVADO`, `RECUSADO`, `ESTORNADO`.
- Busca por texto, preço e ordenação são locais sobre o conjunto carregado por `GET /products`. Sem paginação na API.
- Não existem endpoints de recuperação de senha; atualização/exclusão de perfil, endereço, categoria ou produto; lista administrativa de pedidos/usuários; políticas institucionais; verificação de pagamento ou webhook real.
- O pedido soma apenas itens; frete não integra o total. RF07 foi adiado. O frontend não apresenta `valorTotal` como total final da compra com entrega.
- `POST /payments/process` pode retornar um Pix sintético em falha do Mercado Pago ou ausência de token; boleto/cartão não geram cobrança. Sem endpoint confiável para conciliação, o frontend não exibe confirmação de pagamento.

## Erros observáveis pelo código

- 400: DTO inválido, carrinho vazio ou estoque insuficiente.
- 401: JWT ausente/expirado ou credenciais inválidas.
- 403: operação administrativa protegida.
- 404: produto/categoria/endereço/pedido/item inexistente ou não pertencente ao cliente.
- 409: e-mail já cadastrado.

Consultar `BACKEND_GAPS.md` antes de liberar checkout ou administração para produção.
