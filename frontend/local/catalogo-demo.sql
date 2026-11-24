-- Catálogo de backend/prisma/seed.ts em 31f334a. As imagens genéricas do seed foram omitidas.
BEGIN;

DO $$
BEGIN
  IF current_database() <> 'magicled_v3_demo' OR (
    SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = current_database()
  ) IS DISTINCT FROM 'magicled-v3-dev:demo' THEN
    RAISE EXCEPTION 'A carga é exclusiva do banco local de apresentação da Magic LED.';
  END IF;
END;
$$;

LOCK TABLE categorias, produtos IN SHARE ROW EXCLUSIVE MODE;

INSERT INTO categorias (nome)
SELECT catalogo.nome
FROM (VALUES
  ('Fitas LED'),
  ('Lâmpadas Inteligentes'),
  ('Perfis de Alumínio'),
  ('Controladores & Fontes')
) AS catalogo(nome)
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = catalogo.nome);

INSERT INTO produtos (categoria_id, nome, descricao, especificacao_tecnica, preco, estoque)
SELECT c.id, catalogo.nome, catalogo.descricao, catalogo.especificacao, catalogo.preco, catalogo.estoque
FROM (VALUES
  ('Fitas LED', 'Fita LED RGBWW Neon Flex 5M Wi-Fi',
   'Fita LED Neon flexível com controle via app Smart Life e sincronização musical.',
   'Tensão: 12V | Proteção: IP67 | LEDs/m: 120 | Cor: RGB + Branco Quente', 149.90, 40),
  ('Fitas LED', 'Fita LED COB Ultra Densa 5M 24V',
   'Fita LED contínua sem pontos visíveis, ideal para iluminação indireta de alta qualidade.',
   'Tensão: 24V | Proteção: IP20 | 480 LEDs/m | Temp. Cor: 3000K', 189.00, 25),
  ('Lâmpadas Inteligentes', 'Lâmpada Dicroica GU10 Smart Wi-Fi 4.5W',
   'Lâmpada inteligente spot direcionável com 16 milhões de cores e controle de intensidade.',
   'Soquete: GU10 | Potência: 4.5W | Fluxo Luminoso: 350lm | Conexão: Wi-Fi 2.4GHz', 49.90, 100),
  ('Perfis de Alumínio', 'Perfil de Alumínio Sobrepor Slim 2m',
   'Perfil slim para acabamento sofisticado em sancas e marcenaria com difusor leitoso.',
   'Comprimento: 2 metros | Largura: 17mm | Material: Alumínio Anodizado', 59.90, 60),
  ('Controladores & Fontes', 'Fonte Chaveada Colmeia 12V 10A 120W',
   'Fonte estabilizada de alta eficiência para alimentação de fitas e módulos LED.',
   'Entrada: 110/220V Bivolt | Saída: 12V DC 10A | Potência: 120W', 79.90, 50)
) AS catalogo(categoria, nome, descricao, especificacao, preco, estoque)
JOIN categorias c ON c.nome = catalogo.categoria
WHERE NOT EXISTS (
  SELECT 1 FROM produtos WHERE categoria_id = c.id AND nome = catalogo.nome
);

COMMIT;
