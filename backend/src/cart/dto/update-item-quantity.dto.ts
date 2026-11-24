import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateItemQuantityDto {
  @ApiProperty({ example: 2, description: 'Nova quantidade para o item' })
  @IsNumber()
  @Min(1)
  quantidade!: number;
}
