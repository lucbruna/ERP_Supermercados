import { Controller, Get, Post, Param, Query, Body, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { NFeService } from './nfe.service';
import { CreateNFeEntradaDto, NFeEntradaQueryDto } from './dto/nfe-entrada.dto';
import { EmitirNfeDto, CancelarNfeDto, CartaCorrecaoDto, NfeFilterDto } from './dto/nfe-emissao.dto';

@ApiTags('NF-e')
@Controller('nfe')
export class NFeController {
  constructor(private readonly nfeService: NFeService) {}

  @Post('emitir')
  @ApiOperation({ summary: 'Emitir NF-e (fluxo completo: validar → assinar → transmitir → armazenar)' })
  emitir(@Body() dto: EmitirNfeDto) {
    return this.nfeService.emitir(dto);
  }

  @Post('emitir-real')
  @ApiOperation({ summary: 'Emitir NF-e com transmissão real para SEFAZ' })
  emitirReal(@Body() dto: EmitirNfeDto) {
    return this.nfeService.emitirReal(dto);
  }

  @Post('cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar NF-e (dentro do prazo de 24h)' })
  cancelar(@Body('nfeId') nfeId: string, @Body() dto: CancelarNfeDto) {
    return this.nfeService.cancelar(nfeId, dto);
  }

  @Post('carta-correcao')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Emitir carta de correção eletrônica (CC-e)' })
  cartaCorrecao(@Body() dto: CartaCorrecaoDto) {
    return this.nfeService.cartaCorrecao(dto);
  }

  @Get(':chaveAcesso')
  @ApiOperation({ summary: 'Consultar NF-e por chave de acesso' })
  consultar(@Param('chaveAcesso') chaveAcesso: string) {
    return this.nfeService.consultar(chaveAcesso);
  }

  @Get(':chaveAcesso/xml')
  @ApiOperation({ summary: 'Download do XML da NF-e' })
  downloadXml(@Param('chaveAcesso') chaveAcesso: string, @Res() res: Response) {
    return this.nfeService.downloadXml(chaveAcesso, res);
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Gerar DANFE PDF (simulado, retorna URL)' })
  gerarPdf(@Query('chaveAcesso') chaveAcesso: string) {
    return this.nfeService.gerarPdf(chaveAcesso);
  }

  @Get()
  @ApiOperation({ summary: 'Listar NF-es com filtros' })
  listar(@Query() query: NfeFilterDto) {
    return this.nfeService.listar(query);
  }

  @Post('entrada')
  @ApiOperation({ summary: 'Registrar NF-e de entrada (terceiros)' })
  criarEntrada(@Body() dto: CreateNFeEntradaDto) {
    return this.nfeService.criarEntrada(dto);
  }

  @Get('entrada')
  @ApiOperation({ summary: 'Listar NF-es de entrada' })
  listarEntradas(@Query() query: NFeEntradaQueryDto) {
    return this.nfeService.listarEntradas(query);
  }

  @Get('entrada/:id')
  @ApiOperation({ summary: 'Obter NF-e de entrada por ID' })
  obterEntrada(@Param('id') id: string) {
    return this.nfeService.obterEntrada(id);
  }

  @Post('entrada/:id/cancelar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar NF-e de entrada' })
  cancelarEntrada(@Param('id') id: string) {
    return this.nfeService.cancelarEntrada(id);
  }
}
