import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CorreiosService } from './correios.service';
import { CalcularFreteDto, ColetaData } from './correios.dto';

@ApiTags('Correios')
@Controller('correios')
export class CorreiosController {
  constructor(private readonly correiosService: CorreiosService) {}

  @Post('frete')
  @ApiOperation({ summary: 'Calcular frete (SEDEX, PAC, etc)' })
  async calcularFrete(@Body() dto: CalcularFreteDto) {
    return this.correiosService.calcularFrete(dto);
  }

  @Get('rastrear/:codigo')
  @ApiOperation({ summary: 'Rastrear objeto pelos Correios' })
  async rastrear(@Param('codigo') codigo: string) {
    return this.correiosService.rastrearObjeto(codigo);
  }

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Consultar endereço por CEP (ViaCEP com fallback simulado)' })
  async consultarCEP(@Param('cep') cep: string) {
    return this.correiosService.consultarCEP(cep);
  }

  @Post('coleta')
  @ApiOperation({ summary: 'Solicitar coleta domiciliar' })
  async solicitarColeta(@Body() dados: ColetaData) {
    return this.correiosService.solicitarColeta(dados);
  }
}
