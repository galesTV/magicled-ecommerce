import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Gael Guzman',
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: 'gael@email.com', description: 'E-mail para login' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  senha!: string;

  @ApiProperty({ example: '123.456.789-00', description: 'CPF do cliente' })
  @IsString()
  @IsNotEmpty()
  cpf!: string;
}
