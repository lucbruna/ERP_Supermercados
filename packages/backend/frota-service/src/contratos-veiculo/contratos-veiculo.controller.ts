import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContratosVeiculoService } from './contratos-veiculo.service';
import { CreateContratoVeiculoDto, UpdateContratoVeiculoDto, ContratoVeiculoQueryDto } from './dto/contratos-veiculo.dto';

@ApiTags('Contratos de Veículos')
@ApiBearerAuth()
@Controller('contratos-veiculo')
export class ContratosVeiculoController {
  constructor(private readonly service: ContratosVeiculoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar contrato' })
  async create(@Body() dto: CreateContratoVeiculoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contratos' })
  async findAll(@Query() query: ContratoVeiculoQueryDto) {
    return this.service.findAll(query);
  }

  @Get('vencendo')
  @ApiOperation({ summary: 'Contratos próximos do vencimento (30 dias)' })
  async findVencendo() {
    return this.service.findVencendo();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter contrato por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar contrato' })
  async update(@Param('id') id: string, @Body() dto: UpdateContratoVeiculoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover contrato' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
