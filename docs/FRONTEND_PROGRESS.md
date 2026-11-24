# Acompanhamento da integração V3

A V3 foi validada com o NestJS da `dev` em `31f334a`, Prisma e PostgreSQL 16. O banco de testes rodou em um volume Docker exclusivo e foi acessado pela porta `55432` no loopback. As duas migrations versionadas foram aplicadas nesse ambiente. Os testes usaram dados fictícios e os pedidos ficaram com pagamento pendente.

| Área | Resultado com API real |
| --- | --- |
| Catálogo | Listagem, categorias, busca, ordenação, preços, disponibilidade e detalhe. A interface informa falhas de catálogo e usa uma alternativa visual para imagens ausentes. |
| Conta e sessão | Cadastro, login, logout, cookie HttpOnly, proteção de rotas e retorno ao destino solicitado. |
| Carrinho e endereços | Inclusão, quantidade, remoção, subtotal e revisão do carrinho. Cadastro, persistência e isolamento de endereços entre clientes. |
| Pedidos | Pedido de teste criado pela API local. O cliente consultou seu histórico e detalhe na V3. Outro cliente não pôde acessar o pedido. |
| Administração | Administrador autenticado visualizou o catálogo. Cliente comum teve o acesso bloqueado. |

A revisão final executou seis cenários funcionais com API real, oito testes de contrato HTTP com fixture e nove testes de prévia V3 com capturas. A matriz em Chromium cobriu 320, 375, 390, 768, 1024, 1440 e 1920 px. As 66 verificações Axe da rodada final não detectaram violações nas regras selecionadas.

O checkout da V3 permite revisar os itens. Criação de pedido pela interface, frete, cobrança, cartão salvo, recuperação de senha e mutações administrativas estão indisponíveis. A vinculação das fotos aos registros do catálogo integrado é uma etapa posterior.

[Guia de execução](../frontend/README-V3.md) · [Mapa da API](FRONTEND_API_MAP.md) · [Lacunas comerciais e de autorização](BACKEND_GAPS.md)
