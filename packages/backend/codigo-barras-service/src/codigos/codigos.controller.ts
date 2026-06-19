import {
  Controller, Get, Post, Patch, Param, Body, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CodigosService } from './codigos.service';
import { GerarCodigoDto, ValidarCodigoDto, ImagemCodigoDto } from './dto/gerar-codigo.dto';

@ApiTags('Códigos de Barras')
@ApiBearerAuth()
@Controller('codigos')
export class CodigosController {
  constructor(private readonly codigosService: CodigosService) {}

  @Post('gerar')
  @ApiOperation({ summary: 'Gerar código(s) de barras para um produto' })
  async gerar(@Body() dto: GerarCodigoDto) {
    return this.codigosService.gerar(dto);
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Buscar código de barras pelo número' })
  async buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.codigosService.buscarPorCodigo(codigo);
  }

  @Get('produto/:produtoId')
  @ApiOperation({ summary: 'Listar todos os códigos de barras de um produto' })
  async listarPorProduto(@Param('produtoId') produtoId: string) {
    return this.codigosService.listarPorProduto(produtoId);
  }

  @Patch(':id/ativar')
  @ApiOperation({ summary: 'Ativar código de barras' })
  async ativar(@Param('id') id: string) {
    return this.codigosService.ativar(id);
  }

  @Patch(':id/inativar')
  @ApiOperation({ summary: 'Inativar código de barras' })
  async inativar(@Param('id') id: string) {
    return this.codigosService.inativar(id);
  }

  @Post('validar')
  @ApiOperation({ summary: 'Validar formato e dígito verificador de código de barras' })
  async validar(@Body() dto: ValidarCodigoDto) {
    return this.codigosService.validar(dto);
  }

  @Post('imagem')
  @ApiOperation({ summary: 'Gerar imagem de código de barras (PNG/SVG) como base64' })
  async imagem(@Body() dto: ImagemCodigoDto) {
    return this.codigosService.gerarImagem(dto);
  }
}
