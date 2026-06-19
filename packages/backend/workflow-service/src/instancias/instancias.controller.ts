import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InstanciasService } from './instancias.service';
import { IniciarInstanciaDto, InstanciaQueryDto, TransitarInstanciaDto, CancelarInstanciaDto } from './dto/instancia.dto';

@ApiTags('instancias')
@Controller('instancias')
export class InstanciasController {
  constructor(private readonly service: InstanciasService) {}

  @Post('iniciar')
  @ApiOperation({ summary: 'Start a new workflow instance' })
  iniciar(@Body() dto: IniciarInstanciaDto) {
    return this.service.iniciar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflow instances' })
  findAll(@Query() query: InstanciaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get instance by ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post(':id/transitar')
  @ApiOperation({ summary: 'Execute a transition on instance' })
  transitar(@Param('id') id: string, @Body() dto: TransitarInstanciaDto) {
    return this.service.transitar(id, dto);
  }

  @Post(':id/cancelar')
  @ApiOperation({ summary: 'Cancel a running instance' })
  cancelar(@Param('id') id: string, @Body() dto: CancelarInstanciaDto) {
    return this.service.cancelar(id, dto);
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Get instance history' })
  getHistorico(@Param('id') id: string) {
    return this.service.getHistorico(id);
  }
}
