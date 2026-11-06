import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Pedidos (RF07)')
@Controller('orders')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @ApiOperation({ summary: 'Fechar o carrinho ativo e gerar um novo pedido' })
  createOrder(
    @Request() req: { user: { id: number } },
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar histórico de pedidos do cliente logado' })
  findMyOrders(@Request() req: { user: { id: number } }) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalhes de um pedido específico' })
  findOrderById(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.ordersService.findOrderById(req.user.id, id);
  }
}
