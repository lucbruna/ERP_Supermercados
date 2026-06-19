import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { NcmService } from './ncm.service';
import { SearchNcmDto } from './dto/search-ncm.dto';

@ApiTags('NCM')
@Controller('ncm')
export class NcmController {
  constructor(private readonly ncmService: NcmService) {}

  @Get()
  @ApiOperation({ summary: 'Buscar NCM por código ou descrição' })
  @ApiQuery({ name: 'search', required: false, description: 'Texto para busca' })
  @ApiResponse({ status: 200, description: 'Lista de NCMs' })
  search(@Query() query: SearchNcmDto) {
    return this.ncmService.search(query);
  }

  @Get(':codigo')
  @ApiOperation({ summary: 'Detalhe do NCM' })
  @ApiParam({ name: 'codigo', description: 'Código NCM (8 dígitos)' })
  @ApiResponse({ status: 200, description: 'Dados do NCM' })
  @ApiResponse({ status: 404, description: 'NCM não encontrado' })
  findByCodigo(@Param('codigo') codigo: string) {
    return this.ncmService.findByCodigo(codigo);
  }
}
