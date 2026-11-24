import type { CSSProperties } from 'react';

export type Exemplar = {
  title: string;
  description: string;
  query: string;
  image: string;
  sourceWidth: number;
  sourceHeight: number;
  crop: { x: number; y: number; size: number };
};

// As imagens são capturas fornecidas pela equipe. O recorte exibe apenas a foto;
// nomes, preços, estoque e condições comerciais vêm exclusivamente da API.
export const exemplars: Exemplar[] = [
  {
    title: 'Piscinas',
    description: 'Luminárias e refletores para áreas aquáticas',
    query: 'piscina',
    image: '/exemplares/piscinas.webp',
    sourceWidth: 1407,
    sourceHeight: 605,
    crop: { x: 66, y: 120, size: 240 },
  },
  {
    title: 'Jardins',
    description: 'Pontos de luz para paisagismo',
    query: 'jardim',
    image: '/exemplares/jardim-piscina.webp',
    sourceWidth: 1113,
    sourceHeight: 769,
    crop: { x: 442, y: 16, size: 186 },
  },
  {
    title: 'Infantil',
    description: 'Iluminação para ambientes de crianças',
    query: 'infantil',
    image: '/exemplares/jardim-infantil-piscina.webp',
    sourceWidth: 1065,
    sourceHeight: 727,
    crop: { x: 416, y: 378, size: 186 },
  },
  {
    title: 'Sinalização',
    description: 'Luz funcional para veículos e acessos',
    query: 'sinalizador',
    image: '/exemplares/infantil-sinalizacao-piscina.webp',
    sourceWidth: 1135,
    sourceHeight: 710,
    crop: { x: 75, y: 354, size: 185 },
  },
];

// Conteúdo editorial para a prévia local. As capturas nunca são convertidas em Product.
export const visualReferences: Exemplar[] = [
  {
    title: 'Luminária para piscina',
    description: 'Piscinas',
    query: 'piscina',
    image: '/exemplares/piscinas.webp',
    sourceWidth: 1407,
    sourceHeight: 605,
    crop: { x: 66, y: 120, size: 240 },
  },
  {
    title: 'Refletores para piscina',
    description: 'Piscinas',
    query: 'piscina',
    image: '/exemplares/piscinas.webp',
    sourceWidth: 1407,
    sourceHeight: 605,
    crop: { x: 323, y: 120, size: 240 },
  },
  {
    title: 'Iluminação RGB para piscina',
    description: 'Piscinas',
    query: 'piscina',
    image: '/exemplares/piscinas.webp',
    sourceWidth: 1407,
    sourceHeight: 605,
    crop: { x: 578, y: 120, size: 240 },
  },
  {
    title: 'Spot para jardim',
    description: 'Jardins',
    query: 'jardim',
    image: '/exemplares/jardim-piscina.webp',
    sourceWidth: 1113,
    sourceHeight: 769,
    crop: { x: 442, y: 16, size: 186 },
  },
  {
    title: 'Deck com iluminação embutida',
    description: 'Áreas externas',
    query: 'deck',
    image: '/exemplares/jardim-piscina.webp',
    sourceWidth: 1113,
    sourceHeight: 769,
    crop: { x: 41, y: 369, size: 185 },
  },
  {
    title: 'Sinalizador LED',
    description: 'Sinalização',
    query: 'sinalizador',
    image: '/exemplares/infantil-sinalizacao-piscina.webp',
    sourceWidth: 1135,
    sourceHeight: 710,
    crop: { x: 75, y: 354, size: 185 },
  },
  {
    title: 'Luminária infantil',
    description: 'Infantil',
    query: 'infantil',
    image: '/exemplares/jardim-infantil-piscina.webp',
    sourceWidth: 1065,
    sourceHeight: 727,
    crop: { x: 416, y: 378, size: 186 },
  },
  {
    title: 'Farol auxiliar LED',
    description: 'Veicular',
    query: 'farol',
    image: '/exemplares/infantil-sinalizacao-piscina.webp',
    sourceWidth: 1135,
    sourceHeight: 710,
    crop: { x: 675, y: 13, size: 186 },
  },
];

export function ExemplarPhoto({ item, className = '' }: { item: Exemplar; className?: string }) {
  const { x, y, size } = item.crop;
  const style: CSSProperties = {
    backgroundImage: `url("${item.image}")`,
    backgroundSize: `${(item.sourceWidth / size) * 100}% auto`,
    backgroundPosition: `${(x / (item.sourceWidth - size)) * 100}% ${(y / (item.sourceHeight - size)) * 100}%`,
  };
  return <span className={`exemplar-photo ${className}`} style={style} aria-hidden="true" />;
}
