import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 1, description: 'ID da categoria vinculada' })
  @IsNumber()
  @IsNotEmpty()
  categoriaId!: number;

  @ApiProperty({
    example: 'Fita LED RGB 5M Neon',
    description: 'Nome do produto',
  })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiPropertyOptional({
    example: 'Fita LED impermeável IP67 com controle Wi-Fi',
  })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ example: 'Tensão: 12V | LEDs/m: 60 | Cor: RGB' })
  @IsString()
  @IsOptional()
  especificacaoTecnica?: string;

  @ApiProperty({ example: 129.9, description: 'Preço unitário' })
  @IsNumber()
  @Min(0)
  preco!: number;

  @ApiProperty({ example: 50, description: 'Quantidade em estoque' })
  @IsNumber()
  @Min(0)
  estoque!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
