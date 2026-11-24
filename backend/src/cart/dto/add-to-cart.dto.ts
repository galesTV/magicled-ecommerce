import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 1, description: 'ID do produto a ser adicionado' })
  @IsNumber()
  @IsNotEmpty()
  produtoId!: number;

  @ApiProperty({ example: 1, description: 'Quantidade desejada' })
  @IsNumber()
  @Min(1)
  quantidade!: number;
}
