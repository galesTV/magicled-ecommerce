import { demoEnabled } from '@/lib/data-mode';

export const contact = {
  email: 'ledshoppingdistribuidora@gmail.com',
  phoneDisplay: '(11) 99833-3720',
  whatsapp: 'https://wa.me/5511998333720',
  instagram: 'https://www.instagram.com/magicledbr/',
  instagramHandle: '@magicledbr',
  hours: 'Segunda a sexta, das 8h às 17h (horário de Brasília).',
  cnpj: '39.236.613/0001-68',
};

export interface EditorialPage {
  title: string;
  headline: string;
  intro: string;
  review?: string;
  sections?: ReadonlyArray<readonly [heading: string, content: string, id?: string]>;
}

export const institutionalPages: Record<string, EditorialPage> = {
  'quem-somos': {
    title: 'Quem somos',
    headline: 'A iluminação transforma espaços. A confiança transforma experiências.',
    intro:
      'Na Magic LED, acreditamos que uma boa iluminação faz diferença na maneira como vivemos, utilizamos e valorizamos cada ambiente.',
  },
  contato: {
    title: 'Contato',
    headline: 'Converse com a Magic LED.',
    intro: 'Fale com a nossa equipe sobre produtos, aplicações, pedidos ou suporte.',
  },
  'prazos-e-envios': {
    title: 'Prazos e envios',
    headline: 'Cuidado da preparação ao envio.',
    intro:
      'A Magic LED prepara cada pedido com atenção, da conferência à embalagem para transporte.',
    review:
      'As modalidades de envio e os prazos de transporte serão apresentados na operação comercial.',
    sections: [
      [
        'Preparação do pedido',
        'A preparação inclui separação, conferência e embalagem. Os prazos de postagem serão informados quando a operação comercial estiver disponível.',
      ],
      [
        'Prazo de entrega',
        'O prazo total depende da localidade, da disponibilidade do produto e da modalidade de transporte. O período de preparação e postagem é considerado separadamente do prazo de transporte.',
      ],
      [
        'Acompanhamento',
        'Quando a transportadora disponibilizar rastreamento, as informações deverão aparecer na área de pedidos.',
      ],
    ],
  },
  pagamentos: {
    title: 'Formas de pagamento',
    headline: 'Mais clareza para escolher como comprar.',
    intro:
      'As condições disponíveis em cada compra deverão ser apresentadas antes da confirmação do pedido.',
    review:
      'Cartão, Pix e boleto estão em revisão para o futuro checkout. Esta prévia tem pagamentos desativados.',
    sections: [
      [
        'Cartão de crédito',
        'Quando disponível, o checkout apresentará as opções de parcelamento e os eventuais juros informados pelo serviço de pagamento.',
      ],
      [
        'Pix',
        'Quando habilitado, o Pix será oferecido com suas condições na finalização da compra.',
      ],
      [
        'Boleto bancário',
        'Quando disponível, o checkout informará as regras e os prazos de compensação aplicáveis.',
      ],
      [
        'Segurança',
        'A operação comercial dependerá de um serviço de pagamento que processe os dados de cartão com segurança.',
      ],
    ],
  },
  'garantia-trocas-e-devolucoes': {
    title: 'Garantia, trocas e devoluções',
    headline: 'Informações claras em cada etapa da compra.',
    intro:
      'Encontre orientações sobre garantia, troca, devolução e situações relacionadas ao recebimento.',
    review: 'Política em revisão comercial e jurídica.',
    sections: [
      [
        'Garantia',
        'As condições aplicáveis consideram as informações do produto, a garantia do fabricante ou importador e as disposições legais correspondentes.',
        'garantia',
      ],
      [
        'Direito de arrependimento',
        'As compras pela internet estão sujeitas ao direito de arrependimento previsto na legislação de defesa do consumidor.',
        'trocas-e-devolucoes',
      ],
      [
        'Produto com defeito',
        'Entre em contato para receber orientações sobre análise e encaminhamento da solicitação.',
      ],
      [
        'Avarias no transporte',
        'Se a embalagem ou o produto apresentar sinais de avaria no recebimento, procure os canais de atendimento para receber orientações.',
      ],
    ],
  },
  'politica-de-privacidade': {
    title: 'Política de privacidade',
    headline: 'Como esta prévia usa dados.',
    intro:
      'Esta página descreve o funcionamento da prévia e os pontos que a Magic LED precisa validar antes de operar o novo canal de vendas.',
    review:
      'Minuta para revisão jurídica. A política comercial será atualizada antes do lançamento.',
    sections: [
      [
        'Identificação e canal de contato',
        'Magic LED, CNPJ ' +
          contact.cnpj +
          '. Questões sobre privacidade podem ser encaminhadas pelos canais de contato desta aplicação. A identificação do controlador e do canal para titulares será validada na versão comercial.',
      ],
      [
        'Dados coletados e finalidade',
        demoEnabled
          ? 'O carrinho desta prévia guarda os produtos selecionados e suas quantidades. A conta, os pedidos e os métodos de pagamento são exemplos fictícios.'
          : 'O ambiente integrado armazena no banco de testes o cadastro, os endereços, o carrinho e os pedidos associados à conta. Use apenas dados fictícios nesta demonstração.',
      ],
      [
        'Cookies e armazenamento local',
        demoEnabled
          ? 'O navegador guarda as quantidades do carrinho para restaurá-las na próxima visita. As alterações nos métodos de pagamento de exemplo ficam em memória durante a sessão.'
          : 'O navegador usa um cookie de sessão para manter o acesso à conta. O carrinho fica associado à conta no banco de testes.',
      ],
      [
        'Bases legais, retenção e compartilhamento',
        'A operação comercial precisa definir quais dados serão tratados, suas bases legais, prazos de retenção e os prestadores que terão acesso a esses dados. Os canais externos têm práticas de privacidade próprias.',
      ],
      [
        'Seus direitos, segurança e atualizações',
        'Use a página de contato para questões sobre seus dados. A versão comercial deve descrever o exercício dos direitos, as medidas de segurança aplicadas e o procedimento de atualização desta política.',
      ],
    ],
  },
  'termos-de-uso': {
    title: 'Termos de uso',
    headline: 'Sobre o uso desta prévia.',
    intro:
      'A experiência atual permite consultar produtos, testar um carrinho e explorar a área da conta.',
    review: 'Minuta dos termos em revisão comercial e jurídica.',
    sections: [
      [
        'Catálogo e valores',
        demoEnabled
          ? 'Os preços exibidos na prévia são referências de demonstração.'
          : 'Os preços e estoques exibidos são os registros do catálogo no ambiente de testes.',
      ],
      [
        'Carrinho e conta de demonstração',
        'Os fluxos disponíveis nesta prévia servem para testar a navegação. O checkout comercial está desativado.',
      ],
      [
        'Atendimento e atualização',
        'A equipe Magic LED pode esclarecer dúvidas pelos canais apresentados na página de contato. As condições de compra serão atualizadas antes do lançamento.',
      ],
    ],
  },
};

export function findInstitutionalPage(slug: string) {
  return Object.hasOwn(institutionalPages, slug) ? institutionalPages[slug] : undefined;
}

const legacyPaths: Record<string, string> = {
  'quem-somos': '/quem-somos',
  contato: '/contato',
  privacidade: '/politica-de-privacidade',
  garantia: '/garantia-trocas-e-devolucoes',
  'trocas-e-devolucoes': '/garantia-trocas-e-devolucoes',
  'garantia-e-trocas': '/garantia-trocas-e-devolucoes',
  pagamentos: '/pagamentos',
  'prazos-e-envios': '/prazos-e-envios',
  termos: '/termos-de-uso',
};

export function institutionalRedirect(slug: string) {
  return Object.hasOwn(legacyPaths, slug) ? legacyPaths[slug] : undefined;
}
