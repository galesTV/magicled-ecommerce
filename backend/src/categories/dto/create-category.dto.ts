import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Fitas LED', description: 'Nome da categoria' })
  @IsString()
  @IsNotEmpty()
  nome!: string;
}
