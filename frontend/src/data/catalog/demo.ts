import type { CatalogCategory, CatalogImage, CatalogProduct } from './types';

export const catalogCategories: readonly CatalogCategory[] = [
  { slug: 'piscinas', name: 'Piscinas' },
  { slug: 'jardins', name: 'Jardins' },
  { slug: 'casa-e-decoracao', name: 'Casa e decoração' },
  { slug: 'piso-e-deck', name: 'Piso e deck' },
  { slug: 'infantil', name: 'Infantil' },
  { slug: 'sinalizacao', name: 'Sinalização' },
];

const source = {
  storefrontUrl: 'https://www.mercadolivre.com.br/pagina/magicled',
  checkedOn: '2026-11-20',
};

function productPhoto(
  slug: string,
  alt: string,
  aiTreatment: CatalogImage['aiTreatment'] = 'restored',
): CatalogImage {
  return { src: '/produtos/' + slug + '.webp', alt, width: 1200, height: 1200, aiTreatment };
}

type ProductRecord = Omit<CatalogProduct, 'source' | 'dataAvailability'>;

const products: readonly ProductRecord[] = [
  {
    id: 'ml-demo-01',
    slug: 'kit-6-luminarias-espeto-jardim',
    name: 'Kit 6 luminárias espeto para jardim',
    description:
      'Seis luminárias de espeto com luz branco-quente. Distribua pontos de luz pelo jardim para destacar plantas, caminhos e outros elementos da paisagem.',
    category: 'jardins',
    referencePriceCents: 32243,
    specifications: [
      ['Peças', '6'],
      ['Potência anunciada', '8 W por peça'],
      ['Alimentação anunciada', '12 V'],
      ['Proteção anunciada', 'IP65'],
      ['Luz', 'Branco-quente'],
      ['Acabamento', 'Preto'],
    ],
    images: [
      productPhoto(
        'kit-6-luminarias-espeto-jardim',
        'Seis luminárias de espeto pretas acesas em um jardim',
      ),
    ],
  },
  {
    id: 'ml-demo-02',
    slug: 'refletor-led-rgb-piscina-125-mm',
    name: 'Refletor LED RGB para piscina',
    description:
      'Refletor RGB para criar diferentes composições de cor em piscinas. A peça de 125 mm tem potência anunciada de 9 W.',
    category: 'piscinas',
    referencePriceCents: 7300,
    specifications: [
      ['Diâmetro', '125 mm'],
      ['Potência', '9 W'],
      ['Alimentação', '12 Vcc'],
      ['Conexão', 'Rosca 1/2 pol.'],
      ['Luz', 'RGB'],
    ],
    images: [
      productPhoto(
        'refletor-led-rgb-piscina-125-mm',
        'Refletor redondo com aro azul à beira de uma piscina',
      ),
    ],
  },
  {
    id: 'ml-demo-03',
    slug: 'abajur-led-touch-recarregavel-branco',
    name: 'Abajur LED Touch recarregável',
    description:
      'Luminária de mesa compacta com comando touch e três opções de tonalidade para compor diferentes espaços da casa.',
    category: 'casa-e-decoracao',
    referencePriceCents: 6920,
    specifications: [
      ['Comando', 'Touch'],
      ['Luz', 'Três tonalidades'],
      ['Conexões anunciadas', 'USB e USB-C'],
      ['Acabamento', 'Branco'],
    ],
    images: [
      productPhoto(
        'abajur-led-touch-recarregavel-branco',
        'Abajur branco aceso, com cúpula redonda e base frisada, sobre uma mesa',
        'generated',
      ),
    ],
  },
  {
    id: 'ml-demo-04',
    slug: 'kit-6-balizadores-led-piso-deck',
    name: 'Kit 6 balizadores LED para piso e deck',
    description:
      'Conjunto de balizadores embutidos para piso e deck, com acabamento prateado e luz branco-quente.',
    category: 'piso-e-deck',
    referencePriceCents: 44610,
    specifications: [
      ['Peças', '6'],
      ['Potência anunciada', '12 W'],
      ['Luz', 'Branco-quente'],
      ['Acabamento', 'Prateado'],
      ['Instalação', 'Embutida em piso ou deck'],
    ],
    images: [
      productPhoto(
        'kit-6-balizadores-led-piso-deck',
        'Seis balizadores redondos prateados com luz quente em um deck de madeira',
        'generated',
      ),
    ],
  },
  {
    id: 'ml-demo-05',
    slug: 'giroled-automotivo-vermelho',
    name: 'Giroled automotivo vermelho',
    description:
      'Sinalizador luminoso para aplicações automotivas compatíveis, com fixação por parafuso e cabo flexível.',
    category: 'sinalizacao',
    referencePriceCents: 7409,
    specifications: [
      ['Potência anunciada', '10 W'],
      ['Cor', 'Vermelho'],
      ['Fixação', 'Parafuso'],
      ['Cabo', 'Flexível'],
    ],
    images: [
      productPhoto('giroled-automotivo-vermelho', 'Sinalizador LED vermelho sobre base preta'),
    ],
  },
  {
    id: 'ml-demo-06',
    slug: 'refletor-led-azul-piscina-80-mm',
    name: 'Refletor LED azul para piscina',
    description: 'Refletor compacto de 80 mm para distribuir pontos de luz azul em piscinas.',
    category: 'piscinas',
    referencePriceCents: 6780,
    specifications: [
      ['Diâmetro', '80 mm'],
      ['Potência', '18 W'],
      ['Alimentação', '12 V'],
      ['Conexão', 'Rosca 1/2 pol.'],
      ['Luz', 'Azul'],
    ],
    images: [
      productPhoto(
        'refletor-led-azul-piscina-80-mm',
        'Refletor circular branco à beira de uma piscina iluminada em azul',
      ),
    ],
  },
  {
    id: 'ml-demo-07',
    slug: 'mini-abajur-infantil-usb-rosa',
    name: 'Mini abajur infantil LED USB',
    description:
      'Luminária noturna compacta para criar um ponto de luz decorativo em ambientes infantis.',
    category: 'infantil',
    referencePriceCents: 5990,
    specifications: [
      ['Tipo', 'Luminária noturna'],
      ['Conexão anunciada', 'USB'],
      ['Variante', 'Corpo rosa'],
      ['Luz', 'Rosa e branco-quente'],
    ],
    images: [
      productPhoto(
        'mini-abajur-infantil-usb-rosa',
        'Mini abajur rosa com entrada USB e luz quente, encaixado na tomada',
        'generated',
      ),
    ],
  },
  {
    id: 'ml-demo-08',
    slug: 'spot-deck-inox-led-8-w',
    name: 'Spot Deck Inox LED',
    description:
      'Spot com acabamento em inox e luz branco-quente para compor a iluminação de pisos e decks.',
    category: 'piso-e-deck',
    referencePriceCents: 7115,
    specifications: [
      ['Potência', '8 W'],
      ['Alimentação anunciada', 'Bivolt'],
      ['Abertura', '90°'],
      ['Temperatura de cor', '3000 K'],
      ['Acabamento', 'Inox prateado'],
    ],
    images: [
      productPhoto('spot-deck-inox-led-8-w', 'Spot embutido em inox aceso em um deck de madeira'),
    ],
  },
  {
    id: 'ml-demo-09',
    slug: 'giroled-automotivo-ambar',
    name: 'Giroled automotivo âmbar',
    description:
      'Sinalizador LED âmbar com fixação por parafusos para aplicações automotivas compatíveis.',
    category: 'sinalizacao',
    referencePriceCents: 7587,
    specifications: [
      ['Potência anunciada', '10 W'],
      ['Alimentação anunciada', '12/24 V'],
      ['Cor', 'Âmbar'],
      ['Fixação', 'Parafusos'],
    ],
    images: [productPhoto('giroled-automotivo-ambar', 'Sinalizador âmbar aceso, com base preta')],
  },
  {
    id: 'ml-demo-10',
    slug: 'sinalizador-garagem-led-slim',
    name: 'Sinalizador de garagem LED Slim',
    description: 'Sinalizador slim para orientar a entrada e a saída de veículos em garagens.',
    category: 'sinalizacao',
    referencePriceCents: 12809,
    specifications: [
      ['Modelo', 'Slim'],
      ['Alimentação anunciada', 'Bivolt'],
      ['Proteção anunciada', 'IP65'],
      ['Aplicação', 'Entrada e saída de veículos'],
    ],
    images: [
      productPhoto(
        'sinalizador-garagem-led-slim',
        'Sinalizador slim com extremidades iluminadas em um acesso veicular',
      ),
    ],
  },
  {
    id: 'ml-demo-11',
    slug: 'spot-base-jardim-12-w-branco',
    name: 'Refletor Spot Base para jardim',
    description:
      'Spot branco de base para destacar pontos específicos do jardim com luz branco-quente.',
    category: 'jardins',
    referencePriceCents: 14990,
    specifications: [
      ['Potência', '12 W'],
      ['Abertura', '45°'],
      ['Luz', 'Branco-quente'],
      ['Acabamento', 'Branco'],
      ['Montagem', 'Base'],
    ],
    images: [
      productPhoto(
        'spot-base-jardim-12-w-branco',
        'Refletor branco de base ao lado de uma área ajardinada',
      ),
    ],
  },
  {
    id: 'ml-demo-12',
    slug: 'espeto-led-jardim-8-w-verde',
    name: 'Espeto LED para jardim 8 W',
    description: 'Spot com espeto para criar um ponto de luz branco-quente no paisagismo.',
    category: 'jardins',
    referencePriceCents: 5400,
    specifications: [
      ['Potência anunciada', '8 W'],
      ['Alimentação anunciada', '12 V'],
      ['Luz', 'Branco-quente'],
      ['Cor', 'Verde-escuro'],
      ['Montagem', 'Espeto para solo'],
    ],
    images: [
      productPhoto(
        'espeto-led-jardim-8-w-verde',
        'Spot de espeto verde-escuro com luz quente, fincado no solo do jardim',
        'generated',
      ),
    ],
  },
];

export const demoCatalog: readonly CatalogProduct[] = products.map((product) => ({
  ...product,
  dataAvailability: 'storefront-verified',
  source,
}));
