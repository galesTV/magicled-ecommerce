import { Injectable, NotFoundException } from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { MetodoPagamentoEnum } from '../orders/dto/create-order.dto';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(private readonly prisma: PrismaService) {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
    this.client = new MercadoPagoConfig({ accessToken });
  }

  async processPayment(usuarioId: number, dto: ProcessPaymentDto) {
    const pedido = await this.prisma.pedido.findFirst({
      where: {
        id: dto.pedidoId,
        cliente: { usuarioId },
      },
      include: {
        cliente: { include: { usuario: true } },
        pagamento: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado para este cliente.');
    }

    const valorTotalNum = Number(pedido.valorTotal);

    if (dto.metodo === MetodoPagamentoEnum.PIX) {
      // Integração real com a API do Mercado Pago para gerar PIX Dinâmico
      if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
        try {
          const payment = new Payment(this.client);
          const response = await payment.create({
            body: {
              transaction_amount: valorTotalNum,
              description: `Pedido #${pedido.id} - Magic LED`,
              payment_method_id: 'pix',
              payer: {
                email: pedido.cliente.usuario.email,
                first_name: pedido.cliente.usuario.nome,
              },
            },
          });

          const pixData = response.point_of_interaction?.transaction_data;

          return {
            status: response.status,
            metodo: 'PIX',
            valor: pedido.valorTotal,
            qrCode: pixData?.qr_code,
            qrCodeBase64: pixData?.qr_code_base64,
            ticketUrl: pixData?.ticket_url,
          };
        } catch (error) {
          console.warn(
            'Erro ao conectar ao Mercado Pago, gerando PIX simulado:',
            error,
          );
        }
      }

      // Retorno fallback simulado se a chave de testes não estiver configurada
      return {
        status: 'PENDENTE',
        metodo: 'PIX',
        valor: pedido.valorTotal,
        qrCode: `00020126580014BR.GOV.BCB.PIX0136magicled-pedido-${pedido.id}-pix-copia-e-cola5204000053039865405${valorTotalNum.toFixed(2)}5802BR5913MAGIC LED INC6009SAO PAULO62070503***6304ABCD`,
        qrCodeBase64:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      };
    }

    return {
      status: 'PENDENTE',
      metodo: dto.metodo,
      valor: pedido.valorTotal,
      instrucoes: 'Aguardando processamento do gateway de pagamento.',
    };
  }

  // Webhook / Simulação para aprovar o pagamento de um pedido
  async simulatePaymentApproval(pedidoId: number) {
    const pagamento = await this.prisma.pagamento.findUnique({
      where: { pedidoId },
    });

    if (!pagamento) {
      throw new NotFoundException('Pagamento não encontrado para este pedido.');
    }

    await this.prisma.$transaction([
      this.prisma.pagamento.update({
        where: { pedidoId },
        data: {
          status: 'APROVADO',
          dataPagamento: new Date(),
        },
      }),
      this.prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: 'PAGO' },
      }),
    ]);

    return {
      success: true,
      message: `Pagamento do pedido #${pedidoId} aprovado com sucesso!`,
    };
  }
}
