import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('Produtos (RF03)')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar catálogo de produtos (com filtro opcional por categoria)',
  })
  @ApiQuery({ name: 'categoriaId', required: false, type: Number })
  findAll(@Query('categoriaId') categoriaId?: string) {
    return this.productsService.findAll(
      categoriaId ? Number(categoriaId) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar detalhes de um produto' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cadastrar produto (Requer Auth)' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }
}
