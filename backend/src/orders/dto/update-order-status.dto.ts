import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum StatusPedidoEnum {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  EM_TRANSPORTE = 'EM_TRANSPORTE',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: StatusPedidoEnum.EM_TRANSPORTE,
    enum: StatusPedidoEnum,
    description: 'Novo status do pedido',
  })
  @IsEnum(StatusPedidoEnum)
  @IsNotEmpty()
  status!: StatusPedidoEnum;

  @ApiPropertyOptional({
    example: 'BR123456789BR',
    description: 'Código de rastreamento dos Correios/Transportadora',
  })
  @IsString()
  @IsOptional()
  codigoRastreio?: string;
}
