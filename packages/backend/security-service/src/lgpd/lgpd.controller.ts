import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Headers,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { Response } from 'express';
import { LgpdService } from './lgpd.service';
import {
  ConsentimentoDto,
  CriarSolicitacaoDto,
  ProcessarSolicitacaoDto,
  RegistrarDadosPessoaisDto,
  CriarPoliticaDto,
  AceitarPoliticaDto,
  ListarSolicitacoesDto,
} from './dto/lgpd.dto';

@ApiTags('LGPD - Lei Geral de Proteção de Dados')
@ApiBearerAuth()
@Controller()
export class LgpdController {
  constructor(private readonly lgpdService: LgpdService) {}

  @Post('lgpd/consentimento')
  @ApiOperation({ summary: 'Registrar consentimento do titular' })
  async consentir(
    @Headers('x-usuario-id') usuarioId: string,
    @Headers('x-forwarded-for') ip: string,
    @Headers('user-agent') userAgent: string,
    @Body() dto: ConsentimentoDto,
  ) {
    return this.lgpdService.consentir(usuarioId, dto, ip || 'unknown', userAgent || 'unknown');
  }

  @Get('lgpd/consentimentos/:usuarioId')
  @ApiOperation({ summary: 'Listar consentimentos do titular' })
  async listarConsentimentos(@Param('usuarioId') usuarioId: string) {
    return this.lgpdService.listarConsentimentos(usuarioId);
  }

  @Post('lgpd/solicitacao')
  @ApiOperation({ summary: 'Criar solicitação de titular (LGPD Art. 18)' })
  async criarSolicitacao(@Body() dto: CriarSolicitacaoDto) {
    return this.lgpdService.criarSolicitacaoTitular(dto);
  }

  @Get('lgpd/solicitacoes')
  @ApiOperation({ summary: 'Listar solicitações de titulares' })
  async listarSolicitacoes(@Query() filtros: ListarSolicitacoesDto) {
    return this.lgpdService.listarSolicitacoes(filtros);
  }

  @Post('lgpd/solicitacao/:id/processar')
  @ApiOperation({ summary: 'Processar solicitação de titular' })
  async processarSolicitacao(
    @Param('id') id: string,
    @Body() dto: ProcessarSolicitacaoDto,
  ) {
    return this.lgpdService.processarSolicitacao(id, dto);
  }

  @Post('lgpd/dados/anonymize/:usuarioId')
  @ApiOperation({ summary: 'Anonimizar dados do titular (LGPD Art. 18 IV)' })
  async anonimizarDados(@Param('usuarioId') usuarioId: string) {
    return this.lgpdService.anonimizarDados(usuarioId);
  }

  @Post('lgpd/dados/export/:usuarioId')
  @ApiOperation({ summary: 'Exportar dados do titular (LGPD Art. 18 V - Portabilidade)' })
  async exportarDados(
    @Param('usuarioId') usuarioId: string,
    @Res() res: Response,
  ) {
    const result = await this.lgpdService.exportarDados(usuarioId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="dados-lgpd-${usuarioId}.json"`,
    );
    return res.json(result.data);
  }

  @Post('lgpd/dados/delete/:usuarioId')
  @ApiOperation({ summary: 'Excluir dados do titular (LGPD Art. 18 VI)' })
  async excluirDados(@Param('usuarioId') usuarioId: string) {
    return this.lgpdService.excluirDados(usuarioId);
  }

  @Get('lgpd/dados/:usuarioId')
  @ApiOperation({ summary: 'Listar dados pessoais armazenados' })
  async listarDadosPessoais(@Param('usuarioId') usuarioId: string) {
    return this.lgpdService.listarDadosPessoais(usuarioId);
  }

  @Post('lgpd/dados')
  @ApiOperation({ summary: 'Registrar coleta de dado pessoal' })
  async registrarDadosPessoais(@Body() dto: RegistrarDadosPessoaisDto) {
    return this.lgpdService.registrarDadosPessoais(dto);
  }

  @Get('lgpd/politicas')
  @ApiOperation({ summary: 'Listar políticas de privacidade' })
  async listarPoliticas() {
    return this.lgpdService.listarPoliticas();
  }

  @Post('lgpd/politicas')
  @ApiOperation({ summary: 'Publicar nova política de privacidade' })
  async criarPolitica(@Body() dto: CriarPoliticaDto) {
    return this.lgpdService.criarPolitica(dto);
  }

  @Post('lgpd/politicas/:id/aceitar')
  @ApiOperation({ summary: 'Aceitar política de privacidade' })
  async aceitarPolitica(
    @Param('id') id: string,
    @Body() dto: AceitarPoliticaDto,
  ) {
    return this.lgpdService.aceitarPolitica(id, dto.usuarioId, dto.ip);
  }

  @Get('lgpd/compliance')
  @ApiOperation({ summary: 'Status de conformidade LGPD' })
  async compliance() {
    return this.lgpdService.getComplianceStatus();
  }
}
