import {
  Controller, Get, Post, Patch, Delete, Body, Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TiposService } from './tipos.service';
import { CreateTipoContratoDto, UpdateTipoContratoDto } from './dto/create-tipo.dto';

@ApiTags('Tipos de Contrato')
@ApiBearerAuth()
@Controller('tipos')
export class TiposController {
  constructor(private readonly tiposService: TiposService) {}

  @Post()
  @ApiOperation({ summary: 'Criar tipo de contrato' })
  async create(@Body() dto: CreateTipoContratoDto) {
    return this.tiposService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar tipos de contrato' })
  async findAll() {
    return this.tiposService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter tipo de contrato por ID' })
  async findOne(@Param('id') id: string) {
    return this.tiposService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar tipo de contrato' })
  async update(@Param('id') id: string, @Body() dto: UpdateTipoContratoDto) {
    return this.tiposService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir tipo de contrato' })
  async remove(@Param('id') id: string) {
    return this.tiposService.remove(id);
  }
}
