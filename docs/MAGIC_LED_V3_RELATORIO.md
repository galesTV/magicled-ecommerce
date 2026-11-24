# Magic LED V3 — Experience & Motion

## Mudanças entregues

- Home, header e vitrines remodelados com tipografia ampla, superfícies claras, acentos luminosos e fotografia editorial local. O hero leva ao catálogo e ao refletor RGB em destaque.
- Sistema de movimento em CSS, com entradas de 400–850 ms, transições de 160–280 ms e efeitos de ponteiro limitados a dispositivos com mouse. IntersectionObserver anima seções na primeira entrada. Hero com profundidade de baixa amplitude, superfície editorial com inclinação de até 3,5°, elevação discreta nos cards e feedback no contador do carrinho. A preferência de movimento reduzido é respeitada e as informações da vitrine são renderizadas no HTML inicial.
- Header fixo, abertura de menu desktop e mobile, busca com sugestões navegáveis por teclado, estado vazio e filtros por categoria, texto e preço. Fichas têm especificações, preço de referência, galeria, modal de ampliação e produtos relacionados. A galeria permite miniaturas, setas e gesto horizontal quando a ficha recebe uma segunda foto autorizada.
- Footer com navegação local e canais confirmados. As rotas institucionais antigas redirecionam internamente para as novas. Os únicos destinos externos na navegação ativa são WhatsApp, Instagram e o e-mail autorizado.
- Carrinho local com quantidade, subtotal, confirmação e desfazer. Checkout apresenta apenas a revisão. Conta de demonstração tem visão geral, endereços fictícios, pedidos de exemplo e cartões de teste com preferência, remoção, confirmação, estado vazio e feedback.

## Catálogo e fontes

