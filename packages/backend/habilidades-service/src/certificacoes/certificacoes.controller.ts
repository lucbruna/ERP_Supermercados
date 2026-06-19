import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CertificacoesService } from './certificacoes.service';
import {
  CreateCertificacaoDto, UpdateCertificacaoDto, CertificacaoQueryDto,
  ConcederCertificacaoDto, RenovarCertificacaoDto,
} from './dto/certificacoes.dto';

@ApiTags('Certificações')
@ApiBearerAuth()
@Controller()
export class CertificacoesController {
  constructor(private readonly certificacoesService: CertificacoesService) {}

  @Post('certificacoes')
  @ApiOperation({ summary: 'Criar certificação' })
  async create(@Body() dto: CreateCertificacaoDto) {
    return this.certificacoesService.create(dto);
  }

  @Get('certificacoes')
  @ApiOperation({ summary: 'Listar certificações' })
  async findAll(@Query() query: CertificacaoQueryDto) {
    return this.certificacoesService.findAll(query);
  }

  @Get('certificacoes/vencendo')
  @ApiOperation({ summary: 'Certificações próximas do vencimento' })
  async vencendo() {
    return this.certificacoesService.vencendo();
  }

  @Get('certificacoes/:id')
  @ApiOperation({ summary: 'Obter certificação por ID' })
  async findOne(@Param('id') id: string) {
    return this.certificacoesService.findOne(id);
  }

  @Patch('certificacoes/:id')
  @ApiOperation({ summary: 'Atualizar certificação' })
  async update(@Param('id') id: string, @Body() dto: UpdateCertificacaoDto) {
    return this.certificacoesService.update(id, dto);
  }

  @Delete('certificacoes/:id')
  @ApiOperation({ summary: 'Remover certificação' })
  async remove(@Param('id') id: string) {
    return this.certificacoesService.remove(id);
  }

  @Post('certificacoes/:id/conceder')
  @ApiOperation({ summary: 'Conceder certificação a funcionário' })
  async conceder(@Param('id') id: string, @Body() dto: ConcederCertificacaoDto) {
    return this.certificacoesService.conceder(id, dto);
  }

  @Patch('certificacoes/:id/renovar')
  @ApiOperation({ summary: 'Renovar certificação' })
  async renovar(@Param('id') id: string, @Body() dto: RenovarCertificacaoDto) {
    return this.certificacoesService.renovar(id, dto);
  }
}
