import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CalculateShippingDto {
  @ApiProperty({ example: '01001-000', description: 'CEP de destino' })
  @IsString()
  @IsNotEmpty()
  @Length(8, 9)
  cepDestino!: string;
}
