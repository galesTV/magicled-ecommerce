import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateItemQuantityDto } from './dto/update-item-quantity.dto';

@ApiTags('Carrinho de Compras (RF06)')
@Controller('cart')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Obter o carrinho ativo com itens e valor total calculados',
  })
  getMyCart(@Request() req: { user: { id: number } }) {
    return this.cartService.getMyCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Adicionar produto ao carrinho' })
  addItem(@Request() req: { user: { id: number } }, @Body() dto: AddToCartDto) {
    return this.cartService.addItem(req.user.id, dto);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Atualizar a quantidade de um item do carrinho' })
  updateItemQuantity(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateItemQuantityDto,
  ) {
    return this.cartService.updateItemQuantity(req.user.id, id, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remover um item do carrinho' })
  removeItem(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.cartService.removeItem(req.user.id, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Esvaziar o carrinho por completo' })
  clearCart(@Request() req: { user: { id: number } }) {
    return this.cartService.clearCart(req.user.id);
  }
}
