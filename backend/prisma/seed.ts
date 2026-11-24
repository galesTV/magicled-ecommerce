import { PrismaClient, TipoUsuario } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Carrega as variáveis de ambiente do .env
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL não configurada no arquivo .env');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando o seeding do banco de dados...');

  // 1. Limpar dados antigos na ordem das FKs
  await prisma.itemPedido.deleteMany();
  await prisma.itemCarrinho.deleteMany();
  await prisma.pagamento.deleteMany();
  await prisma.frete.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.endereco.deleteMany();
  await prisma.carrinho.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.administrador.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.usuario.deleteMany();

  // 2. Criar Usuário Admin de Teste
  const senhaHash = await bcrypt.hash('admin123', 10);

  const adminUsuario = await prisma.usuario.create({
    data: {
      nome: 'Admin Magic LED',
      email: 'admin@magicled.com',
      senhaHash,
      tipoUsuario: TipoUsuario.ADMIN,
      admin: {
        create: {
          nivelAcesso: 'SUPER_ADMIN',
        },
      },
    },
  });

  console.log(
    `✅ Usuário Admin criado: ${adminUsuario.email} (Senha: admin123)`,
  );

  // 3. Criar Categorias
  const catFitas = await prisma.categoria.create({
    data: { nome: 'Fitas LED' },
  });

  const catLampadas = await prisma.categoria.create({
    data: { nome: 'Lâmpadas Inteligentes' },
  });

  const catPerfis = await prisma.categoria.create({
    data: { nome: 'Perfis de Alumínio' },
  });

  const catAcessorios = await prisma.categoria.create({
    data: { nome: 'Controladores & Fontes' },
  });

  console.log('✅ Categorias criadas com sucesso!');

  // 4. Criar Produtos com URLs de Imagens
  const produtos = [
    {
      categoriaId: catFitas.id,
      nome: 'Fita LED RGBWW Neon Flex 5M Wi-Fi',
      descricao:
        'Fita LED Neon flexível com controle via app Smart Life e sincronização musical.',
      especificacaoTecnica:
        'Tensão: 12V | Proteção: IP67 | LEDs/m: 120 | Cor: RGB + Branco Quente',
      preco: 149.9,
      estoque: 40,
      imagemUrl:
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    },
    {
      categoriaId: catFitas.id,
      nome: 'Fita LED COB Ultra Densa 5M 24V',
      descricao:
        'Fita LED contínua sem pontos visíveis, ideal para iluminação indireta de alta qualidade.',
      especificacaoTecnica:
        'Tensão: 24V | Proteção: IP20 | 480 LEDs/m | Temp. Cor: 3000K',
      preco: 189.0,
      estoque: 25,
      imagemUrl:
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
    },
    {
      categoriaId: catLampadas.id,
      nome: 'Lâmpada Dicroica GU10 Smart Wi-Fi 4.5W',
      descricao:
        'Lâmpada inteligente spot direcionável com 16 milhões de cores e controle de intensidade.',
      especificacaoTecnica:
        'Soquete: GU10 | Potência: 4.5W | Fluxo Luminoso: 350lm | Conexão: Wi-Fi 2.4GHz',
      preco: 49.9,
      estoque: 100,
      imagemUrl:
        'https://images.unsplash.com/photo-1507499739999-097706ad8914?w=800&q=80',
    },
    {
      categoriaId: catPerfis.id,
      nome: 'Perfil de Alumínio Sobrepor Slim 2m',
      descricao:
        'Perfil slim para acabamento sofisticado em sancas e marcenaria com difusor leitoso.',
      especificacaoTecnica:
        'Comprimento: 2 metros | Largura: 17mm | Material: Alumínio Anodizado',
      preco: 59.9,
      estoque: 60,
      imagemUrl:
        'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
    },
    {
      categoriaId: catAcessorios.id,
      nome: 'Fonte Chaveada Colmeia 12V 10A 120W',
      descricao:
        'Fonte estabilizada de alta eficiência para alimentação de fitas e módulos LED.',
      especificacaoTecnica:
        'Entrada: 110/220V Bivolt | Saída: 12V DC 10A | Potência: 120W',
      preco: 79.9,
      estoque: 50,
      imagemUrl:
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    },
  ];

  for (const produto of produtos) {
    await prisma.produto.create({ data: produto });
  }

  console.log(`✅ ${produtos.length} produtos de teste inseridos com sucesso!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
