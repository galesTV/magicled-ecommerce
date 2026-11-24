import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { MetodoPagamentoEnum } from '../../orders/dto/create-order.dto';

export class ProcessPaymentDto {
  @ApiProperty({ example: 1, description: 'ID do Pedido' })
  @IsNumber()
  @IsNotEmpty()
  pedidoId!: number;

  @ApiProperty({ enum: MetodoPagamentoEnum, example: MetodoPagamentoEnum.PIX })
  @IsEnum(MetodoPagamentoEnum)
  @IsNotEmpty()
  metodo!: MetodoPagamentoEnum;
}
