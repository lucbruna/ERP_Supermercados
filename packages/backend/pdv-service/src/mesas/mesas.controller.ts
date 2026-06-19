import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MesasService } from './mesas.service';
import { CreateMesaDto, UpdateMesaDto, AbrirMesaDto, MesaQueryDto } from './dto/mesa.dto';

@ApiTags('Mesas / Comanda')
@Controller('mesas')
export class MesasController {
  constructor(private readonly mesasService: MesasService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastrar mesa' })
  create(@Body() dto: CreateMesaDto) { return this.mesasService.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Listar mesas' })
  findAll(@Query() query: MesaQueryDto) { return this.mesasService.findAll(query); }

  @Get(':id')
  @ApiOperation({ summary: 'Obter mesa por ID' })
  findOne(@Param('id') id: string) { return this.mesasService.findOne(id); }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar mesa' })
  update(@Param('id') id: string, @Body() dto: UpdateMesaDto) { return this.mesasService.update(id, dto); }

  @Post(':id/abrir')
  @ApiOperation({ summary: 'Abrir mesa (vincular venda)' })
  abrir(@Param('id') id: string, @Body() dto: AbrirMesaDto) { return this.mesasService.abrir(id, dto); }

  @Post(':id/fechar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fechar mesa (liberar)' })
  fechar(@Param('id') id: string) { return this.mesasService.fechar(id); }

  @Post(':id/reservar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reservar mesa' })
  reservar(@Param('id') id: string) { return this.mesasService.reservar(id); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover mesa' })
  async remove(@Param('id') id: string) { await this.mesasService.remove(id); }
}
