import { Injectable } from '@nestjs/common';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@Injectable()
export class ShippingService {
  calculate(dto: CalculateShippingDto) {
    const cepLimpo = dto.cepDestino.replace(/\D/g, '');

    // Simulação baseada na região/estado derivada do CEP
    const eSaoPaulo = cepLimpo.startsWith('0') || cepLimpo.startsWith('1');

    return [
      {
        modalidade: 'PAC / Standard',
        valor: eSaoPaulo ? 15.9 : 28.5,
        prazoDias: eSaoPaulo ? 3 : 7,
      },
      {
        modalidade: 'SEDEX / Expressa',
        valor: eSaoPaulo ? 24.9 : 45.0,
        prazoDias: eSaoPaulo ? 1 : 3,
      },
    ];
  }
}
