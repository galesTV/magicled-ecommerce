import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from './payments.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';

@ApiTags('Pagamentos (RF09)')
@Controller('payments')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @ApiOperation({ summary: 'Gerar cobrança / PIX via Gateway de Pagamento' })
  processPayment(
    @Request() req: { user: { id: number } },
    @Body() dto: ProcessPaymentDto,
  ) {
    return this.paymentsService.processPayment(req.user.id, dto);
  }

  @Post('webhook/simulate-approval/:pedidoId')
  @ApiOperation({
    summary: 'Simular aprovação de pagamento (muda status para PAGO)',
  })
  simulateApproval(@Param('pedidoId', ParseIntPipe) pedidoId: number) {
    return this.paymentsService.simulatePaymentApproval(pedidoId);
  }
}
