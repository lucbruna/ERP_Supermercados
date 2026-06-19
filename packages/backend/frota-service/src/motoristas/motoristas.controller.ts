import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MotoristasService } from './motoristas.service';
import { CreateMotoristaDto, UpdateMotoristaDto, MotoristaQueryDto } from './dto/motoristas.dto';

@ApiTags('Motoristas')
@ApiBearerAuth()
@Controller('motoristas')
export class MotoristasController {
  constructor(private readonly service: MotoristasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar motorista' })
  async create(@Body() dto: CreateMotoristaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar motoristas' })
  async findAll(@Query() query: MotoristaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter motorista por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Histórico de rotas e abastecimentos do motorista' })
  async findHistorico(@Param('id') id: string) {
    return this.service.findHistorico(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar motorista' })
  async update(@Param('id') id: string, @Body() dto: UpdateMotoristaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar motorista' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
