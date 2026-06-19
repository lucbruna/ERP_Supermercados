import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AutomacaoService } from './automacao.service';
import { RegistrarRegraDto, DispararAutomacaoDto, RegraQueryDto } from './dto/automacao.dto';

@ApiTags('automacao')
@Controller('automacao')
export class AutomacaoController {
  constructor(private readonly service: AutomacaoService) {}

  @Post('registrar')
  @ApiOperation({ summary: 'Register an automated rule' })
  registrar(@Body() dto: RegistrarRegraDto) {
    return this.service.registrar(dto);
  }

  @Post('disparar')
  @ApiOperation({ summary: 'Trigger automation check for entity' })
  disparar(@Body() dto: DispararAutomacaoDto) {
    return this.service.disparar(dto);
  }

  @Get('regras')
  @ApiOperation({ summary: 'List applicable rules' })
  listarRegras(@Query() query: RegraQueryDto) {
    return this.service.listarRegras(query);
  }
}
