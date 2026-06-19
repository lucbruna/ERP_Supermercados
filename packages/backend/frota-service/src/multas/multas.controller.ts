import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MultasService } from './multas.service';
import { CreateMultaDto, UpdateMultaDto, PagarMultaDto, MultaQueryDto } from './dto/multas.dto';

@ApiTags('Multas')
@ApiBearerAuth()
@Controller('multas')
export class MultasController {
  constructor(private readonly service: MultasService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar multa' })
  async create(@Body() dto: CreateMultaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar multas' })
  async findAll(@Query() query: MultaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter multa por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar multa' })
  async update(@Param('id') id: string, @Body() dto: UpdateMultaDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/pagar')
  @ApiOperation({ summary: 'Registrar pagamento de multa' })
  async pagar(@Param('id') id: string, @Body() dto: PagarMultaDto) {
    return this.service.pagar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover multa' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
