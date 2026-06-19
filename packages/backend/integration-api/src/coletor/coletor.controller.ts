import { Controller, Get, Post, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ColetorService } from './coletor.service';
import { IniciarSessaoDto, RegistrarLeituraDto } from './dto/coletor.dto';

@ApiTags('Coletor (Scanner)')
@Controller('coletor')
export class ColetorController {
  constructor(private readonly coletorService: ColetorService) {}

  @Post('sessao') @ApiOperation({ summary: 'Iniciar sessão de coleta' })
  iniciarSessao(@Body() dto: IniciarSessaoDto) { return this.coletorService.iniciarSessao(dto); }

  @Post('leitura') @ApiOperation({ summary: 'Registrar leitura de código de barras' })
  registrarLeitura(@Body() dto: RegistrarLeituraDto) { return this.coletorService.registrarLeitura(dto); }

  @Post('sessao/:id/encerrar') @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Encerrar sessão de coleta' })
  encerrarSessao(@Param('id') id: string) { return this.coletorService.encerrarSessao(id); }

  @Get('sessoes') @ApiOperation({ summary: 'Listar sessões de coleta' })
  listarSessoes(@Query('companyId') companyId: string) { return this.coletorService.listarSessoes(companyId); }

  @Get('sessao/:id') @ApiOperation({ summary: 'Obter sessão com leituras' })
  obterSessao(@Param('id') id: string) { return this.coletorService.obterSessao(id); }
}
