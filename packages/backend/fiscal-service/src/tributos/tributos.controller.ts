import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TributosService } from './tributos.service';
import { CalcularIcmsDto, CalcularPisCofinsDto, CalcularTotalTributosDto } from './dto/tributos.dto';

@ApiTags('Tributos')
@Controller('tributos')
export class TributosController {
  constructor(private readonly service: TributosService) {}

  @Post('calcular-icms')
  @ApiOperation({ summary: 'Calcular ICMS para produto (baseado em CST/CSOSN, UF)' })
  calcularIcms(@Body() dto: CalcularIcmsDto) {
    return this.service.calcularIcms(dto);
  }

  @Post('calcular-pis-cofins')
  @ApiOperation({ summary: 'Calcular PIS/COFINS' })
  calcularPisCofins(@Body() dto: CalcularPisCofinsDto) {
    return this.service.calcularPisCofins(dto);
  }

  @Post('calcular-total')
  @ApiOperation({ summary: 'Calcular todos os tributos para uma nota fiscal' })
  calcularTotal(@Body() dto: CalcularTotalTributosDto) {
    return this.service.calcularTotal(dto);
  }

  @Get('tabela-icms')
  @ApiOperation({ summary: 'Alíquotas ICMS por UF (interestadual e interna)' })
  tabelaIcms() {
    return this.service.tabelaIcms();
  }

  @Get('beneficios')
  @ApiOperation({ summary: 'Benefícios fiscais por UF (redução de base, isenção)' })
  beneficios() {
    return this.service.beneficios();
  }
}
