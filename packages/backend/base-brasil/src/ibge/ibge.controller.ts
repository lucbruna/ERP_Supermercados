import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { IbgeService } from './ibge.service';

@ApiTags('IBGE')
@Controller('ibge')
export class IbgeController {
  constructor(private readonly ibgeService: IbgeService) {}

  @Get('cidades')
  @ApiOperation({ summary: 'Listar cidades por UF' })
  @ApiQuery({ name: 'uf', required: false, description: 'Sigla da UF (ex: SP)' })
  @ApiResponse({ status: 200, description: 'Lista de cidades' })
  listarCidades(@Query('uf') uf?: string) {
    return this.ibgeService.listarCidades(uf);
  }

  @Get('estados')
  @ApiOperation({ summary: 'Listar todos os estados brasileiros' })
  @ApiResponse({ status: 200, description: 'Lista de estados' })
  listarEstados() {
    return this.ibgeService.listarEstados();
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Detalhe da cidade por código IBGE' })
  @ApiParam({ name: 'codigo', description: 'Código IBGE da cidade (7 dígitos)' })
  @ApiResponse({ status: 200, description: 'Dados da cidade' })
  @ApiResponse({ status: 404, description: 'Cidade não encontrada' })
  detalheCidade(@Param('codigo') codigo: string) {
    return this.ibgeService.detalheCidade(codigo);
  }
}
