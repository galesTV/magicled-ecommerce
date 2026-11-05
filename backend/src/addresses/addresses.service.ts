import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: number, dto: CreateAddressDto) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente não encontrado.');
    }

    return this.prisma.endereco.create({
      data: {
        clienteId: cliente.usuarioId,
        cep: dto.cep,
        logradouro: dto.logradouro,
        numero: dto.numero,
        complemento: dto.complemento,
        bairro: dto.bairro,
        cidade: dto.cidade,
        estado: dto.estado,
      },
    });
  }

  async findAllByUsuario(usuarioId: number) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { usuarioId },
    });

    if (!cliente) {
      throw new NotFoundException('Perfil de cliente não encontrado.');
    }

    return this.prisma.endereco.findMany({
      where: { clienteId: cliente.usuarioId },
      orderBy: { id: 'desc' },
    });
  }
}
