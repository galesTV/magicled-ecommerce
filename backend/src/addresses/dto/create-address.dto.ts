import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({
    example: '01001-000',
    description: 'CEP no formato 00000-000',
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 9)
  cep!: string;

  @ApiProperty({ example: 'Praça da Sé', description: 'Logradouro / Rua' })
  @IsString()
  @IsNotEmpty()
  logradouro!: string;

  @ApiProperty({ example: '100', description: 'Número do endereço' })
  @IsString()
  @IsNotEmpty()
  numero!: string;

  @ApiPropertyOptional({ example: 'Apto 12', description: 'Complemento' })
  @IsString()
  @IsOptional()
  complemento?: string;

  @ApiProperty({ example: 'Sé', description: 'Bairro' })
  @IsString()
  @IsNotEmpty()
  bairro!: string;

  @ApiProperty({ example: 'São Paulo', description: 'Cidade' })
  @IsString()
  @IsNotEmpty()
  cidade!: string;

  @ApiProperty({ example: 'SP', description: 'Estado (UF com 2 letras)' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  estado!: string;
}
