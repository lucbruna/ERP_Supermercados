import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ManutencoesService } from './manutencoes.service';
import { CreateManutencaoDto, UpdateManutencaoDto, ManutencaoQueryDto, CustosManutencaoQueryDto } from './dto/manutencoes.dto';

@ApiTags('Manutenções')
@ApiBearerAuth()
@Controller('manutencoes')
export class ManutencoesController {
  constructor(private readonly service: ManutencoesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar manutenção' })
  async create(@Body() dto: CreateManutencaoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar manutenções' })
  async findAll(@Query() query: ManutencaoQueryDto) {
    return this.service.findAll(query);
  }

  @Get('agendadas')
  @ApiOperation({ summary: 'Próximas manutenções agendadas' })
  async findAgendadas() {
    return this.service.findAgendadas();
  }

  @Get('custos')
  @ApiOperation({ summary: 'Relatório de custos de manutenção' })
  async relatorioCustos(@Query() query: CustosManutencaoQueryDto) {
    return this.service.relatorioCustos(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter manutenção por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar manutenção' })
  async update(@Param('id') id: string, @Body() dto: UpdateManutencaoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/concluir')
  @ApiOperation({ summary: 'Concluir manutenção' })
  async concluir(@Param('id') id: string) {
    return this.service.concluir(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover manutenção' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
