import { Controller, Get, Post, Param, Query, Body, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { LeituraPlacasService } from './leitura-placas.service';
import { LeituraPlacaQueryDto, CriarLeituraPlacaDto } from './dto/leitura-placa.dto';

@ApiTags('Leitura de Placas')
@ApiBearerAuth()
@ApiHeader({ name: 'x-company-id', required: true })
@Controller('leitura-placas')
export class LeituraPlacasController {
  constructor(private readonly service: LeituraPlacasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar leituras de placas' })
  async findAll(
    @Headers('x-company-id') companyId: string,
    @Query() query: LeituraPlacaQueryDto,
  ) {
    return this.service.findAll(companyId, query);
  }

  @Get('buscar/:placa')
  @ApiOperation({ summary: 'Buscar leituras por placa' })
  async buscarPorPlaca(
    @Headers('x-company-id') companyId: string,
    @Param('placa') placa: string,
  ) {
    return this.service.buscarPorPlaca(companyId, placa);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes da leitura' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar leitura de placa' })
  async create(@Body() dto: CriarLeituraPlacaDto) {
    return this.service.create(dto);
  }
}
