import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BalancaService } from './balanca.service';
import { RegistrarPesoDto, PesoQueryDto } from './dto/balanca.dto';

@ApiTags('Balança')
@Controller('balanca')
export class BalancaController {
  constructor(private readonly balancaService: BalancaService) {}

  @Post('peso') @ApiOperation({ summary: 'Registrar peso da balança' })
  registrarPeso(@Body() dto: RegistrarPesoDto) { return this.balancaService.registrarPeso(dto); }

  @Get('pesos') @ApiOperation({ summary: 'Listar pesos registrados' })
  listarPesos(@Query() query: PesoQueryDto) { return this.balancaService.listarPesos(query); }

  @Get('ultimo/:balancaId') @ApiOperation({ summary: 'Último peso de uma balança' })
  ultimoPeso(@Param('balancaId') balancaId: string) { return this.balancaService.ultimoPeso(balancaId); }
}
