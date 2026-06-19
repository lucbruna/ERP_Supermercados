import {
  Controller, Get, Post, Patch, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ContratosService } from './contratos.service';
import {
  CreateContratoDto,
  UpdateContratoDto,
  ContratoQueryDto,
  AditarContratoDto,
  RescindirContratoDto,
  DocumentoContratoDto,
} from './dto/create-contrato.dto';

@ApiTags('Contratos')
@ApiBearerAuth()
@Controller('contratos')
export class ContratosController {
  constructor(private readonly contratosService: ContratosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo contrato' })
  async create(@Body() dto: CreateContratoDto) {
    return this.contratosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contratos com filtros' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'funcionarioId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async findAll(@Query() query: ContratoQueryDto) {
    return this.contratosService.findAll(query);
  }

  @Get('vencendo')
  @ApiOperation({ summary: 'Contratos próximos ao vencimento' })
  async findVencendo() {
    return this.contratosService.findVencendo();
  }

  @Get('relatorio/indicadores')
  @ApiOperation({ summary: 'Indicadores de contratos' })
  async relatorioIndicadores() {
    return this.contratosService.relatorioIndicadores();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes completos do contrato' })
  async findOne(@Param('id') id: string) {
    return this.contratosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  async update(@Param('id') id: string, @Body() dto: UpdateContratoDto) {
    return this.contratosService.update(id, dto);
  }

  @Get(':id/aditivos')
  @ApiOperation({ summary: 'Listar aditivos do contrato' })
  async findAditivos(@Param('id') id: string) {
    return this.contratosService.findAditivos(id);
  }

  @Get(':id/documentos')
  @ApiOperation({ summary: 'Listar documentos do contrato' })
  async findDocumentos(@Param('id') id: string) {
    return this.contratosService.findDocumentos(id);
  }

  @Post(':id/aditar')
  @ApiOperation({ summary: 'Adicionar aditivo ao contrato' })
  async aditar(@Param('id') id: string, @Body() dto: AditarContratoDto) {
    return this.contratosService.aditar(id, dto);
  }

  @Post(':id/rescindir')
  @ApiOperation({ summary: 'Rescindir contrato' })
  async rescindir(@Param('id') id: string, @Body() dto: RescindirContratoDto) {
    return this.contratosService.rescindir(id, dto);
  }

  @Post(':id/suspender')
  @ApiOperation({ summary: 'Suspender contrato' })
  async suspender(@Param('id') id: string, @Body('motivo') motivo?: string) {
    return this.contratosService.suspender(id, motivo);
  }

  @Post(':id/reativar')
  @ApiOperation({ summary: 'Reativar contrato suspenso' })
  async reativar(@Param('id') id: string) {
    return this.contratosService.reativar(id);
  }

  @Post(':id/documentos')
  @ApiOperation({ summary: 'Adicionar documento ao contrato' })
  async addDocumento(@Param('id') id: string, @Body() dto: DocumentoContratoDto) {
    return this.contratosService.addDocumento(id, dto);
  }
}
