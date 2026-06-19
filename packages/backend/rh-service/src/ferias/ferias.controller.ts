import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeriasService } from './ferias.service';
import { CreateFeriasDto, UpdateFeriasDto, FeriasQueryDto } from './dto/create-ferias.dto';

@ApiTags('Férias')
@ApiBearerAuth()
@Controller('ferias')
export class FeriasController {
  constructor(private readonly feriasService: FeriasService) {}

  @Post()
  @ApiOperation({ summary: 'Agendar férias' })
  async create(@Body() dto: CreateFeriasDto) {
    return this.feriasService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros de férias' })
  async findAll(@Query() query: FeriasQueryDto) {
    return this.feriasService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter registro de férias por ID' })
  async findOne(@Param('id') id: string) {
    return this.feriasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar registro de férias' })
  async update(@Param('id') id: string, @Body() dto: UpdateFeriasDto) {
    return this.feriasService.update(id, dto);
  }

  @Patch(':id/conceder')
  @ApiOperation({ summary: 'Conceder férias' })
  async conceder(@Param('id') id: string) {
    return this.feriasService.conceder(id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar férias' })
  async cancelar(@Param('id') id: string) {
    return this.feriasService.cancelar(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover registro de férias' })
  async remove(@Param('id') id: string) {
    return this.feriasService.remove(id);
  }
}
