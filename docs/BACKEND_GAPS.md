# Lacunas do backend e riscos de integração

Auditoria somente leitura do commit `31f334a`. Nenhum arquivo do backend, migration, seed ou banco foi alterado.

| Gravidade | Ponto verificado | Efeito no frontend |
|---|---|---|
| Crítica | `POST /products` e `POST /categories` exigem JWT, mas não `AdminGuard`. | Cadastro administrativo não será exposto como operação segura. |
| Crítica | `POST /payments/webhook/simulate-approval/:pedidoId` aceita qualquer JWT e não confere dono/admin. | Rota jamais consumida pelo frontend; deve ser removida ou bloqueada antes de produção. |
| Alta | Pix usa Mercado Pago somente com token; qualquer erro retorna Pix falso. Não existe discriminador confiável no contrato. | Não exibir QR/código recebido como cobrança real sem correção do backend. |
| Alta | Não existe webhook real, consulta de status do provedor ou conciliação. | Página de retorno não pode atestar pagamento por conta própria. |
| Alta | `PATCH /orders/:id/status` permite ao administrador definir `PAGO` sem conciliação financeira. | A camada do frontend bloqueia esse valor; o backend precisa restringi-lo antes de produção. |
| Alta | Checkout debita estoque, limpa carrinho e cria pedido, mas soma somente itens, sem frete. | Compra fica restrita a ambiente de desenvolvimento; valor exibido é subtotal dos produtos. RF07 permanece adiado. |
| Alta | `JWT_SECRET` tem fallback conhecido no código. | Não usar chave padrão em qualquer ambiente compartilhado. |
| Média | CORS está aberto sem allowlist. | Restringir na implantação. |
| Média | Seed apaga todas as tabelas e recria dados e credencial de teste. | Seed não foi executado; imagens Unsplash do seed não são fotografias verificadas dos produtos. |
| Média | Não há edição/exclusão de produtos, perfil, categorias, endereços, usuários; recuperação de senha; políticas; lista administrativa de pedidos. | Interfaces indicam indisponibilidade real, sem botões falsos. |
| Média | `GET /products/:id` não filtra `status`; listas filtram. | Frontend não permite compra de produto inativo e deve evitar indexá-lo. |
| Baixa | API não pagina catálogo e não traz marca/data/vendas. | Busca, preço e nome podem ser filtrados localmente; demais critérios ficam pendentes. |

## Decisões necessárias de backend antes de operação comercial

1. Proteger todas as mutações administrativas no servidor.
2. Remover ou isolar a simulação de aprovação de pagamento.
3. Fazer `payments/process` diferenciar cobrança real, erro e simulação; implantar webhook e consulta de status do pagamento.
4. Definir a política de entrega e valor final do pedido, mesmo com RF07 fora desta fase.
5. Disponibilizar ambiente de teste identificado e credenciais de teste para validação ponta a ponta.
