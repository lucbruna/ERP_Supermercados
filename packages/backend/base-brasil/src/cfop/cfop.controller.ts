import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CfopService } from './cfop.service';
import { SearchCfopDto } from './dto/search-cfop.dto';

@ApiTags('CFOP')
@Controller('cfop')
export class CfopController {
  constructor(private readonly cfopService: CfopService) {}

  @Get()
  @ApiOperation({ summary: 'Listar CFOPs por tipo (entrada/saída)' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['ENTRADA', 'SAIDA'] })
  @ApiResponse({ status: 200, description: 'Lista de CFOPs' })
  listar(@Query() query: SearchCfopDto) {
    return this.cfopService.listar(query);
  }

  @Get('natureza/:natureza')
  @ApiOperation({ summary: 'Buscar CFOPs por natureza de operação' })
  @ApiParam({ name: 'natureza', description: 'Descrição da natureza' })
  @ApiResponse({ status: 200, description: 'CFOPs encontrados' })
  findByNatureza(@Param('natureza') natureza: string) {
    return this.cfopService.findByNatureza(natureza);
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Detalhe do CFOP' })
  @ApiParam({ name: 'codigo', description: 'Código CFOP (4 dígitos)' })
  @ApiResponse({ status: 200, description: 'Dados do CFOP' })
  @ApiResponse({ status: 404, description: 'CFOP não encontrado' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.cfopService.findByCodigo(codigo);
  }
}