A consulta à vitrine Magic LED no Mercado Livre confirmou os 12 registros e seus valores de referência em 20/11/2026. A abertura direta da vitrine retornou HTTP 403 neste ambiente, com conteúdo acessível pelo índice de busca. As URLs individuais, as fichas completas e a disponibilidade comercial permanecem pendentes. Os valores correspondem à consulta e podem variar por canal ou promoção. [Vitrine Magic LED no Mercado Livre](https://www.mercadolivre.com.br/pagina/magicled)

As referências de fabricantes e de terceiros foram usadas para comparar linhas e variantes. As capturas fornecidas pela equipe serviram de referência para as imagens da prévia. A dimensão na tabela corresponde à área útil de cada recorte original. [Documento de referências da equipe](MAGIC_LED_REFERENCIAS_FOTOS_CODEX.md), [Iluctron 80 mm 18 W](https://www.iluctron.com.br/produtos/luminaria-para-piscina-80mm-18w/), [Iluctron Deck Inox](https://www.iluctron.com.br/produtos/deck-inox/), [Iluctron Spot com Base](https://www.iluctron.com.br/produtos/spot-led-com-base/)

| Produto | Preço de referência | Documento da equipe | Referência da foto |
| --- | ---: | --- | --- |
| Kit 6 luminárias espeto para jardim | R$ 322,43 | ML-07 descreve a unidade separada | Recorte de 184 px do kit preto de seis peças. |
| Refletor LED RGB para piscina | R$ 73,00 | ML-01 | Recorte de 185 px da peça com aro azul, 125 mm e 9 W. A referência externa é de corpo branco. |
| Abajur LED Touch recarregável | R$ 69,20 | Briefing | Variante branca ilustrada com base no formato do abajur azul da captura. |
| Kit 6 balizadores LED para piso e deck | R$ 446,10 | Briefing | Seis peças ilustradas com base no balizador prateado de 12 W da captura. |
| Giroled automotivo vermelho | R$ 74,09 | Briefing | Recorte de 185 px do modelo vermelho anunciado como bivolt. |
| Refletor LED azul para piscina | R$ 67,80 | ML-02 | Recorte de 238 px da peça de 80 mm e 18 W. A imagem de fabricante é de outra configuração de corpo. |
| Mini abajur infantil LED USB | R$ 59,90 | Briefing | Variante rosa isolada a partir da referência promocional com três cores. |
| Spot Deck Inox LED | R$ 71,15 | ML-03 | Recorte de 154 px da ficha de 8 W, com a marcação da antiga vitrine fora do enquadramento. |
| Giroled automotivo âmbar | R$ 75,87 | ML-04 | Recorte de 185 px da captura da variante 10 W 12/24 V. |
| Sinalizador de garagem LED Slim | R$ 128,09 | ML-05 | Recorte de 185 px do Slim da captura. Versão sonora e código de fabricante ainda pendentes. |
| Refletor Spot Base para jardim | R$ 149,90 | ML-06 | Recorte de 184 px do spot de base branco da captura. Confirmação da alimentação pendente por descrição ambígua na vitrine. |
| Espeto LED para jardim 8 W | R$ 54,00 | ML-07 | Unidade verde-escura ilustrada a partir do espeto verde da captura. |

O ImageGen restaurou oito imagens a partir dos recortes e gerou quatro novas ilustrações usando as referências e as fichas do catálogo. A galeria identifica cada tratamento. Os arquivos têm 1200 × 1200 px e são servidos em tamanhos adequados aos cards e à ampliação. [Imagens dos produtos](../frontend/public/produtos/)

<details>
<summary>Prompts de restauração dos produtos</summary>

Cada recorte foi enviado com este prompt e a instrução correspondente ao produto.

> Use a imagem de referência como alvo de restauração. Refaça a mesma fotografia de produto em alta resolução quadrada, com foco limpo no produto, bordas naturais, texturas realistas, controle de ruído e luz de catálogo. Preserve o enquadramento, o ângulo, o ambiente, as cores, as proporções e cada componente visível do objeto. Não invente acessórios, inscrições, novas peças ou LEDs. Mantenha identificações existentes apenas se estiverem legíveis. Sem moldura, textos sobrepostos ou marca-d'água.

- `kit-6-luminarias-espeto-jardim` — Preserve exatamente seis espetos pretos, em duas fileiras de três, no gramado iluminado à noite. Mantenha a posição de cada luminária e a luz branco-quente.
- `refletor-led-rgb-piscina-125-mm` — Preserve o aro azul grosso, o disco branco recuado, a disposição dos pequenos LEDs cinza e a borda de piscina. Não troque pelo modelo de aro branco.
- `giroled-automotivo-vermelho` — Preserve o domo vermelho arredondado translúcido, as fileiras internas verticais, a base circular preta e o fundo de estúdio cinza. O produto permanece inteiro e centralizado.
- `refletor-led-azul-piscina-80-mm` — Preserve o refletor branco circular, com face branca e pequenos LEDs quadrados na disposição visível, junto à água azul da piscina.
- `spot-deck-inox-led-8-w` — Preserve o spot baixo de inox escovado, disco central de luz quente, posições de fixação visíveis e deck de madeira. Destaque os detalhes do aço sem adicionar parafusos.
- `giroled-automotivo-ambar` — Preserve o domo âmbar translúcido, as colunas verticais de LEDs, a base circular preta e o cenário de acesso veicular noturno. Deixe o pequeno rótulo prateado discreto sem inventar letras nele.
- `sinalizador-garagem-led-slim` — Preserve o sinalizador horizontal em perspectiva no piso da garagem, extremidade esquerda vermelha, extremidade direita âmbar, carcaça prateada com pontas pretas, e o texto central original escrito exatamente “CUIDADO VEÍCULOS”.
- `spot-base-jardim-12-w-branco` — Preserve o spot branco com face circular inclinada, LEDs branco-quentes, suporte branco em U e base redonda sobre a madeira, com jardim ao fundo.

</details>

<details>
<summary>Prompts das quatro novas ilustrações</summary>

Cada recorte foi enviado com este prompt e a instrução correspondente ao produto.

> Crie uma única fotografia ilustrativa quadrada, fotorrealista e nítida para a prévia de um catálogo brasileiro de iluminação LED. A imagem enviada é referência visual para a forma do produto. Use enquadramento de catálogo, produto inteiro, plástico ou metal com textura realista, foco no produto e ambiente discretamente desfocado. Preencha o quadro de ponta a ponta com a cena. Sem texto, logotipos, marcas-d’água, embalagens ou molduras.

- `abajur-led-touch-recarregavel-branco` — Um único abajur LED touch recarregável compacto na variante BRANCO FOSCO. Mantenha o formato da referência: cúpula redonda e achatada com aro de luz difusa na borda inferior, haste vertical fina e base redonda baixa com ranhuras verticais. O corpo inteiro é branco, incluindo haste, cúpula e base. Acenda apenas a luz branco-quente sob a cúpula. Mostre em três quartos sobre mesa de madeira clara, com decoração residencial neutra ao fundo e espaço em torno da peça inteira. Sem celular, cabo, ilustrações na cúpula ou luzes extras.
- `kit-6-balizadores-led-piso-deck` — Kit com EXATAMENTE SEIS balizadores de LED embutidos e nivelados com um deck de madeira ao anoitecer. Use o balizador redondo prateado em inox escovado da referência como modelo para todas as seis unidades. Cada uma tem um único disco difusor central aceso em branco-quente. Organize as seis peças idênticas em duas fileiras paralelas de três, todas inteiras, com espaço regular entre elas e nenhuma cortada. Use câmera em três quartos levemente elevada para tornar a contagem inequívoca. Deck e folhagem discreta ao fundo. Só há seis balizadores visíveis no quadro.
- `mini-abajur-infantil-usb-rosa` — Um único mini abajur infantil USB cor ROSA, da variante rosa da referência. Reproduza a pequena peça retangular horizontal de cantos arredondados montada sobre uma placa branca de tomada de parede, com uma abertura USB vertical à esquerda, a tomada de três furos ao centro e um pequeno comando à direita, como aparece na referência. O corpo da peça é rosa suave e uma faixa difusora na borda de baixo lança luz branco-quente para baixo. Enquadramento de perto em três quartos, com parede rosa suave de quarto infantil e ambiente discretamente desfocado. Sem pessoas e sem cabos. Mostre somente uma unidade, sem painel promocional e sem variações de cor.
- `espeto-led-jardim-8-w-verde` — Um único spot LED de espeto para jardim, verde-escuro, na linha de 8 W. Preserve o formato da referência: cabeça circular inclinada de metal verde-floresta, lente frontal com pequenos pontos de LED branco-quente visíveis e espeto verde-escuro alinhado e fincado no solo. Mostre desde a cabeça até o ponto em que o espeto entra na terra. Jardim ao anoitecer, folhas e algumas pedras naturais próximas, fundo residencial desfocado. Apenas um refletor em destaque, sem kit, pedestal ou fonte de energia aparente.

</details>

### Imagens editoriais

As composições de ambiente foram geradas com ImageGen. As versões WebP abaixo foram exportadas a partir dos originais para a prévia.

- Capa da home, 1536 × 1024 px. [Piscina ao anoitecer](../frontend/public/v3/piscina-ao-anoitecer-hd.webp)
- Seção «O jardim ganha vida à noite», 1536 × 1024 px. [Jardim com luz quente](../frontend/public/v3/jardim-luz-quente-hd.webp)
- Página «Quem somos», 1360 × 907 px. [Jardim ao anoitecer](../frontend/public/v3/jardim-ao-anoitecer-hd.webp)

<details>
<summary>Prompts enviados ao ImageGen</summary>

**Piscina**

```text
Use case: photorealistic-natural. Produce a single wide 3:2 architectural editorial photograph as a website hero for a Brazilian lighting brand. A contemporary Brazilian house and a tranquil geometric swimming pool at blue hour. Deep violet and muted indigo sky, clean dark stone pool deck, lush tropical foliage warmed by concealed amber garden lighting, luminous pale lavender and soft cyan reflecting subtly in the water. Strong composition, view from the near pool corner, water leads to the right, focal house and dramatically lit foliage on the right, keep left third simple and dark deep plum so website text can overlay on desktop. Premium real architectural photography, realistic full-frame camera, tactile natural textures, restrained cinematic color grade. Lighting effect is the subject, no recognizable fixture or product packaging. No people, text, logos, watermarks, neon beams or interface graphics.
```

**Jardim**

```text
Use case: photorealistic-natural. Single premium architectural editorial photograph for Magic LED's Brazilian exterior lighting category. Horizontal 3:2 photograph of a path of large natural stone slabs through a lush tropical Brazilian courtyard garden at dusk, low warm amber pools of light on foliage and path at varied distances, a modern dark stucco wall on one side. Rich fern and philodendron textures, subtle lavender dusk in the deepest shadows. Balanced, slightly off-center framing with depth, restrained realistic lighting, art-directed architectural photography. No people, text, logo, watermarks, visible recognizable fixtures or product depictions.
```

**Jardim com luz quente**

```text
Fotografia editorial horizontal de um jardim residencial tropical à noite. Enquadramento baixo, com folhas largas em primeiro plano, um pequeno refletor de espeto discreto e fachos de LED branco-quente iluminando samambaias e a textura de um muro de pedra escura. Composição intimista, realista, ponto de interesse perto do centro para recorte responsivo. Sem caminho de pedra, piscina, pessoas, texto ou logotipos.
```

</details>

## Institucional e canais

Páginas disponíveis em `/quem-somos`, `/contato`, `/prazos-e-envios`, `/pagamentos`, `/garantia-trocas-e-devolucoes`, `/politica-de-privacidade` e `/termos-de-uso`. A antiga navegação para páginas comerciais ou institucionais em `magicled.com.br` foi substituída por links locais.

A equipe confirmou WhatsApp (11) 99833-3720, Instagram @magicledbr, e-mail ledshoppingdistribuidora@gmail.com, CNPJ 39.236.613/0001-68 e atendimento de segunda a sexta, das 8h às 17h no horário de Brasília. Modalidades de frete, prazos, política de garantia, privacidade, termos comerciais e meios de pagamento exigem validação antes de uma operação comercial.

## Arquitetura e integração

Em modo API, o Next.js lê o catálogo do NestJS e usa os IDs do PostgreSQL para produtos, carrinho, endereços e pedidos. O BFF guarda a sessão em cookie HttpOnly. O catálogo de prévia continua disponível em modo explícito e usa as imagens ilustrativas documentadas acima.

Para pagamento, substitua o adaptador de exemplos por um provedor que entregue resumos de métodos tokenizados. Integre a cobrança e a confirmação via Mercado Pago somente na fase correspondente. O futuro fluxo de pedidos deve recalcular valores e estoque no servidor e reconciliar a confirmação de pagamento. O cálculo de frete fica para a fase de logística.

Um processo de desenvolvimento pode usar `NEXT_PUBLIC_DATA_MODE=demo`. Um build de prévia exige também `NEXT_PUBLIC_MAGICLED_PREVIEW=true` na compilação. O checkout apresenta uma revisão do carrinho nos dois modos. Na demonstração isolada, o navegador guarda itens e quantidades do carrinho e os cartões fictícios ficam em memória.

## Validação e capturas

- Build otimizado e checagem TypeScript aprovados. Um build comum com a flag de autorização desativada manteve catálogo, pedidos e cartões demonstrativos indisponíveis. O checkout continuou em modo de revisão.
- Nove testes Playwright aprovados em Chromium. A suíte conferiu movimento, menus, busca por teclado, filtros, ampliação, persistência e desfazer no carrinho, cartões fictícios, navegação institucional e HTML legível com JavaScript desativado. O backend configurado apontou para uma porta local indisponível durante a validação.
- Oito rotas verificadas a 320, 375, 390, 768, 1024, 1440 e 1920 px, totalizando 56 combinações. As verificações axe em seis rotas e nas sugestões abertas passaram nas regras WCAG selecionadas. A inspeção visual cobriu 18 capturas de home, catálogo, produto, carrinho, checkout, Quem somos, contato e formas de pagamento.
- A integração real com NestJS, Prisma e PostgreSQL foi validada depois da prévia. As capturas podem ser reproduzidas localmente com `V3_CAPTURE=true` e `V3_CAPTURE_DIR`. [Resumo da validação](FRONTEND_PROGRESS.md)

Os comandos para reproduzir a validação ficam no [guia do frontend V3](../frontend/README-V3.md).

## Pendências

O catálogo integrado aguarda fotos oficiais por variante. A revisão dos anúncios e das minutas com as áreas responsáveis é parte da preparação comercial.
