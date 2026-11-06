import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum MetodoPagamentoEnum {
  PIX = 'PIX',
  BOLETO = 'BOLETO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
}

export class CreateOrderDto {
  @ApiProperty({
    example: 1,
    description: 'ID do endereço de entrega selecionado',
  })
  @IsNumber()
  @IsNotEmpty()
  enderecoId!: number;

  @ApiProperty({
    example: MetodoPagamentoEnum.PIX,
    enum: MetodoPagamentoEnum,
    description: 'Forma de pagamento escolhida',
  })
  @IsEnum(MetodoPagamentoEnum)
  @IsNotEmpty()
  metodoPagamento!: MetodoPagamentoEnum;
}
