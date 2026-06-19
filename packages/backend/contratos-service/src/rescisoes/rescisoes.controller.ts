import {
  Controller, Get, Delete, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RescisoesService } from './rescisoes.service';
import { RescisaoQueryDto, RescisaoRelatorioDto } from './dto/create-rescisao.dto';

@ApiTags('Rescisões')
@ApiBearerAuth()
@Controller('rescisoes')
export class RescisoesController {
  constructor(private readonly rescisoesService: RescisoesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar rescisões com filtros' })
  @ApiQuery({ name: 'tipoRescisao', required: false })
  @ApiQuery({ name: 'contratoId', required: false })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: RescisaoQueryDto) {
    return this.rescisoesService.findAll(query);
  }

  @Get('relatorio')
  @ApiOperation({ summary: 'Relatório de rescisões' })
  @ApiQuery({ name: 'dataInicio', required: false })
  @ApiQuery({ name: 'dataFim', required: false })
  async relatorio(@Query() query: RescisaoRelatorioDto) {
    return this.rescisoesService.relatorio(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter rescisão por ID' })
  async findOne(@Param('id') id: string) {
    return this.rescisoesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover rescisão (soft delete)' })
  async remove(@Param('id') id: string) {
    return this.rescisoesService.remove(id);
  }
}
