import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const categoria = await this.prisma.categoria.findUnique({
      where: { id: dto.categoriaId },
    });

    if (!categoria) {
      throw new NotFoundException('Categoria informada não existe.');
    }

    return this.prisma.produto.create({
      data: {
        categoriaId: dto.categoriaId,
        nome: dto.nome,
        descricao: dto.descricao,
        especificacaoTecnica: dto.especificacaoTecnica,
        preco: dto.preco,
        estoque: dto.estoque,
        status: dto.status ?? true,
      },
    });
  }

  async findAll(categoriaId?: number) {
    return this.prisma.produto.findMany({
      where: {
        status: true,
        ...(categoriaId ? { categoriaId } : {}),
      },
      include: {
        categoria: true,
      },
      orderBy: { id: 'desc' },
    });
  }

  async findOne(id: number) {
    const produto = await this.prisma.produto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!produto) throw new NotFoundException('Produto não encontrado.');
    return produto;
  }
}
