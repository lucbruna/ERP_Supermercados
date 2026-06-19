import { Controller, Get, Post, Put, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SegmentacaoService } from './segmentacao.service';
import { CreateSegmentoDto } from './dto/create-segmento.dto';
import { UpdateSegmentoDto } from './dto/update-segmento.dto';

@ApiTags('Segmentação')
@Controller('segmentacao')
export class SegmentacaoController {
  constructor(private readonly segmentacaoService: SegmentacaoService) {}

  @Post('segmentos')
  @ApiOperation({ summary: 'Criar segmento personalizado' })
  @ApiResponse({ status: 201, description: 'Segmento criado com sucesso' })
  createSegmento(@Body() dto: CreateSegmentoDto) {
    return this.segmentacaoService.create(dto);
  }

  @Get('segmentos/empresa/:companyId')
  @ApiOperation({ summary: 'Listar segmentos da empresa' })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  findAllSegmentos(@Param('companyId') companyId: string) {
    return this.segmentacaoService.findAll(companyId);
  }

  @Get('segmentos/:id')
  @ApiOperation({ summary: 'Obter segmento por ID' })
  @ApiParam({ name: 'id', description: 'ID do segmento' })
  findSegmentoById(@Param('id') id: string) {
    return this.segmentacaoService.findById(id);
  }

  @Put('segmentos/:id')
  @ApiOperation({ summary: 'Atualizar segmento' })
  @ApiParam({ name: 'id', description: 'ID do segmento' })
  updateSegmento(@Param('id') id: string, @Body() dto: UpdateSegmentoDto) {
    return this.segmentacaoService.update(id, dto);
  }

  @Delete('segmentos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover segmento' })
  @ApiParam({ name: 'id', description: 'ID do segmento' })
  async removeSegmento(@Param('id') id: string) {
    await this.segmentacaoService.remove(id);
  }

  @Post('classificar/:clienteId')
  @ApiOperation({ summary: 'Classificar cliente em segmento automático e personalizados' })
  @ApiParam({ name: 'clienteId', description: 'ID do cliente' })
  classificarCliente(@Param('clienteId') clienteId: string) {
    return this.segmentacaoService.classificarCliente(clienteId);
  }

  @Post('classificar/empresa/:companyId')
  @ApiOperation({ summary: 'Reclassificar todos os clientes da empresa' })
  @ApiParam({ name: 'companyId', description: 'ID da empresa' })
  classificarEmMassa(@Param('companyId') companyId: string) {
    return this.segmentacaoService.classificarEmMassa(companyId);
  }
}
