import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateItemQuantityDto } from './dto/update-item-quantity.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Busca ou cria o carrinho do cliente logado
  private async getOrCreateCart(usuarioId: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente não encontrado.');
    }

    let carrinho = await this.prisma.carrinho.findUnique({
      where: { clienteId: cliente.usuarioId },
    });

    if (!carrinho) {
      carrinho = await this.prisma.carrinho.create({
        data: { clienteId: cliente.usuarioId },
      });
    }

    return carrinho;
  }

  async getMyCart(usuarioId: number) {
    const carrinho = await this.getOrCreateCart(usuarioId);

    const cartWithItems = await this.prisma.carrinho.findUnique({
      where: { id: carrinho.id },
      include: {
        itens: {
          include: {
            produto: true,
          },
          orderBy: { id: 'asc' },
        },
      },
    });

    // Calcula o valor total do carrinho dinamicamente
    const valorTotal =
      cartWithItems?.itens.reduce(
        (acc, item) => acc + Number(item.precoUnitario) * item.quantidade,
        0,
      ) ?? 0;

    return {
      ...cartWithItems,
      valorTotal,
    };
  }

  async addItem(usuarioId: number, dto: AddToCartDto) {
    const carrinho = await this.getOrCreateCart(usuarioId);

    // Validar produto e estoque
    const produto = await this.prisma.produto.findUnique({
      where: { id: dto.produtoId },
    });

    if (!produto || !produto.status) {
      throw new NotFoundException('Produto não encontrado ou indisponível.');
    }

    if (produto.estoque < dto.quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${produto.estoque}`,
      );
    }

    // Verificar se o item já está no carrinho
    const itemExistente = await this.prisma.itemCarrinho.findFirst({
      where: {
        carrinhoId: carrinho.id,
        produtoId: dto.produtoId,
      },
    });

    if (itemExistente) {
      const novaQuantidade = itemExistente.quantidade + dto.quantidade;

      if (produto.estoque < novaQuantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para essa quantidade total (${novaQuantidade}).`,
        );
      }

      await this.prisma.itemCarrinho.update({
        where: { id: itemExistente.id },
        data: { quantidade: novaQuantidade },
      });
    } else {
      await this.prisma.itemCarrinho.create({
        data: {
          carrinhoId: carrinho.id,
          produtoId: dto.produtoId,
          quantidade: dto.quantidade,
          precoUnitario: produto.preco,
        },
      });
    }

    return this.getMyCart(usuarioId);
  }

  async updateItemQuantity(
    usuarioId: number,
    itemId: number,
    dto: UpdateItemQuantityDto,
  ) {
    const carrinho = await this.getOrCreateCart(usuarioId);

    const item = await this.prisma.itemCarrinho.findFirst({
      where: {
        id: itemId,
        carrinhoId: carrinho.id,
      },
      include: { produto: true },
    });

    if (!item) {
      throw new NotFoundException('Item do carrinho não encontrado.');
    }

    if (item.produto.estoque < dto.quantidade) {
      throw new BadRequestException(
        `Estoque insuficiente. Disponível: ${item.produto.estoque}`,
      );
    }

    await this.prisma.itemCarrinho.update({
      where: { id: itemId },
      data: { quantidade: dto.quantidade },
    });

    return this.getMyCart(usuarioId);
  }

  async removeItem(usuarioId: number, itemId: number) {
    const carrinho = await this.getOrCreateCart(usuarioId);

    const item = await this.prisma.itemCarrinho.findFirst({
      where: {
        id: itemId,
        carrinhoId: carrinho.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Item do carrinho não encontrado.');
    }

    await this.prisma.itemCarrinho.delete({
      where: { id: itemId },
    });

    return this.getMyCart(usuarioId);
  }

  async clearCart(usuarioId: number) {
    const carrinho = await this.getOrCreateCart(usuarioId);

    await this.prisma.itemCarrinho.deleteMany({
      where: { carrinhoId: carrinho.id },
    });

    return this.getMyCart(usuarioId);
  }
}
