import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';

@ApiTags('Endereços (RF05)')
@Controller('addresses')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({
    summary: 'Cadastrar endereço de entrega do cliente autenticado',
  })
  create(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateAddressDto,
  ) {
    return this.addressesService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os endereços do cliente autenticado' })
  findAll(@Request() req: { user: { id: number } }) {
    return this.addressesService.findAllByUsuario(req.user.id);
  }
}
