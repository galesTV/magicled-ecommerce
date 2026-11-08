import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@ApiTags('Frete (RF08)')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Calcular opções de frete por CEP' })
  calculate(@Body() dto: CalculateShippingDto) {
    return this.shippingService.calculate(dto);
  }
}
