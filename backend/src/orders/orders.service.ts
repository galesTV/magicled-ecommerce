import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(usuarioId: number, dto: CreateOrderDto) {
    // 1. Validar se o cliente existe
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente não encontrado.');
    }

    // 2. Validar se o endereço pertence ao cliente
    const endereco = await this.prisma.endereco.findFirst({
      where: {
        id: dto.enderecoId,
        clienteId: cliente.usuarioId,
      },
    });

    if (!endereco) {
      throw new NotFoundException(
        'Endereço de entrega inválido ou não pertence ao cliente.',
      );
    }

    // 3. Buscar o carrinho ativo com os itens e dados do produto
    const carrinho = await this.prisma.carrinho.findUnique({
      where: { clienteId: cliente.usuarioId },
      include: {
        itens: {
          include: {
            produto: true,
          },
        },
      },
    });

    if (!carrinho || carrinho.itens.length === 0) {
      throw new BadRequestException(
        'O carrinho está vazio para fechar o pedido.',
      );
    }

    // 4. Executar a criação do pedido, abatimento de estoque e limpeza do carrinho em uma Transação do Prisma
    return this.prisma.$transaction(async (tx) => {
      let valorTotal = 0;

      // Verificar estoque de cada item e calcular valor total
      for (const item of carrinho.itens) {
        if (item.produto.estoque < item.quantidade) {
          throw new BadRequestException(
            `Estoque insuficiente para o produto: ${item.produto.nome} (Disponível: ${item.produto.estoque})`,
          );
        }
        valorTotal += Number(item.precoUnitario) * item.quantidade;
      }

      // Criar o registro do Pedido
      const pedido = await tx.pedido.create({
        data: {
          clienteId: cliente.usuarioId,
          enderecoId: dto.enderecoId,
          valorTotal,
          status: 'PENDENTE',
          pagamento: {
            create: {
              metodo: dto.metodoPagamento,
              valor: valorTotal,
              status: 'PENDENTE',
            },
          },
        },
      });

      // Criar os itens do pedido e atualizar o estoque dos produtos
      for (const item of carrinho.itens) {
        await tx.itemPedido.create({
          data: {
            pedidoId: pedido.id,
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
          },
        });

        await tx.produto.update({
          where: { id: item.produtoId },
          data: {
            estoque: {
              decrement: item.quantidade,
            },
          },
        });
      }

      // Limpar todos os itens do carrinho após fechar o pedido
      await tx.itemCarrinho.deleteMany({
        where: { carrinhoId: carrinho.id },
      });

      return tx.pedido.findUnique({
        where: { id: pedido.id },
        include: {
          itens: {
            include: { produto: true },
          },
          endereco: true,
          pagamento: true,
        },
      });
    });
  }

  async findMyOrders(usuarioId: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente não encontrado.');
    }

    return this.prisma.pedido.findMany({
      where: { clienteId: cliente.usuarioId },
      include: {
        itens: {
          include: { produto: true },
        },
        pagamento: true,
        endereco: true,
      },
      orderBy: { dataCriacao: 'desc' },
    });
  }

  async findOrderById(usuarioId: number, orderId: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente não encontrado.');
    }

    const pedido = await this.prisma.pedido.findFirst({
      where: {
        id: orderId,
        clienteId: cliente.usuarioId,
      },
      include: {
        itens: {
          include: { produto: true },
        },
        pagamento: true,
        endereco: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    return pedido;
  }
}
