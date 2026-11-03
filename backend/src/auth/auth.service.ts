import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const userExists = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (userExists) {
      throw new ConflictException('E-mail já cadastrado.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
        tipoUsuario: 'CLIENTE',
        cliente: {
          create: {
            cpf: dto.cpf,
          },
        },
      },
    });

    return this.generateToken(usuario.id, usuario.email, usuario.tipoUsuario);
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const passwordMatches = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return this.generateToken(usuario.id, usuario.email, usuario.tipoUsuario);
  }

  private generateToken(userId: number, email: string, tipoUsuario: string) {
    const payload = { sub: userId, email, tipoUsuario };
    const token = this.jwtService.sign(payload);
    return {
      accessToken: token,
      usuario: { id: userId, email, tipoUsuario },
    };
  }
}
